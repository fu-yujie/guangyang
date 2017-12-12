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
     "dojo/dom",
    "dojo/dom-style",
    "dojo/dom-class",
    "dojo/on",
    "dijit/popup",
    "dojo/text!./templates/RoadPollution.html",
    "dijit/TooltipDialog",
    "dijit/form/CheckBox",
    "dijit/layout/ContentPane",
    "dojox/grid/DataGrid",
    "esri/Color",
    "esri/geometry/Point",
    "esri/graphic",
    "esri/symbols/PictureMarkerSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
    "widgets/_Widget",
    "widgets/TitlePartPane",
    "esri/symbols/TextSymbol",
], function (
    array,
    declare,
    lang,
    ItemFileWriteStore,
    xhr,
    topic,
    dom,
    domStyle,
    domClass,
    on,
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
    SimpleLineSymbol,
    _Widget,
    TitlePartPane,
    TextSymbol
) {
    var road = declare("widgets.RoadPollution", _Widget, {
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
                //this._setRoadPollutionLayer();
                //this.map.on("extent-change", lang.hitch(this, function () {

                //    if (this.data != null && this.data != undefined && this.data != ""&&this.evt!=null) {
                //        var evt = this.evt;
                //        alert(2)
                //        var symbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 10);
                //        var graphic = new Graphic(evt.graphic.geometry, symbol);
                //        this._roadPollutionlayer.add(graphic);
                //    }

                //}));
            }
        },
        _getMapAttr: function () {
            return this.map;
        },
        _setEvent: function () {
            topic.subscribe(this.domNode.id + "click", lang.hitch(this, "onClick"));
            topic.subscribe(this.domNode.id + "close", lang.hitch(this, "onClose"));
            topic.subscribe(this.domNode.id + "open", lang.hitch(this, "onOpen"));
            on(this.checkBox, "change", lang.hitch(this, function (evt) {
                this._setLayerVisible();
                if (this.checkBox.checked) {
                    this._addGraphics();
                } else {
                    popup.close();
                    this._clearTable()
                    this.map.graphics.clear();
                }
            }));

        },
        _setGrid: function () {
            this._attrGrid = new DataGrid({
                style: "padding:0;font-size: 12px;width:220px;font-family: 'Microsoft YaHei';float:left;",
                structure: this._createAttrGridLayout(),
                autoHeight: true,
                //height:"242px",
                //width:"220px",
                autoWidth: true,
                store: this._createGridStore([])
            });
            this._titlePartPane = new TitlePartPane({
                style: "background-color:lightskyblue",
                onClose: lang.hitch(this, function () {
                    popup.close();
                    this.map.graphics.clear();
                })
            });
            this._contentPane = new ContentPane({
                style: "width:auto;padding:0;margin:0;overflow: hidden;"
            });
            this._toolTipDialog.addChild(this._titlePartPane);
            this._contentPane.addChild(this._attrGrid);
            this._toolTipDialog.addChild(this._contentPane);
        },
        //获取数据；
        _addGraphics: function () {
            this._roadPollutionlayer = this.map.getLayer("roadPollution");
            this._roadPollutionlayer.clear();
            xhr.post(this._projectName + "/widgets/handler/RoadPollution.ashx", {
                handleAs: "text",
                timeout: 10000,
                data: {
                    methodName: "GetRoadInfoByRoadCode"
                }
            }).then(lang.hitch(this, function (data) {
                var data = eval("(" + data + ")");
                this.nodup(data)
                this.data = data;
                this._setRoadPollutionLayer(data)
            }), lang.hitch(this, function (error) {

            }));
        },
        //对于不同段的道路进行编码等去重；
        nodup: function (controls) {
            var result = [], isRepeated;
            for (var i = 0; i < controls.length; i++) {
                isRepeated = false;
                if (result.length != 0) {
                    for (var j = 0; j < result.length; j++) {
                        if (controls[i].编码 == result[j].编码) {
                            isRepeated = true;
                        }
                    }
                } else {
                    for (var j = 0; j <= result.length; j++) {
                        isRepeated = false;
                    }
                }
                if (!isRepeated) {
                    result.push(controls[i]);
                }
            }
            if (result != null) {
                this._cutData(result)
            }
        },
        //数据排序完毕执行分页插件自动生成列表；
        _cutData: function (data) {
            this.TabHost();
            //数据自动加载，以及分页的实现；注意数据格式为：[{},{},{},{}]
            (function (that, popup, tableContentId) {
                var ne = new page()
                ne.pageContentElement = "table";//用哪种 标签进行数据的展示，可以用table与tr+td;或者是ul+li+span;只需要填入table或者ul既可；
                ne.cut_page_id = tableContentId;//整体容器的最外层id
                ne.data = data;//数据；注：数据格式为[{},{},{}];外层为数组，每个数组内的元素为对象的格式；
                ne.pageContentLength = 10;//每页展示数据的长度或个数；
                //ne.orderKey = ["名称", "编码", "联系人", "联系方式"];//表格展示的属性名的顺序
                //ne.orderKeyName = ["道路名称", "编码", "联系人", "联系方式"]//表格头部的属性名一次的名称与orderKey对应起来；
                ne.orderKey = ["名称", "清扫联系人", "联系方式"];//表格展示的属性名的顺序
                ne.orderKeyName = ["道路名称", "清扫联系人", "联系方式"]//表格头部的属性名一次的名称与orderKey对应起来；
                ne.addDom({
                    that: that,
                    popup: popup
                })//调用主方法；
                ne.addOrRemove("set", "border", 0)//第一个属性为remove和set，第二属性为标签的属性名，第三个属性为属性值；
            })(this, popup, this.tableContentId + 6)
        },
        //首次数据加载为图中坐标点添加事件与数据；
        _setRoadPollutionLayer: function (data) {
            this._roadPollutionlayer = this.map.getLayer("roadPollution");
            this._roadPollutionlayer.renderer.symbol.setColor("darkred");
            this._roadPollutionlayer.renderer.symbol.setWidth(4);
            //this._roadPollutionlayer.refresh();

            this._roadPollutionlayer.on("click", lang.hitch(this, function (evt) {
                this.map.graphics.clear();
                this._mapPoint = evt.mapPoint
                var allGraphics = this._roadPollutionlayer.graphics;
                var newdata = allGraphics.filter(function (i) {
                    if (evt.graphic.attributes.Code == i.attributes.Code) {
                        return i;
                    }
                })
                array.forEach(newdata, lang.hitch(this, function (dt) {
                    var symbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color("green"), 10);
                    var _mapPoint = dt.geometry;
                    var graphic = new Graphic(_mapPoint, symbol);
                    this.map.graphics.add(graphic);
                }))
                var $path = map_graphics_layer.getElementsByTagName("path");
                array.forEach($path, function (i) {
                    i.setAttribute("class", "addcolor")
                })
                this.map.setExtent(evt.graphic.geometry.getExtent().expand(0));
                topic.publish(this.domNode.id + "click", this._mapPoint, this._toolTipDialog);
                var newData = data.filter(function (i) {
                    if (evt.graphic.attributes.Code == i.编码) {
                        return i;
                    }
                })
                var attrData = [];
                var attrIndex = 0;
                for (var item in newData[0]) {
                    if (item != "地址") {
                        if (item != "联系人") {
                            attrIndex++;
                            attrData.push({
                                ID: attrIndex,
                                name: item,
                                value: newData[0][item]
                            });
                        } else {
                            attrIndex++;
                            attrData.push({
                                ID: attrIndex,
                                name: "清扫联系人",
                                value: newData[0][item]
                            });
                        }

                    }
                }
                this._attrGrid.setStore(this._createGridStore(attrData));
            }));
        },
        addTagName: function () {
            this._roadPollutionlayer = this.map.getLayer("roadPollution");
            var that = this
            // setTimeout(function () {
            //     var allGraphics = that._roadPollutionlayer.graphics;
            //     for (var rode in allGraphics) {
            //         var textSymbol = new TextSymbol({
            //             text: allGraphics[rode].attributes.name,
            //             font: "12px",
            //             color: new Color("red"),
            //             haloColor: new Color([255, 0, 0]),
            //             haloSize: "1",
            //             horizontalAlignment: "left",
            //             xoffset: 10,
            //         });
            //         var mapPoint = allGraphics[rode].geometry.getExtent().getCenter().offset(0, 0.000001)
            //         var labelGraphic = new Graphic(mapPoint, textSymbol);
            //         that.textLayer.add(labelGraphic);
            //     }
            // }, 1000)
            //this.textLayer.setScaleRange(0, 0);
        },
        //设置图层（误删）
        _setLayer: function (data) { },
        //添加到坐标点到图中（误删）；
        _addpoint: function (data) {
        },
        //添加表格与图中坐标点数据展示联动
        _pointadd: function (controls) {
            this._tableshow()
            var that = this;
            var tableId = dojo.byId(this.tableContentId + 6)
            this.addTagName()
            if (tableId.innerHTML != undefined && tableId.innerHTML != null) {
                var w_cons = tableId.getElementsByTagName("tr")
                for (var item = 1; item < w_cons.length; item++) {
                    w_cons[item].index = item
                    w_cons[item].onclick = function () {
                        that.map.graphics.clear();
                        var indx = controls[this.index - 1].编码
                        var allGraphics = that._roadPollutionlayer.graphics;
                        var newdata = allGraphics.filter(function (i) {
                            if (indx == i.attributes.Code) {
                                return i;
                            }
                        })
                        array.forEach(newdata, lang.hitch(that, function (dt) {
                            var symbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color("green"), 10);
                            var _mapPoint = dt.geometry;
                            var graphic = new Graphic(_mapPoint, symbol);
                            that.map.graphics.add(graphic);
                        }))
                        var $path = map_graphics_layer.getElementsByTagName("path");
                        array.forEach($path, function (i) {
                            i.setAttribute("class", "addcolor")
                        })
                        that.map.setExtent(newdata[0].geometry.getExtent().expand(0));
                        //var path=newdata.geometry.paths;
                        var allpath = [];
                        for (var i in newdata) {
                            for (var j = 0; j < newdata[i].geometry.paths[0].length; j++) {
                                allpath.push(newdata[i].geometry.paths[0][j])
                                //lastpoint = newdata[i].geometry.paths[0][0]
                                //if (lastpoint[0] < newdata[i].geometry.paths[0][j][0]) {
                                //    lastpoint = newdata[i].geometry.paths[0][j]
                                //}
                            }
                        }
                        var lastpoint = allpath[0];
                        for (var k = 0; k < allpath.length; k++) {
                            if (lastpoint[0] <= allpath[k][0]) {
                                lastpoint = allpath[k]
                            }
                        }
                        that._mapPoint = { type: "point", x: lastpoint[0], y: lastpoint[1] };
                        //var pathLength = newdata[0].geometry.paths[0].length - 1;
                        //var x = newdata[0].geometry.paths[0][pathLength][0];
                        //var y = newdata[0].geometry.paths[0][pathLength][1];
                        //that._mapPoint = { type: "point", x: x, y: y };
                        topic.publish("widgets_RoadPollution_0" + "click", that._mapPoint, that._toolTipDialog);
                        var newData = controls[this.index - 1]
                        var attrData = [];
                        var attrIndex = 0;
                        for (var item in newData) {
                            if (item != "地址") {
                                if (item != "联系人") {
                                    attrIndex++;
                                    attrData.push({
                                        ID: attrIndex,
                                        name: item,
                                        value: newData[item]
                                    });
                                } else {
                                    attrIndex++;
                                    attrData.push({
                                        ID: attrIndex,
                                        name: "清扫联系人",
                                        value: newData[item]
                                    });
                                }
                            }
                        }
                        that._attrGrid.setStore(that._createGridStore(attrData));
                    }
                }

            }
        },
        _createAttrGridLayout: function () {
            var layout = [
                {
                    name: '序号', field: 'ID', width: '36px', hidden: true, cellStyles: 'text-align:center;',
                    headerStyles: "text-align:center;font-size: 12px;font-family: 'Microsoft YaHei';font-weight: normal;"
                },
                {
                    name: '属性名称', field: 'name', width: '88px', cellStyles: 'text-align:center;',
                    headerStyles: "text-align:center;font-size: 12px;font-family: 'Microsoft YaHei';font-weight: normal;"
                },
                {
                    name: '属性值', field: 'value', width: '88px', cellStyles: 'text-align:center;',
                    headerStyles: "text-align:center;font-size: 12px;font-family: 'Microsoft YaHei';font-weight: normal;"
                }
            ];
            return layout;
        },
        _createGridStore: function (items) {
            var store = new ItemFileWriteStore({
                data: {
                    identifier: "ID",
                    items: items
                }
            });
            return store;
        },
        //功能面板与表格面板的切换；
        TabHost: function () {
            var $tableTitleId = dojo.byId(this.tableTitleId + 6);//表格头部对应的标题
            this.tableTitleNode.style.display = "block"//表格头部
            $tableTitleId.style.display = "inline-block"
            $tableTitleId.innerHTML = "道路列表";
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
            $tableTitle[6].style.background = "#f1ab00";
            $tableTitle[6].style.borderRight = "1px solid beige";
            $tableTitle[6].style.borderBottom = "1px solid beige";
            $tableContent[6].style.display = "block";
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
            var $tableTitleId = dojo.byId(this.tableTitleId + 6);
            var $tableContentId = dojo.byId(this.tableContentId + 6);
            $tableTitleId.style.display = "inline"
            $tableTitleId.style.borderRight = "";
            $tableTitleId.style.borderBottom = "";
            $tableTitleId.innerHTML = "";
            $tableContentId.innerHTML = "";
        },
        _setLayerVisible: function () {
            var layerBase = this.map.getLayer("roadPollutionBase");
            layerBase.setVisibility(this.checkBox.checked);
            var layer = this.map.getLayer("roadPollution");
            layer.setVisibility(this.checkBox.checked);
            this.textLayer = this.map.getLayer("roadTextSymbol");
            this.textLayer.setVisibility(this.checkBox.checked);
            //var searchLayer = this.map.getLayer("searchResult");
            //var length = searchLayer.graphics.length;
            //if(length>0){
            //    var graphics = array.filter(searchLayer.graphics, function(graphic){
            //        if (graphic.attributes.type == "roadPollution") {
            //            graphic.visible = layer.visible;
            //            return graphic;
            //        }
            //        else {
            //            return graphic;
            //        }
            //    });
            //    searchLayer.graphics = graphics;
            //    searchLayer.redraw();
            //}
        }
    });
    return road;
});