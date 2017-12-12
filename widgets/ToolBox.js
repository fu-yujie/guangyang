/**
 * Created by Administrator on 2015/12/10.
 */
define([
    "dojo/_base/array",
    "dijit/layout/ContentPane",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dojo/number",
    "dojo/on",
    "dojo/text!./templates/ToolBox.html",
    "dojo/text!widgets/assets/mapServiceConfig.html",
    "dojo/topic",
    "esri/Color",
    "esri/geometry/geometryEngine",
    "esri/geometry/Point",
    "esri/graphic",
    "esri/layers/FeatureLayer",
    "esri/layers/GraphicsLayer",
    "esri/layers/LabelLayer",
    "esri/layers/LabelClass",
    "esri/renderers/SimpleRenderer",
    "dojo/request/iframe",
    "esri/symbols/PictureMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/Font",
    "esri/symbols/TextSymbol",
    "esri/toolbars/draw",
    "esri/tasks/PrintTask",
    "esri/tasks/QueryTask",
    "esri/tasks/query",
    "esri/tasks/PrintParameters",
    "esri/tasks/PrintTemplate",
    "widgets/Switching",
    "widgets/_Widget",
    "widgets/svg",
    "widgets/PlottingData"
], function (
    array,
    ContentPane,
    declare,
    lang,
    domClass,
    domConstruct,
    domStyle,
    number,
    on,
    template,
    mapServiceConfig,
    topic,
    Color,
    geometryEngine,
    Point,
    Graphic,
    FeatureLayer,
    GraphicsLayer,
    LabelLayer,
    LabelClass,
    SimpleRenderer,
    iframe,
    PictureMarkerSymbol,
    SimpleLineSymbol,
    SimpleFillSymbol,
    SimpleMarkerSymbol,
    Font,
    TextSymbol,
    Draw,
    PrintTask,
    QueryTask,
    Query,
    PrintParameters,
    PrintTemplate,
    Switching,
    _Widget,
    svg,
    PlottingData
) {
    var toolBox = declare("widgets.ToolBox", _Widget, {
        // templateString: html||Object
        //    控件的html模板
        templateString: template,
        map: null,
        requiredCount: 0,
        _currentDrawTool: null,
        isActive: false,
        constructor: function (para) {
            if (para != undefined) {
                if ("map" in para) {
                    this.map = para.map;
                }
            }
            lang.mixin(toolBox, { CIRCLE: "circle", POLYGON: "polygon", POLYLINE: "polyline", RECTANGLE: "rectangle" });
        },
        postMixInProperties: function () {
            this.inherited(arguments);
            var pathName = window.document.location.pathname;
            this._projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);
        },
        postCreate: function () {
            this.inherited(arguments);
            this.newDraw = new Draw(this.map, { showTooltips: true });

            this._drawPlineSwitching = new Switching();
            this._drawPlineSwitching.set("iconSVG");
            this._drawPlineSwitching.set("iconMarginBox", { w: 20, h: 20 });
            this._drawPlineSwitching.setOpened(false);
            this.dPolylineNode.appendChild(this._drawPlineSwitching.domNode);

            this._drawRectangleSwitching = new Switching();
            this._drawRectangleSwitching.set("iconSVG");
            this._drawRectangleSwitching.set("iconMarginBox", { w: 20, h: 20 });
            this._drawRectangleSwitching.setOpened(false);
            this.dRectangleNode.appendChild(this._drawRectangleSwitching.domNode);

            this._drawPolygonSwitching = new Switching();
            this._drawPolygonSwitching.set("iconSVG");
            this._drawPolygonSwitching.set("iconMarginBox", { w: 20, h: 20 });
            this._drawPolygonSwitching.setOpened(false);
            this.dPolygonNode.appendChild(this._drawPolygonSwitching.domNode);

            this._drawCircleSwitching = new Switching();
            this._drawCircleSwitching.set("iconSVG");
            this._drawCircleSwitching.set("iconMarginBox", { w: 20, h: 20 });
            this._drawCircleSwitching.setOpened(false);
            this.dCircleNode.appendChild(this._drawCircleSwitching.domNode);

            this.plottingData = new PlottingData({
                style: "position:fixed;left:38%;top:100px;display:none"
            }, this.plottingDataNode);
            this.plottingData.set("map", this.map);
            var printerIconDom = domConstruct.toDom();
            //this.printPaneNode.appendChild(printerIconDom);

            this._initEvent();
        },
        startup: function () {
            this.inherited(arguments);
        },
        onIsActive: function () {
        },
        _activateDrawTool: function (newDrawTool) {
            /// <summary>
            /// 激活新绘图工具
            /// </summary>
            /// <param name="newDrawTool" type="String">新绘图工具（折线、圆、矩形、多边形）</param>
            if (this.map.conductorTool != undefined && this.map.conductorTool != null) {
                if (this.map.conductorTool._currentDrawTool != null) {
                    this.map.conductorTool._closeCurrentDrawTool();
                }
            }
            if (this.map.dirtyAnalyze != undefined && this.map.dirtyAnalyze != null) {
                if (this.map.dirtyAnalyze._currentDrawTool != null) {
                    this.map.dirtyAnalyze._closeCurrentDrawTool();
                }
            }
            if (this._currentDrawTool != null) {
                this._closeCurrentDrawTool();
                //this.plottingData.set("style", "display:");

            }
            //else {
            //    this.plottingData.set("style", "display:block");
            //}

            switch (newDrawTool) {
                case "circle":
                    {
                        this.newDraw.activate(Draw.CIRCLE);
                        break;
                    }
                case "polygon":
                    {
                        this.newDraw.activate(Draw.POLYGON);
                        break;
                    }
                case "polyline":
                    {
                        this.newDraw.activate(Draw.POLYLINE);
                        break;
                    }
                case "rectangle":
                    {
                        this.newDraw.activate(Draw.RECTANGLE);
                        break;
                    }
                default:
                    break;
            }//激活新绘图工具
            this._currentDrawTool = newDrawTool;//改变当前绘图工具名称
        },
        _closeCurrentDrawTool: function () {
            /// <summary>
            /// 关闭当前绘图工具
            /// </summary>
            switch (this._currentDrawTool) {
                case "circle":
                    {
                        this._drawCircleSwitching.setOpened(false);
                        break;
                    }
                case "polygon":
                    {
                        this._drawPolygonSwitching.setOpened(false);
                        break;
                    }
                case "polyline":
                    {
                        this._drawPlineSwitching.setOpened(false);
                        break;
                    }
                case "rectangle": {
                    this._drawRectangleSwitching.setOpened(false);
                    break;
                }
                default:
                    break;
            }//关闭当前绘图工具
            this._currentDrawTool = null;//清空当前绘图工具名称
        },
        //在绘制工具绘制完成之后，将数据添加到地图上；
        _addToMap: function (evt) {
            var geometrySymbol, centerPoint, textSymbol, labelGraphic;
            var font = new Font("20px", Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLDER);
            switch (evt.target._geometryType) {
                case "polyline":
                    {
                        geometrySymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                            new Color([255, 0, 0]), 2);
                        centerPoint = evt.geometry.getExtent().getCenter().offset(0, 0.000001);
                        //textSymbol = new TextSymbol("L=" +
                        //    number.format(this._geodesicLength(evt.geometry)) + "m",
                        //    font, new Color([0, 0, 0]));
                        //labelGraphic = new Graphic(centerPoint, textSymbol);
                        this.plottingData.set("style", "display:block");
                        this.plottingData.labXNode.style.display = "none";
                        this.plottingData.labRNode.style.display = "none";
                        this.plottingData.txtXNode.style.display = "none";
                        this.plottingData.txtRNode.style.display = "none";
                        //this.plottingData.txtXNode.innerHTML = number.format(this._geodesicArea(evt.geometry)) + "㎡"
                        this.plottingData.txtYNode.innerHTML = number.format(this._geodesicLength(evt.geometry)) + "m"
                        //this.plottingData.txtRNode.innerHTML = number.format(r) + "m"
                        this.map.setExtent(evt.geometry.getExtent().expand(2));
                        break;
                    }
                case "rectangle":
                    {
                        geometrySymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                                new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.25]));
                        centerPoint = evt.geometry.getExtent().getCenter();
                        this.plottingData.set("style", "display:block");
                        //var areaPoint = centerPoint.offset(0,0.000001);
                        //var lengthPoint = centerPoint.offset(0,-0.000001);
                        //var sSymbol = new TextSymbol("S=" +
                        //    number.format(this._geodesicArea(evt.geometry)),
                        //    font, new Color([0, 0, 0]));
                        //var lSymbol = new TextSymbol("L=" +
                        //    number.format(this._geodesicLength(evt.geometry)),
                        //    font, new Color([0, 0, 0]));
                        //var sLabelGraphic = new Graphic(areaPoint, sSymbol);
                        //var lLabelGraphic = new Graphic(lengthPoint, lSymbol);
                        //// add the label point graphic to the map
                        //this.map.graphics.add(sLabelGraphic);
                        //this.map.graphics.add(lLabelGraphic);


                        //textSymbol = new TextSymbol("S=" +
                        //    number.format(this._geodesicArea(evt.geometry)) +
                        //    "㎡,L=" + number.format(this._geodesicLength(evt.geometry)) + "m",
                        //    font, new Color([0, 0, 0]));
                        //labelGraphic = new Graphic(centerPoint, textSymbol);
                        this.plottingData.labXNode.style.display = "inline-block";
                        this.plottingData.txtXNode.style.display = "inline-block";
                        this.plottingData.txtXNode.innerHTML = number.format(this._geodesicArea(evt.geometry)) + "㎡"
                        this.plottingData.txtYNode.innerHTML = number.format(this._geodesicLength(evt.geometry)) + "m"
                        //this.plottingData.txtRNode.innerHTML = number.format(r) + "m"
                        this.plottingData.labRNode.style.display = "none";
                        this.plottingData.txtRNode.style.display = "none";
                        this.map.setExtent(evt.geometry.getExtent().expand(2));
                        break;
                    }
                case "polygon": {
                    geometrySymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                        new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                            new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.25]));
                    centerPoint = evt.geometry.getExtent().getCenter();
                    this.plottingData.set("style", "display:block");
                    //textSymbol = new TextSymbol("S=" +
                    //    number.format(this._geodesicArea(evt.geometry)) +
                    //    "㎡,L=" + number.format(this._geodesicLength(evt.geometry)) + "m",
                    //    font, new Color([0, 0, 0]));
                    //labelGraphic = new Graphic(centerPoint, textSymbol);
                    this.plottingData.labXNode.style.display = "inline-block";
                    this.plottingData.txtXNode.style.display = "inline-block";
                    this.plottingData.txtXNode.innerHTML = number.format(this._geodesicArea(evt.geometry)) + "㎡"
                    this.plottingData.txtYNode.innerHTML = number.format(this._geodesicLength(evt.geometry)) + "m"
                    this.plottingData.labRNode.style.display = "none";
                    this.plottingData.txtRNode.style.display = "none";
                    //this.plottingData.txtRNode.innerHTML = number.format(r) + "m"
                    this.map.setExtent(evt.geometry.getExtent().expand(2));
                    break;
                }
                case "circle":
                    {
                        geometrySymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                                new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.25]));
                        centerPoint = evt.geometry.getExtent().getCenter();
                        var perimeter = this._geodesicLength(evt.geometry);
                        this.plottingData.set("style", "display:block");
                        var r = perimeter / 2 / Math.PI;
                        this.plottingData.labRNode.style.display = "inline-block";
                        this.plottingData.txtRNode.style.display = "inline-block";
                        this.plottingData.labYNode.style.display = "inline-block";
                        this.plottingData.txtYNode.style.display = "inline-block";
                        this.plottingData.txtXNode.innerHTML = number.format(this._geodesicArea(evt.geometry)) + "㎡"
                        this.plottingData.txtYNode.innerHTML = number.format(perimeter) + "m"
                        this.plottingData.txtRNode.innerHTML = number.format(r) + "m"
                        this.map.setExtent(evt.geometry.getExtent().expand(2));

                        break;
                    }
                default: {
                    geometrySymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                        new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                            new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.25]));
                    break;
                }
            }
            var graphic = new Graphic(evt.geometry, geometrySymbol);
            this.map.graphics.add(graphic);
        },
        //监听所有的点击以及绘制事件的发生；
        _initEvent: function () {
            topic.subscribe(this.domNode.id + "isActive", lang.hitch(this, "onIsActive"));
            on(this.newDraw, "draw-end", lang.hitch(this, function (evt) {
                this._addToMap(evt);

            }));
            on(this.toolBoxBtnNode, "click", lang.hitch(this, function (evt) {
                if (domStyle.get(this.toolBoxPaneNode, "display") == "none") {
                    domStyle.set(this.toolBoxPaneNode, "display", "inline-block");
                    domStyle.set(this.toolBoxBtnNode, "background-image", "url('./widgets/assets/images/toolbox_open.png')");
                } else {
                    this.map.graphics.clear();
                    domStyle.set(this.toolBoxPaneNode, "display", "none");
                    domStyle.set(this.toolBoxBtnNode, "background-image", "url('./widgets/assets/images/toolbox_close.png')");
                    this._closeCurrentDrawTool();
                }
            }));
            on(this._drawPlineSwitching, "opended", lang.hitch(this, function (isOpened) {
                if (isOpened) {
                    this.isActive = true;
                    topic.publish(this.domNode.id + "isActive", "onIsActive", this.isActive);
                    this._activateDrawTool(toolBox.POLYLINE);
                }
                else {
                    this.isActive = false;
                    topic.publish(this.domNode.id + "isActive", "onIsActive", this.isActive);
                    this.map.graphics.clear();
                    this.newDraw.deactivate();
                    this._currentDrawTool = null;
                    this.plottingData.set("style", "display:none");
                }
            }));
            on(this._drawRectangleSwitching, "opended", lang.hitch(this, function (isOpened) {
                if (isOpened) {
                    this.isActive = true;
                    topic.publish(this.domNode.id + "isActive", "onIsActive", this.isActive);
                    this._activateDrawTool(toolBox.RECTANGLE);
                }
                else {
                    this.isActive = false;
                    topic.publish(this.domNode.id + "isActive", "onIsActive", this.isActive);
                    this.map.graphics.clear();
                    this.newDraw.deactivate();
                    this._currentDrawTool = null;
                    this.plottingData.set("style", "display:none");
                }
            }));
            on(this._drawPolygonSwitching, "opended", lang.hitch(this, function (isOpened) {
                if (isOpened) {
                    this.isActive = true;
                    topic.publish(this.domNode.id + "isActive", "onIsActive", this.isActive);
                    this._activateDrawTool(toolBox.POLYGON);
                }
                else {
                    this.isActive = false;
                    topic.publish(this.domNode.id + "isActive", "onIsActive", this.isActive);
                    this.map.graphics.clear();
                    this.newDraw.deactivate();
                    this._currentDrawTool = null;
                    this.plottingData.set("style", "display:none");
                }
            }));
            on(this._drawCircleSwitching, "opended", lang.hitch(this, function (isOpened) {
                if (isOpened) {
                    this.isActive = true;
                    topic.publish(this.domNode.id + "isActive", "onIsActive", this.isActive);
                    this._activateDrawTool(toolBox.CIRCLE);
                }
                else {
                    this.isActive = false;
                    topic.publish(this.domNode.id + "isActive", "onIsActive", this.isActive);
                    this.map.graphics.clear();
                    this.newDraw.deactivate();
                    this._currentDrawTool = null;
                    this.plottingData.set("style", "display:none");
                }
            }));
            on(this.printPaneNode, "click", lang.hitch(this, function () {
                this.requiredCount++;
                this._printMap(this._projectName);
            }));
        },
        _geodesicArea: function (geometry) {
            return geometryEngine.geodesicArea(geometry, "square-meters");
        },
        _geodesicLength: function (geometry) {
            return geometryEngine.geodesicLength(geometry, "meters");
        },
        _printMap: function (projectName) {
            var url;
            array.forEach(eval("(" + mapServiceConfig + ")"), lang.hitch(this, function (layerConfig) {
                switch (layerConfig.type) {
                    case "GP":
                        {
                            url = layerConfig.url;
                            break;
                        }
                    default: {
                        break;
                    }
                }
            }));
            if (url) {
                var template = new PrintTemplate();
                template.exportOptions = {
                    width: 1754,
                    height: 1240,
                    dpi: 150
                };
                template.format = "png8";
                template.layout = "HJJC_A4";
                template.preserveScale = false;
                var params = new PrintParameters();
                params.map = this.map;
                params.template = template;
                var printTask = new PrintTask(url);
                var that = this;
                printTask.execute(params, function (value) {
                    var img = document.createElement("img");
                    var a = new Image();
                    a.src = value.url;
                    a.onload = function () {
                        //var newdoc = document.open("text/html", "replace");
                        //var txt = "<html><body><img src=" + a.src + " height=100%;></body></html>";
                        //newdoc.write(txt);

                        var txt = "<html><body><img src=" + a.src + " height=100%;></body></html>";
                        document.body.innerHTML = txt;//局部打印，要打印的内容
                        window.print();
                        window.location.replace(that._projectName + "/Index1.html");
                    }
                }, lang.hitch(this, function (error) {
                    this.requiredCount++;
                    if (this.requiredCount < 5) {
                        this._printMap();
                    }
                }));
            }
        }
    });

    return toolBox;
});