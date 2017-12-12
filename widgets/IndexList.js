/**
 * Created by 陈同建 on 2015/9/29.
 */
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-style",
    "dojo/on",
    "dojo/topic",
    "dojo/text!./templates/IndexList.html",
    "dijit/_Container",
    "dijit/_Contained",
    "dijit/layout/_ContentPaneResizeMixin",
    "dijit/layout/LayoutContainer",
    "dijit/layout/ContentPane",
    "./_Widget",
    "dojo/domReady!"
],function(
    declare,
    lang,
    domStyle,
    on,
    topic,
    template,
    _Container,
    _Contained,
    _ContentPaneResizeMixin,
    LayoutContainer,
    ContentPane,
    _Widget
){
    var aqi = declare("widgets.IndexList", [_Widget, _Container, _ContentPaneResizeMixin, _Contained],{
        // templateString: html||Object
        //    控件的html模板
        templateString: template,
        //postCreate: function () {
        //    /// <summary>
        //    /// 小部件的DOM准备好后并被插入到页面后调用该方法，保存图层信息
        //    /// </summary>
        //    this.inherited(arguments);
        //    this.mainContent = new LayoutContainer({
        //    }, this.indexListContentNode);
        //    this.aqi = new ContentPane({
        //        content: "AQI",
        //        onClick: lang.hitch(this, function () {
        //            topic.publish(this.domNode.id + "click", true);
        //        })                  
        //    },this.aqiNode);
        //    this.pm25 = new ContentPane({
        //        content: "PM2.5",
        //        onClick: lang.hitch(this, function () {
        //            topic.publish(this.domNode.id + "click", true);
        //        })
        //    },this.pm25Node);
        //    this.pm10 = new ContentPane({
        //        content: "PM10",
        //        onClick: lang.hitch(this, function () {
        //            topic.publish(this.domNode.id + "click", true);
        //        })
        //    },this.pm10Node);
        //    this.so2 = new ContentPane({
        //        content: "SO2",
        //        onClick: lang.hitch(this, function () {
        //            topic.publish(this.domNode.id + "click", true);
        //        })
        //    },this.so2Node);
        //    this.no2 = new ContentPane({
        //        content: "NO2",
        //        onClick: lang.hitch(this, function () {
        //            topic.publish(this.domNode.id + "click", true);
        //        })
        //    },this.no2Node);
        //    this.co = new ContentPane({
        //        content: "CO",
        //        onClick: lang.hitch(this, function () {
        //            topic.publish(this.domNode.id + "click", true);
        //        })
        //    },this.coNode);
        //    this.o3 = new ContentPane({
        //        content: "O3",
        //        onClick: lang.hitch(this, function () {
        //            topic.publish(this.domNode.id + "click", true);
        //        })
        //    },this.o3Node);
        //    this._initEvent();
        //},
        //startup: function () {
        //    this.inherited(arguments);
        //    this.aqi.startup();
        //    this.mainContent.startup();
        //},
        //_initEvent: function () {
        //    /// <summary>
        //    /// 对监听事件设置订阅，以下为订阅列表
        //    /// </summary>
        //    topic.subscribe(this.domNode.id + "click", lang.hitch(this, "onClick"));  //订阅
        //    topic.subscribe(this.domNode.id + "click", lang.hitch(this, "onClick"));  //订阅
        //    topic.subscribe(this.domNode.id + "click", lang.hitch(this, "onClick"));  //订阅
        //    topic.subscribe(this.domNode.id + "click", lang.hitch(this, "onClick"));  //订阅
        //    topic.subscribe(this.domNode.id + "click", lang.hitch(this, "onClick"));  //订阅
        //    topic.subscribe(this.domNode.id + "click", lang.hitch(this, "onClick"));  //订阅
        //},
        //onClick: function (index) {
        //    /// <summary>
        //    /// 执行各个按钮和菜单项单击后触发该事件
        //    /// </summary>
        //    /// <param name="index">返回值为1-5、true、false</param>
        //}
        });
    return aqi;
});