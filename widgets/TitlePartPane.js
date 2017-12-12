/**
 * Created by Administrator on 2015/10/13.
 */
/**
 * Created by Administrator on 2015/9/29.
 */
define([
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/data/ItemFileWriteStore",
    "dojo/dom-style",
    "dojo/request/xhr",
    "dojo/mouse",
    "dojo/on",
    "dijit/popup",
    "dojo/text!./templates/TitlePartPane.html",
    "dojo/topic",
    "dijit/TooltipDialog",
    "dijit/form/CheckBox",
    "dijit/layout/ContentPane",
    "dojox/grid/DataGrid",
    "esri/Color",
    "widgets/_Widget",
    "widgets/tools/arcGISDynamicMapServiceLayer"
],function(
    array,
    declare,
    lang,
    ItemFileWriteStore,
    domStyle,
    xhr,
    mouse,
    on,
    popup,
    template,
    topic,
    TooltipDialog,
    CheckBox,
    ContentPane,
    DataGrid,
    Color,
    _Widget,
    arcGISDynamicMapServiceLayer
){
    var t = declare("widgets.TitlePartPane",_Widget,{
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
            topic.subscribe(this.domNode.id + "close", lang.hitch(this, "onClose"));
            this._setEvent();
        },
        startup:function(){
            this.inherited(arguments);
        },
        onClose:function(){

        },
        _setEvent:function(){
            on(this.iconNode,mouse.enter,lang.hitch(this,function(evt){
                domStyle.set(this.iconNode,"cursor","pointer");
            }));
            on(this.iconNode,mouse.leave,lang.hitch(this,function(evt){
                domStyle.set(this.iconNode,"cursor","default");
            }));
            on(this.iconNode, "click", lang.hitch(this, function (evt) {
                topic.publish(this.domNode.id + "close", true);
            }));
        }
    });
    return t;
});