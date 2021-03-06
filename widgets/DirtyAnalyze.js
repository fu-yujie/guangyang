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
    "dojo/text!./templates/DirtyAnalyze.html",
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
    "esri/tasks/PrintParameters",
    "esri/tasks/PrintTemplate",
    "esri/tasks/query",
    "widgets/Switching",
    "widgets/_Widget",
    "dojo/request/xhr",
    "widgets/svg",
    "widgets/TitlePartPane",
    "dijit/TooltipDialog",
    "dijit/popup",
    "widgets/WCtrlInfo",
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
    PrintParameters,
    PrintTemplate,
     Query,
    Switching,
    _Widget,
    xhr,
    svg,
    TitlePartPane,
    TooltipDialog,
    popup,
    WCtrlInfo
) {
    var dirtyAnalyze = declare("widgets.DirtyAnalyze.", _Widget, {
        // templateString: html||Object
        //    控件的html模板
        templateString: template,
        map: null,
        _domNodeId: null,
        requiredCount: 0,
        _currentDrawTool: null,
        isActive: false,
        constructor: function (para) {
            if (para != undefined) {
                for (var item in para) {
                    switch (item) {
                        case "map": {
                            this.map =para[item];
                        } break;
                        case "barbecuePollution": {
                            this.barbecuePollution = para[item];
                        } break;
                        case "coalPollution": {
                            this.coalPollution = para[item];
                        } break;
                        case "sewagePollution": {
                            this.sewagePollution = para[item];
                        } break;
                        case "boilerPollution": {
                            this.boilerPollution = para[item];
                        } break;
                        case "sitePollution": {
                            this.sitePollution = para[item];
                        } break;
                        case "farmPollution": {
                            this.farmPollution = para[item];
                        } break;
                        case "roadPollution": {
                            this.roadPollution = para[item];
                        } break;
                        case "exposedLandPollution": {
                            this.exposedLandPollution = para[item];
                        } break;
                        case "companyPollution": {
                            this.companyPollution = para[item];
                        } break;
                        case "carPollution": {
                            this.carPollution = para[item];
                        } break;
                    }
                }
            }
            lang.mixin(dirtyAnalyze, { CIRCLE: "circle", POLYGON: "polygon", POLYLINE: "polyline", RECTANGLE: "rectangle" });
        },
        postMixInProperties: function () {
            this.inherited(arguments);
            var pathName = window.document.location.pathname;
            this._projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);
        },
        postCreate: function () {
            this.inherited(arguments);
            this.newDraw = new Draw(this.map, { showTooltips: true });
            this._drawRectangleSwitching = new Switching();
            //this._drawRectangleSwitching.set("iconSVG", svg.rectangleSVG);
            this._drawRectangleSwitching.set("iconMarginBox", { w: 20, h: 20 });
            domStyle.set(this._drawRectangleSwitching.outLineNode, "margin", "-3px -3px -3px -4px");
            this._drawRectangleSwitching.setOpened(false);
            this.dRectangleNode.appendChild(this._drawRectangleSwitching.domNode);

            this._drawPolygonSwitching = new Switching();
            //this._drawPolygonSwitching.set("iconSVG", svg.polygonSVG);
            this._drawPolygonSwitching.set("iconMarginBox", { w: 20, h: 20 });
            domStyle.set(this._drawPolygonSwitching.outLineNode, "margin", "-3px -3px -3px -4px");
            this._drawPolygonSwitching.setOpened(false);
            this.dPolygonNode.appendChild(this._drawPolygonSwitching.domNode);

            this._drawCircleSwitching = new Switching();
            //this._drawCircleSwitching.set("iconSVG", svg.circleSVG);
            this._drawCircleSwitching.set("iconMarginBox", { w: 20, h: 20 });
            domStyle.set(this._drawCircleSwitching.outLineNode, "margin", "-3px -3px -3px -4px");
            this._drawCircleSwitching.setOpened(false);
            this.dCircleNode.appendChild(this._drawCircleSwitching.domNode);
            this._toolTipDialog = new TooltipDialog({
                onOpen: lang.hitch(this, function () {
                    this._attrContent.resize();
                    topic.publish(this.domNode.id + "open", this._mapPoint, this._toolTipDialog);
                }),
                onClose: lang.hitch(this, function () {
                    topic.publish(this.domNode.id + "close", this._toolTipDialog);
                })
            });
            this._initEvent();
            this._setGrid();
        },
        startup: function () {
            this.inherited(arguments);
            this._attrContent.startup();
        },
        onIsActive: function () {
        },
        table_height: function () {
            var h = document.documentElement.clientHeight;
            var conductor_tabcontent = document.getElementById("conductor_tabcontent");
            conductor_tabcontent.style.height = (h - 230) + "px";
            conductor_tabcontent.style.overflowY = "auto";
        },
        _activateDrawTool: function (newDrawTool) {
            /// <summary>
            /// 激活新绘图工具
            /// </summary>
            /// <param name="newDrawTool" type="String">新绘图工具（折线、圆、矩形、多边形）</param>
            if (this.map.toolBox != undefined && this.map.toolBox != null) {
                if (this.map.toolBox._currentDrawTool != null) {
                    this.map.toolBox._closeCurrentDrawTool();
                }
            }
            if (this.map.conductorTool != undefined && this.map.conductorTool != null) {
                if (this.map.conductorTool._currentDrawTool != null) {
                    this.map.conductorTool._closeCurrentDrawTool();
                }
            }
            if (this._currentDrawTool != null) {
                this._closeCurrentDrawTool();
            }
            switch (newDrawTool) {
                case "circle":
                    {
                        this.newDraw.activate(Draw.CIRCLE);
                        this.g_table = ""
                        break;
                    }
                case "polygon":
                    {
                        this.newDraw.activate(Draw.POLYGON);
                        this.g_table = ""
                        break;
                    }
                case "polyline":
                    {
                        this.newDraw.activate(Draw.POLYLINE);
                        this.g_table = ""
                        break;
                    }
                case "rectangle":
                    {
                        this.newDraw.activate(Draw.RECTANGLE);
                        this.g_table = ""
                        break;
                    }
                default:
                    break;
            }//激活新绘图工具
            this._currentDrawTool = newDrawTool;//改变当前绘图工具名称
        },
        //关闭工具后显示已选中污染源；
        addPrimaryPollutionPoint: function () {
            var allPollutionlayer = [this.map.getLayer("barbecuePollution"), this.map.getLayer("coalPollution"), this.map.getLayer("sewagePollution"), this.map.getLayer("boilerPollution"), this.map.getLayer("sitePollution"), this.map.getLayer("farmPollution"), this.map.getLayer("exposedLandPollution"), this.map.getLayer("companyPollution"), this.map.getLayer("carPollution")]
            var allPollution = [this.barbecuePollution, this.coalPollution, this.sewagePollution, this.boilerPollution, this.sitePollution, this.farmPollution, this.exposedLandPollution, this.companyPollution, this.carPollution]
            var allTextPollutionLayer = [this.map.getLayer("barbecueTextSymbol"), this.map.getLayer("coalTextSymbol"), this.map.getLayer("sewageTextSymbol"), this.map.getLayer("boilerTextSymbol"), this.map.getLayer("siteTextSymbol"), this.map.getLayer("farmTextSymbol"), this.map.getLayer("exposedLandTextSymbol"), this.map.getLayer("companyTextSymbol"), this.map.getLayer("carTextSymbol")]
            //console.log(2)
            for (var i = 0; i < allPollution.length; i++) {
                if (allPollution[i].checkBox.checked == true && allPollutionlayer[i] != undefined) {
                    //console.log(i)
                    allPollutionlayer[i].setVisibility(true)
                    allTextPollutionLayer[i].setVisibility(true)
                } 
            }
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
        //绘制完毕往图中添加；
        _addToMap: function (evt) {
            var that = this
            var geometrySymbol, centerPoint, textSymbol, labelGraphic;
            var font = new Font("20px", Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLDER);
            switch (evt.target._geometryType) {
               
                case "rectangle":
                    {
                        geometrySymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                                new Color([255, 0, 0]), 2), new Color([37, 194, 41, 0.25]));
                        centerPoint = evt.geometry.getExtent().getCenter();
                        var query = new Query();
                        query.geometry = evt.geometry;

                        var checkedPollution = [];
                        this.filterCheckedPollution(checkedPollution)
                        this.filterPoint(query, checkedPollution)
                        this.map.setExtent(evt.geometry.getExtent().expand(2));
                        break;
                    }
                case "polygon": {
                    geometrySymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                        new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                            new Color([255, 0, 0]), 2), new Color([37, 194, 41, 0.25]));
                    centerPoint = evt.geometry.getExtent().getCenter();
                    var query = new Query();
                    query.geometry = evt.geometry;

                    var checkedPollution = [];
                    this.filterCheckedPollution(checkedPollution)
                    this.filterPoint(query, checkedPollution)
                    this.map.setExtent(evt.geometry.getExtent().expand(2));
                    break;
                }
                case "circle":
                    {
                        geometrySymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                                new Color([255, 0, 0]), 2), new Color([37, 194, 41, 0.25]));
                        var perimeter = this._geodesicLength(evt.geometry);
                        var r = perimeter / 2 / Math.PI;
                        var query = new Query();
                        query.geometry = evt.geometry;
                        var checkedPollution = [];
                        this.filterCheckedPollution(checkedPollution)
                        this.filterPoint(query, checkedPollution)
                        this.map.setExtent(evt.geometry.getExtent().expand(1.5));
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
        //筛选选中的污染源
        filterCheckedPollution: function (checkedPollution) {
            var allPollution = [this.barbecuePollution, this.coalPollution, this.sewagePollution, this.boilerPollution, this.sitePollution, this.farmPollution,  this.exposedLandPollution, this.companyPollution, this.carPollution]
            
            array.forEach(allPollution, lang.hitch(this, function (every) {
                if (every.checkBox.checked == true) {
                        checkedPollution.push(every)
                }
            }))
            return checkedPollution;
        },

        filterPoint: function (query, checkedPollution) {
            var data = [];
            var num = 0;
            var centerPoint = query.geometry.getExtent().getCenter();
            var that = this;
            //将从图中搜索出的范围内的污染源放入数组；
            function addData(results) {
                data.push(results);
               that._setdirtyAnalyzeLayer(data, centerPoint)
                    that._displayPoints(data)
            }
            //从不同图层中选出绘制范围内的污染源；
            array.forEach(checkedPollution, lang.hitch(this, function (every) {
                switch (every) {
                    case this.barbecuePollution: {
                        this._barbecuePollutionlayer = that.map.getLayer("barbecuePollution");
                        this._barbecuePollutionlayer.setVisibility(false);
                        this._barbecueTextSymbol = that.map.getLayer("barbecueTextSymbol");
                        this._barbecueTextSymbol.setVisibility(false);
                        this._barbecueAnalyzelayer = this.map.getLayer("barbecueAnalyze");
                        this._barbecueAnalyzelayer.selectFeatures(query, FeatureLayer, lang.hitch(this, function (results) {
                            num++;
                            addData(results)
                        }));

                    } break;
                    case this.coalPollution: {
                        this._coalPollutionlayer = that.map.getLayer("coalPollution");
                        this._coalPollutionlayer.setVisibility(false);
                        this._coalTextSymbol = that.map.getLayer("coalTextSymbol");
                        this._coalTextSymbol.setVisibility(false);
                        this._coalAnalyzelayer = this.map.getLayer("coalAnalyze");
                        this._coalAnalyzelayer.selectFeatures(query, FeatureLayer, function (results) {
                                 num++;
                                addData(results)
                        });
                    } break;
                    case this.sewagePollution: {
                        this._sewagePollutionlayer = that.map.getLayer("sewagePollution");
                        this._sewagePollutionlayer.setVisibility(false);
                        this._sewageTextSymbol = that.map.getLayer("sewageTextSymbol");
                        this._sewageTextSymbol.setVisibility(false);
                        this._sewageAnalyzelayer = this.map.getLayer("sewageAnalyze");
                        this._sewageAnalyzelayer.selectFeatures(query, FeatureLayer, function (results) {
                            num++;
                            addData(results)
                        });
                    } break;
                    case this.boilerPollution: {
                        this._boilerPollutionlayer = that.map.getLayer("boilerPollution");
                        this._boilerPollutionlayer.setVisibility(false);
                        this._boilerTextSymbol = that.map.getLayer("boilerTextSymbol");
                        this._boilerTextSymbol.setVisibility(false);
                        this._boilerAnalyzelayer = this.map.getLayer("boilerAnalyze");
                        this._boilerAnalyzelayer.selectFeatures(query, FeatureLayer, function (results) {
                            num++;
                            addData(results)
                        });
                    } break;
                    case this.sitePollution: {
                        this._sitePollutionlayer = that.map.getLayer("sitePollution");
                        this._sitePollutionlayer.setVisibility(false);
                        this._siteTextSymbol = that.map.getLayer("siteTextSymbol");
                        this._siteTextSymbol.setVisibility(false);
                        this._siteAnalyzelayer = this.map.getLayer("siteAnalyze");
                        this._siteAnalyzelayer.selectFeatures(query, FeatureLayer, function (results) {
                            num++;
                            addData(results)
                        });
                    } break;
                    case this.farmPollution: {
                        this._farmPollutionlayer = that.map.getLayer("farmPollution");
                        this._farmPollutionlayer.setVisibility(false);
                        this._farmTextSymbol = that.map.getLayer("farmTextSymbol");
                        this._farmTextSymbol.setVisibility(false);
                        this._farmAnalyzelayer = this.map.getLayer("farmAnalyze");
                        this._farmAnalyzelayer.selectFeatures(query, FeatureLayer, function (results) {
                            num++;
                            addData(results)
                        });
                    } break;
                    //case this.roadPollution: {
                    //    this._roadPollutionlayer = that.map.getLayer("roadPollution");
                    //    this._roadPollutionlayer.setVisibility(false);
                    //    this._roadAnalyzelayer = this.map.getLayer("roadAnalyze");
                    //    this._roadAnalyzelayer.selectFeatures(query, FeatureLayer, function (results) {
                    //        num++;
                    //        addData(results)
                    //    });
                    //} break;
                    case this.exposedLandPollution: {
                      
                        this._exposedLandPollutionlayer = that.map.getLayer("exposedLandPollution");
                        this._exposedLandPollutionlayer.setVisibility(false);
                        this._exposedLandTextSymbol = that.map.getLayer("exposedLandTextSymbol");
                        this._exposedLandTextSymbol.setVisibility(false);
                        this._exposedLandAnalyzelayer = this.map.getLayer("exposedLandAnalyze");
                        this._exposedLandAnalyzelayer.selectFeatures(query, FeatureLayer, function (results) {
                            num++;
                            addData(results)
                        });
                    } break;
                    case this.companyPollution: {
                        this._companyPollutionlayer = that.map.getLayer("companyPollution");
                        this._companyPollutionlayer.setVisibility(false);
                        this._companyTextSymbol = that.map.getLayer("companyTextSymbol");
                        this._companyTextSymbol.setVisibility(false);
                        this._company1Analyzelayer = this.map.getLayer("companyAnalyze");
                        this._company1Analyzelayer.selectFeatures(query, FeatureLayer, function (results) {
                            num++;
                            addData(results)
                        });
                    } break;
                    case this.carPollution: {
                        this._carPollutionlayer = that.map.getLayer("carPollution");
                        this._carPollutionlayer.setVisibility(false);
                        this._carTextSymbol = that.map.getLayer("carTextSymbol");
                        this._carTextSymbol.setVisibility(false);
                        this._carAnalyzelayer = this.map.getLayer("carAnalyze");
                        this._carAnalyzelayer.selectFeatures(query, FeatureLayer, function (results) {
                            num++;
                            addData(results)
                        });
                    } break;
                }
            }))
        },
       
        _setGrid: function () {
       
            this._attrContent = new ContentPane({
                style: "width:350px;height:auto;padding:0;margin:0;overflow: hidden;"
            });
        },
        //调用数据分析模板；
        _setdirtyAnalyzeLayer: function (data,cpoint) {
            this._dirtyAnalyzeLayer = this.map.getLayer("DirtyAnalyze");
            var that = this;
            this._attrContent.destroyDescendants();
            var gCtrlInfo = new WCtrlInfo({
                title: "污染源数据分析",
                datas: data,
                jcType: "4"
            });
            on(gCtrlInfo, "click", lang.hitch(this, function (evt) {

                popup.close();
                this._mapPoint = null;
            }))
            this._toolTipDialog = new TooltipDialog({
               
            });
            this._attrContent.addChild(gCtrlInfo);
            this._toolTipDialog.addChild(this._attrContent);
            this._mapPoint = cpoint
            var popupScreenPoint = this.map.toScreen(this._mapPoint);
            popup.open({
                popup: this._toolTipDialog,
                x: popupScreenPoint.x - 10,
                y: popupScreenPoint.y + 80
            });
            this.map.on("extent-change", lang.hitch(this, function () {
                if (this._toolTipDialog != null && this._mapPoint != null) {
                    var popupScreenPoint = this.map.toScreen(this._mapPoint);
                    popup.open({
                        popup: this._toolTipDialog,
                        x: popupScreenPoint.x - 10,
                        y: popupScreenPoint.y + 80
                    });
                }
            }));
        },
        //
        _displayPoints: function (controls) {
            /// <summary>
            /// 根据微监控点的属性信息，生成点，并将点绘制到地图中。
            /// </summary>
            /// <param name="controls">微监控点的属性信息</param>
            // 清除图中的元素    
            this._dirtyAnalyzeLayer.clear();
            this._dirtyAnalyzeLayer = this.map.getLayer("DirtyAnalyze");
            this._dirtyAnalyzeLayer.setVisibility(true)
            var data = [];
            //搜索出的 污染源数据由二维数组转成一维数组；
            for (var item in controls) {
                for (var j in controls[item]) {
                    data.push(controls[item][j])
                }
            }
            //将所有搜索出污染源坐标点绘制到_dirtyAnalyzeLayer这一个图层上；
            var length = data.length;
            if (length > 0) {
                var spatialReference = this.map.spatialReference;
                for (var i = 0; i < length; i++) {
                    //console.log(data[i].attributes.Industry)
                    switch (data[i].attributes.Industry) {
                        case 101: {
                            var pt = new Point(data[i].attributes.Longitude, data[i].attributes.Latitude, spatialReference);
                            var symbol = new PictureMarkerSymbol({
                                "url": this._projectName + "/widgets/assets/images/barbecue.png",
                                "height": 15,
                                "width": 15,
                                "type": "esriPMS"
                            });
                            var graphic = new Graphic(pt, symbol);
                            this._dirtyAnalyzeLayer.add(graphic);
                        } break;
                        case 102: {
                            var pt = new Point(data[i].attributes.Longitude, data[i].attributes.Latitude, spatialReference);
                            var symbol = new PictureMarkerSymbol({
                                "url": this._projectName + "/widgets/assets/images/boiler.png",
                                "height": 15,
                                "width": 15,
                                "type": "esriPMS"
                            });
                            var graphic = new Graphic(pt, symbol);
                            this._dirtyAnalyzeLayer.add(graphic);
                           
                        } break;
                        case 103: {
                            var pt = new Point(data[i].attributes.Longitude, data[i].attributes.Latitude, spatialReference);
                            var symbol = new PictureMarkerSymbol({
                                "url": this._projectName + "/widgets/assets/images/farmPollution.png",
                                "height": 15,
                                "width": 15,
                                "type": "esriPMS"
                            });
                            var graphic = new Graphic(pt, symbol);
                            this._dirtyAnalyzeLayer.add(graphic);
                        } break;
                        case 104: {
                            var pt = new Point(data[i].attributes.Longitude, data[i].attributes.Latitude, spatialReference);
                            var symbol = new PictureMarkerSymbol({
                                "url": this._projectName + "/widgets/assets/images/site.png",
                                "height": 15,
                                "width": 15,
                                "type": "esriPMS"
                            });
                            var graphic = new Graphic(pt, symbol);
                            this._dirtyAnalyzeLayer.add(graphic);
                        }
                            break;

                        case 105: {
                            var pt = new Point(data[i].attributes.Longitude, data[i].attributes.Latitude, spatialReference);
                            var symbol = new PictureMarkerSymbol({
                                "url": this._projectName + "/widgets/assets/images/coal.png",
                                "height": 15,
                                "width": 15,
                                "type": "esriPMS"
                            });
                            var graphic = new Graphic(pt, symbol);
                            this._dirtyAnalyzeLayer.add(graphic);
                        }
                            break;

                        case 106: {
                            var pt = new Point(data[i].attributes.Longitude, data[i].attributes.Latitude, spatialReference);
                            var symbol = new PictureMarkerSymbol({
                                "url": this._projectName + "/widgets/assets/images/sewagePollution.png",
                                "height": 15,
                                "width": 15,
                                "type": "esriPMS"
                            });
                            var graphic = new Graphic(pt, symbol);
                            this._dirtyAnalyzeLayer.add(graphic);
                        }
                            break;

                        case 108: {
                            var pt = new Point(data[i].attributes.Longitude, data[i].attributes.Latitude, spatialReference);
                            var symbol = new PictureMarkerSymbol({
                                "url": this._projectName + "/widgets/assets/images/exposedLand.png",
                                "height": 15,
                                "width": 15,
                                "type": "esriPMS"
                            });
                            var graphic = new Graphic(pt, symbol);
                            this._dirtyAnalyzeLayer.add(graphic);
                        }
                            break;

                        case 109: {
                            var pt = new Point(data[i].attributes.Longitude, data[i].attributes.Latitude, spatialReference);
                            var symbol = new PictureMarkerSymbol({
                                "url": this._projectName + "/widgets/assets/images/car.png",
                                "height": 15,
                                "width": 15,
                                "type": "esriPMS"
                            });
                            var graphic = new Graphic(pt, symbol);
                            this._dirtyAnalyzeLayer.add(graphic);
                        }
                            break;

                        case 110: {
                            var pt = new Point(data[i].attributes.Longitude, data[i].attributes.Latitude, spatialReference);
                            var symbol = new PictureMarkerSymbol({
                                "url": this._projectName + "/widgets/assets/images/companyPollution.png",
                                "height": 15,
                                "width": 15,
                                "type": "esriPMS"
                            });
                            var graphic = new Graphic(pt, symbol);
                            this._dirtyAnalyzeLayer.add(graphic);
                        }
                            break;

                        case 111: {
                            var pt = new Point(data[i].attributes.Longitude, data[i].attributes.Latitude, spatialReference);
                            var symbol = new PictureMarkerSymbol({
                                "url": this._projectName + "/widgets/assets/images/companyPollution.png",
                                "height": 15,
                                "width": 15,
                                "type": "esriPMS"
                            });
                            var graphic = new Graphic(pt, symbol);
                            this._dirtyAnalyzeLayer.add(graphic);
                        }
                            break;

                        case 112: {
                            var pt = new Point(data[i].attributes.Longitude, data[i].attributes.Latitude, spatialReference);
                            var symbol = new PictureMarkerSymbol({
                                "url": this._projectName + "/widgets/assets/images/companyPollution.png",
                                "height": 15,
                                "width": 15,
                                "type": "esriPMS"
                            });
                            var graphic = new Graphic(pt, symbol);
                            this._dirtyAnalyzeLayer.add(graphic);
                        }
                            break;

                        case 113: {
                            var pt = new Point(data[i].attributes.Longitude, data[i].attributes.Latitude, spatialReference);
                            var symbol = new PictureMarkerSymbol({
                                "url": this._projectName + "/widgets/assets/images/companyPollution.png",
                                "height": 15,
                                "width": 15,
                                "type": "esriPMS"
                            });
                            var graphic = new Graphic(pt, symbol);
                            this._dirtyAnalyzeLayer.add(graphic);
                        }
                            break;


                    }
                }
            }
        },
        _initEvent: function () {
            topic.subscribe(this.domNode.id + "isActive", lang.hitch(this, "onIsActive"));
            on(this.newDraw, "draw-end", lang.hitch(this, function (evt) {
                this.map.graphics.clear();
                this._addToMap(evt);
            }));
           
            domStyle.set(this.dirtyAnalyzePaneNode, "display", "inline-block");
          
            on(this._drawRectangleSwitching, "opended", lang.hitch(this, function (isOpened) {
                if (isOpened) {
                    this.isActive = true;
                    topic.publish(this.domNode.id + "isActive", "onIsActive", this.isActive);
                    this._activateDrawTool(dirtyAnalyze.RECTANGLE);
                }
                else {
                    this.isActive = false;
                    topic.publish(this.domNode.id + "isActive", "onIsActive", this.isActive);
                    this.map.graphics.clear();
                    this.newDraw.deactivate();
                    if (this._dirtyAnalyzeLayer != undefined) {
                        this._dirtyAnalyzeLayer.clear();
                    }
                    this._toolTipDialog = null;
                    this._currentDrawTool = null;
                    popup.close();
                    this._mapPoint = null
                    this.addPrimaryPollutionPoint()

                }
            }));
            on(this._drawPolygonSwitching, "opended", lang.hitch(this, function (isOpened) {
                if (isOpened) {
                    this.isActive = true;
                    topic.publish(this.domNode.id + "isActive", "onIsActive", this.isActive);
                    this._activateDrawTool(dirtyAnalyze.POLYGON);
                }
                else {
                    this.isActive = false;
                    topic.publish(this.domNode.id + "isActive", "onIsActive", this.isActive);
                    this.map.graphics.clear();
                    this.newDraw.deactivate();
                    if (this._dirtyAnalyzeLayer != undefined) {
                        this._dirtyAnalyzeLayer.clear();
                    }
                    this._toolTipDialog = null;
                    this._currentDrawTool = null;
                    popup.close();
                    this._mapPoint=null
                    this.addPrimaryPollutionPoint()
                }
            }));
            on(this._drawCircleSwitching, "opended", lang.hitch(this, function (isOpened) {
                if (isOpened) {
                    this.isActive = true;
                    topic.publish(this.domNode.id + "isActive", "onIsActive", this.isActive);
                    this._activateDrawTool(dirtyAnalyze.CIRCLE);
                }
                else {
                    this.isActive = false;
                    topic.publish(this.domNode.id + "isActive", "onIsActive", this.isActive);
                    this.map.graphics.clear();
                    this.newDraw.deactivate();
                    if (this._dirtyAnalyzeLayer != undefined) {
                        this._dirtyAnalyzeLayer.clear();
                    }
                    this._toolTipDialog =null;
                    popup.close();
                    this._mapPoint = null;
                    
                    this.addPrimaryPollutionPoint()
                }
            }));
           
        },
        _geodesicArea: function (geometry) {
            return geometryEngine.geodesicArea(geometry, "square-meters");
        },
        _geodesicLength: function (geometry) {
            return geometryEngine.geodesicLength(geometry, "meters");
        },
       
    });

    return dirtyAnalyze;
});