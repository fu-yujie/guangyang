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
    "dojo/text!./templates/ConductorTool.html",
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
    "widgets/TitlePartPane",
    "dijit/layout/ContentPane",
    "dijit/TooltipDialog",
    "dijit/form/CheckBox",
    "esri/dijit/Popup",
    "dijit/popup",
    "widgets/svg",
    "dojox/form/CheckedMultiSelect",
     "dojo/data/ItemFileWriteStore",
     "dojo/dom",
     "dojo/dom-style",
     "esri/geometry/Extent",
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
    TitlePartPane,
    ContentPane,
    TooltipDialog,
    CheckBox,
    Popup,
    popup,
    svg,
    CheckedMultiSelect,
    ItemFileWriteStore,
    dom,
    domStyle,
    Extent
) {
    var conductorTool = declare("widgets.ConductorTool", _Widget, {
        // templateString: html||Object
        //    控件的html模板
        templateString: template,
        map: null,
        requiredCount: 0,
        _currentDrawTool: null,
        isActive: false,
        userId: [],
        tel: [],
        content: "",
        title: "",
        constructor: function (para) {
            if (para != undefined) {
                if ("map" in para) {
                    this.map = para.map;
                }
                if ("tableTitleNode" in para.that) {
                    this.tableTitleNode = para.that.tableTitleNode;
                }
                if ("tableContentNode" in para.that) {
                    this.tableContentNode = para.that.tableContentNode;
                }
                if ("tableContentId" in para.that) {
                    this.tableContentId = para.that.tableContentId;
                }
                if ("tableTitleId" in para.that) {
                    this.tableTitleId = para.that.tableTitleId;
                }
                if ("dataTemplateListNode" in para.that) {
                    this.dataTemplateListNode = para.that.dataTemplateListNode;
                }
                if ("domNode" in para.that) {
                    this.dataTemplateContent = para.that.domNode;
                }
                if ("TabIconNode" in para.that) {
                    this.TabIconNode = para.that.TabIconNode;
                }
                if ("ListIconNode" in para.that) {
                    this.ListIconNode = para.that.ListIconNode;
                }

            }
            lang.mixin(conductorTool, { CIRCLE: "circle", POLYGON: "polygon", POLYLINE: "polyline", RECTANGLE: "rectangle" });
        },
        postMixInProperties: function () {
            this.inherited(arguments);
            var pathName = window.document.location.pathname;
            this._projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);
        },
        //请求数据前的参数配置；
        getAllDate: function () {
            var name = [];
            var lengthName = this._typeSelect.value.length;
            if (lengthName === 0) {
                name.push("all");
            } else {
                if (this._typeSelect.value.indexOf("all") > -1) {
                    name.push("all");
                } else {
                    name.push(this._typeSelect.value[0]);
                    for (var i = 1; i < lengthName; i++) {
                        name.push(this._typeSelect.value[i]);
                    }
                }
            }

            var partment = [];
            var lengthPart = this._partSelect.value.length;
            if (lengthPart === 0) {
                partment.push("all");
            } else {
                if (this._partSelect.value.indexOf("all") > -1) {
                    partment.push("all");
                } else {
                    partment.push(this._partSelect.value[0]);
                    for (var i = 1; i < lengthPart; i++) {
                        partment.push(this._partSelect.value[i]);
                    }
                }
            }
            var personName = $("#txtNameConductor").val();
            var gridName = $("#txtGridNameConductor").val();
            if (partment != undefined && partment != null && partment != "" && name != undefined && name != null && name != "") {
                this.getData(partment, name,personName,gridName);
            }
        },
        //获取数据
        getData: function (partment, type, personName, gridName) {
            xhr.post(this._projectName + "/widgets/handler/Conductor.ashx", {
                handleAs: "text",
                timeout: 10000,
                data: {
                    methodName: "GetAllConductor",
                    type: type,
                    partment: partment,
                    personName: personName,
                    gridName: gridName
                }
            }).then(lang.hitch(this, function (result) {
                var dataJson = eval("(" + result + ")");
                if (dataJson.status) {
                    this.defaultData = dataJson.data;
                    this.defaultDataShow();
                    this._cutData(dataJson.data);
                } else {
                    this._clearTable();
                    this.map.graphics.clear();
                    this._closeCurrentDrawTool();
                    this._conductorToolLayers.clear();
                }
            }), lang.hitch(this, function (error) {
            }));
        },
        //默认数据的图中标记
        defaultDataShow: function () {
            var dataJson = this.defaultData;
            this._conductorToolLayers = this.map.getLayer("ConductorTool");
            this._conductorToolLayers.clear();
            if (typeof (dataJson) != "undefined" || dataJson != null) {
                var length = dataJson.length;
            }
            if (length > 0) {
                var spatialReference = this.map.spatialReference;
                for (var i = 0; i < length; i++) {
                    var attr = { "conductorCode": i, "data": dataJson[i] };
                    var pt = new Point(dataJson[i].Longitude, dataJson[i].Latitude, spatialReference);

                    switch (dataJson[i].status) {
                        case "在线": {
                            var symbol = new PictureMarkerSymbol({
                                "url": this._projectName + "/widgets/assets/images/patrolChildren.png",
                                "height": 15,
                                "width": 15,
                                "type": "esriPMS"
                            });
                        } break;
                        case "历史签到": {
                            var symbol = new PictureMarkerSymbol({
                                "url": this._projectName + "/widgets/assets/images/conductorL.png",
                                "height": 15,
                                "width": 15,
                                "type": "esriPMS"
                            });
                        } break;
                        case "未签到": {
                            var symbol = new PictureMarkerSymbol({
                                "url": this._projectName + "/widgets/assets/images/conductorW.png",
                                "height": 15,
                                "width": 15,
                                "type": "esriPMS"
                            });
                        } break;
                    }
                    var graphic = new Graphic(pt, symbol, attr);
                    this._conductorToolLayers.add(graphic);
                }
            }
        },
        postCreate: function () {
            this.inherited(arguments);
            this.checkBox = new CheckBox({
                checked: false
            }, this.checkBoxNode);
            this._toolTipDialog = new TooltipDialog({
                onOpen: lang.hitch(this, function () {
                    topic.publish(this.domNode.id + "open", this._mapPoint, this._toolTipDialog);
                }),
                onClose: lang.hitch(this, function () {
                    topic.publish(this.domNode.id + "close", this._toolTipDialog);
                })
            });

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

            var labOnNode = domConstruct.create("label", {
                innerHTML: "状&nbsp;&nbsp;&nbsp;&nbsp;态：",
                style: "margin-left:6px;font-size:15px;display:inline-block;width:80px;"
            });
            this.conductorCheckNode.appendChild(labOnNode);
            this._typeSelect = new CheckedMultiSelect({
                multiple: true,
                dropDown: true,
                style: "display:inline-block",
                store: new ItemFileWriteStore({
                    data: {
                        identifier: "id",
                        label: "label",                          //此处不能用name，只能用label
                        items: [{ id: "all", label: "全部" }, { id: "在线", label: "在线" }, { id: "历史签到", label: "历史签到" }, { id: "未签到", label: "未签到" }]
                    }
                })
            });
            this._typeSelect.startup()//对于CheckedMultiSelect创建后必须用startup方法来启动
            this.conductorCheckNode.appendChild(this._typeSelect.domNode);

            var labNode = domConstruct.create("label", {
                innerHTML: "二级网格：",
                style: "margin-left:6px;font-size:15px;display:inline-block;width:80px;"
            });
            this.departmentSHNode.appendChild(labNode);
            this._partSelect = new CheckedMultiSelect({
                multiple: true,
                dropDown: true,
                style: "display:inline-block",
                store: new ItemFileWriteStore({
                    data: {
                        identifier: "id",
                        label: "label",                          //此处不能用name，只能用label
                        items: eval(secondCon)
                    }
                })
            });
            this._partSelect.startup();//对于CheckedMultiSelect创建后必须用startup方法来启动
            this.departmentSHNode.appendChild(this._partSelect.domNode);

            //搜索框开始,按网格名称查询
            var labGridNameNode = domConstruct.create("label", {
                innerHTML: "网格名称：",
                style: "margin-left:6px;font-size:15px;display:inline-block;width:80px;"
            });
            this.departmentSHNode.appendChild(labGridNameNode);
            var labGridNode = domConstruct.create("input", {
                innerHTML: "网格名称：",
                id: "txtGridNameConductor",
                style: "margin-top:1px;font-size:14px;display:inline-block;width:102px;"
            });
            this.departmentSHNode.appendChild(labGridNode);
            //搜索框结束

            //搜索框开始,按姓名查询
            var labNameNode = domConstruct.create("label", {
                innerHTML: "姓&nbsp;&nbsp;&nbsp;&nbsp;名：",
                style: "margin-left:6px;font-size:15px;display:inline-block;width:80px;"
            });
            this.departmentSHNode.appendChild(labNameNode);
            var labTestNode = domConstruct.create("input", {
                innerHTML: "姓&nbsp;&nbsp;&nbsp;&nbsp;名：",
                id: "txtNameConductor",
                style: "margin-top:1px;font-size:14px;display:inline-block;width:102px;"
            });
            this.departmentSHNode.appendChild(labTestNode);
            //搜索框结束

            //dojo.byId(dijit_form_ComboButton_1).style.width = "230px";
            //dojo.byId(dijit_form_ComboButton_1).style.height = "30px"
            this.btnNode = domConstruct.create("button", {
                innerHTML: "搜索",
                style: "width: 120px;height: 40px; background: #0899ff;color: #fff;border: 1px solid #0899ff;border-radius: 2px;box-sizing: border-box;margin:5px;"
            });
            this.departmentBtnNode.appendChild(this.btnNode);

            on(this.labelNodeYJ, 'click', lang.hitch(this, function () {
                //alert("haha");
                //点击事件启动弹窗
                var pop_con_emer = document.getElementById('pop_con_emer');
                var pop_bg = document.getElementById('pop_bg');
                pop_con_emer.style.display = 'block';
                pop_bg.style.display = 'block';
            }));
            this._initEvent();
            this._setGrid();
            this._setEvent();
        },
        select: function (evt) {
            this.checkBox.set("checked", !this.checkBox.checked);
        },
        _setEvent: function () {
        },
        startup: function () {
            this.inherited(arguments);
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
            if (this.map.dirtyAnalyze != undefined && this.map.dirtyAnalyze != null) {
                if (this.map.dirtyAnalyze._currentDrawTool != null) {
                    this.map.dirtyAnalyze._closeCurrentDrawTool();
                }
            }
            if (this._currentDrawTool != null) {
                this._closeCurrentDrawTool();
            }
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

        _addToMap: function (evt) {
            var geometrySymbol, centerPoint, textSymbol, labelGraphic;
            var font = new Font("20px", Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLDER);
            this.defaultDataShow()
            switch (evt.target._geometryType) {
                case "rectangle":
                    {
                        geometrySymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                                new Color([255, 0, 0]), 2), new Color([37, 194, 41, 0.25]));
                        //对graphic图层进行地理要素的查询；
                        this._conductorToolLayer = this.map.getLayer("ConductorTool");
                        var graphics = this._conductorToolLayer.graphics;
                        var newGraphics = []
                        for (var i = 0, total = graphics.length; i < total; i++) {
                            if (evt.geometry.contains(graphics[i].geometry)) {
                                newGraphics.push(graphics[i])
                            }
                        }
                        this._dataConversion(newGraphics)
                        this.map.setExtent(evt.geometry.getExtent().expand(2));
                        break;
                    }
                case "polygon": {
                    geometrySymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                        new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                            new Color([255, 0, 0]), 2), new Color([37, 194, 41, 0.25]));
                    //对graphic图层进行地理要素的查询；
                    this._conductorToolLayer = this.map.getLayer("ConductorTool");
                    var graphics = this._conductorToolLayer.graphics;
                    var newGraphics = []
                    for (var i = 0, total = graphics.length; i < total; i++) {
                        if (evt.geometry.contains(graphics[i].geometry)) {
                            newGraphics.push(graphics[i])
                        }
                    }
                    this._dataConversion(newGraphics)
                    this.map.setExtent(evt.geometry.getExtent().expand(2));
                    break;
                }
                case "circle":
                    {
                        geometrySymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                                new Color([255, 0, 0]), 2), new Color([37, 194, 41, 0.25]));
                        centerPoint = evt.geometry.getExtent().getCenter();//获取图形的圆心
                        var perimeter = this._geodesicLength(evt.geometry);//获取图形圆的周长；
                        var r = perimeter / 2 / Math.PI;
                        //对graphic图层进行地理要素的查询；
                        this._conductorToolLayer = this.map.getLayer("ConductorTool");
                        var graphics = this._conductorToolLayer.graphics;
                        var newGraphics = []
                        for (var i = 0, total = graphics.length; i < total; i++) {
                            if (evt.geometry.contains(graphics[i].geometry)) {
                                newGraphics.push(graphics[i])
                            }
                        }
                        this._dataConversion(newGraphics)
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
        _setGrid: function () {

        },
        //对于graphic的数据整理，以及凸显选中范围内的巡查员；
        _dataConversion: function (data) {
            var newdata = data.map(function (item) {
                return item.attributes.data
            })
            this._cutData(newdata)
            data.forEach(lang.hitch(this, function (item) {
                item.symbol = new PictureMarkerSymbol({
                    "url": this._projectName + "/widgets/assets/images/conductorRed.png",
                    "height": 15,
                    "width": 15,
                    "type": "esriPMS"
                });
            }))
        },
        //数据排序完毕执行分页插件自动生成列表；
        _cutData: function (data) {
            this.TabHost();
            //数据自动加载，以及分页的实现；注意数据格式为：[{},{},{},{}]
            (function (that, popup, tableContentId) {
                var ne = new page()
                ne.pageContentElement = "table"; //用哪种 标签进行数据的展示，可以用table与tr+td;或者是ul+li+span;只需要填入table或者ul既可；
                ne.cut_page_id = tableContentId; //整体容器的最外层id
                ne.data = data; //数据；注：数据格式为[{},{},{}];外层为数组，每个数组内的元素为对象的格式；
                ne.pageContentLength = 6; //每页展示数据的长度或个数；
                ne.orderKey = ["", "userName", "contactNumber", "status", "threeGridName"]; //表格展示的属性名的顺序
                ne.orderKeyName = ["", "姓名", "联系方式", "状态", "所属三级网格"] //表格头部的属性名一次的名称与orderKey对应起来；
                ne.addDom({
                    that: that,
                    popup: popup
                }); //调用主方法；
                ne.addOrRemove("set", "border", 0); //第一个属性为remove和set，第二属性为标签的属性名，第三个属性为属性值；
            })(this, popup, this.tableContentId + 0);
            this.sendMessege();


        },
        //首次数据加载为图中坐标点添加事件与数据；
        _setLayer: function (data) {
            //（涉及到模板，勿删除）
        },
        //添加到坐标点到图中；
        _addpoint: function (controls) {
            //(涉及到模板，勿删除)
        },
        //在表格中创建多选框以及创建内容发送部分；
        _pointadd: function (controls) {
            this.pageData = controls
            this._tableshow()
            var tableId = dojo.byId(this.tableContentId + 0)
            //将checkbox添加到表格每行的前面；
            if (tableId.innerHTML != undefined && tableId.innerHTML != null) {
                var w_cons = tableId.getElementsByTagName("tr")
                for (var item = 0; item < w_cons.length; item++) {
                    if (item != 0) {
                        var $dom = w_cons[item].getElementsByTagName("td")[0];
                        var $checkbox = domConstruct.create("input", {
                            type: "checkbox",
                            style: "width: 16px;height: 16px;display: inline-block; margin-right: 15px; vertical-align: middle;"
                        });

                        $dom.insertBefore($checkbox, $dom.firstChild);
                    }
                }

                this.addAllParme();

            }

        },

        //功能面板与表格面板的切换；
        TabHost: function () {
            var $tableTitleId = dojo.byId(this.tableTitleId + 0);//表格头部对应的标题
            this.tableTitleNode.style.display = "block"//表格头部
            $tableTitleId.style.display = "inline-block";
            $tableTitleId.innerHTML = "巡查员列表";
            this.dataTemplateContent.style.display = "none";//选项面板隐藏
            this.dataTemplateListNode.style.display = "block";//表格面板展示
            this.TabIconNode.style.backgroundImage = "url(" + this._projectName + "/widgets/assets/images/Tab.png" + ")";
            this.ListIconNode.style.backgroundImage = "url(" + this._projectName + "/widgets/assets/images/List1.png" + ")";
        },
        //表格模板中每个表格的切换与默认显示
        _tableshow: function () {
            var $tableTitle = dojo.query(".ConductorTableTitle")
            var $tableContent = dojo.query(".ConductorTable")
            for (var i = 0; i < $tableTitle.length; i++) {
                $tableTitle[i].style.background = "white";
                $tableContent[i].style.display = "none";
            }
            $tableTitle[0].style.background = "#f1ab00";
            $tableTitle[0].style.borderRight = "1px solid beige";
            $tableTitle[0].style.borderBottom = "1px solid beige";
            $tableContent[0].style.display = "block";
            for (var i = 0; i < $tableTitle.length; i++) {
                $tableTitle[i].index = i;
                $tableTitle[i].onclick = function () {
                    for (var i = 0; i < $tableTitle.length; i++) {
                        $tableTitle[i].style.background = "white";
                        $tableContent[i].style.display = "none";
                    }
                    this.style.background = "#f1ab00";
                    $tableContent[this.index].style.display = "block";
                }
            }
        },
        //未选中情况下表格以及表格标题的清空；
        _clearTable: function () {
            var $tableTitleId = dojo.byId(this.tableTitleId + 0);
            var $tableContentId = dojo.byId(this.tableContentId + 0);
            $tableTitleId.style.display = "inline";
            $tableTitleId.style.borderRight = "";
            $tableTitleId.style.borderBottom = "";
            $tableTitleId.innerHTML = "";
            $tableContentId.innerHTML = "";
        },
        //首次请求数据
        //添加发送按钮事件
        sendMessege: function (result) {
            var tableId = dojo.byId(this.tableContentId + 0)
            if (tableId.innerHTML != undefined && tableId.innerHTML != null) {
                var w_cons = tableId.getElementsByTagName("table")[0]
                var $checkbox = w_cons.getElementsByTagName("input");
                on(trackSend, "click", lang.hitch(this, function (evt) {
                    if (dojo.byId(app).checked || dojo.byId(tel).checked) {
                        if (this.tel.length > 0) {
                            if (dojo.byId(sendContent).value != "" && dojo.byId(taskTittle).value != "") {
                                if (dojo.byId(app).checked) {
                                    this._trackSearchApp()
                                }
                                if (dojo.byId(tel).checked) {
                                    this._trackSearchTel()
                                }
                            } else {
                                alert("请正确填写标题与内容")
                            }
                        } else {
                            alert("请选择巡查员")
                        }

                    } else {
                        alert("请选择发送形式")
                    }
                }));
            }
        },
        oneSend: function () {

        },
        addAllParme: function () {
            var $id = ConductorTable0.getElementsByTagName("table")[0]
            var $input = $id.getElementsByTagName("input");
            //var $telE = dojo.query($id + ".a2");
            var $telE = $id.getElementsByClassName("a2")
            var that = this;
            for (var j = 1; j < $telE.length; j++) {
                if (that.tel.indexOf($telE[j].innerHTML) != -1) {
                    $input[j - 1].checked = true;
                }
            }

            for (var i = 0; i < $input.length; i++) {
                $input[i].index = i;
                $input[i].onchange = function () {
                    if (this.checked) {
                        that.tel.push(that.pageData[this.index].contactNumber)
                        that.userId.push(that.pageData[this.index].userId)
                    } else {
                        var indexTel = that.tel.indexOf(that.pageData[this.index].contactNumber)
                        var indexUserId = that.userId.indexOf(that.pageData[this.index].userId)
                        if (indexTel != -1) {
                            that.tel.splice(indexTel, 1)
                        }
                        if (indexUserId != -1) {
                            that.userId.splice(indexUserId, 1)
                        }
                    }
                }
            }
            this.linkMap()
        },
        //表格与地图联动效果；
        linkMap: function () {
            var $id = ConductorTable0.getElementsByTagName("table")[0]
            var $input = $id.getElementsByTagName("input");
            var w_cons = $id.getElementsByTagName("tr")
            var that = this
            for (var i = 1; i <= $input.length; i++) {
                //that.pageData[this.index]
                w_cons[i].index = i;
                w_cons[i].onclick = function () {
                    var extent = new Extent(parseFloat(that.pageData[this.index - 1].Longitude) - 0.03, parseFloat(that.pageData[this.index - 1].Latitude) - 0.03
              , parseFloat(that.pageData[this.index - 1].Longitude) + 0.03, parseFloat(that.pageData[this.index - 1].Latitude) + 0.03, that.map.spatialReference);
                    that.map.setExtent(extent)
                }
            }
        },
        //实现任务的发送

        _trackSearchApp: function (dt) {
            var dpartdata = eval("(" + sessionStorage.getItem('dat') + ")");
            xhr.post(this._projectName + "/widgets/handler/Conductor.ashx", {
                handleAs: "text",
                timeout: 100000,
                data: {
                    methodName: "SendContentCode",
                    userId: this.userId,
                    title: dojo.byId(taskTittle).value,
                    content: dojo.byId(sendContent).value,
                    senderId: dpartdata.userId
                }
            }).then(function (data) {
                var data = eval("(" + data + ")")
                if (data.msg == "Ok") {
                    alert("发送成功")
                } else {
                    alert("发送失败")
                }
            }, lang.hitch(this, function (error) {
                alert("发送失败")
            }));
        },
        _trackSearchTel: function (dt) {
            var dpartdata = eval("(" + sessionStorage.getItem('dat') + ")");
            xhr.post(this._projectName + "/widgets/handler/Conductor.ashx", {
                handleAs: "text",
                timeout: 100000,
                data: {
                    methodName: "SendSMSContentCode",
                    tel: this.tel,
                    title: dojo.byId(taskTittle).value,
                    content: dojo.byId(sendContent).value,
                    senderId: dpartdata.userId
                }
            }).then(function (data) {
                var data = eval("(" + data + ")")
                if (data.msg == "Ok") {
                    alert("发送成功")
                } else {
                    alert("发送失败")
                }
            }, lang.hitch(this, function (error) {
                alert("发送失败")
            }));
        },
        //事件监听
        _initEvent: function () {
            topic.subscribe(this.domNode.id + "isActive", lang.hitch(this, "onIsActive"));
            on(this.checkBox, "change", lang.hitch(this, function (evt) {
                if (this.checkBox.checked) {
                    domStyle.set(this.conductorSelectContentNode, "display", "block");
                    domStyle.set(this.conductorToolPaneNode, "display", "inline-block");
                    on(this.btnNode, "click", lang.hitch(this, function () {

                        //每次搜素之后清空上次选择后存错的人员信息
                        var that = this;
                        if (that.tel != undefined && that.tel.length > 0) {
                            that.tel = [];
                        }
                        if (that.userId != undefined && that.userId.length > 0) {
                            that.userId = [];
                        }
                        this.getAllDate();
                    }));
                } else {
                    domStyle.set(this.conductorSelectContentNode, "display", "none");
                    domStyle.set(this.conductorToolPaneNode, "display", "none");
                    on(this.btnNode, "click", null);
                    this._clearTable();
                    this.map.graphics.clear();
                    this._closeCurrentDrawTool();
                    this._conductorToolLayers.clear();
                }
            }));
            on(this.newDraw, "draw-end", lang.hitch(this, function (evt) {
                this.map.graphics.clear();
                this._addToMap(evt);
            }));
            domStyle.set(this.conductorToolPaneNode, "display", "none");

            on(this._drawRectangleSwitching, "opended", lang.hitch(this, function (isOpened) {
                if (isOpened) {
                    this.isActive = true;
                    topic.publish(this.domNode.id + "isActive", "onIsActive", this.isActive);
                    this._activateDrawTool(conductorTool.RECTANGLE);
                }
                else {
                    this._clearTable();
                    if (typeof (this._conductorToolLayers) != "undefined" || this._conductorToolLayers != null)
                    { this._conductorToolLayers.clear(); }
                    this.defaultDataShow();
                    this.isActive = false;
                    topic.publish(this.domNode.id + "isActive", "onIsActive", this.isActive);
                    this.map.graphics.clear();
                    this.newDraw.deactivate();
                    this._currentDrawTool = null;
                }
            }));
            on(this._drawPolygonSwitching, "opended", lang.hitch(this, function (isOpened) {
                if (isOpened) {
                    this.isActive = true;
                    topic.publish(this.domNode.id + "isActive", "onIsActive", this.isActive);
                    this._activateDrawTool(conductorTool.POLYGON);
                }
                else {
                    this._clearTable()
                    this._conductorToolLayers.clear()
                    this.defaultDataShow()
                    this.isActive = false;
                    topic.publish(this.domNode.id + "isActive", "onIsActive", this.isActive);
                    this.map.graphics.clear();
                    this.newDraw.deactivate();
                    this._currentDrawTool = null;
                }
            }));
            on(this._drawCircleSwitching, "opended", lang.hitch(this, function (isOpened) {
                if (isOpened) {
                    this.isActive = true;
                    topic.publish(this.domNode.id + "isActive", "onIsActive", this.isActive);
                    this._activateDrawTool(conductorTool.CIRCLE);
                }
                else {
                    this._clearTable()
                    this._conductorToolLayers.clear()
                    this.defaultDataShow()
                    this.isActive = false;
                    topic.publish(this.domNode.id + "isActive", "onIsActive", this.isActive);
                    this.map.graphics.clear();
                    this.newDraw.deactivate();
                    this._currentDrawTool = null;
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
    return conductorTool;
});