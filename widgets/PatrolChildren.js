/**
 * Created by Administrator on 2015/9/29.
 */
define([
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/data/ItemFileWriteStore",
    "dojo/dom",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/request/xhr",
    "dojo/topic",
    "dojo/on",
    "dojo/text!./templates/PatrolChildren.html",
    "dijit/form/Button",
    "dijit/form/CheckBox",
    "dijit/popup",
    "dijit/TooltipDialog",
    "dojox/charting/Chart",
    "dojox/charting/themes/Dollar",
    "dojox/grid/DataGrid",
    "dijit/layout/ContentPane",
    "dojox/layout/FloatingPane",
    "dojox/layout/Dock",
    "widgets/_Widget",
    "widgets/WCtrlInfo",
    "esri/Color",
    "esri/graphic",
    "esri/InfoTemplate",
    "esri/dijit/Popup",
    "esri/dijit/PopupTemplate",
    "esri/geometry/Point",
    "esri/SpatialReference",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/PictureMarkerSymbol",
    "widgets/TitlePartPane",
    "widgets/themes/JS/My97DatePicker/WdatePicker",
    "esri/toolbars/draw",
    "esri/geometry/Polyline",
    "dojo/dom-style",
    "esri/geometry/Extent",
], function (
    array,
    declare,
    lang,
    ItemFileWriteStore,
    dom,
    domClass,
    domConstruct,
    xhr,
    topic,
    on,
    template,
    Button,
    CheckBox,
    popup,
    TooltipDialog,
    Chart,
    theme,
    DataGrid,
    ContentPane,
    FloatingPane,
    Dock,
    _Widget,
    WCtrlInfo,
    Color,
    Graphic,
    InfoTemplate,
    Popup,
    PopupTemplate,
    Point,
    SpatialReference,
    SimpleFillSymbol,
    SimpleLineSymbol,
    SimpleMarkerSymbol,
    PictureMarkerSymbol,
    TitlePartPane,
    WdatePicker,
    Draw,
    Polyline,
    domStyle,
    Extent
) {
    var t = declare("widgets.PatrolChildren", _Widget, {
        map: null,
        templateString: template,
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
                if ("that" in para) {
                    this.that = para.that;
                }
               
            }
        },
        postMixInProperties: function () {
            this.inherited(arguments);
            var pathName = window.document.location.pathname;
            this._projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);
        },
        buildRendering: function () {
            this.inherited(arguments);
        },
        postCreate: function () {
            /// <summary>
            /// 小部件的DOM准备好后并被插入到页面后调用该方法，保存图层信息
            /// </summary>
            this.inherited(arguments);
            this.checkBox = new CheckBox({
                checked: false
            }, this.checkBoxNode);
            this._toolTipDialog = new TooltipDialog({
                onOpen: lang.hitch(this, function () {
                    this._textContent.resize();
                    topic.publish(this.domNode.id + "open", this._mapPoint, this._toolTipDialog);
                }),
                onClose: lang.hitch(this, function () {
                    topic.publish(this.domNode.id + "close", this._toolTipDialog);
                })
            });
            this._setEvent();
            this._setGrid();
        },
        startup: function () {
            //this.inherited(arguments);
            //this._textContent.startup();
            //this._setLayerVisible();
        },
        select: function (evt) {
            this.checkBox.set("checked", !this.checkBox.checked);
        },
        onClick: function (popupPoint, toolTipDialog) {

        },
        onClose: function (popupPoint, toolTipDialog) {

        },
        onOpen: function (tooltipDialog) {

        },
        _setMapAttr: function (map) {
            if (map) {
                this.map = map;
            }
        },
        _getMapAttr: function () {
            return this.map;
        },
        _setEvent: function () {
            topic.subscribe(this.domNode.id + "click", lang.hitch(this, "onClick"));
            topic.subscribe(this.domNode.id + "close", lang.hitch(this, "onClose"));
            topic.subscribe(this.domNode.id + "open", lang.hitch(this, "onOpen"));
            on(this.checkBox, "change", lang.hitch(this, function (evt) {
                this._setLayerVisible();
                if (this.checkBox.checked) {
                    //this.that.selectContentNode.set("style","display:block")
                    domStyle.set(this.that.selectContentNode, "display", "block");
                    var that = this;
                    on(this.that.btnNode, "click", lang.hitch(this, function() {
                        this.getAllDate();
                    }));
                } else if (this._patrolChildrenLayer != undefined) {
                    // 清除图中的元素                      
                    //this._patrolChildrenLayer.clear();
                    //this.that.selectContentNode.set("style", "display:none")
                    domStyle.set(this.that.selectContentNode, "display", "none");
                    //this.that._partSelect.value = "";
                    //this.that._typeSelect.value = "";
                    popup.close();
                    this._clearTable();
                    this._patrolChildrenLayer.clear();
                    this._patrolMoveLayer.clear();
                    this._patrolLineLayer.clear();
                    if (this.time != undefined) {
                        var time = this.time;
                        clearInterval(time);
                    }
                } else {
                    domStyle.set(this.that.selectContentNode, "display", "none");
                    this.that._partSelect.value = "";
                    this.that._typeSelect.value = "";
                }
            }));
        },
        _setGrid: function () {
            this._titlePartPane = new TitlePartPane({
                style: "background-color:#0899ff;color:white;line-height:24px;",
                onClose: lang.hitch(this, function () {
                    popup.close();
                })
            });

            this._textContent = new ContentPane({
                style: "width:205px;height:auto;padding:5px 10px;margin:0;overflow: hidden;line-height:20px;font-size:12px;"
            });
            this._toolTipDialog.addChild(this._titlePartPane);
            this._toolTipDialog.addChild(this._textContent);
        },
        
        //请求数据前的参数配置；
        getAllDate: function () {
            var name = [];
            var lengthName = this.that._typeSelect.value.length;
            if (lengthName === 0) {
                name.push("all");
            } else {
                if (this.that._typeSelect.value.indexOf("all") > -1) {
                    name.push("all");
                } else {
                    for (var i = 0; i < lengthName; i++) {
                        name.push(this.that._typeSelect.value[i]);
                    }
                }
            }
           
            var partment = [];
            var lengthPart = this.that._partSelect.value.length;
            if (lengthPart === 0) {
                partment.push("all");
            } else {
                if (this.that._partSelect.value.indexOf("all") > -1) {
                    partment.push("all");
                } else {
                    for (var i = 0; i < lengthPart; i++) {
                        partment.push(this.that._partSelect.value[i]);
                    }
                }
            }
           
            var personName = $("#txtNameConductor2").val();
            var gridName = $("#txtGridNameConductor2").val();
            if (partment != undefined && partment != null && partment != "" && name != undefined && name != null && name != "") {
                this._getData(partment, name, personName, gridName);
            }
        },
        //加载数据
        _getData: function (partment, type, personName, gridName) {
            this._patrolMoveLayer.clear();
            this._patrolLineLayer.clear();
            if (this.time != undefined) {
                var time = this.time;
                clearInterval(time);
            }
            xhr.post(this._projectName + "/widgets/handler/Patrol.ashx", {
                handleAs: "text",
                timeout: 10000,
                data: {
                    methodName: "GetAllPatrolAreas",
                    type: type,
                    partment: partment,
                    personName: personName,
                    gridName: gridName
                }
            }).then(lang.hitch(this, function (data) {
                var dataJson = eval("(" + data + ")");
                if (dataJson.status) {
                    this._cutData(dataJson.data);
                    this._addpointAll(dataJson.data);
                    this._setLayer(dataJson.data);
                } else {
                    popup.close();
                    this._clearTable();
                    this._patrolChildrenLayer.clear();
                    this._patrolMoveLayer.clear();
                    this._patrolLineLayer.clear();
                }
            }), lang.hitch(this, function (error) {
                console.log("获取所有微监控点时返回错误：" + error);
            }));
        },
        //数据排序完毕执行分页插件自动生成列表；
        _cutData: function (data) {
            this.TabHost();
            //数据自动加载，以及分页的实现；注意数据格式为：[{},{},{},{}]
            (function(that, popup, tableContentId) {
                var ne = new page();
                ne.pageContentElement = "table"; //用哪种 标签进行数据的展示，可以用table与tr+td;或者是ul+li+span;只需要填入table或者ul既可；
                ne.cut_page_id = tableContentId; //整体容器的最外层id
                ne.data = data; //数据；注：数据格式为[{},{},{}];外层为数组，每个数组内的元素为对象的格式；
                ne.pageContentLength = 10; //每页展示数据的长度或个数；
                ne.orderKey = ["userName", "contactNumber", "status", "threeGridName"]; //表格展示的属性名的顺序
                ne.orderKeyName = ["姓名", "联系方式", "状态", "所属网格"] //表格头部的属性名一次的名称与orderKey对应起来；
                ne.addDom({
                    that: that,
                    popup: popup
                });//调用主方法；
                ne.addOrRemove("set", "border", 0); //第一个属性为remove和set，第二属性为标签的属性名，第三个属性为属性值；
            })(this, popup, this.tableContentId + 0);
        },
        //首次数据加载为图中坐标点添加事件与数据；
        _setLayer: function (data) {
            this._patrolChildrenLayer = this.map.getLayer("patrolChildren");
            this._patrolChildrenLayer.on("click", lang.hitch(this, function(evt) {
                var dt = evt.graphic.attributes;
                this._mapPoint = evt.mapPoint;
                this._titlePartPane.labelNode.innerHTML = dt.userName;
                WdatePicker.dateFmt = "yyyy年MM月dd日 HH时mm分ss秒";
                var sp = "<div><ul><li><b>网格名称：</b>" + dt.threeGridName + "</li><li><b>编&nbsp;&nbsp;号：</b>" + dt.GridCode + "</li><li><b>联系方式：</b>" + dt.contactNumber + "</li><li><b>定位时间：</b>" + dt.STAMP + "</li><li style='margin-top:5px;'><b>查询日期：</b><input name='patrolDates' type='text' class='Wdate' id='d241' onFocus='WdatePicker({dateFmt:\"yyyy-MM-dd\"})' style='width:140px'/></li><li style='margin-top:5px;'><b>开始时间：</b><input name='patrolStarts' type='text' class='Wdate' id='d241' value='00:00:00' onFocus='WdatePicker({dateFmt:\"H:mm:ss\"})' style='width:140px'/></li><li style='margin-top:5px;'><b>结束时间：</b><input name='patrolEnds' type='text' value='23:59:00' class='Wdate' id='d242' onFocus='WdatePicker({dateFmt:\"H:mm:ss\"})' style='width:140px'/></li><li><button style='width:100px;height:30px;border-radius:5px;background-color:#0899ff;color:white;line-height:30px;text-align:center;margin:5px 0px 0px 52px;' id='trackSearch'>查询轨迹</button></li></ul></div>"
                this._textContent.set("content", sp);
                topic.publish(this.domNode.id + "click", this._mapPoint, this._toolTipDialog);
                var $patrolDateDefault = document.getElementsByName('patrolDates')[0];
                $patrolDateDefault.value = new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate();
                var extent = new Extent(parseFloat(evt.graphic.attributes.Longitude) - 0.03, parseFloat(evt.graphic.attributes.Latitude) - 0.03, parseFloat(evt.graphic.attributes.Longitude) + 0.03, parseFloat(evt.graphic.attributes.Latitude) + 0.03, this.map.spatialReference);
                this.map.setExtent(extent);
                var that = this;
                dom.byId(trackSearch).onclick = function() {
                    var $patrolDate = document.getElementsByName('patrolDates')[0];
                    var $patrolStart = document.getElementsByName('patrolStarts')[0];
                    var $patrolEnd = document.getElementsByName('patrolEnds')[0];
                    that._trackSearch(dt, $patrolDate, $patrolStart, $patrolEnd);
                    topic.publish("widgets_TitlePartPane_13close", true);
                }
            }));
        },
        //添加到坐标点到图中；
        _addpointAll: function (controls) {
            this._patrolChildrenLayer = this.map.getLayer("patrolChildren");
            this._patrolChildrenLayer.clear();
            var length = controls.length;
            if (length > 0) {
                var spatialReference = this.map.spatialReference;
                for (var i = 0; i < length; i++) {
                    
                    var pt = new Point(controls[i].Longitude, controls[i].Latitude, spatialReference);
                    switch (controls[i].status) {
                        case "在线": {
                            var symbol = new PictureMarkerSymbol({
                                "url": this._projectName + "/widgets/assets/images/xuncha1.png",
                                "height": 15,
                                "width": 15,
                                "type": "esriPMS"
                            });
                        } break;
                        case "历史签到": {
                            var symbol = new PictureMarkerSymbol({
                                "url": this._projectName + "/widgets/assets/images/patrolL.png",
                                "height": 15,
                                "width": 15,
                                "type": "esriPMS"
                            });
                        } break;
                        case "未签到": {
                            var symbol = new PictureMarkerSymbol({
                                "url": this._projectName + "/widgets/assets/images/patrolW.png",
                                "height": 15,
                                "width": 15,
                                "type": "esriPMS"
                            });
                        } break;
                    }
                    
                    var graphic = new Graphic(pt, symbol, controls[i]);
                    this._patrolChildrenLayer.add(graphic);
                }
            }
        },
        //分页数据添加到坐标点到图中；
        _addpoint: function () {
            //预留
        },
        //添加表格与图中坐标点数据展示联动
        _pointadd: function (result) {
            this._tableshow();
            var that = this;
            var tableId = dojo.byId(this.tableContentId + 0);
            if (tableId.innerHTML != undefined && tableId.innerHTML != null) {
                var w_cons = tableId.getElementsByTagName("tr");
                var that = this;
                for (var i = 1; i < w_cons.length; i++) {
                    w_cons[i].index = i
                    w_cons[i].onclick = function () {
                        that._titlePartPane.labelNode.innerHTML = result[this.index - 1].userName;
                        //WdatePicker.dateFmt = "yyyy年MM月dd日 HH时mm分ss秒"
                        var sp = "<div><ul id='patrolsearchs'><li><b>所属网格：</b>" + result[this.index - 1].threeGridName + "</li><li><b>编&nbsp;&nbsp;号：</b>" + result[this.index - 1].GridCode + "</li><li><b>联系方式：</b>" + result[this.index - 1].contactNumber + "</li><li><b>定位时间：</b>" + result[this.index - 1].STAMP + "</li><li style='margin-top:5px;'><b>查询日期：</b><input name='patrolDate' type='text' class='Wdate' id='d241' onFocus='WdatePicker({dateFmt:\"yyyy-MM-dd\"})' style='width:140px'/></li><li style='margin-top:5px;'><b>开始时间：</b><input name='patrolStart' type='text' class='Wdate' id='d241' value='00:00:00' onFocus='WdatePicker({dateFmt:\"H:mm:ss\"})' style='width:140px'/></li><li style='margin-top:5px;'><b>结束时间：</b><input name='patrolEnd' type='text' class='Wdate' value='23:59:00' id='d242' onFocus='WdatePicker({dateFmt:\"H:mm:ss\"})' style='width:140px'/></li><li><button style='width:100px;height:30px;border-radius:5px;background-color:#0899ff;color:white;line-height:30px;text-align:center;margin:5px 0px 0px 52px;' id='trackSearch'>查询轨迹</button></li></ul></div>"
                        that._textContent.set("content", sp);
                        var there = this;
                        that._mapPoint = { type: "point", x: result[this.index - 1].Longitude, y: result[this.index - 1].Latitude };
                        topic.publish("widgets_PatrolChildren_0" + "click", that._mapPoint, that._toolTipDialog);
                        var $patrolEnd = document.getElementsByName('patrolEnd')[0];
                        var $patrolDateDefault = document.getElementsByName('patrolDate')[0];
                        $patrolDateDefault.value = new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate();
                        var extent = new Extent(parseFloat(result[this.index - 1].Longitude) - 0.03, parseFloat(result[this.index - 1].Latitude) - 0.03
               , parseFloat(result[this.index - 1].Longitude) + 0.03, parseFloat(result[this.index - 1].Latitude) + 0.03, that.map.spatialReference);
                        that.map.setExtent(extent);
                        //$patrolEnd.onFocus = WdatePicker({ skin: 'whyGreen', dateFmt: 'H:mm:ss' })
                        dom.byId(trackSearch).onclick = function () {
                            var $patrolDate = document.getElementsByName('patrolDate')[0];
                            var $patrolStart = document.getElementsByName('patrolStart')[0];
                            var $patrolEnd = document.getElementsByName('patrolEnd')[0];
                            that._trackSearch(result[there.index - 1], $patrolDate, $patrolStart, $patrolEnd);
                            topic.publish("widgets_TitlePartPane_13close", true);
                        }
                    }
                }
            }
        },
        //功能面板与表格面板的切换；
        TabHost: function () {
            var $tableTitleId = dojo.byId(this.tableTitleId + 0);//表格头部对应的标题
            this.tableTitleNode.style.display = "block";//表格头部
            $tableTitleId.style.display = "inline-block";
            $tableTitleId.innerHTML = "巡查员列表";
            this.dataTemplateContent.style.display = "none";//选项面板隐藏
            this.dataTemplateListNode.style.display = "block";//表格面板展示
            this.TabIconNode.style.backgroundImage = "url(" + this._projectName + "/widgets/assets/images/Tab.png" + ")";
            this.ListIconNode.style.backgroundImage = "url(" + this._projectName + "/widgets/assets/images/List1.png" + ")";
        },
        //表格模板中每个表格的切换与默认显示
        _tableshow: function () {
            var $tableTitle = dojo.query(".PatrolTableTitle");
            var $tableContent = dojo.query(".PatrolTable");
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
        _createGridStore: function (items) {
            var store = new ItemFileWriteStore({
                data: {
                    identifier: "ID",
                    items: items
                }
            });
            return store;
        },
        //加载巡查坐标并绘制到图中；
        _trackSearch: function (dt, $patrolDate, $patrolStart, $patrolEnd) {
            var startD = $patrolDate.value + $patrolStart.value;
            var endD = $patrolDate.value + $patrolEnd.value;
            this._patrolLineLayer.clear();
            this._patrolMoveLayer.clear();
            xhr.post(this._projectName + "/widgets/handler/Patrol.ashx", {
                handleAs: "text",
                timeout: 10000,
                data: {
                    methodName: "GetPatrolInfoByUserCode",
                    userId: dt.userId,
                    patrolDate:$patrolDate.value,
                    strDate: $patrolStart.value,
                    endDate: $patrolEnd.value
                }
            }).then(lang.hitch(this, function (data) {
                var datas = eval("(" + data + ")");
                if (this.time != undefined) {
                    var time = this.time;
                    clearInterval(time);
                }
                if (datas.status == true) {
                    this.makeLine(datas.data);
                } else {
                    alert("无轨迹");
                }
            }), lang.hitch(this, function (error) {
                console.log("获取所有微监控点时返回错误：" + error);
            }));
        },
        makeLine: function (data) {
            var arrChild = [], lineArr = [];
            lineChildArr = [];
            if (data.length < 1) {
                alert("无轨迹");
            } else {
                if (parseInt(data[0].LON) != 0) {
                    arrChild.push([data[0].LON, data[0].LAT]);
                    lineChildArr.push([data[0].LON, data[0].LAT]);
                }
                data.forEach(function(item, index) {
                    arrChild.push([item.LON, item.LAT]);
                    if (index > 0) {
                    }
                });
                //开始绘制；
                if (arrChild.length>=2) {
                     
                    //lineArr.forEach(lang.hitch(this, function (item) {
                    var polyline = new Polyline({
                        paths: [arrChild]
                    });
                    var lineSymbol = new SimpleLineSymbol({
                        color: [226, 119, 40],
                        width: 4
                    });
                    var graphic = new Graphic(polyline, lineSymbol);
                    this._patrolLineLayer.add(graphic);
                    this.map.setExtent(polyline.getExtent());
                    var startPoint = new Point(arrChild[0]);
                    var endPoint = new Point(arrChild[arrChild.length - 1]);
                    var startSymbol = new PictureMarkerSymbol(this._projectName + "/widgets/assets/images/start0.png", 20, 20);
                    var endSymbol = new PictureMarkerSymbol(this._projectName + "/widgets/assets/images/end0.png", 20, 20);
                    var startgraphic = new Graphic(startPoint, startSymbol);
                    var endgraphic = new Graphic(endPoint, endSymbol);
                    this._patrolLineLayer.add(startgraphic);
                    this._patrolLineLayer.add(endgraphic);
                    //}))
                    var num = 0;
                    var symbol = new PictureMarkerSymbol(this._projectName + "/widgets/assets/images/point.png", 15, 15);
                    var that = this;
                    this.time = setInterval(function() {
                        that._patrolMoveLayer.clear();
                        if (num == arrChild.length - 1) {
                            num = 0;
                        }
                        var point = new Point(arrChild[num]);
                        var graphics = new Graphic(point, symbol);
                        that._patrolMoveLayer.add(graphics);
                        num++;
                    }, 200);
                } else {
                    alert("无轨迹");
                }
               
            }
        },
        _setLayerVisible: function () {
            var layer = this.map.getLayer("patrolChildren");
            layer.setVisibility(this.checkBox.checked);
            this._patrolMoveLayer = this.map.getLayer("patrolMove");
            this._patrolMoveLayer.setVisibility(this.checkBox.checked);
            this._patrolLineLayer = this.map.getLayer("patrolLine");
            this._patrolLineLayer.setVisibility(this.checkBox.checked);
        }
    });
    return t;
});