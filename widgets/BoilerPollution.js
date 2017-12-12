/**
 * Created by Administrator on 2015/10/13.
 */
define([
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/data/ItemFileWriteStore",
    "dojo/request/xhr",
    "dojo/topic",
    "dojo/on",
    "dojo/dom",
    "dojo/dom-construct",
    "dijit/popup",
    "dojo/text!./templates/BoilerPollution.html",
    "dijit/TooltipDialog",
    "dijit/form/CheckBox",
    "dijit/layout/ContentPane",
    "dojox/grid/DataGrid",
    "esri/Color",
    "esri/geometry/Point",
    "esri/graphic",
    "esri/symbols/PictureMarkerSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    "widgets/_Widget",
    "widgets/TitlePartPane",
    "esri/symbols/TextSymbol",
     "esri/geometry/Extent",
    "dojo/domReady!"
], function (
    array,
    declare,
    lang,
    ItemFileWriteStore,
    xhr,
    topic,
    on,
    dom,
    domConstruct,
    popup,
    template,
    TooltipDialog,
    CheckBox,
    ContentPane,
    DataGrid,
    Color,
    Point,
    Graphic,
    PictureMarkerSymbol,
    SimpleMarkerSymbol,
    _Widget,
    TitlePartPane,
    TextSymbol,
    Extent
) {
    var t = declare("widgets.BoilerPollution", _Widget, {
        templateString: template,
        map: null,
        constructor: function (para) {
            if (para != undefined) {
                if ("map" in para) {
                    this.map = para.map;
                }
                if ("tableTitleNode" in para.that) {
                    this.tableTitleNode = para.that.tableTitleNode;
                }
                if ("tableContentNode" in para.that) {
                    this.tableContentNode = para.that.tableContentNode;
                }
                if ("tableContentId" in para.that) {
                    this.tableContentId = para.that.tableContentId;
                }
                if ("tableTitleId" in para.that) {
                    this.tableTitleId = para.that.tableTitleId;
                }
                if ("dataTemplateListNode" in para.that) {
                    this.dataTemplateListNode = para.that.dataTemplateListNode;
                }
                if ("domNode" in para.that) {
                    this.dataTemplateContent = para.that.domNode;
                }
                if ("TabIconNode" in para.that) {
                    this.TabIconNode = para.that.TabIconNode;
                }
                if ("ListIconNode" in para.that) {
                    this.ListIconNode = para.that.ListIconNode;
                }
            }
        },
        postMixInProperties: function () {
            this.inherited(arguments);
            var pathName = window.document.location.pathname;
            this._projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);
        },
        buildRendering: function () {
            this.inherited(arguments);
        },

        postCreate: function () {
            /// <summary>
            /// 小部件的DOM准备好后并被插入到页面后调用该方法，保存图层信息
            /// </summary>
            this.inherited(arguments);
            this.checkBox = new CheckBox({
                checked: false
            }, this.checkBoxNode);
            //窗口弹出框的模板内容声明；
            this._toolTipDialog = new TooltipDialog({
                onOpen: lang.hitch(this, function () {
                    topic.publish(this.domNode.id + "open", this._mapPoint, this._toolTipDialog);
                }),
                onClose: lang.hitch(this, function () {
                    topic.publish(this.domNode.id + "close", this._toolTipDialog);
                })
            });
            this._setGrid();
            this._setEvent();
        },
        //加载后执行；
        startup: function () {
            this.inherited(arguments);
            this._setLayerVisible();
        },
        select: function (evt) {
            this.checkBox.set("checked", !this.checkBox.checked);
        },
        onClick: function (popupPoint, toolTipDialog) {

        },
        onClose: function (popupPoint, toolTipDialog) {

        },
        onOpen: function (tooltipDialog) {

        },
        _setMapAttr: function (map) {
            if (map) {
                this.map = map;
            }
        },
        _getMapAttr: function () {
            return this.map;
        },
        //事件监听
        _setEvent: function () {
            topic.subscribe(this.domNode.id + "click", lang.hitch(this, "onClick"));
            topic.subscribe(this.domNode.id + "close", lang.hitch(this, "onClose"));
            topic.subscribe(this.domNode.id + "open", lang.hitch(this, "onOpen"));
            on(this.checkBox, "change", lang.hitch(this, function (evt) {
                this._setLayerVisible();
                if (this.checkBox.checked) {
                    this._addGraphics();
                } else {
                    this._clearTable()
                    popup.close();
                }
            }));
        },
        //弹出框内_toolTipDialog中不同模板声明，
        _setGrid: function () {
            //锅炉信息
            this._attrGrid = new DataGrid({
                style: "padding:0;font-size: 12px;width:220px;font-family: 'Microsoft YaHei';float:left;",
                structure: this._createAttrGridLayout(),
                //autoHeight:true,
                height: "242px",
                //width:"220px",
                //autoWidth:true,
                store: this._createGridStore([])
            });
            //锅炉企业信息模板
            this._staffGrid = new DataGrid({
                style: "padding:0;font-size: 12px;width:187px;font-family: 'Microsoft YaHei';float:left",
                structure: this._createStaffGridLayout(),
                //autoHeight:true,
                height: "242px",
                width: "200px",
                autoWidth: true,
                store: this._createGridStore([])
            });
            //弹出模板头部；
            this._titlePartPane = new TitlePartPane({
                style: "background-color:lightskyblue",
                onClose: lang.hitch(this, function () {
                    popup.close();
                })

            });
            //内容块；
            this._contentPane = new ContentPane({
                style: "width:auto;padding:0;margin:0;overflow: hidden;"
            });
            this._toolTipDialog.addChild(this._titlePartPane);
            this._contentPane.addChild(this._staffGrid);
            this._contentPane.addChild(this._attrGrid);
            this._toolTipDialog.addChild(this._contentPane);
            //this._contentPane.addChild(this._staffGrid,1);

        },
        //所有小部件加载完毕进行数据的加载
        _addGraphics: function () {
            this._boilerPollutionlayer = this.map.getLayer("boilerPollution");
            this._boilerPollutionlayer.clear();
            xhr.post(this._projectName + "/widgets/handler/BoilerPollution.ashx", {
                handleAs: "text",
                timeout: 10000,
                data: {
                    methodName: "GetAllBoilerAreas"
                }
            }).then(lang.hitch(this, function (data) {
                var data = eval("(" + data + ")");
                this._cutData(this, data.items)
                this.secondaryFilter(data)
                this._addpointAll(data.items)
                this._setLayer(data.items)
            }), lang.hitch(this, function (error) {
            }));
        },
        //数据排序完毕执行分页插件自动生成列表；
        _cutData: function (that, data) {
            this.TabHost();
            //数据自动加载，以及分页的实现；注意数据格式为：[{},{},{},{}]
            (function (that, popup, tableContentId) {
                var ne = new page()
                ne.pageContentElement = "table";//用哪种 标签进行数据的展示，可以用table与tr+td;或者是ul+li+span;只需要填入table或者ul既可；
                ne.cut_page_id = tableContentId;//整体容器的最外层id
                ne.data = data;//数据；注：数据格式为[{},{},{}];外层为数组，每个数组内的元素为对象的格式；
                ne.pageContentLength = 10;//每页展示数据的长度或个数；
                ne.orderKey = ["名称", "编码", "地址"];//表格展示的属性名的顺序
                ne.orderKeyName = ["污染源名称", "编码", "地址"]//表格头部的属性名一次的名称与orderKey对应起来；
                //ne.orderKey = ["名称", "地址"];//表格展示的属性名的顺序
                //ne.orderKeyName = ["污染源名称", "地址"]//表格头部的属性名一次的名称与orderKey对应起来；
                ne.addDom({
                    that: that,
                    popup: popup
                })//调用主方法；
                ne.addOrRemove("set", "border", 0)//第一个属性为remove和set，第二属性为标签的属性名，第三个属性为属性值；
            })(that, popup, this.tableContentId + 3)
        },
        //首次数据加载为图中坐标点添加事件与数据；
        _setLayer: function (data) {
            this._boilerPollutionlayer = this.map.getLayer("boilerPollution");
            this._boilerPollutionlayer.on("click", lang.hitch(this, function (evt) {
                this._mapPoint = evt.mapPoint;
                var code = evt.graphic.attributes.boilerCode
                topic.publish(this.domNode.id + "click", this._mapPoint, this._toolTipDialog);
                var rows = data[code].rows;
                this._titlePartPane.labelNode.innerHTML = data[code].名称
                var attr = [];
                var arrIdxAll = []
                var ids;
                for (var i = 0; i < rows.length; i++) {
                    var attrData = [];
                    var attrIndex = 0;
                    var arrIdx = eval('"a" + i');
                    arrIdxAll.push(arrIdx)
                    ids = rows[i]
                    for (var item in ids) {
                        attrIndex++;
                        var everyData = {
                            ID: attrIndex,
                            name: item
                        }
                        everyData[arrIdx] = ids[item]
                        attrData.push(everyData);
                    }
                    attr.push(attrData)
                }
                //更变锅炉数据展示模板锅炉个数，通过数据再次调用调整模板；
                this._attrGrid.set("structure", this._createAttrGridLayout(attr));
                var sd = [];
                var aa = attr[0]
                for (var its in aa) {
                    for (var i = 1; i < attr.length; i++) {
                        var bb = attr[i]
                        for (var j = 0; j < bb.length; j++) {
                            aa[its][arrIdxAll[i]] = bb[its][arrIdxAll[i]]
                        }
                    }
                    sd.push(attr[0][its])
                }
                //设置锅炉信息数据
                this._attrGrid.setStore(this._createGridStore(sd));
                var companyDt = data[code];
                var staffData = [];
                var staffIndex = 0;
                for (var item in companyDt) {
                    if (item != "rows") {
                        staffIndex++;
                        if (item != "经度" && item != "纬度" && companyDt[item] != "NULL") {
                            var datas = {
                                ID: staffIndex,
                                name: item
                            }
                            if (companyDt[item] == "NULL") {
                                datas.value = "无"
                            } else {
                                datas.value = companyDt[item]
                            }
                            staffData.push(datas);
                        }
                    }
                }
                //设置锅炉企业信息数据
                this._staffGrid.setStore(this._createGridStore(staffData));
                var extent = new Extent(parseFloat(evt.mapPoint.x) - 0.03, parseFloat(evt.mapPoint.y) - 0.03
                , parseFloat(evt.mapPoint.x) + 0.03, parseFloat(evt.mapPoint.y) + 0.03, this.map.spatialReference);
                //this.map.setExtent(extent)
                this.map.centerAt(evt.mapPoint);
            }));
        },
        //将所有锅炉点插入图中
        _addpointAll: function (datas) {
            this._boilerPollutionlayer = this.map.getLayer("boilerPollution");
            this._boilerPollutionlayer.clear()
            this.textLayer = this.map.getLayer("boilerTextSymbol");
            this.textLayer.clear()
            for (var boiler in datas) {
                if (datas[boiler].rows != undefined) {
                    if (datas[boiler].rows[0].是否改造 == "是") {
                        var point = new Point(datas[boiler].经度, datas[boiler].纬度, this.map.spatialReference);
                        var symbol = new PictureMarkerSymbol(this._projectName + "/widgets/assets/images/boiler.png", 20, 20);
                        var attr = { "boilerCode": boiler };
                        var graphic = new Graphic(point, symbol, attr, null);
                        this._boilerPollutionlayer.add(graphic);
                    } else {
                        var point = new Point(datas[boiler].经度, datas[boiler].纬度, this.map.spatialReference);
                        var symbol = new PictureMarkerSymbol(this._projectName + "/widgets/assets/images/boilerW.png", 20, 20);
                        var attr = { "boilerCode": boiler };
                        var graphic = new Graphic(point, symbol, attr, null);
                        this._boilerPollutionlayer.add(graphic);
                    }
                }
                var textSymbol = new TextSymbol({
                    text: datas[boiler].名称,
                    font: "12px",
                    color: new Color("red"),
                    haloColor: new Color([255, 0, 0]),
                    haloSize: "1",
                    horizontalAlignment: "left",
                    xoffset: 10,
                });
                var labelGraphic = new Graphic(point, textSymbol);

                this.textLayer.add(labelGraphic);
            }
            //this.textLayer.setScaleRange(15000,0);
            this.textLayer.setScaleRange(0, 0);
        },
        //分页数据添加到坐标点到图中；
        _addpoint: function () {
            //预留
        },
        //首次数据加载与二次筛选后，通过此方法赋予表格中所有污染企业在图中弹出框的事件与实现；
        _pointadd: function (controls) {
            this._tableshow()
            var that = this;
            var tableId = dojo.byId(this.tableContentId + 3)
            if (tableId.innerHTML != undefined && tableId.innerHTML != null) {
                var w_cons = tableId.getElementsByTagName("tr")

                var i = 1;
                var data = controls;
                for (var item in data) {
                    w_cons[i].index = item
                    w_cons[i].onclick = function () {
                        that._mapPoint = { type: "point", x: data[this.index].经度, y: data[this.index].纬度 };
                        //that._toolTipDialog.removeChild(that._contentPane)
                        that._boilerPollutionlayer = that.map.getLayer("boilerPollution");
                        topic.publish("widgets_BoilerPollution_0" + "click", that._mapPoint, that._toolTipDialog);
                        that._titlePartPane.labelNode.innerHTML = data[this.index].名称
                        var rows = data[this.index].rows;
                        //整体锅炉数据为固定模板要求数据的调整；
                        var attr = [];
                        var arrIdxAll = []
                        var ids;
                        for (var i = 0; i < rows.length; i++) {
                            var attrData = [];
                            var attrIndex = 0;
                            var arrIdx = eval('"a" + i');
                            arrIdxAll.push(arrIdx)
                            ids = rows[i]
                            for (var item in ids) {
                                attrIndex++;
                                var everyData = {
                                    ID: attrIndex,
                                    name: item
                                }
                                everyData[arrIdx] = ids[item]
                                attrData.push(everyData);
                            }
                            attr.push(attrData)
                        }
                        that._attrGrid.set("structure", that._createAttrGridLayout(attr));
                        var sd = [];
                        for (var its in attr[0]) {
                            for (var i = 1; i < attr.length; i++) {
                                for (var j = 0; j < attr[i].length; j++) {
                                    attr[0][its][arrIdxAll[i]] = attr[i][its][arrIdxAll[i]]
                                }
                            }
                            sd.push(attr[0][its])
                        }
                        that._attrGrid.setStore(that._createGridStore(sd));
                        var companyDt = data[this.index];
                        var staffData = [];
                        var staffIndex = 0;
                        for (var item in companyDt) {
                            if (item != "rows") {
                                staffIndex++;
                                if (item != "经度" && item != "纬度" && companyDt[item] != "NULL") {
                                    var datas = {
                                        ID: staffIndex,
                                        name: item
                                    }
                                    if (companyDt[item] == "NULL") {
                                        datas.value = "无"
                                    } else {
                                        datas.value = companyDt[item]
                                    }
                                    staffData.push(datas);
                                }
                            }
                        }
                        that._staffGrid.setStore(that._createGridStore(staffData));
                        var extent = new Extent(parseFloat(data[this.index].经度) - 0.03, parseFloat(data[this.index].纬度) - 0.03
                  , parseFloat(data[this.index].经度) + 0.03, parseFloat(data[this.index].纬度) + 0.03, that.map.spatialReference);
                        //that.map.setExtent(extent)
                        that.map.centerAt(that._mapPoint);
                    }
                    i++;
                }

            }
        },
        //锅炉数据模板
        _createAttrGridLayout: function (attr) {
            var layout = [
                {
                    name: '序号', field: 'ID', width: '36px', hidden: true, cellStyles: 'text-align:center;',
                    headerStyles: "text-align:center;font-size: 12px;font-family: 'Microsoft YaHei';font-weight: normal;"
                },
                {
                    name: '属性名称', field: 'name', width: '88px', cellStyles: 'text-align:center;',
                    headerStyles: "text-align:center;font-size: 12px;font-family: 'Microsoft YaHei';font-weight: normal;"
                },
                //{
                //    name: "锅炉" , field: 'value', width: '88px', cellStyles: 'text-align:center;',
                //    headerStyles: "text-align:center;font-size: 12px;font-family: 'Microsoft YaHei';font-weight: normal;"
                //}

            ];
            var i = 0;
            for (its in attr) {
                i++
                var everydt = {
                    name: "锅炉" + i, field: "a" + its, width: '88px', cellStyles: 'text-align:center;',
                    headerStyles: "text-align:center;font-size: 12px;font-family: 'Microsoft YaHei';font-weight: normal;"
                }
                layout.push(everydt)
            }
            return layout;
        },
        //锅炉企业展示模板
        _createStaffGridLayout: function () {
            var layout = [
                 {
                     name: '序号', field: 'ID', width: '36px', hidden: true, cellStyles: 'text-align:center;',
                     headerStyles: "text-align:center;font-size: 12px;font-family: 'Microsoft YaHei';font-weight: normal;"
                 },
                {
                    name: '属性名称', field: 'name', width: '80px', cellStyles: 'text-align:center;',
                    headerStyles: "text-align:center;font-size: 12px;font-family: 'Microsoft YaHei';font-weight: normal;"
                },
                {
                    name: "属性", field: 'value', width: '80px', cellStyles: 'text-align:center;',
                    headerStyles: "text-align:center;font-size: 12px;font-family: 'Microsoft YaHei';font-weight: normal;"
                }

            ];
            return layout;
        },
        //功能面板与表格面板的切换；
        TabHost: function () {
            var $tableTitleId = dojo.byId(this.tableTitleId + 3);//表格头部对应的标题
            this.tableTitleNode.style.display = "block"//表格头部
            $tableTitleId.style.display = "inline-block"
            $tableTitleId.innerHTML = "锅炉列表";
            this.dataTemplateContent.style.display = "none";//选项面板隐藏
            this.dataTemplateListNode.style.display = "block";//表格面板展示
            this.TabIconNode.style.backgroundImage = "url(" + this._projectName + "/widgets/assets/images/Tab.png" + ")";
            this.ListIconNode.style.backgroundImage = "url(" + this._projectName + "/widgets/assets/images/List1.png" + ")";
        },
        //表格模板中每个表格的切换与默认显示
        _tableshow: function () {
            var $tableTitle = dojo.query(".PollutionSourcesTableTitle")
            var $tableContent = dojo.query(".PollutionSourcesTable")
            for (var i = 0; i < $tableTitle.length; i++) {
                $tableTitle[i].style.background = "white";
                $tableContent[i].style.display = "none";
            }
            $tableTitle[3].style.background = "#f1ab00";
            $tableTitle[3].style.borderRight = "1px solid beige";
            $tableTitle[3].style.borderBottom = "1px solid beige";
            $tableContent[3].style.display = "block";
            for (var i = 0; i < $tableTitle.length; i++) {
                $tableTitle[i].index = i;
                $tableTitle[i].onclick = function () {
                    for (var i = 0; i < $tableTitle.length; i++) {
                        $tableTitle[i].style.background = "white";
                        $tableContent[i].style.display = "none";
                    }
                    this.style.background = "#f1ab00";
                    $tableContent[this.index].style.display = "block";
                }
            }
        },
        //未选中情况下表格以及表格标题的清空；
        _clearTable: function () {
            var $tableTitleId = dojo.byId(this.tableTitleId + 3);
            var $tableContentId = dojo.byId(this.tableContentId + 3);
            $tableTitleId.style.display = "inline"
            $tableTitleId.style.borderRight = "";
            $tableTitleId.style.borderBottom = "";
            $tableTitleId.innerHTML = "";
            $tableContentId.innerHTML = "";
        },
        //根据改造类型进行锅炉信息的二次筛选并展示；
        secondaryFilter: function (dataJsons) {
            var data = dataJsons.items;
            var lables = [];
            this.lables = lables;
            var lab = domConstruct.create("p", {
                style: "overflow:hidden;padding-left:20px;",
                id: this.tableContentId + 3 + "_p"
            });
            dojo.byId(this.tableContentId + 3).insertBefore(lab, dojo.byId(this.tableContentId + 3).firstElementChild)
            lab.innerHTML += "<span style='float:left;width:70px;height:25px'><input type='checkbox' style='width:15px;height:15px;vertical-align:bottom;display:inline-block'/><em style='font-size:12px;'>" + "未改造" + "</em></span>"
            lab.innerHTML += "<span style='float:left;width:70px;height:25px'><input type='checkbox' style='width:15px;height:15px;vertical-align:bottom;display:inline-block'/><em style='font-size:12px;'>" + "已改造" + "</em></span>"
            for (itme in data) {
                for (i in data[itme].rows) {
                    if (lables.indexOf(data[itme].rows[i].是否改造) == -1) {
                        lables.push(data[itme].rows[i].是否改造)
                        //            if (data[itme].rows[i].淘汰方式 == "") {
                        //                lab.innerHTML += "<span style='float:left;width:70px;height:25px'><input type='checkbox' style='width:15px;height:15px;vertical-align:bottom;display:inline-block'/><em style='font-size:12px;'>" + "未改造" + "</em></span>"
                        //            } else {
                        //                lab.innerHTML += "<span style='float:left;width:70px;height:25px'><input type='checkbox' style='width:15px;height:15px;vertical-align:bottom;display:inline-block'/><em style='font-size:12px;'>" + data[itme].rows[i].淘汰方式 + "</em></span>"
                        //            }
                    }
                }

            }
            this._clik(dataJsons)
        },
        //赋予二次筛选中不同字段相应的事件，并根据checkbox的选中与否进行数据的过滤，得到新的数据；
        _clik: function (dt) {
            var that = this;
            var dat = dt.items
            var $p = dojo.byId(this.tableContentId + 3 + "_p");
            var alllabipt = $p.getElementsByTagName("input");
            var alllab = $p.getElementsByTagName("span");
            var alllabem = $p.getElementsByTagName("em");
            var arr = [];
            function filte() {
                for (var j = 0; j < alllabipt.length; j++) {
                    if (alllabipt[j].checked == true) {
                        if (alllabem[j].innerHTML == "未改造") {
                            arr.push("否")
                        } else {
                            arr.push("是")
                            //array.forEach(that.lables, function (its) {
                            //    if (its != "") {
                            //        arr.push(its)
                            //    }
                            //})
                        }
                    }
                }
                var d;
                var arrcontect = [];
                for (var i = 0; i < arr.length; i++) {
                    (function (j) {
                        function fl(element, index, array) {
                            for (var item in element.rows) {
                                return (element.rows[item].是否改造 == arr[j])
                            }
                        }
                        d = dat.filter(fl)

                    })(i)
                    arrcontect = arrcontect.concat(d)
                }
                //根据编码排序
                function order(a, b) {
                    return parseInt(a.编码) - parseInt(b.编码);
                }
                arrcontect.sort(order)
                var alldts = {
                    msg: "ok",
                    items: arrcontect
                }
                that._boilerPollutionlayer.clear();
                popup.close();
                that._cutData(that, alldts.items)
                that._addpointAll(alldts.items)
                that._setLayer(alldts.items)
            }
            for (var q = 0; q < alllab.length; q++) {
                //alllabipt[q].checked = true;
                (function (p) {
                    on(alllabipt[p], "change", lang.hitch(this, function (evt) {
                        arr = [];
                        filte();
                    }))
                    on(alllabem[q], "click", function () {
                        arr = [];
                        var ipt = alllabipt[p]
                        if (ipt.checked == true) {
                            ipt.checked = false;
                        } else {
                            ipt.checked = true;
                        }
                        filte()
                    })

                })(q)
            }
            //}
        },


        //模板需要数据格式转换
        _createGridStore: function (items) {
            var store = new ItemFileWriteStore({
                data: {
                    identifier: "ID",
                    items: items
                }
            });
            return store;
        },
        //图层显示控制
        _setLayerVisible: function () {
            var layer = this.map.getLayer("boilerPollution");
            layer.setVisibility(this.checkBox.checked);
            this.textLayer = this.map.getLayer("boilerTextSymbol");
            this.textLayer.setVisibility(this.checkBox.checked);
            //var searchLayer = this.map.getLayer("searchResult");
            //searchLayer.setVisibility(this.checkBox.checked);
        }
    });
    return t;
});