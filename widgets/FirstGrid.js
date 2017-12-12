/**
 * Created by Administrator on 2015/9/29.
 */
define([
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/data/ItemFileWriteStore",
    "dojo/dom-style",
    "dojo/dom-class",
    "dojo/number",
    "dojo/request/xhr",
    "dojo/topic",
    "dojo/on",
    "dijit/popup",
    "dojo/text!./templates/FirstGrid.html",
    "dijit/TooltipDialog",
    "dijit/form/CheckBox",
    "dijit/form/NumberSpinner",
    "dijit/layout/ContentPane",
    "dojox/grid/DataGrid",
    "dojox/layout/FloatingPane",
    "dojox/layout/Dock",
    "esri/layers/LayerDrawingOptions",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/TextSymbol",
    "esri/graphic",
    "esri/renderers/UniqueValueRenderer",
    "widgets/_Widget",
    "widgets/TitlePartPane",
    "esri/geometry/Extent",
    "widgets/tools/arcGISDynamicMapServiceLayer",
    "esri/symbols/Font",
    "esri/Color",
],function(
    array,
    declare,
    lang,
    ItemFileWriteStore,
    domStyle,
    domClass,
    number,
    xhr,
    topic,
    on,
    popup,
    template,
    TooltipDialog,
    CheckBox,
    NumberSpinner,
    ContentPane,
    DataGrid,
    FloatingPane,
    Dock,
    LayerDrawingOptions,
    SimpleLineSymbol,
    SimpleFillSymbol,
    TextSymbol,
    Graphic,
    UniqueValueRenderer,
    _Widget,
    TitlePartPane,
    Extent,
    arcGISDynamicMapServiceLayer,
    Font,
    Color
){
    var t = declare("widgets.FirstGrid",_Widget,{
        templateString: template,
        map:null,
        _floatPaneDefaultWidth:300,
        _floatPaneMaxWidth:808,
        constructor: function (para) {
            if (para != undefined) {

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
                checked:false
            }, this.checkBoxNode);
            this._opacityTextBox = new NumberSpinner({
                value:"10",
                intermediateChanges:true,
                constraints: { min:0, max:10, places:0 },
                style:"width:42px;margin-top:5px;font-size: 10px;" +
                "font-family: 'Microsoft YaHei';font-weight: bold;text-align: center;" +
                "vertical-align: middle;"
            },this.opacityNode);
            this.floatingPane = new FloatingPane({
                resizable: true,
                dockable: false,
                title: "指标",
                closable: true,
                //dockTo: dock,
                style: "position:absolute;top:-137px;left:270px;width:380px;" +
                "height:95px;z-index:50;opacity: 0;font-size:12px;margin:0;",
                close: lang.hitch(this,function (evt) {
                    if (!this.floatingPane.closable) {
                        return;
                    }
                    this.floatingPane.hide();
                })
            }, dojo.byId("floatPane"));
            this.floatingPane.hide();
            this._toolTipDialog = new TooltipDialog({
                onOpen: lang.hitch(this, function () {
                    this._contentPane.resize();
                    topic.publish(this.domNode.id + "open", this._mapPoint, this._toolTipDialog);
                }),
                onClose: lang.hitch(this, function () {
                    topic.publish(this.domNode.id + "close", this._toolTipDialog);
                })
            });
            this._setGrid();
            this._setEvent();
        },
        startup:function(){
            this.inherited(arguments);
            this._contentPane.startup();
            this._setLayerVisible();
        },
        select:function(evt){
            this.checkBox.set("checked",!this.checkBox.checked);
        },
        onClick: function (popupPoint,toolTipDialog) {

        },
        onClose:function(popupPoint,toolTipDialog){

        },
        onOpen:function(tooltipDialog){

        },
        _setMapAttr:function(map){
            if(map){
                this.map = map;
                this._setFirstGridLayer();
            }
        },
        _getMapAttr:function(){
            return this.map;
        },
        _setEvent:function(){
            topic.subscribe(this.domNode.id + "click", lang.hitch(this, "onClick"));
            topic.subscribe(this.domNode.id + "close", lang.hitch(this, "onClose"));
            topic.subscribe(this.domNode.id + "open", lang.hitch(this, "onOpen"));
            on(this.checkBox,"change",lang.hitch(this,function(evt){
                this._setLayerVisible();
                //显示以及网格右下方的信息表格
                this._setFloatingPaneVisible();
                if(this.checkBox.checked) {
                    this._setLayerRender();
                } else {
                    popup.close();
                }
            }));
            on(this._opacityTextBox,"change",lang.hitch(this,function(e){
                var layer = this.map.getLayer("firstGrid");
                var labelLayer = this.map.getLayer("firstGridlabels");
                layer.setOpacity(this._opacityTextBox.value/10);
                labelLayer.setOpacity(this._opacityTextBox.value/10);
            }));//改变不透明度
        },
        _setGrid:function(){
            this._floatGrid = new DataGrid({
                style:"padding:0;font-size: 12px;font-family: 'Microsoft YaHei';",
                structure:this._createFloatGridLayout(),
                autoHeight:true,
                autoWidth:true,
                store: this._createGridStore([])
            });
            this._attrGrid = new DataGrid({
                style:"padding:0;font-size: 12px;width:220px;font-family: 'Microsoft YaHei';float:left;",
                structure:this._createAttrGridLayout(),
                //autoHeight:true,
                height:"282px",
                width:"220px",
                //autoWidth:true,
                store: this._createGridStore([])
            });
            this._staffGrid = new DataGrid({
                style:"padding:0;font-size: 12px;width:187px;font-family: 'Microsoft YaHei';float:left",
                structure:this._createStaffGridLayout(),
                //autoHeight:true,
                height:"282px",
                width:"187px",
                //autoWidth:true,
                store: this._createGridStore([])
            });
            this._titlePartPane = new TitlePartPane({
                style:"background-color:#259ae0",
                onClose:lang.hitch(this,function(){
                    popup.close();
                })
            });
            this._contentPane = new ContentPane({
                style:"width:413px;height:286px;padding:0;margin:0;overflow: hidden;"
            });
            this._toolTipDialog.addChild(this._titlePartPane);
            this._contentPane.addChild(this._attrGrid);
            this._contentPane.addChild(this._staffGrid);
            this.floatingPane.addChild(this._floatGrid);
            this._toolTipDialog.addChild(this._contentPane);
        },
        _createFloatGridLayout:function(){
            var layout = [
                {
                    name: '大气质量', field: 'quality', width: '50px', cellStyles: 'text-align:center;',
                    headerStyles: "text-align:center;font-size: 12px;font-family: 'Microsoft YaHei';font-weight: normal;"
                },
                {
                    name: 'AQI', field: 'AQI', width: '30px', cellStyles: 'text-align:center;',
                    headerStyles: "text-align:center;font-size: 12px;font-family: 'Microsoft YaHei';font-weight: normal;"
                },
                {
                    name: 'PM10', field: 'PM10', width: '40px', cellStyles: 'text-align:center;',
                    headerStyles: "text-align:center;font-size: 12px;font-family: 'Microsoft YaHei';font-weight: normal;"
                },
                {
                    name: 'PM2.5', field: 'PM25', width: '40px', cellStyles: 'text-align:center;',
                    headerStyles: "text-align:center;font-size: 12px;font-family: 'Microsoft YaHei';font-weight: normal;"
                },
                {
                    name: 'SO2', field: 'SO2', width: '30px', cellStyles: 'text-align:center;',
                    headerStyles: "text-align:center;font-size: 12px;font-family: 'Microsoft YaHei';font-weight: normal;"
                },
                {
                    name: 'CO', field: 'CO', width: '30px', cellStyles: 'text-align:center;',
                    headerStyles: "text-align:center;font-size: 12px;font-family: 'Microsoft YaHei';font-weight: normal;"
                },
                {
                    name: 'NO2', field: 'NO2', width: '30px', cellStyles: 'text-align:center;',
                    headerStyles: "text-align:center;font-size: 12px;font-family: 'Microsoft YaHei';font-weight: normal;"
                },
                {
                    name: 'O3', field: 'O3', width: '30px', cellStyles: 'text-align:center;',
                    headerStyles: "text-align:center;font-size: 12px;font-family: 'Microsoft YaHei';font-weight: normal;"
                }
            ];
            return layout;
        },
        _createAttrGridLayout:function(){
            var layout = [
                {
                    name: '序号', field: 'ID', width:'36px',hidden: true, cellStyles: 'text-align:center;',
                    headerStyles: "text-align:center;font-size: 12px;font-family: 'Microsoft YaHei';font-weight: normal;"
                },
                {
                    name: '属性名称', field: 'name',width:'88px',cellStyles: 'text-align:center;',
                    headerStyles: "text-align:center;font-size: 12px;font-family: 'Microsoft YaHei';font-weight: normal;"
                },
                {
                    name: '属性值', field: 'value',width:'88px', cellStyles: 'text-align:center;',
                    headerStyles: "text-align:center;font-size: 12px;font-family: 'Microsoft YaHei';font-weight: normal;"
                }
            ];
            return layout;
        },
        _createStaffGridLayout:function(){
            var layout = [
                {
                    name: '序号', field: 'ID', width:'36px', hidden: true,cellStyles: 'text-align:center;',
                    headerStyles: "text-align:center;font-size: 12px;font-family: 'Microsoft YaHei';font-weight: normal;"
                },
                {
                    name: '网格员名称', field: 'name',width:'63px', cellStyles: 'text-align:center;',
                    headerStyles: "font-weight: bold;text-align:center;font-size: 12px;font-family: 'Microsoft YaHei';font-weight: normal;"
                },
                {
                    name: '联系方式', field: 'value', width:'78px',cellStyles: 'text-align:center;',
                    headerStyles: "text-align:center;font-size: 12px;font-family: 'Microsoft YaHei';font-weight: normal;"
                }
            ];
            return layout;
        },
        _createGridStore:function(items){
            var store = new ItemFileWriteStore({
                data: {
                    identifier: "ID",
                    items: items
                }
            });
            return store;
        },
        _setFirstGridLayer:function(){
            this._firstGridlayer = this.map.getLayer("firstGrid");
            this._firstGridlayer.on("click", lang.hitch(this, function (evt) {
                this._mapPoint = evt.mapPoint;
                topic.publish(this.domNode.id + "click", this._mapPoint, this._toolTipDialog);
                xhr.post(this._projectName + "/widgets/handler/FirstGrid.ashx", {
                    handleAs: "text",
                    timeout: 10000,
                    data: {
                        methodName: "GetGridInfo",
                        gridCode: evt.graphic.attributes.gridcode == undefined ? evt.graphic.attributes.GRIDCODE : evt.graphic.attributes.gridcode
                    }
                }).then(lang.hitch(this, function (result) {
                    
                    var attrData=[];
                    var staffData = [];
                    var attrIndex=0;
                    var staffIndex = 0;
                    var resultJson = eval("(" + result + ")");
                    for (var item in resultJson.gridInfo) {
                        attrIndex++;
                        attrData.push({
                            ID:attrIndex,
                            name:item,
                            value:resultJson.gridInfo[item]
                        });
                    }
                    this._attrGrid.setStore(this._createGridStore(attrData));
                    for (var item in resultJson.userList) {
                        staffIndex++;
                        staffData.push({
                            ID:staffIndex,
                            name:item,
                            value:resultJson.userList[item]
                        });
                    }
                    this._attrGrid.setStore(this._createGridStore(attrData));
                    this._staffGrid.setStore(this._createGridStore(staffData));
                }), lang.hitch(this, function (error) {
                }));
            }));
        },
        _setLayerVisible:function() {
            var layer = this.map.getLayer("firstGrid");
                layer.setVisibility(this.checkBox.checked);
            //var textLayer = this.map.getLayer("firstGridTextSymbol");
            //    textLayer.setVisibility(this.checkBox.checked);
            arcGISDynamicMapServiceLayer.setLayerInfoVisible(this.map,"baseMap",
                "一级网格", !this.checkBox.checked);
        },
        _setLayerRender: function () {
            xhr.post(this._projectName + "/widgets/handler/FirstGrid.ashx", {
                handleAs: "text",
                timeout: 10000,
                data: {
                    methodName: "GetPollutionQuality"
                }
            }).then(lang.hitch(this, function (result) {
                var data = [];
                var index = 0;
                var pollutionQuality = eval("(" + result + ")");
                var layer = this.map.getLayer("firstGrid");
                var defaultSymbol = new SimpleFillSymbol().setColor(new Color("#fac305"));
                //var defaultSymbol = new SimpleFillSymbol().setColor(new Color("#fd5b30"));
                var renderer = new UniqueValueRenderer(defaultSymbol, "gridcode");
                //for(var grid in pollutionQuality){
                    index++;
                    renderer.addValue(gridCode, new SimpleFillSymbol().setColor(pollutionQuality[gridCode].color));
                    data.push({
                        ID: index,
                        gridName: pollutionQuality[gridCode].gridName,
                        quality: pollutionQuality[gridCode].quality,
                        AQI: number.round(pollutionQuality[gridCode].AQI, 4),
                        PM10: number.round(pollutionQuality[gridCode].PM10, 4),
                        PM25: number.round(pollutionQuality[gridCode].PM25, 4),
                        SO2: number.round(pollutionQuality[gridCode].SO2, 4),
                        CO: number.round(pollutionQuality[gridCode].CO, 4),
                        NO2: number.round(pollutionQuality[gridCode].NO2, 4),
                        O3: number.round(pollutionQuality[gridCode].O3, 4)
                    });
                //}
                    this._setFloatingPaneContent(data);
                    
                    layer.setRenderer(renderer);
                    layer.refresh();
                
            }), lang.hitch(this, function (error) {
            }));
        },
        _setFloatingPaneContent:function(items){
            this._floatGrid.setStore(this._createGridStore(items));
        },
        _setFloatingPaneVisible:function(){
            if(this.checkBox.checked) {
                this._floatPaneDefaultWidth = domStyle.get(this.floatingPane.domNode, "width");
                domStyle.set(this.floatingPane.domNode, "top","-57px")
                this.floatingPane.show();
            }
            else{
                this.floatingPane.hide();
            }
        }
    });
    return t;
});