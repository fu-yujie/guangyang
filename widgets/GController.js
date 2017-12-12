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
    "dojo/dom-geometry",
    "dojo/dom-style",
    "dojo/request/xhr",
    "dojo/topic",
    "dojo/on",
    "dojo/text!./templates/GController.html",
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
    "dijit/layout/LayoutContainer",
    "widgets/_Widget",
    "widgets/WCtrlInfo",
    "esri/Color",
    "esri/graphic",
    "esri/InfoTemplate",
    "esri/dijit/Popup",
    "esri/dijit/PopupTemplate",
    "esri/geometry/Point",
    "esri/layers/GraphicsLayer",
    "esri/SpatialReference",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/PictureMarkerSymbol",
    "esri/geometry/Extent",
    "widgets/themes/JS/cutPage"
], function (
    array,
    declare,
    lang,
    ItemFileWriteStore,
    domClass,
    domConstruct,
    domGeometry,
    domStyle,
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
    LayoutContainer,
    _Widget,
    WCtrlInfo,
    Color,
    Graphic,
    InfoTemplate,
    Popup,
    PopupTemplate,
    Point,
    GraphicsLayer,
    SpatialReference,
    SimpleFillSymbol,
    SimpleLineSymbol,
    SimpleMarkerSymbol,
    PictureMarkerSymbol,
    Extent,
    cutPage
){
    var t = declare("widgets.GController", _Widget, {
        map: null,
        _index:null,
        _domNodeId: null,
        g_table:null,
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
        postMixInProperties: function(){
            this.inherited(arguments);
            var pathName = window.document.location.pathname;
            this._projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);
        },
        buildRendering:function(){
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
            this.mainContent = new LayoutContainer({
                style:"display:none;"
            }, this.indexListNode);
            this.aqi = new ContentPane({
                content: "AQI",
                onClick:lang.hitch(this,function(){
                    this._setAQIAttr();
                })
            }, this.aqiNode);
            this.pm25 = new ContentPane({
                content: "PM2.5",
                onClick:lang.hitch(this,function(){
                    this._setPM25Attr();
                })
            }, this.pm25Node);
            this.pm10 = new ContentPane({
                content: "PM10",
                onClick:lang.hitch(this,function(){
                    this._setPM10Attr();
                })
            }, this.pm10Node);
            this.so2 = new ContentPane({
                content: "SO2",
                onClick:lang.hitch(this,function(){
                    this._setSO2Attr();
                })
            }, this.so2Node);
            this.no2 = new ContentPane({
                content: "NO2",
                onClick:lang.hitch(this,function(){
                    this._setNO2Attr();
                })
            }, this.no2Node);
            this.co = new ContentPane({
                content: "CO",
                onClick:lang.hitch(this,function(){
                    this._setCOAttr();
                })
            }, this.coNode);
            this.o3 = new ContentPane({
                content: "O3",
                onClick:lang.hitch(this,function(){
                    this._setO3Attr();
                })
            }, this.o3Node);
            this._setEvent();
            this._setGrid();
        },
        startup: function () {
           
        },
        select: function (evt) {
            this.checkBox.set("checked", !this.checkBox.checked);
        },
        resize: function (/*Object?*/newSize) {
            this.inherited(arguments);
            if (newSize) {
                domStyle.set(this.mapNode, "width", newSize.w + "px");
                domStyle.set(this.mapNode, "height", newSize.h + "px");
            }
            this.map.on("load", lang.hitch(this, function () {
                topic.publish(this.domNode.id + "mapLoaded", this.map);
                this.map.resize();
            }));
            this.map.on("extent-change", lang.hitch(this, function (result) {
                topic.publish(this.domNode.id + "mapExtentChange", result.extent);
            }));
        },
        onClick: function (popupPoint,toolTipDialog) {

        },
        onClose:function(popupPoint,toolTipDialog){

        },
        onOpen:function(tooltipDialog){

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
            xhr.post(this._projectName + "/widgets/handler/GController.ashx", {
                handleAs: "text",
                data: {
                    methodName: "GetAllGController",
                    index:this._index
                }
            }).then(lang.hitch(this, function (gController) {
                this._result = eval("(" + gController + ")");
                this._cutData(eval("(" + gController + ")"))
                this._addpoint(this._result)
                this._setLayer(this._result)
            }), lang.hitch(this, function (error) {
                console.log("获取所有国控点时返回错误：" + error);
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
                ne.orderKey = ["Name", "StatusName", "AQI", "Address"];//表格展示的属性名的顺序
                ne.orderKeyName = ["名称", "空气质量", "AQI", "地址"]//表格头部的属性名一次的名称与orderKey对应起来；
                ne.addDom({
                    that: that,
                    popup: popup
                })//调用主方法；
                ne.addOrRemove("set", "border", 0)//第一个属性为remove和set，第二属性为标签的属性名，第三个属性为属性值；
            })(this, popup, this.tableContentId+0)
            
        },
        //首次数据加载为图中坐标点添加事件与数据；
        _setLayer: function (data) {
            this._gControllerLayer = this.map.getLayer("gController");
            this._gControllerLayer.on("click", lang.hitch(this, function (evt) {
                this._mapPoint = evt.mapPoint;
                topic.publish(this.domNode.id + "click", this._mapPoint, this._toolTipDialog);
                this._attrContent.destroyDescendants();
                var gCtrlInfo = new WCtrlInfo({
                    title: evt.graphic.attributes.name,
                    code: evt.graphic.attributes.code,
                    jcType: "1",
                    index: this._index
                });
                on(gCtrlInfo, "click", lang.hitch(this, function () {
                    popup.close();
                }));
                this._attrContent.addChild(gCtrlInfo);
                var extent = new Extent(parseFloat(evt.graphic.attributes.Longitude) - 0.03, parseFloat(evt.graphic.attributes.Latitude) - 0.03
                 , parseFloat(evt.graphic.attributes.Longitude) + 0.03, parseFloat(evt.graphic.attributes.Latitude) + 0.03, this.map.spatialReference);
                this.map.setExtent(extent)
            }))
        },
        //添加到坐标点到图中；
        _addpoint: function (data) {
            this._gControllerLayer = this.map.getLayer("gController");
            this._gControllerLayer.clear();
            var length = data.length;
            if (length > 0) {
                for (var i = 0; i < length; i++) {
                    var pt = new Point(data[i].Longitude, data[i].Latitude, this.map.spatialReference);
                    switch (data[i].StatusName) {
                        case "优":
                            {
                                this._url = this._projectName + "/widgets/assets/images/GController_green.png";
                            }
                            break;
                        case "良":
                            {
                                this._url = this._projectName + "/widgets/assets/images/GController_yellow.png";
                            }
                            break;
                        case "轻度":
                            {
                                this._url = this._projectName + "/widgets/assets/images/GController_orange.png";
                            }
                            break;
                        case "中度":
                            {
                                this._url = this._projectName + "/widgets/assets/images/GController_red.png";
                            }
                            break;
                        case "重度":
                            {
                                this._url = this._projectName + "/widgets/assets/images/GController_purple.png";
                            }
                            break;
                        case "严重":
                            {
                                this._url = this._projectName + "/widgets/assets/images/GController_maroon.png";
                            }
                            break;
                        default:
                            break;
                    }
                    var symbol = new PictureMarkerSymbol({
                        "url": this._url,
                        "height": 22,
                        "width": 22,
                        "type": "esriPMS"
                    });
                    var attr = {
                        "name": data[i].Name, "address": data[i].Address, "quality": data[i].StatusName, "color": data[i].StatusColour,
                        "Longitude": data[i].Longitude, "Latitude": data[i].Latitude, "code": data[i].Code
                    };
                    var graphic = new Graphic(pt, symbol, attr);
                    this._gControllerLayer.add(graphic);
                }
            }
        },
        //添加表格与图中坐标点数据展示联动
        _pointadd: function (controls) {
            this._tableshow()
            var that = this;
            var tableId =dojo.byId(this.tableContentId + 0)
            if (tableId.innerHTML != undefined && tableId.innerHTML != null) {
                var w_cons = tableId.getElementsByTagName("tr")
                for (var item = 1; item < w_cons.length; item++) {
                    w_cons[item].index = item
                    w_cons[item].onclick = function () {
                        that._attrContent.destroyDescendants();
                        var gCtrlInfo = new WCtrlInfo({
                            title: controls[this.index - 1].Name,
                            code: controls[this.index - 1].Code,
                            jcType: "1",
                            index:that._index
                        });
                        on(gCtrlInfo, "click", lang.hitch(this, function (evt) {

                            popup.close();
                        }))
                        that._attrContent.addChild(gCtrlInfo);
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
            var $tableTitleId = dojo.byId(this.tableTitleId + 0);//表格头部对应的标题
            this.tableTitleNode.style.display = "block"//表格头部
            $tableTitleId.style.display = "inline-block"
            $tableTitleId.innerHTML = "国控点列表";
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
            $tableTitle[0].style.background = "#f1ab00";
            $tableContent[0].style.display = "block";
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
        _clearTable:function(){
            var $tableTitleId = dojo.byId(this.tableTitleId + 0);
            var $tableContentId = dojo.byId(this.tableContentId + 0);
            $tableTitleId.style.display = "inline"
            $tableTitleId.innerHTML = "";
            $tableContentId.innerHTML = "";
        },
        _setEvent: function () {
            topic.subscribe(this.domNode.id + "click", lang.hitch(this, "onClick"));
            topic.subscribe(this.domNode.id + "close", lang.hitch(this, "onClose"));
            topic.subscribe(this.domNode.id + "open", lang.hitch(this, "onOpen"));
            on(this.checkBox, "change", lang.hitch(this, function (evt) {
                this._setLayerVisible();
                if (this.checkBox.checked) {
                    domStyle.set(this.indexListNode, "display", "none");
                    this._getData();
                } else if (this._gControllerLayer != undefined) {
                    popup.close();
                    this._clearTable()
                    domStyle.set(this.indexListNode,"display","none");
                }
            }));
            this._index = this.aqi.content;
            this._domNodeId = this.aqi.domNode;
            domStyle.set(this.aqiNode, "background-image", "url('./widgets/assets/images/list_back.png')");
            domStyle.set(this.aqiNode, "background-size", "68px 35px");
            on(this.aqi,"mouseover",lang.hitch(this, function (aa) {
                domStyle.set(this.aqiNode, "background-color", "#cee6fa");
            }));
            on(this.aqi,"mouseout",lang.hitch(this, function (aa) {
                domStyle.set(this.aqiNode, "background-color", "rgba(255,255,255,0.7)");
            }));
            on(this.aqi,"mousedown",lang.hitch(this, function (aa) {
                if(this._index == this.aqi.content) {

                }else{
                    domStyle.set(this._domNodeId,"background-image", "none");
                    this._index =this.aqi.content;
                    this._domNodeId = this.aqi.domNode;
                }
                domStyle.set(this.aqiNode, "background-image", "url('./widgets/assets/images/list_back.png')");
                domStyle.set(this.aqiNode, "background-size", "68px 35px");
            }));
            on(this.pm25,"mouseover",lang.hitch(this, function (aa) {
                domStyle.set(this.pm25Node, "background-color", "#cee6fa");
            }));
            on(this.pm25,"mouseout",lang.hitch(this, function (aa) {
                domStyle.set(this.pm25Node, "background-color", "rgba(255,255,255,0.7)");
            }));
            on(this.pm25,"mousedown",lang.hitch(this, function (aa) {
                if(this._index == this.pm25.content) {

                }else{
                    domStyle.set(this._domNodeId,"background-image", "none");
                    this._index =this.pm25.content;
                    this._domNodeId = this.pm25.domNode;
                }
                domStyle.set(this.pm25Node, "background-image", "url('./widgets/assets/images/list_back.png')");
                domStyle.set(this.pm25Node, "background-size", "68px 35px");
            }));
            on(this.pm10,"mouseover",lang.hitch(this, function (aa) {
                domStyle.set(this.pm10Node, "background-color", "#cee6fa");
            }));
            on(this.pm10,"mouseout",lang.hitch(this, function (aa) {
                domStyle.set(this.pm10Node, "background-color", "rgba(255,255,255,0.7)");
            }));
            on(this.pm10,"mousedown",lang.hitch(this, function (aa) {
                if(this._index == this.pm10.content) {

                }else{
                    domStyle.set(this._domNodeId,"background-image", "none");
                    this._index =this.pm10.content;
                    this._domNodeId = this.pm10.domNode;
                }
                domStyle.set(this.pm10Node, "background-image", "url('./widgets/assets/images/list_back.png')");
                domStyle.set(this.pm10Node, "background-size", "68px 35px");
            }));
            on(this.so2,"mouseover",lang.hitch(this, function (aa) {
                domStyle.set(this.so2Node, "background-color", "#cee6fa");
            }));
            on(this.so2,"mouseout",lang.hitch(this, function (aa) {
                domStyle.set(this.so2Node, "background-color", "rgba(255,255,255,0.7)");
            }));
            on(this.so2,"mousedown",lang.hitch(this, function (aa) {
                if(this._index == this.so2.content) {

                }else{
                    domStyle.set(this._domNodeId,"background-image", "none");
                    this._index =this.so2.content;
                    this._domNodeId = this.so2.domNode;
                }
                domStyle.set(this.so2Node, "background-image", "url('./widgets/assets/images/list_back.png')");
                domStyle.set(this.so2Node, "background-size", "68px 35px");
            }));
            on(this.no2 ,"mouseover",lang.hitch(this, function (aa) {
                domStyle.set(this.no2Node, "background-color", "#cee6fa");
            }));
            on(this.no2 ,"mouseout",lang.hitch(this, function (aa) {
                domStyle.set(this.no2Node, "background-color", "rgba(255,255,255,0.7)");
            }));
            on(this.no2 ,"mousedown",lang.hitch(this, function (aa) {
                if(this._index == this.no2.content) {

                }else{
                    domStyle.set(this._domNodeId,"background-image", "none");
                    this._index =this.no2.content;
                    this._domNodeId = this.no2.domNode;
                }
                domStyle.set(this.no2Node, "background-image", "url('./widgets/assets/images/list_back.png')");
                domStyle.set(this.no2Node, "background-size", "68px 35px");
            }));
            on(this.co ,"mouseover",lang.hitch(this, function (aa) {
                domStyle.set(this.coNode, "background-color", "#cee6fa");
            }));
            on(this.co ,"mouseout",lang.hitch(this, function (aa) {
                domStyle.set(this.coNode, "background-color", "rgba(255,255,255,0.7)");
            }));
            on(this.co ,"mousedown",lang.hitch(this, function (aa) {
                if(this._index == this.co.content) {

                }else{
                    domStyle.set(this._domNodeId,"background-image", "none");
                    this._index =this.co.content;
                    this._domNodeId = this.co.domNode;
                }
                domStyle.set(this.coNode, "background-image", "url('./widgets/assets/images/list_back.png')");
                domStyle.set(this.coNode, "background-size", "68px 35px");
            }));
            on(this.o3 ,"mouseover",lang.hitch(this, function (aa) {
                domStyle.set(this.o3Node, "background-color", "#cee6fa");
            }));
            on(this.o3 ,"mouseout",lang.hitch(this, function (aa) {
                domStyle.set(this.o3Node, "background-color", "rgba(255,255,255,0.7)");
            }));
            on(this.o3 ,"mousedown",lang.hitch(this, function (aa) {
                if(this._index == this.o3.content) {

                }else{
                    domStyle.set(this._domNodeId,"background-image", "none");
                    this._index =this.o3.content;
                    this._domNodeId = this.o3.domNode;
                }
                domStyle.set(this.o3Node, "background-image", "url('./widgets/assets/images/list_back.png')");
                domStyle.set(this.o3Node, "background-size", "68px 35px");
            }));
        },
        _setAQIAttr:function(){
            var controls = this._result;
            this._gControllerLayer.clear();
            var length = controls.length;
            if (length > 0) {
                var spatialReference = this.map.spatialReference;
                for (var i = 0; i < length; i++) {
                    var pt = new Point(controls[i].Longitude, controls[i].Latitude, spatialReference);
                    switch (controls[i].AQIStatus) {
                        case "0501":
                        {
                            this._url = this._projectName + "/widgets/assets/images/GController_green.png";
                        }
                            break;
                        case "0502":
                        {
                            this._url = this._projectName + "/widgets/assets/images/GController_yellow.png";
                        }
                            break;
                        case "0503":
                        {
                            this._url = this._projectName + "/widgets/assets/images/GController_orange.png";
                        }
                            break;
                        case "0504":
                        {
                            this._url = this._projectName + "/widgets/assets/images/GController_red.png";
                        }
                            break;
                        case "0505":
                        {
                            this._url = this._projectName + "/widgets/assets/images/GController_purple.png";
                        }
                            break;
                        case "0506":
                        {
                            this._url = this._projectName + "/widgets/assets/images/GController_maroon.png";
                        }
                            break;
                        default:
                            break;
                    }
                    var symbol = new PictureMarkerSymbol({
                        "url": this._url,
                        "height": 22,
                        "width": 22,
                        "type": "esriPMS"
                    });
                    var attr = {
                        "name": controls[i].Name,
                        "address": controls[i].Address,
                        "quality": controls[i].StatusName,
                        "color": controls[i].StatusColour,
                        "Longitude": controls[i].Longitude,
                        "Latitude": controls[i].Latitude,
                        "code": controls[i].Code
                    };
                    var graphic = new Graphic(pt, symbol, attr);
                    this._gControllerLayer.add(graphic);
                }
            }
        },
        _setPM25Attr:function(){
            var controls = this._result;
            this._gControllerLayer.clear();
            var length = controls.length;
            if (length > 0) {
                var spatialReference = this.map.spatialReference;
                for (var i = 0; i < length; i++) {
                    var pt = new Point(controls[i].Longitude, controls[i].Latitude, spatialReference);
                    switch (controls[i].PM25Status) {
                        case "0501":
                        {
                            this._url = this._projectName + "/widgets/assets/images/GController_green.png";
                        }
                            break;
                        case "0502":
                        {
                            this._url = this._projectName + "/widgets/assets/images/GController_yellow.png";
                        }
                            break;
                        case "0503":
                        {
                            this._url = this._projectName + "/widgets/assets/images/GController_orange.png";
                        }
                            break;
                        case "0504":
                        {
                            this._url = this._projectName + "/widgets/assets/images/GController_red.png";
                        }
                            break;
                        case "0505":
                        {
                            this._url = this._projectName + "/widgets/assets/images/GController_purple.png";
                        }
                            break;
                        case "0506":
                        {
                            this._url = this._projectName + "/widgets/assets/images/GController_maroon.png";
                        }
                            break;
                        default:
                            break;
                    }
                    var symbol = new PictureMarkerSymbol({
                        "url": this._url,
                        "height": 22,
                        "width": 22,
                        "type": "esriPMS"
                    });
                    var attr = {
                        "name": controls[i].Name,
                        "address": controls[i].Address,
                        "quality": controls[i].StatusName,
                        "color": controls[i].StatusColour,
                        "Longitude": controls[i].Longitude,
                        "Latitude": controls[i].Latitude,
                        "code": controls[i].Code
                    };
                    var graphic = new Graphic(pt, symbol, attr);
                    this._gControllerLayer.add(graphic);
                }
            }
        },
        _setPM10Attr:function(){
            var controls = this._result;
        this._gControllerLayer.clear();
        var length = controls.length;
        if (length > 0) {
            var spatialReference = this.map.spatialReference;
            for (var i = 0; i < length; i++) {
                var pt = new Point(controls[i].Longitude, controls[i].Latitude, spatialReference);
                switch (controls[i].PM10Status) {
                    case "0501":
                    {
                        this._url = this._projectName + "/widgets/assets/images/GController_green.png";
                    }
                        break;
                    case "0502":
                    {
                        this._url = this._projectName + "/widgets/assets/images/GController_yellow.png";
                    }
                        break;
                    case "0503":
                    {
                        this._url = this._projectName + "/widgets/assets/images/GController_orange.png";
                    }
                        break;
                    case "0504":
                    {
                        this._url = this._projectName + "/widgets/assets/images/GController_red.png";
                    }
                        break;
                    case "0505":
                    {
                        this._url = this._projectName + "/widgets/assets/images/GController_purple.png";
                    }
                        break;
                    case "0506":
                    {
                        this._url = this._projectName + "/widgets/assets/images/GController_maroon.png";
                    }
                        break;
                    default:
                        break;
                }
                var symbol = new PictureMarkerSymbol({
                    "url": this._url,
                    "height": 22,
                    "width": 22,
                    "type": "esriPMS"
                });
                var attr = {
                    "name": controls[i].Name,
                    "address": controls[i].Address,
                    "quality": controls[i].StatusName,
                    "color": controls[i].StatusColour,
                    "Longitude": controls[i].Longitude,
                    "Latitude": controls[i].Latitude,
                    "code": controls[i].Code
                };
                var graphic = new Graphic(pt, symbol, attr);
                this._gControllerLayer.add(graphic);
            }
        }
    },
        _setSO2Attr:function(){
            var controls = this._result;
            this._gControllerLayer.clear();
            var length = controls.length;
            if (length > 0) {
                var spatialReference = this.map.spatialReference;
                for (var i = 0; i < length; i++) {
                    var pt = new Point(controls[i].Longitude, controls[i].Latitude, spatialReference);
                    switch (controls[i].SO2Status) {
                        case "0501":
                        {
                            this._url = this._projectName + "/widgets/assets/images/GController_green.png";
                        }
                            break;
                        case "0502":
                        {
                            this._url = this._projectName + "/widgets/assets/images/GController_yellow.png";
                        }
                            break;
                        case "0503":
                        {
                            this._url = this._projectName + "/widgets/assets/images/GController_orange.png";
                        }
                            break;
                        case "0504":
                        {
                            this._url = this._projectName + "/widgets/assets/images/GController_red.png";
                        }
                            break;
                        case "0505":
                        {
                            this._url = this._projectName + "/widgets/assets/images/GController_purple.png";
                        }
                            break;
                        case "0506":
                        {
                            this._url = this._projectName + "/widgets/assets/images/GController_maroon.png";
                        }
                            break;
                        default:
                            break;
                    }
                    var symbol = new PictureMarkerSymbol({
                        "url": this._url,
                        "height": 22,
                        "width": 22,
                        "type": "esriPMS"
                    });
                    var attr = {
                        "name": controls[i].Name,
                        "address": controls[i].Address,
                        "quality": controls[i].StatusName,
                        "color": controls[i].StatusColour,
                        "Longitude": controls[i].Longitude,
                        "Latitude": controls[i].Latitude,
                        "code": controls[i].Code
                    };
                    var graphic = new Graphic(pt, symbol, attr);
                    this._gControllerLayer.add(graphic);
                }
            }
        },
        _setNO2Attr:function(){
            var controls = this._result;
            this._gControllerLayer.clear();
            var length = controls.length;
            if (length > 0) {
                var spatialReference = this.map.spatialReference;
                for (var i = 0; i < length; i++) {
                    var pt = new Point(controls[i].Longitude, controls[i].Latitude, spatialReference);
                    switch (controls[i].NO2Status) {
                        case "0501":
                        {
                            this._url = this._projectName + "/widgets/assets/images/GController_green.png";
                        }
                            break;
                        case "0502":
                        {
                            this._url = this._projectName + "/widgets/assets/images/GController_yellow.png";
                        }
                            break;
                        case "0503":
                        {
                            this._url = this._projectName + "/widgets/assets/images/GController_orange.png";
                        }
                            break;
                        case "0504":
                        {
                            this._url = this._projectName + "/widgets/assets/images/GController_red.png";
                        }
                            break;
                        case "0505":
                        {
                            this._url = this._projectName + "/widgets/assets/images/GController_purple.png";
                        }
                            break;
                        case "0506":
                        {
                            this._url = this._projectName + "/widgets/assets/images/GController_maroon.png";
                        }
                            break;
                        default:
                            break;
                    }
                    var symbol = new PictureMarkerSymbol({
                        "url": this._url,
                        "height": 22,
                        "width": 22,
                        "type": "esriPMS"
                    });
                    var attr = {
                        "name": controls[i].Name,
                        "address": controls[i].Address,
                        "quality": controls[i].StatusName,
                        "color": controls[i].StatusColour,
                        "Longitude": controls[i].Longitude,
                        "Latitude": controls[i].Latitude,
                        "code": controls[i].Code
                    };
                    var graphic = new Graphic(pt, symbol, attr);
                    this._gControllerLayer.add(graphic);
                }
            }
        },
        _setCOAttr:function(){
            var controls = this._result;
            this._gControllerLayer.clear();
            var length = controls.length;
            if (length > 0) {
                var spatialReference = this.map.spatialReference;
                for (var i = 0; i < length; i++) {
                    var pt = new Point(controls[i].Longitude, controls[i].Latitude, spatialReference);
                    switch (controls[i].COStatus) {
                        case "0501":
                        {
                            this._url = this._projectName + "/widgets/assets/images/GController_green.png";
                        }
                            break;
                        case "0502":
                        {
                            this._url = this._projectName + "/widgets/assets/images/GController_yellow.png";
                        }
                            break;
                        case "0503":
                        {
                            this._url = this._projectName + "/widgets/assets/images/GController_orange.png";
                        }
                            break;
                        case "0504":
                        {
                            this._url = this._projectName + "/widgets/assets/images/GController_red.png";
                        }
                            break;
                        case "0505":
                        {
                            this._url = this._projectName + "/widgets/assets/images/GController_purple.png";
                        }
                            break;
                        case "0506":
                        {
                            this._url = this._projectName + "/widgets/assets/images/GController_maroon.png";
                        }
                            break;
                        default:
                            break;
                    }
                    var symbol = new PictureMarkerSymbol({
                        "url": this._url,
                        "height": 22,
                        "width": 22,
                        "type": "esriPMS"
                    });
                    var attr = {
                        "name": controls[i].Name,
                        "address": controls[i].Address,
                        "quality": controls[i].StatusName,
                        "color": controls[i].StatusColour,
                        "Longitude": controls[i].Longitude,
                        "Latitude": controls[i].Latitude,
                        "code": controls[i].Code
                    };
                    var graphic = new Graphic(pt, symbol, attr);
                    this._gControllerLayer.add(graphic);
                }
            }
        },
        _setO3Attr:function(){
            var controls = this._result;
            this._gControllerLayer.clear();
            var length = controls.length;
            if (length > 0) {
                var spatialReference = this.map.spatialReference;
                for (var i = 0; i < length; i++) {
                    var pt = new Point(controls[i].Longitude, controls[i].Latitude, spatialReference);
                    switch (controls[i].O3Status) {
                        case "0501":
                        {
                            this._url = this._projectName + "/widgets/assets/images/GController_green.png";
                        }
                            break;
                        case "0502":
                        {
                            this._url = this._projectName + "/widgets/assets/images/GController_yellow.png";
                        }
                            break;
                        case "0503":
                        {
                            this._url = this._projectName + "/widgets/assets/images/GController_orange.png";
                        }
                            break;
                        case "0504":
                        {
                            this._url = this._projectName + "/widgets/assets/images/GController_red.png";
                        }
                            break;
                        case "0505":
                        {
                            this._url = this._projectName + "/widgets/assets/images/GController_purple.png";
                        }
                            break;
                        case "0506":
                        {
                            this._url = this._projectName + "/widgets/assets/images/GController_maroon.png";
                        }
                            break;
                        default:
                            break;
                    }
                    var symbol = new PictureMarkerSymbol({
                        "url": this._url,
                        "height": 22,
                        "width": 22,
                        "type": "esriPMS"
                    });
                    var attr = {
                        "name": controls[i].Name,
                        "address": controls[i].Address,
                        "quality": controls[i].StatusName,
                        "color": controls[i].StatusColour,
                        "Longitude": controls[i].Longitude,
                        "Latitude": controls[i].Latitude,
                        "code": controls[i].Code
                    };
                    var graphic = new Graphic(pt, symbol, attr);
                    this._gControllerLayer.add(graphic);
                }
            }
        },
        _setMapAttr: function (map) {
            if (map) {
                this.map = map;
            }
        },
        _getMapAttr: function () {
            return this.map;
        },
        _setLayerVisible: function () {
            var layer = this.map.getLayer("gController");
            layer.setVisibility(this.checkBox.checked);
        }
    });
    return t;
});