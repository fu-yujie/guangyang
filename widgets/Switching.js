/**
 * Created by Administrator on 2015/11/19.
 */
define([
    "dojo/_base/connect",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dojo/on",
    "dojo/text!./templates/Switching.html",
    "dojo/topic",
    "widgets/_Widget"
],function(
    connect,
    declare,
    lang,
    domClass,
    domConstruct,
    domStyle,
    on,
    template,
    topic,
    _Widget
) {
    var Switch = declare("widgets.Switching", _Widget, {
        // templateString: html||Object
        //    控件的html模板
        templateString: template,
        // icon: String
        //    图标路径
        icon: null,
        iconSVG:"",
        // iconMarginBox: {w:0,h:0,l:0,t:0}
        //    图标外框尺寸
        iconMarginBox: null,
        // opened: [readonly]Boolean
        //    开关打开状态，默认打开
        opened: true,
        postCreate: function () {
            this._initEvent();
        },
        startup: function () {

        },
        setOpened:function(value){
            if (value) {
                topic.publish(this.domNode.id + "opended", true);
                this.opened = true;
                domStyle.set(this.outLineNode, "display", "block");
            }
            else {
                topic.publish(this.domNode.id + "opended", false);
                this.opened = false;
                domStyle.set(this.outLineNode, "display", "none");
            }
            this.opened = value;
        },
        onOpended: function (isOpened) {

        },
        _initEvent: function () {
            this._onOpended();
        },
        _onOpended: function () {
            topic.subscribe(this.domNode.id + "opended", lang.hitch(this, "onOpended"));
            on(this.switchingNode, "click", lang.hitch(this, function () {
                if (this.opened) {
                    topic.publish(this.domNode.id + "opended", false);
                    this.opened = false;
                    domStyle.set(this.outLineNode, "display", "none");
                }
                else {
                    topic.publish(this.domNode.id + "opended", true);
                    this.opened = true;
                    domStyle.set(this.outLineNode, "display", "block");
                }
            }));
        },
        _setIconAttr: function (icon) {
            if (icon != undefined) {
                this.icon = icon;
                domStyle.set(this.iconNode, "background-image", "url('" + this.icon + "')");
            }
        },
        _setIconSVGAttr: function (iconSVG) {
            if (iconSVG != undefined) {
                this.iconSVG = iconSVG;
                var iconDom = domConstruct.toDom(iconSVG);
                this.iconNode.appendChild(iconDom);
            }
        },
        _setIconMarginBoxAttr: function (iconMarginBox) {
            if (iconMarginBox != undefined) {
                domStyle.set(this.iconNode, "width", iconMarginBox.w + "px");
                domStyle.set(this.iconNode, "height", iconMarginBox.h + "px");
                domStyle.set(this.outLineNode, "width", iconMarginBox.w + 2 + "px");
                domStyle.set(this.outLineNode, "height", iconMarginBox.h + 2 + "px");
                domStyle.set(this.domNode, "width", iconMarginBox.w + 3 + "px");
                domStyle.set(this.domNode, "height", iconMarginBox.h + 3 + "px");
            }
        },
        _getIconAttr: function (icon) {
            return this.icon;
        },
        _getIconSVGAttr: function (iconSVG) {
            return this.iconSVG;
        },
        _getIconMarginBoxAttr: function (iconMarginBox) {
            return this.iconMarginBox;
        }
    });
    return Switch;
});