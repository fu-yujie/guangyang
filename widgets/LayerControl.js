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
    "dojo/text!./templates/LayerControl.html",
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
    "widgets/FirstGrid",
    "widgets/SecondGrid",
    "widgets/ThirdGrid",
    "widgets/ShadowGraph"
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
    FirstGrid,
    SecondGrid,
    ThirdGrid,
    ShadowGraph
) {
    var patrol = declare("widgets.LayerControl", _Widget, {
        templateString: template,
        _popupMapPoint: null,
        _toolTipDialog: null,
       
        postCreate: function () {
            this.inherited(arguments);
            this.shadowGraph = new ShadowGraph({
                //style:"padding-left:15px;margin-top:36px;"
            }, this.shadowGraphNode);
            this.shadowGraph.set("map", this.map);
            on(this.shadowGraph, "click", lang.hitch(this, function (popupPoint, toolTipDialog) {
                this._popupMapPoint = popupPoint;
                this._toolTipDialog = toolTipDialog;

                if (this._toolTipDialog != null && this._popupMapPoint != null) {
                    var popupScreenPoint = this.map.toScreen(this._popupMapPoint);
                    popup.open({
                        style: "overflow:hidden;",
                        popup: this._toolTipDialog,
                        x: popupScreenPoint.x - 10,
                        y: popupScreenPoint.y + 80
                    });
                }

            }));
            on(this.shadowGraph, "open", lang.hitch(this, function (popupPoint, toolTipDialog) {
                this._popupMapPoint = popupPoint;
                this._toolTipDialog = toolTipDialog;
            }));
            on(this.shadowGraph, "close", lang.hitch(this, function (tooltipDialog) {
                this._popupMapPoint = null;
                this._toolTipDialog = null;
            }));
            this.firstGrid = new FirstGrid({
                //style:"padding-left:15px;margin-top:36px;"
            }, this.firstGridNode);
            this.firstGrid.set("map", this.map);
            on(this.firstGrid, "click", lang.hitch(this, function (popupPoint, toolTipDialog) {
                this._popupMapPoint = popupPoint;
                this._toolTipDialog = toolTipDialog;

                if (this._toolTipDialog != null && this._popupMapPoint != null) {
                    var popupScreenPoint = this.map.toScreen(this._popupMapPoint);
                    popup.open({
                        style: "overflow:hidden;",
                        popup: this._toolTipDialog,
                        x: popupScreenPoint.x - 10,
                        y: popupScreenPoint.y + 80
                    });
                }

            }));
            on(this.firstGrid, "open", lang.hitch(this, function (popupPoint, toolTipDialog) {
                
                this._popupMapPoint = popupPoint;
                this._toolTipDialog = toolTipDialog;
            }));
            on(this.firstGrid, "close", lang.hitch(this, function (tooltipDialog) {
                this._popupMapPoint = null;
                this._toolTipDialog = null;
            }));
            this.secondGrid = new SecondGrid({
                //style:"padding-left:15px;margin-top:36px;"
            }, this.secondGridNode);
            this.secondGrid.set("map", this.map);
            on(this.secondGrid, "click", lang.hitch(this, function (popupPoint, toolTipDialog) {
                this._popupMapPoint = popupPoint;
                this._toolTipDialog = toolTipDialog;
                if (this._toolTipDialog != null && this._popupMapPoint != null) {
                    var popupScreenPoint = this.map.toScreen(this._popupMapPoint);
                    popup.open({
                        popup: this._toolTipDialog,
                        x: popupScreenPoint.x - 10,
                        y: popupScreenPoint.y + 80
                    });
                }
            }));
            on(this.secondGrid, "open", lang.hitch(this, function (popupPoint, toolTipDialog) {
                this._popupMapPoint = popupPoint;
                this._toolTipDialog = toolTipDialog;
            }));
            on(this.secondGrid, "close", lang.hitch(this, function (tooltipDialog) {
                this._popupMapPoint = null;
                this._toolTipDialog = null;
            }));
            this.thirdGrid = new ThirdGrid({
                //style:"padding-left:15px;margin-top:65px;"
            }, this.thirdGridNode);
            this.thirdGrid.set("map", this.map);
            on(this.thirdGrid, "click", lang.hitch(this, function (popupPoint, toolTipDialog) {
                this._popupMapPoint = popupPoint;
                this._toolTipDialog = toolTipDialog;
                if (this._toolTipDialog != null && this._popupMapPoint != null) {
                    var popupScreenPoint = this.map.toScreen(this._popupMapPoint);
                    popup.open({
                        popup: this._toolTipDialog,
                        x: popupScreenPoint.x - 10,
                        y: popupScreenPoint.y + 80
                    });
                }
            }));

            on(this.thirdGrid, "open", lang.hitch(this, function (popupPoint, toolTipDialog) {
                this._popupMapPoint = popupPoint;
                this._toolTipDialog = toolTipDialog;
            }));
            on(this.thirdGrid, "close", lang.hitch(this, function (tooltipDialog) {
                this._popupMapPoint = null;
                this._toolTipDialog = null;
            }));
            this.map.on("extent-change", lang.hitch(this, function () {
                if (this._toolTipDialog != null && this._popupMapPoint != null) {
                    var popupScreenPoint = this.map.toScreen(this._popupMapPoint);
                    popup.open({
                        popup: this._toolTipDialog,
                        x: popupScreenPoint.x - 10,
                        y: popupScreenPoint.y + 80
                    });
                }
            }));
            var bol = true;
            on(this.tuhsNode,"click", lang.hitch(this,function () {
                if (bol) {
                    this.layerControlNode.style.height = "27px";
                    this.layerControlNode.style.overflow = "hidden"
                    bol = false;
                } else {
                    this.layerControlNode.style.height = "174px";
                    this.layerControlNode.style.overflow = "hidden"
                    bol = true;
                }
            }))
        },

        startup: function () {
        },

    });
    return patrol;
});