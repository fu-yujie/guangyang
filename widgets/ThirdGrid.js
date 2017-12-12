/**
 * Created by Administrator on 2015/9/29.
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
    "dojo/text!./templates/ThirdGrid.html",
    "dijit/TooltipDialog",
    "dijit/form/CheckBox",
    "dijit/form/NumberSpinner",
    "dijit/layout/ContentPane",
    "dojox/grid/DataGrid",
    "esri/Color",
    "widgets/_Widget",
    "widgets/TitlePartPane",
    "widgets/tools/arcGISDynamicMapServiceLayer"
],function(
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
    NumberSpinner,
    ContentPane,
    DataGrid,
    Color,
    _Widget,
    TitlePartPane,
    arcGISDynamicMapServiceLayer
){
    var t = declare("widgets.ThirdGrid",_Widget,{
        templateString: template,
        map:null,
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
            },this.checkBoxNode);
            this._opacityTextBox = new NumberSpinner({
                value:"10",
                intermediateChanges:true,
                constraints: { min:0, max:10, places:0 },
                style:"width:42px;margin-top:5px;font-size: 10px;" +
                "font-family: 'Microsoft YaHei';font-weight: bold;text-align: center;" +
                "vertical-align: middle;"
            },this.opacityNode);
            this._toolTipDialog = new TooltipDialog({
                onOpen:lang.hitch(this,function () {
                    this._contentPane.resize();
                    topic.publish(this.domNode.id + "open", this._mapPoint, this._toolTipDialog);
                }),
                onClose:lang.hitch(this,function(){
                    topic.publish(this.domNode.id + "close", this._toolTipDialog);
                })
            });
            this._setGrid();
            this._setEvent();
        },
        startup:function(){
            this.inherited(arguments);
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
                this._setThirdGridLayer();
            }
        },
        _getMapAttr:function(){
            return this.map;
        },
        _setEvent:function(){
            topic.subscribe(this.domNode.id + "click", lang.hitch(this, "onClick"));
            topic.subscribe(this.domNode.id + "close", lang.hitch(this, "onClose"));
            topic.subscribe(this.domNode.id + "open", lang.hitch(this, "onOpen"));
            on(this._opacityTextBox,"change",lang.hitch(this,function(e){
                var layer = this.map.getLayer("thirdGrid");
                var labelLayer = this.map.getLayer("thirdGridlabels");
                layer.setOpacity(this._opacityTextBox.value/10);
                labelLayer.setOpacity(this._opacityTextBox.value/10);
            }));//改变不透明度
            on(this.checkBox,"change",lang.hitch(this,function(evt){
                this._setLayerVisible();
                if (this.checkBox.checked) {
                    //this._setLayerRender();

                } else {
                    popup.close();
                }
            }));
        },
        _setGrid:function(){
            this._attrGrid = new DataGrid({
                style:"padding:0;font-size: 12px;width:220px;font-family: 'Microsoft YaHei';float:left;",
                structure:this._createAttrGridLayout(),
                //autoHeight:true,
                height:"242px",
                //width:"220px",
                //autoWidth:true,
                store: this._createGridStore([])
            });
            this._staffGrid = new DataGrid({
                style:"padding:0;font-size: 12px;width:187px;font-family: 'Microsoft YaHei';float:left",
                structure:this._createStaffGridLayout(),
                //autoHeight:true,
                height:"242px",
                //width:"187px",
                //autoWidth:true,
                store: this._createGridStore([])
            });
            this._titlePartPane = new TitlePartPane({
                style:"background-color:lightskyblue",
                onClose:lang.hitch(this,function(){
                    popup.close();
                })
            });
            this._contentPane = new ContentPane({
                style:"width:413px;padding:0;margin:0;overflow: hidden;"
            });
            this._toolTipDialog.addChild(this._titlePartPane);
            this._contentPane.addChild(this._attrGrid,0);
            this._contentPane.addChild(this._staffGrid,1);
            this._toolTipDialog.addChild(this._contentPane);
        },
        _setThirdGridLayer:function(){
            this._thirdGridlayer = this.map.getLayer("thirdGrid");
            this._thirdGridlayer.on("click", lang.hitch(this, function (evt) {
                this._mapPoint = evt.mapPoint;
                topic.publish(this.domNode.id + "click", this._mapPoint, this._toolTipDialog);
                xhr.post(this._projectName + "/widgets/handler/ThirdGrid.ashx", {
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
                    name: '网格员名称', field: 'name', cellStyles: 'text-align:center;',
                    headerStyles: "font-weight: bold;text-align:center;font-size: 12px;font-family: 'Microsoft YaHei';font-weight: normal;"
                },
                {
                    name: '联系方式', field: 'value', cellStyles: 'text-align:center;',
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
        _setLayerVisible:function() {
            var layer = this.map.getLayer("thirdGrid");
            layer.setVisibility(this.checkBox.checked);
        }
    });
    return t;
});