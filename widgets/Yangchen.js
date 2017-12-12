/// <reference path="jquery.js" />
/// <reference path="jquery.js" />
/**
 * Created by Administrator on 2015/9/29.
 */
define([
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/data/ItemFileWriteStore",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/request/xhr",
    "dojo/topic",
    "dojo/on",
    "dojo/text!./templates/Yangchen.html",
    "dijit/form/Button",
    "dijit/form/CheckBox",
    "dijit/popup",
    "dijit/TooltipDialog",
    "dojox/charting/Chart",
    "dojox/charting/themes/Dollar",
    "dojox/grid/DataGrid",
    "dijit/layout/ContentPane",
    "dojox/layout/FloatingPane",
    "dojox/layout/Dock",
    "widgets/_Widget",
    "widgets/WCtrlInfo",
    "esri/Color",
    "esri/graphic",
    "esri/InfoTemplate",
    "esri/dijit/Popup",
    "esri/geometry/Extent",
    "esri/dijit/PopupTemplate",
    "esri/geometry/Point",
    "esri/layers/GraphicsLayer",
    "esri/SpatialReference",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/PictureMarkerSymbol"
], function (
    array,
    declare,
    lang,
    ItemFileWriteStore,
    domClass,
    domConstruct,
    xhr,
    topic,
    on,
    template,
    Button,
    CheckBox,
    popup,
    TooltipDialog,
    Chart,
    theme,
    DataGrid,
    ContentPane,
    FloatingPane,
    Dock,
    _Widget,
    WCtrlInfo,
    Color,
    Graphic,
    InfoTemplate,
    Popup,
    Extent,
    PopupTemplate,
    Point,
    GraphicsLayer,
    SpatialReference,
    SimpleFillSymbol,
    SimpleLineSymbol,
    SimpleMarkerSymbol,
    PictureMarkerSymbol
) {

    var t = declare("widgets.Yangchen", _Widget, {
        map: null,
        templateString: template,
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
                    this._attrContent.resize();
                    topic.publish(this.domNode.id + "open", this._mapPoint, this._toolTipDialog);
                }),
                onClose: lang.hitch(this, function () {
                    topic.publish(this.domNode.id + "close", this._toolTipDialog);
                })
            });
            this._setEvent();
            this._setGrid();
        },
        startup: function () {

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
        _setGrid: function () {
            this._attrContent = new ContentPane({
                style: "width:350px;height:auto;padding:0;margin:0;overflow: hidden;"
            });
            this._toolTipDialog.addChild(this._attrContent);
        },
        _getData: function () {
            /// <summary>
            /// 获取所有微监控点的属性信息
            /// </summary>   
            var th = this;
            var XHR = null;
            if (window.XMLHttpRequest) {
                // 非IE内核  
                XHR = new XMLHttpRequest();
            } else if (window.ActiveXObject) {
                // IE内核,这里早期IE的版本写法不同,具体可以查询下  
                XHR = new ActiveXObject("Microsoft.XMLHTTP");
            } else {
                XHR = null;
            }

            if (XHR) {
                XHR.open("GET", "http://192.168.30.242:8065/api/raise/GetRaisePointLocation");

                XHR.onreadystatechange = function () {
                    if (XHR.readyState === 4 && XHR.status === 200) {
                        sController = XHR.responseText;
                        th._cutData(eval("(" + sController + ")"));
                        th._addpoint(eval("(" + sController + ")"));
                        th._setLayer(eval("(" + sController + ")"));
                    }
                };
                XHR.send();
            }
        },
        //数据排序完毕执行分页插件自动生成列表；
        _cutData: function (sController) {
            this.TabHost();
            //数据自动加载，以及分页的实现；注意数据格式为：[{},{},{},{}]
            (function (that, popup, tableContentId) {
                var ne = new page();
                ne.pageContentElement = "table"; //用哪种 标签进行数据的展示，可以用table与tr+td;或者是ul+li+span;只需要填入table或者ul既可；
                ne.cut_page_id = tableContentId; //整体容器的最外层id
                ne.data = sController.Data; //数据；注：数据格式为[{},{},{}];外层为数组，每个数组内的元素为对象的格式；
                ne.pageContentLength = 10; //每页展示数据的长度或个数；
                ne.orderKey = ["RaisePointName", "JCJG2PM10", "JCJG1PM25"]; //表格展示的属性名的顺序
                ne.orderKeyName = ["名称", "PM10", "TSP"];//表格头部的属性名一次的名称与orderKey对应起来；
                ne.addDom({
                    that: that,
                    popup: popup
                });//调用主方法；
                ne.addOrRemove("set", "border", 0); //第一个属性为remove和set，第二属性为标签的属性名，第三个属性为属性值；
            })(this, popup, this.tableContentId + 3);
        },
        //首次数据加载为图中坐标点添加事件与数据；
        _setLayer: function (sController) {
            this._yControllerLayer = this.map.getLayer("yangchen");
            this._yControllerLayer.on("click", lang.hitch(this, function (evt) {
                this._attrContent.destroyDescendants();
                var wCtrlInfo = new WCtrlInfo({
                    title: evt.graphic.attributes.name,
                    code: evt.graphic.attributes.code,
                    jcType: "5",
                    id: evt.graphic.attributes.Id
                });
                on(wCtrlInfo, "click", lang.hitch(this, function (evt) {
                    popup.close();
                }))
                this._attrContent.addChild(wCtrlInfo);
                this._mapPoint = evt.mapPoint;
                topic.publish(this.domNode.id + "click", this._mapPoint, this._toolTipDialog);
                var extent = new Extent(parseFloat(evt.graphic.attributes.Longitude) - 0.03, parseFloat(evt.graphic.attributes.Latitude) - 0.03
                 , parseFloat(evt.graphic.attributes.Longitude) + 0.03, parseFloat(evt.graphic.attributes.Latitude) + 0.03, this.map.spatialReference);
                this.map.setExtent(extent)
            }))
        },
        //添加到坐标点到图中；
        _addpoint: function (sController) {
            this._yControllerLayer = this.map.getLayer("yangchen");
            /// <summary>
            /// 根据微监控点的属性信息，生成点，并将点绘制到地图中。
            /// </summary>
            /// <param name="controls">微监控点的属性信息</param>
            // 清除图中的元素    
            this._yControllerLayer.clear();
            var length = sController.Data.length;
            if (length > 0) {
                var spatialReference = this.map.spatialReference;
                for (var i = 0; i < length; i++) {
                    var pt = new Point(sController.Data[i].Longitude, sController.Data[i].Latitude, spatialReference);
                    //switch (sController.Data[i].Status) {
                    //    case true:
                    //        {
                    //            this._url = this._projectName + "/widgets/assets/images/yangchen-green.png";
                    //        }
                    //        break;
                    //    case "false":
                    //        {
                    //            this._url = this._projectName + "/widgets/assets/images/yangchen-yellow.png";
                    //        }
                    //        break;
                    //    default:
                    //        break;
                    if (sController.Data[i].Status == true) {
                        this._url = this._projectName + "/widgets/assets/images/yangchen-green.png";
                    } else {
                        this._url = this._projectName + "/widgets/assets/images/yangchen-yellow.png";
                    }
                    //}
                    var symbol = new PictureMarkerSymbol({
                        "url": this._url,
                        "height": 22,
                        "width": 22,
                        "type": "esriPMS"
                    });

                    var attr = {
                        "name": sController.Data[i].RaisePointName, "code": sController.Data[i].Code, "quality": sController.Data[i].Status,
                        "Longitude": sController.Data[i].Longitude, "Latitude": sController.Data[i].Latitude, "PM25": sController.Data[i].JCJG1PM25, "PM10": sController.Data[i].JCJG2PM10, "Id": sController.Data[i].Id, "code": sController.Data[i].Code
                    };
                    var graphic = new Graphic(pt, symbol, attr);
                    this._yControllerLayer.add(graphic);
                }
            }
        },
        //添加表格与图中坐标点数据展示联动
        _pointadd: function (controls) {
            this._tableshow()
            var that = this;
            var tableId = dojo.byId(this.tableContentId + 3)
            if (tableId.innerHTML != undefined && tableId.innerHTML != null) {
                var w_cons = tableId.getElementsByTagName("tr")
                for (var i = 0; i < w_cons.length; i++) {
                    w_cons[i].index = i
                    w_cons[i].onclick = function () {
                        that._attrContent.destroyDescendants();
                        var wCtrlInfo = new WCtrlInfo({
                            title: controls[this.index - 1].RaisePointName,
                            code: controls[this.index - 1].Code,
                            jcType: "5",
                            id: controls[this.index - 1].Id,
                        });
                        on(wCtrlInfo, "click", lang.hitch(this, function (evt) {
                            popup.close();
                        }))
                        that._attrContent.addChild(wCtrlInfo);
                        that._mapPoint = { type: "point", x: controls[this.index - 1].Longitude, y: controls[this.index - 1].Latitude };
                        topic.publish(that.domNode.id + "click", that._mapPoint, that._toolTipDialog);
                        var extent = new Extent(parseFloat(controls[this.index - 1].Longitude) - 0.03, parseFloat(controls[this.index - 1].Latitude) - 0.03
                  , parseFloat(controls[this.index - 1].Longitude) + 0.03, parseFloat(controls[this.index - 1].Latitude) + 0.03, that.map.spatialReference);
                        that.map.setExtent(extent)
                    }
                }
            }
        },
        //功能面板与表格面板的切换；
        TabHost: function () {
            var $tableTitleId = dojo.byId(this.tableTitleId + 3);//表格头部对应的标题
            this.tableTitleNode.style.display = "block"//表格头部
            $tableTitleId.style.display = "inline-block"
            $tableTitleId.innerHTML = "扬尘列表";
            this.dataTemplateContent.style.display = "none";//选项面板隐藏
            this.dataTemplateListNode.style.display = "block";//表格面板展示
            this.TabIconNode.style.backgroundImage = "url(" + this._projectName + "/widgets/assets/images/Tab.png" + ")";
            this.ListIconNode.style.backgroundImage = "url(" + this._projectName + "/widgets/assets/images/List1.png" + ")";
        },
        //表格模板中每个表格的切换与默认显示
        _tableshow: function () {
            var $tableTitle = dojo.query(".MonitoringPointTableTitle")
            var $tableContent = dojo.query(".MonitoringPointTable")

            for (var i = 0; i < $tableTitle.length; i++) {
                $tableTitle[i].style.background = "white";
                $tableContent[i].style.display = "none";
            }
            $tableTitle[3].style.background = "#f1ab00";
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
            $tableTitleId.style.display = "inline";
            $tableTitleId.innerHTML = "";
            $tableContentId.innerHTML = "";
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
                    this._getData()
                } else if (this._yControllerLayer != undefined) {
                    // 清除图中的元素                      
                    this._clearTable()
                    popup.close()
                }
            }));
        },
        _setLayerVisible: function () {
            var layer = this.map.getLayer("yangchen");
            layer.setVisibility(this.checkBox.checked);

        }
    });
    return t;
});