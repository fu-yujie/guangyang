/**
 * Created by Administrator on 2015/5/4.
 */
define([
  "dojo/_base/array",
  "dojo/_base/connect",
  "dojo/_base/declare",
    "dojo/_base/fx",
  "dojo/_base/lang",
  "dojo/dom",
  "dojo/dom-construct",
  "dojo/dom-class",
  "dojo/dom-geometry",
  "dojo/dom-style",
  "dojo/json",
    "dojo/mouse",
  "dojo/on",
  "dojo/ready",
  "dojo/topic",
  "dojo/request/xhr",
  "dojo/text!./templates/MapControl1.html",
  "dijit/_Container",
  "dijit/_Contained",
  "dijit/form/Button",
  "dijit/layout/_ContentPaneResizeMixin",
  "dijit/layout/LayoutContainer",
  "dijit/layout/BorderContainer",
  "dijit/layout/ContentPane",
    "dijit/popup",
  "dijit/registry",
  "./_Widget",
    "./Switching",
    "./Search",
    "./ToolBox",
  "esri/map",
  "esri/dijit/Scalebar",
  "esri/dijit/HomeButton",
   "esri/geometry/Extent",
   "esri/geometry/Point",
  "esri/layers/ArcGISDynamicMapServiceLayer",
  "esri/layers/ArcGISTiledMapServiceLayer",
  "esri/symbols/SimpleFillSymbol",
  "esri/Color",
  "esri/symbols/SimpleLineSymbol",
  "esri/renderers/SimpleRenderer",
   "esri/tasks/query",
   "esri/tasks/QueryTask",
  "esri/layers/LayerDrawingOptions",
  "esri/layers/GraphicsLayer",
  "esri/layers/FeatureLayer",
  "esri/symbols/TextSymbol",
  "esri/symbols/Font",
  "esri/layers/LabelLayer",
  "esri/renderers/UniqueValueRenderer",
  "esri/symbols/PictureMarkerSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/renderers/ClassBreaksRenderer",
  "esri/graphic",
    "esri/toolbars/navigation",
    "esri/request",
    "esri/InfoTemplate",
    //"widgets/MenuBar",
    "widgets/Patrol",
    "widgets/Conductor",
    "widgets/LayerControl",
    "widgets/MonitoringPoint",
    "widgets/PollutionSources",
    "widgets/RealTime",
    "widgets/Case",
    "widgets/Coordinate",
    "widgets/DataTemplate",
    "widgets/TaskMessage",
    "widgets/SearchPart",
    "dojo/domReady!"
], function (
  array,
  connect,
  declare,
  fx,
  lang,
  dom,
  domConstruct,
  domClass,
  domGeom,
  domStyle,
  JSON,
  mouse,
  on,
  ready,
  topic,
  xhr,
  template,
  _Container,
  _Contained,
  Button,
  _ContentPaneResizeMixin,
  LayoutContainer,
  BorderContainer,
  ContentPane,
  popup,
  registry,
  _Widget,
  Switching,
  Search,
  ToolBox,
  Map,
  Scalebar,
  HomeButton,
  Extent,
  Point,
  ArcGISDynamicMapServiceLayer,
  ArcGISTiledMapServiceLayer,
  SimpleFillSymbol,
  Color,
  SimpleLineSymbol,
  SimpleRenderer,
  Query,
  QueryTask,
  LayerDrawingOptions,
  GraphicsLayer,
  FeatureLayer,
  TextSymbol,
  Font,
  LabelLayer,
  UniqueValueRenderer,
  PictureMarkerSymbol,
  SimpleMarkerSymbol,
  ClassBreaksRenderer,
  Graphic,
  Navigation,
  esriRequest,
  InfoTemplate,
  //MenuBar,
  Patrol,
  Conductor,
  LayerControl,
  MonitoringPoint,
  PollutionSources,
  RealTime,
  Case,
  Coordinate,
  DataTemplate,
  TaskMessage,
  SearchPart
) {
    var mapControl = declare("widgets.MapControl1", [_Widget, _Container, _ContentPaneResizeMixin, _Contained], {
        // templateString: html||Object
        //    控件的html模板
        templateString: template,
        mapServiceConfig: null,
        userInfoJson: null,
        _popupMapPoint: null,
        _toolTipDialog: null,

        constructor: function (para) {
            if (para != undefined) {
                if ("mapServiceConfig" in para) {
                    this.mapServiceConfig = para.mapServiceConfig;
                }
                if ("userInfoJson" in para) {
                    this.userInfoJson = para.userInfoJson;
                }
            }
        },
        buildRendering: function () {
            this.inherited(arguments);//继承父类的方法；
        },
        //默认头部功能切换
        GoToMenu: function () {
            var $dataTemplate = dojo.query(".dataTemplate");
            var chil_top = this.functionPartNode.getElementsByTagName("div");
            var that = this;
            for (var i = 0; i < chil_top.length; i++) {
                chil_top[i].sa = i;
                var zI = 50;
                chil_top[i].onclick = function () {
                    this.style.background = "#007ad0";
                    //筛选当前显示的功能；
                    var idex = [];
                    for (var j = 0; j < chil_top.length; j++) {
                        chil_top[j].style.background = "";
                        if ($dataTemplate[j].style.display == "block" && $dataTemplate[j].style.right < "10px") {
                            idex.push(j)
                            that.DragAndDrop($dataTemplate[j], dojo.query(".dataTemplateTitle")[j])
                        }
                        if ($dataTemplate[j].style.display == "none") {
                            $dataTemplate[j].style.right = "0px"
                        }
                    }
                    //将当前功能的索引添加到数组的最后一个；
                    $dataTemplate[this.sa].style.display = "block";
                    that.DragAndDrop($dataTemplate[this.sa], dojo.query(".dataTemplateTitle")[this.sa])
                    if (idex.indexOf(this.sa) != -1) {
                        idex.splice(idex.indexOf(this.sa), 1)
                    }
                    if ($dataTemplate[this.sa].style.right < "10px") {
                        idex.push(this.sa)
                    }
                    //将当前显示的所有的功能进行重新排列显示；
                    for (var s in idex) {
                        if (idex[s] == this.sa) {
                            $dataTemplate[idex[s]].style.top = (idex.length - 1) * 35 + "px";
                            $dataTemplate[idex[s]].style.zIndex = 51;
                        } else {
                            $dataTemplate[idex[s]].style.top = s * 35 + "px";
                            $dataTemplate[idex[s]].style.zIndex = 50;
                        }
                    }
                }
            }
        },
        //拖拽功能
        DragAndDrop: function ($inner, $title) {
            var $outer = document.getElementsByTagName('body')[0];
            var $dataTemplate = dojo.query(".dataTemplate");
            $title.onmousedown = function (event) {
                document.onmousemove = null;
                var event = event || window.event;
                var left1 = event.clientX - $inner.offsetLeft;
                var top1 = event.clientY - $inner.offsetTop;
                var w = $outer.clientWidth - $inner.offsetWidth;
                var h = $outer.clientHeight - $inner.offsetHeight;
                array.forEach($dataTemplate, function (item) {
                    domStyle.set(item, "zIndex", "50")
                })
                domStyle.set($inner, "zIndex", "52");
                document.onmousemove = function (event) {
                    var event = event || window.event;
                    var right = w - (event.clientX - left1);
                    var top = (event.clientY - top1);
                    if (right < 0) {
                        right = 0;
                    };
                    if (right > w) {
                        right = w;
                    };
                    if (top < 0) {
                        top = 0;
                    };
                    if (top > h) {
                        top = h;
                    };
                    $inner.style.right = right + "px";
                    $inner.style.top = top + "px";
                }
            }
            document.onmouseup = function () {
                document.onmousemove = null;
            }
        },
        //拖拽功能left的；
        DragAndDropLeft: function ($inner, $title) {
            var $outer = document.getElementsByTagName('body')[0];
            $title.onmousedown = function (event) {
                document.onmousemove = null;
                var event = event || window.event;
                var left1 = event.clientX - $inner.offsetLeft;
                var top1 = event.clientY - $inner.offsetTop;
                var w = $outer.clientWidth - $inner.offsetWidth;
                var h = $outer.clientHeight - $inner.offsetHeight;

                domStyle.set($inner, "zIndex", "52");
                document.onmousemove = function (event) {
                    var event = event || window.event;
                    var left = (event.clientX - left1);
                    var top = (event.clientY - top1);
                    if (left < 0) {
                        left = 0;
                    };
                    if (left > w) {
                        left = w;
                    };
                    if (top < 0) {
                        top = 0;
                    };
                    if (top > h) {
                        top = h;
                    };
                    $inner.style.left = left + "px";
                    $inner.style.top = top + "px";
                }
            }
            document.onmouseup = function () {
                document.onmousemove = null;
            }
        },
        //头部功能根据不同局的筛选(环保局权限和其他局权限下名称的展示)；
        Top_filter: function (dpartdata) {
            if (dpartdata != null && dpartdata != undefined) {
                switch (dpartdata.DepartName) {
                    case "环保局":
                        {
                            domStyle.set(this.currentDepartNode, "display", "none");
                            this.tableEveryDepart();
                        }
                        break;
                    case "超级管理员":
                        {
                            domStyle.set(this.currentDepartNode, "display", "none");
                            this.tableEveryDepart();
                        }
                        break;
                    case "云鹏道办事处":
                    case "耀华道办事处":
                        {
                            domStyle.set(this.currentDepartAllNode, "display", "none");
                            this.currentDepartNode.innerHTML = dpartdata.DepartName;
                            domStyle.set(this.realTimeTNode, "display", "none");
                            domStyle.set(this.conductorTNode, "display", "none");
                        }
                        break;
                    default:
                        {
                            domStyle.set(this.currentDepartAllNode, "display", "none");
                            this.currentDepartNode.innerHTML = dpartdata.DepartName;
                            domStyle.set(this.realTimeTNode, "display", "none");
                            domStyle.set(this.caseTNode, "display", "none");
                            domStyle.set(this.patrolTNode, "display", "none");
                            domStyle.set(this.conductorTNode, "display", "none");
                        }
                }
                domStyle.set(this.currentDepartAllNode, "display", "none");
            }
        },
        //环保局权限下获得到不同局的权限数据后进行功能展示的过滤；
        hbpart: function (dt) {
            if (dt != null && dt != undefined) {
                switch (dt.DepartName) {
                    case "环保局": {
                        domStyle.set(this.realTimeTNode, "display", "block");
                        domStyle.set(this.caseTNode, "display", "block");
                        domStyle.set(this.patrolTNode, "display", "block");
                        domStyle.set(this.conductorTNode, "display", "block");
                        domStyle.set(this.monitoringPointTNode, "display", "block");
                        domStyle.set(this.pollutionSourcesTNode, "display", "block");
                        domStyle.set(this.currentDepartNode, "display", "none");
                    }
                        break;
                    default:
                        {
                            domStyle.set(this.currentDepartNode, "display", "none");
                            domStyle.set(this.realTimeTNode, "display", "none");
                            domStyle.set(this.caseTNode, "display", "none");
                            domStyle.set(this.patrolTNode, "display", "none");
                            domStyle.set(this.conductorTNode, "display", "none");
                        }
                }
            }
        },
        //环保局权限下进行各个部门权限的查看并从后台获取权限数据；
        tableEveryDepart: function () {
            var allDepart = this.currentDepartAllNode.getElementsByTagName("p")
            var functionALL = ["monitoringPointTemplate", "pollutionSourcesTemplate", "realTimeTemplate", "caseTemplate", "patrolTemplate", "conductorTemplate"]
            var that = this;
            for (var item = 0; item < allDepart.length; item++) {
                allDepart[item].index = item;
                allDepart[item].onclick = function () {
                    that.map.graphics.clear();
                    for (iss in functionALL) {
                        that[functionALL[iss]].dataTemplateContents.stateListener();
                        that[functionALL[iss]].set("style", "display:none")
                    }
                    array.forEach(that.mapServiceConfig, lang.hitch(that, function (layerConfig) {
                        var layer = [];
                        switch (layerConfig.type) {
                            case "GraphicsLayer": {
                                //that.map.getLayer(layerConfig.id).clear();
                                if (layerConfig.id != "roadPollution") {
                                    that.map.getLayer(layerConfig.id).setVisibility(false);
                                }
                                popup.close();
                            } break;
                        }
                        switch (layerConfig.id) {
                            case "gController": {
                                if (that.monitoringPointTemplate.dataTemplateContents.gController.checkBox.checked == true) {
                                    that.map.getLayer(layerConfig.id).setVisibility(true);
                                } else {
                                    that.map.getLayer(layerConfig.id).setVisibility(false);
                                }
                            } break;
                            case "wController": {
                                if (that.monitoringPointTemplate.dataTemplateContents.wController.checkBox.checked == true) {
                                    that.map.getLayer(layerConfig.id).setVisibility(true);
                                } else {
                                    that.map.getLayer(layerConfig.id).setVisibility(false);
                                }
                                //popup.open();
                            } break;
                            case "sController": {
                                if (that.monitoringPointTemplate.dataTemplateContents.sController.checkBox.checked == true) {
                                    that.map.getLayer(layerConfig.id).setVisibility(true);
                                } else {
                                    that.map.getLayer(layerConfig.id).setVisibility(false);
                                }
                            } break;
                        }

                    }));
                    that.currentStyle(this)
                    that.permissionRequest(this)
                };
            }
        },
        //每次切换后各个局的样式
        currentStyle: function (that) {
            var allDepart = this.currentDepartAllNode.getElementsByTagName("p")
            var wximg = ["hb.png", "zhzf.png", "ggsygl.png", "gh.png", "shfz.png", "scjdgl.png"]
            var xzimg = ["hb1.png", "zhzf1.png", "ggsygl1.png", "gh1.png", "shfz1.png", "scjdgl1.png"]
            for (var i = 0; i < allDepart.length; i++) {
                domStyle.set(allDepart[i], "background-image", "url('" + this.projectName + "/widgets/assets/images/" + wximg[i] + "')")
                domStyle.set(allDepart[i], "background-color", "#0088e7");
                domStyle.set(allDepart[i], "color", "#b8d3f3");
            }
            domStyle.set(that, "background-image", "url('" + this.projectName + "/widgets/assets/images/" + xzimg[that.index] + "')")
            domStyle.set(that, "background-color", "white");
            domStyle.set(that, "color", "#f1ab00 ");
        },
        //每次切换各个局后再次请求权限数据
        permissionRequest: function (that) {
            var data;
            switch (that.innerHTML) {
                case "环保局": {
                    data = {
                        methodName: "GetQX",
                        name: "环保局"
                    }
                } break;
                case "综合执法局": {
                    data = {
                        methodName: "GetQX",
                        name: "综合执法局"
                    }
                } break;
                case "公共事业管理局": {
                    data = {
                        methodName: "GetQX",
                        name: "公共事业管理局"
                    }
                } break;
                case "规划局": {
                    data = {
                        methodName: "GetQX",
                        name: "规划局"
                    }
                } break;
                case "社会发展局": {
                    data = {
                        methodName: "GetQX",
                        name: "社会发展局"
                    }
                } break;
                case "市场监督管理局": {
                    data = {
                        methodName: "GetQX",
                        name: "市场监督管理局"
                    }
                } break;
                case "超级管理员": {
                    data = {
                        methodName: "GetQX",
                        name: "超级管理员"
                    }
                } break;
            }
            xhr.post(this.projectName + "/widgets/handler/Index.ashx", {
                handleAs: "text",
                timeout: 10000,
                data: data
            }).then(lang.hitch(this, function (data) {
                var dt = eval("(" + data + ")")
                this.departName = dt.DepartName;
                this.hbpart(dt);
                this.map.filed(dt, this.pollutionSourcesTemplate.dataTemplateContents)
            }), lang.hitch(this, function (error) {
            }));
        },
        //无权限情况下清除全部dom；
        removeall: function (dpartdata) {
            if (dpartdata == null) {
                var ohtml = document.getElementsByTagName("html")[0];
                while (ohtml.hasChildNodes()) {
                    ohtml.removeChild(ohtml.firstChild);
                }
                while (!ohtml.hasChildNodes()) {
                    window.stop()
                }
            }
        },
        postCreate: function () {
            /// <summary>
            /// 小部件的DOM准备好后并被插入到页面后调用该方法，保存图层信息
            /// </summary>
            this.inherited(arguments);

            var pathName = window.document.location.pathname;
            //projectName:string
            //当前项目路径
            this.projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);
            var h = document.documentElement.clientHeight - 80;
            domStyle.set(this.mapNode, "height", h + "px")
            this.map = new Map(this.mapNode, {
                autoResize: false,
                zoom: 5,
                logo: false,
                center: [116.60369, 39.53896],
                //extent: new Extent({
                //    xmin: 116.6399266576135,
                //    ymin: 39.526745023858496,
                //    xmax: 116.81008631987959,
                //    ymax: 39.622975520547755,
                //    spatialReference: { wkid: 4326 }
                //}),
                fitExtent: true
            });
            this._loadLayers();
            this.scalebar = new Scalebar({
                map: this.map,
                attachTo: "bottom-left",
                scalebarStyle: "ruler",
                scalebarUnit: "metric"
            }, this.scalebarNode);
            this.homeButton = new HomeButton({
                style: "position: absolute;left: 20px;top:90px;z-index: 50;display: block;",
                map: this.map,
                extent: null
            }, this.zoomToFullBtnNode);



            this.monitoringPointTNode.innerHTML = "<span></span><em>环境监测</em>"
            this.pollutionSourcesTNode.innerHTML = "<span></span><em>污染源</em>"
            this.realTimeTNode.innerHTML = "<span></span><em>实时监控</em>"
            this.caseTNode.innerHTML = "<span></span><em>案件</em>"
            this.patrolTNode.innerHTML = "<span></span><em>巡查监督</em>"
            this.conductorTNode.innerHTML = "<span></span><em>指挥调度</em>"
            //图层控制整体模块；
            this.layerControl = new LayerControl({
                map: this.map
            }, this.layerControlNode);
            //图层控制面板的拖拽
            this.DragAndDropLeft(this.layerControl.domNode, this.layerControl.tuceng_topsNode)
             //环境检测整体模块；
            this.monitoringPointTemplate = new DataTemplate({
                map: this.map,
                titleName: "环境监测",
                dataTemplateContent: MonitoringPoint,//头部功能每个模块整体；
                tableTitleId: "MonitoringPointTableTitle",//表格头部切换的id;
                tableContentId: "MonitoringPointTable",//分页器所需要的id
                tableNum: 6//定义每个模块表格数；
            }, this.monitoringPointNode);
            //污染源整体模块；
            this.pollutionSourcesTemplate = new DataTemplate({
                map: this.map,
                titleName: "污染源",
                dataTemplateContent: PollutionSources,
                tableTitleId: "PollutionSourcesTableTitle",
                tableContentId: "PollutionSourcesTable",//分页器所需要的id
                tableNum: 10//此模块中功能种类的个数
            }, this.pollutionSourcesNode);
            //实时监控整体模块；
            this.realTimeTemplate = new DataTemplate({
                map: this.map,
                titleName: "视频监控",
                dataTemplateContent: RealTime,
                tableTitleId: "RealTimeTableTitle",
                tableContentId: "RealTimeTable",//分页器所需要的id
                tableNum: 1
            }, this.realTimeNode);
            //案件整体模块；
            this.caseTemplate = new DataTemplate({
                map: this.map,
                titleName: "案件",
                dataTemplateContent: Case,
                tableTitleId: "CaseTableTitle",
                tableContentId: "CaseTable",//分页器所需要的id
                tableNum: 1
            }, this.caseNode);
            //巡查监督整体模块；
            this.patrolTemplate = new DataTemplate({
                map: this.map,
                titleName: "巡查监督",
                dataTemplateContent: Patrol,
                tableTitleId: "PatrolTableTitle",
                tableContentId: "PatrolTable",//分页器所需要的id
                tableNum: 1
            }, this.patrolNode);
            //指挥调度整体模块；
            this.conductorTemplate = new DataTemplate({
                map: this.map,
                titleName: "指挥调度",
                dataTemplateContent: Conductor,
                tableTitleId: "ConductorTableTitle",
                tableContentId: "ConductorTable",//分页器所需要的id
                tableNum: 1
            }, this.conductorNode);
            //任务消息模板
            //this.taskMessage = new TaskMessage({}, this.taskMessageNode)
            //this.DragAndDropLeft(this.taskMessage.domNode, this.taskMessage.taskMessageTitleNode)
            //搜索功能模块
            this.searchPart = new SearchPart({
                map: this.map
            }, this.searchPartNode)
            this.DragAndDropLeft(this.searchPart.domNode, this.searchPart.searchPartTitleNode)
            //根据权限进行污染源的筛选控制调用部分；
            var dpartdata = eval("(" + sessionStorage.getItem('dat') + ")")
            this.removeall(dpartdata)
            this.Top_filter(dpartdata);
            this.departName = dpartdata.DepartName;

            this.navToolbar = new Navigation(this.map);
            this.zoomInPane = new ContentPane({}, this.navZoomInBtnNode);
            this._zoomInSwitching = new Switching({});
            this._zoomInSwitching.set("icon", this.projectName + "/widgets/assets/images/nav_zoomin.png");
            this._zoomInSwitching.set("iconMarginBox", { w: 23, h: 23 });
            this._zoomInSwitching.setOpened(false);
            this.zoomInPane.addChild(this._zoomInSwitching);
            on(this._zoomInSwitching, "opended", lang.hitch(this, function (isOpened) {
                if (isOpened) {
                    if (this._zoomOutSwitching.opened) {
                        this._zoomOutSwitching.setOpened(false);
                    }
                    if (this._zoomPanSwitching.opened) {
                        this._zoomPanSwitching.setOpened(false);
                    }
                    this.navToolbar.activate(Navigation.ZOOM_IN);
                } else {
                    //this.navToolbar.activate(Navigation.PAN);
                    this.navToolbar.deactivate();
                }
            }));

            this.coordinate = new Coordinate({}, this.coordinateNode);
            this.coordinate.set("map", this.map);
            this.map.xc_topNode = this.xc_topNode;

            this.zoomOutPane = new ContentPane({}, this.navZoomOutBtnNode);
            this._zoomOutSwitching = new Switching({});
            this._zoomOutSwitching.set("icon", this.projectName + "/widgets/assets/images/nav_zoomout.png");
            this._zoomOutSwitching.set("iconMarginBox", { w: 23, h: 23 });
            this._zoomOutSwitching.setOpened(false);
            this.zoomOutPane.addChild(this._zoomOutSwitching);
            on(this._zoomOutSwitching, "opended", lang.hitch(this, function (isOpened) {
                if (isOpened) {
                    if (this._zoomInSwitching.opened) {
                        this._zoomInSwitching.setOpened(false);
                    }
                    if (this._zoomPanSwitching.opened) {
                        this._zoomPanSwitching.setOpened(false);
                    }
                    this.navToolbar.activate(Navigation.ZOOM_OUT);
                } else {
                    //this.navToolbar.activate(Navigation.PAN);
                    this.navToolbar.deactivate();
                }
            }));
            this.toolBox = new ToolBox({
                map: this.map,
                style: "position: absolute; left: 350px;top:0px;z-index: 51;"
            }, this.toolBoxNode);
            this.map.toolBox = this.toolBox

            this.zoomPanPane = new ContentPane({}, this.navPanBtnNode);
            this._zoomPanSwitching = new Switching({});
            this._zoomPanSwitching.set("icon", this.projectName + "/widgets/assets/images/trag0.png");
            this._zoomPanSwitching.set("iconMarginBox", { w: 30, h: 30 });
            this._zoomPanSwitching.setOpened(false);
            this.zoomPanPane.addChild(this._zoomPanSwitching);
            on(this._zoomPanSwitching, "opended", lang.hitch(this, function (isOpened) {
                if (isOpened) {
                    if (this._zoomInSwitching.opened) {
                        this._zoomInSwitching.setOpened(false);
                    }
                    if (this._zoomOutSwitching.opened) {
                        this._zoomOutSwitching.setOpened(false);
                    }
                    this.map.toolBox._closeCurrentDrawTool();
                    this.map.conductorTool._closeCurrentDrawTool();
                    this.map.dirtyAnalyze._closeCurrentDrawTool();
                    this.navToolbar.activate(Navigation.PAN);
                } else {
                    //this.navToolbar.activate(Navigation.PAN);
                    this.navToolbar.deactivate();
                }
            }));
            this.searchPartPane = new ContentPane({
                style: "top:24px;left:265px"
            }, this.searchPartPaneNode);
            this._searchPartPaneSwitching = new Switching({});
            this._searchPartPaneSwitching.set("icon", this.projectName + "/widgets/assets/images/searchPart.png");
            this._searchPartPaneSwitching.set("iconMarginBox", { w: 30, h: 30 });
            this._searchPartPaneSwitching.setOpened(false);
            this.searchPartPane.addChild(this._searchPartPaneSwitching);
            this.map._searchPartPaneSwitching = this._searchPartPaneSwitching
            on(this._searchPartPaneSwitching, "opended", lang.hitch(this, function (isOpened) {
                if (isOpened) {
                    this.searchPart.set("style", "display:block;top:60px")
                    //this.searchPart.newData(data)
                } else {
                    this.searchPart.set("style", "display:none;")
                    this._searchPartlayer = this.map.getLayer("searchPart");
                    this._searchPartlayer.clear()
                    //this.navToolbar.activate(Navigation.PAN);
                    //this.navToolbar.deactivate();
                }
            }));
            this.search = new Search({
                map: this.map,
                style: "position: absolute; right: 35px;top:2px;z-index: 51;display:none;"
            }, this.searchNode);
            on(this.search, "searchGController", lang.hitch(this, function () {
                this.menuBar.gController.checkBox.set("checked", "true");
            }));
            on(this.search, "searchWController", lang.hitch(this, function () {
                this.menuBar.wController.checkBox.set("checked", "true");
            }));
            //on(this.search,"searchCaseInfo",lang.hitch(this,function(){
            //    this.menuBar.caseInfo.checkBox.set("checked","true");
            //}));
            on(this.search, "searchSite", lang.hitch(this, function () {
                this.menuBar.sitePollution.checkBox.set("checked", "true");
            }));
            on(this.search, "searchCar", lang.hitch(this, function () {
                this.menuBar.carPollution.checkBox.set("checked", "true");
            }));
            on(this.search, "searchCoal", lang.hitch(this, function () {
                this.menuBar.coalPollution.checkBox.set("checked", "true");
            }));
            on(this.search, "searchExposedLand", lang.hitch(this, function () {
                this.menuBar.exposedLandPollution.checkBox.set("checked", "true");
            }));
            on(this.search, "searchBarbecue", lang.hitch(this, function () {
                this.menuBar.barbecuePollution.checkBox.set("checked", "true");
            }));
            this._initEvent();
            this._setupAnims();
            this.GoToMenu();
        },

        resize: function (/*Object?*/newSize) {
            this.inherited(arguments);

            if (newSize) {
                domStyle.set(this.mapNode, "width", newSize.w + "px");
                domStyle.set(this.mapNode, "height", newSize.h + "px");
                this._loadLayers();
            }
            this.map.on("load", lang.hitch(this, function () {
                topic.publish(this.domNode.id + "mapLoaded", this.map);
                this.map.resize();
            }));
            this.map.on("extent-change", lang.hitch(this, function (result) {
                topic.publish(this.domNode.id + "mapExtentChange", result.extent);

            }));
        },

        startup: function () {
            this.inherited(arguments);
            //this.search.startup();
            if (!this.getParent() || !this.getParent().isLayoutContainer) {
                this.resize();
            }

        },

        onMapLoaded: function () {
        },
        //onMapExtentChange: function () {
        //},
        _setupAnims: function () {
        },
        //一级网格下面显示的pupup
        _initEvent: function () {
            on(this.userInfoNode, "click", lang.hitch(this, function () {
                alert("当前用户信息为：" + this.departName)
            }));
        },
        _loadLayers: function () {
            //var definitionExpression = "STAFFNAME = 2430 OR STAFFNAME IS null";
            //加载动态2D图层
            array.forEach(this.mapServiceConfig, lang.hitch(this, function (layerConfig) {
                var layer;
                var labelLayer;
                switch (layerConfig.type) {
                    case "FeatureLayer":
                        {
                            //加载要素服务图层
                            layer = new FeatureLayer(layerConfig.url, {
                                id: layerConfig.id,
                                description: layerConfig.description,
                                maxRecordCount: 100000,
                                maxScale: layerConfig.maxScale,
                                minScale: layerConfig.minScale,
                                //maxAllowableOffset: this._calcOffset(),
                                outFields: ["*"]
                            });
                            //if(layerConfig.description == "三级网格") {
                            var statesLabel = new TextSymbol({
                                color: new Color([94, 94, 94]),
                                font: new Font({
                                    size: 10,
                                    family: "arial",
                                    weight: "bold"
                                })
                            });
                            var statesLabelRenderer = new SimpleRenderer(statesLabel);
                            labelLayer = new LabelLayer({
                                id: layerConfig.id + "labels",
                                mode: "DYNAMIC"
                            });
                            labelLayer.addFeatureLayer(layer, statesLabelRenderer, "{FCNAME}");
                            //}
                            layer.setVisibility(false);
                            break;
                        }
                    case "ArcGISTiledMapServiceLayer":
                        {
                            layer = new ArcGISTiledMapServiceLayer(layerConfig.url, {
                                id: layerConfig.id,
                                description: layerConfig.description
                            });
                            //layer.setVisibility(false);
                            break;
                        }
                    case "ArcGISDynamicMapServiceLayer":
                        {
                            layer = new ArcGISDynamicMapServiceLayer(layerConfig.url, {
                                id: layerConfig.id,
                                description: layerConfig.description
                            });
                            if (layerConfig.description == "影像图") {
                                layer.setVisibility(false);
                            }
                            if (layerConfig.id == "roadPollutionBase") {
                                layer.setVisibility(false);
                            }
                            break;
                        }
                    default:
                        {
                            layer = new GraphicsLayer({
                                id: layerConfig.id,
                                description: layerConfig.description
                            });
                            break;
                        }
                }
                if (layer) {
                    if (layerConfig.maxScale != 0) {
                        layer.setMaxScale(layerConfig.maxScale);
                    }
                    if (layerConfig.minScale != 0) {
                        layer.setMinScale(layerConfig.minScale);
                    }
                    this.map.addLayer(layer, layerConfig.level);
                }
                if (labelLayer) {
                    this.map.addLayer(labelLayer);
                }
            }));
        },
        _calcOffset: function () {
            return (this.map.extent.getWidth() / this.map.width);
        },
        showLoading: function () {
        },
        hideLoading: function () {
        }
    });
    return mapControl;
});