/**
 * Created by Administrator on 2015/12/13.
 */
define([
    "dojo/on",
    "dojo/_base/lang",
    "dojo/_base/declare",
	"dojo/dom-style",
    "dojo/text!./templates/Coordinate.html",
    "dijit/_TemplatedMixin",
    "./_Widget",
    "./Switching"
],function(
    on,
    lang,
    declare,
	domStyle,
    template,
    _TemplatedMixin,
    _Widget,
    Switching
) {
    var coordinate = declare("widgets.Coordinate", [_Widget, _TemplatedMixin], {
        xValue: null,
        yValue: null,
        // templateString: html||Object
        //    控件的html模板
        templateString: template,
        constructor: function () {
            this.inherited(arguments);
        },
        postCreate: function () {
            this.inherited(arguments);
            var pathName = window.document.location.pathname;
            //projectName:string
            //当前项目路径
            this.projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);
            //初始化switching
            this.switching = new Switching({}, this.coordinateControlNode);
            this.switching.set("icon", this.projectName + "/widgets/assets/images/coordinate_open.gif");
            domStyle.set(this.switching.outLineNode, "margin", "-3px -3px -3px -4px");
            this.switching.set("iconMarginBox", {w: 20, h: 20});

            on(this.switching, "opended", lang.hitch(this,function (isOpened) {
                if(isOpened)
                {
                    this.switching.set("icon", this.projectName+"/widgets/assets/images/coordinate_open.gif");
                    this._refreshCoordinate();
                }
                else {
                    this.switching.set("icon", this.projectName+"/widgets/assets/images/coordinate_close.png");
                    this.map.on("mouse-move", lang.hitch(this, function (evt) {
                        this.txtXNode.innerHTML = "0";
                        this.txtYNode.innerHTML = "0";
                    }));
                }
            }));
        },
        startup: function () {
            this.inherited(arguments);
            on(this.map, "load", lang.hitch(this, function () {
                this._refreshCoordinate();
            }));
        },
        _refreshCoordinate:function(){
            if(this.map.loaded){
                this.map.on("mouse-move",lang.hitch(this,function(evt){
                    this.xValue = evt.mapPoint.x.toFixed(5);
                    this.yValue = evt.mapPoint.y.toFixed(5);
                    this.txtXNode.innerHTML = this.xValue;
                    this.txtYNode.innerHTML = this.yValue;
                }));
            }else{
                this.txtXNode.innerHTML = "0";
                this.txtYNode.innerHTML = "0";
            }

        },
        _setXValueAttr: function (/*Number|X坐标*/xValue) {
            this.xValue = xValue;
            this.txtXNode.innerHTML = this.xValue;
        },
        _getXValueAttr: function () {
            return this.xValue;
        },
        _setYValueAttr: function (/*Number|Y坐标*/yValue) {
            this.yValue = yValue;
            this.txtYNode.innerHTML = this.yValue;
        },
        _getYValueAttr: function () {
            return this.yValue;
        }
    });
    return coordinate;
});