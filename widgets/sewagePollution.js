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
    "dijit/popup",
    "dojo/text!./templates/sewagePollution.html",
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
], function (
    array,
    declare,
    lang,
    ItemFileWriteStore,
    xhr,
    topic,
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
    _Widget,
    TitlePartPane,
    TextSymbol,
    Extent
) {
    var coal = declare("widgets.SewagePollution", _Widget, {
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
                    this._sewagePollutionlayer.clear();
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
                })
            });
            this._contentPane = new ContentPane({
                style: "width:auto;padding:0;margin:0;overflow: hidden;"
            });
            this._toolTipDialog.addChild(this._titlePartPane);
            this._contentPane.addChild(this._attrGrid);
            this._toolTipDialog.addChild(this._contentPane);
        },
        //加载数据；
        _addGraphics: function () {
            this._sewagePollutionlayer = this.map.getLayer("sewagePollution");
            this._sewagePollutionlayer.clear();
            xhr.post(this._projectName + "/widgets/handler/SewagePollution.ashx", {
                handleAs: "text",
                timeout: 10000,
                sync: true,
                data: {
                    methodName: "GetAllSewageAreas"
                }
            }).then(lang.hitch(this, function (data) {
                var data = eval("(" + data + ")");
                this._cutData(data)
                this._addpointAll(data)
                this._setLayer(data)
            }), lang.hitch(this, function (error) {

            }));
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
                //ne.orderKey = ["名称", "编码", "联系人", "地址"];//表格展示的属性名的顺序
                //ne.orderKeyName = ["污染源名称", "编码", "联系人", "地址"]//表格头部的属性名一次的名称与orderKey对应起来；
                ne.orderKey = ["名称", "联系人", "地址"];//表格展示的属性名的顺序
                ne.orderKeyName = ["污染源名称", "联系人", "地址"]//表格头部的属性名一次的名称与orderKey对应起来；
                ne.addDom({
                    that: that,
                    popup: popup
                })//调用主方法；
                ne.addOrRemove("set", "border", 0)//第一个属性为remove和set，第二属性为标签的属性名，第三个属性为属性值；
            })(this, popup, this.tableContentId + 2)
        },
        //首次数据加载为图中坐标点添加事件与数据；
        _setLayer: function (data) {
            this._sewagePollutionlayer = this.map.getLayer("sewagePollution");
            this._sewagePollutionlayer.on("click", lang.hitch(this, function (evt) {
                this._mapPoint = evt.mapPoint;
                var nowdata = data[evt.graphic.attributes.sewageCode]
                topic.publish(this.domNode.id + "click", this._mapPoint, this._toolTipDialog);
                var attrData = [];
                var staffData = [];
                var attrIndex = 0;
                var staffIndex = 0;
                for (var item in nowdata) {
                    attrIndex++;
                    if (item != "经度" && item != "纬度") {
                        attrData.push({
                            ID: attrIndex,
                            name: item,
                            value: nowdata[item]
                        });
                    }
                }
                this._attrGrid.setStore(this._createGridStore(attrData));
                var extent = new Extent(parseFloat(evt.mapPoint.x) - 0.03, parseFloat(evt.mapPoint.y) - 0.03
                , parseFloat(evt.mapPoint.x) + 0.03, parseFloat(evt.mapPoint.y) + 0.03, this.map.spatialReference);
                //this.map.setExtent(extent)
                this.map.centerAt(evt.mapPoint);
            }))
        },
        //添加到坐标点到图中；
        _addpointAll: function (data) {
            this._sewagePollutionlayer = this.map.getLayer("sewagePollution");
            this._sewagePollutionlayer.clear()
            this.textLayer = this.map.getLayer("sewageTextSymbol");
            this.textLayer.clear()
            for (var sewage in data) {
                var point = new Point(data[sewage].经度, data[sewage].纬度, this.map.spatialReference);
                var symbol = new PictureMarkerSymbol(this._projectName + "/widgets/assets/images/sewagePollution.png", 20, 20);
                var attr = { "sewageCode": sewage };
                var graphic = new Graphic(point, symbol, attr, null);
                this._sewagePollutionlayer.add(graphic);
                var textSymbol = new TextSymbol({
                    text: data[sewage].名称,
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
            //this.textLayer.setScaleRange(15000, 0);
            this.textLayer.setScaleRange(0, 0);
        },
        //分页数据添加到坐标点到图中；
        _addpoint: function () {
            //预留
        },
        //添加表格与图中坐标点数据展示联动
        _pointadd: function (controls) {
            this._tableshow()
            var that = this;
            var tableId = dojo.byId(this.tableContentId + 2)
            if (tableId.innerHTML != undefined && tableId.innerHTML != null) {
                var w_cons = tableId.getElementsByTagName("tr")
                for (var item = 1; item < w_cons.length; item++) {
                    w_cons[item].index = item
                    w_cons[item].onclick = function () {
                        that._mapPoint = { type: "point", x: controls[this.index - 1].经度, y: controls[this.index - 1].纬度 };
                        that._sewagePollutionlayer = that.map.getLayer("sewagePollution");
                        topic.publish("widgets_SewagePollution_0" + "click", that._mapPoint, that._toolTipDialog);
                        var attrData = [];
                        var attrIndex = 0;
                        var resultJson = controls[this.index - 1]
                        for (var item in resultJson) {
                            attrIndex++;
                            if (item != "经度" && item != "纬度") {
                                attrData.push({
                                    ID: attrIndex,
                                    name: item,
                                    value: resultJson[item]
                                });
                            }
                        }
                        that._attrGrid.setStore(that._createGridStore(attrData));
                        var extent = new Extent(parseFloat(controls[this.index - 1].经度) - 0.03, parseFloat(controls[this.index - 1].纬度) - 0.03
                  , parseFloat(controls[this.index - 1].经度) + 0.03, parseFloat(controls[this.index - 1].纬度) + 0.03, that.map.spatialReference);
                        //that.map.setExtent(extent)
                        that.map.centerAt(that._mapPoint);
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
        //功能面板与表格面板的切换；
        TabHost: function () {
            var $tableTitleId = dojo.byId(this.tableTitleId + 2);//表格头部对应的标题
            this.tableTitleNode.style.display = "block"//表格头部
            $tableTitleId.style.display = "inline-block"
            $tableTitleId.innerHTML = "排污口列表";
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
            $tableTitle[2].style.background = "#f1ab00";
            $tableTitle[2].style.borderRight = "1px solid beige";
            $tableTitle[2].style.borderBottom = "1px solid beige";
            $tableContent[2].style.display = "block";
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
            var $tableTitleId = dojo.byId(this.tableTitleId + 2);
            var $tableContentId = dojo.byId(this.tableContentId + 2);
            $tableTitleId.style.display = "inline"
            $tableTitleId.style.borderRight = "";
            $tableTitleId.style.borderBottom = "";
            $tableTitleId.innerHTML = "";
            $tableContentId.innerHTML = "";
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
        _setLayerVisible: function () {
            var layer = this.map.getLayer("sewagePollution");
            layer.setVisibility(this.checkBox.checked);
            this.textLayer = this.map.getLayer("sewageTextSymbol");
            this.textLayer.setVisibility(this.checkBox.checked);
            //var searchLayer = this.map.getLayer("searchResult");
            //var length = searchLayer.graphics.length;
            //if (length > 0) {
            //    var graphics = array.filter(searchLayer.graphics, function (graphic) {
            //        if (graphic.attributes.type == "sewagePollution") {
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
    return coal;
});