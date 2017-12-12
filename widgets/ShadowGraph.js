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
    "dojo/text!./templates/ShadowGraph.html",
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
    var t = declare("widgets.ShadowGraph", _Widget, {
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
                checked: false,
                style:"margin-left:36px;"
            },this.checkBoxNode);
            this._setEvent();
        },      
        
        startup: function () {
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
            }));
            //this._setLayerVisible();
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
            this.layer = this.map.getLayer("ShadowGraph");
            this.layer.setVisibility(this.checkBox.checked);
        },
       
    });
    return t;
});