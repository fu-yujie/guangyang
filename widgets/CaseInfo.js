/**
 * Created by Administrator on 2015/10/30.
 */
define([
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/data/ItemFileWriteStore",
    "dojo/date/stamp",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dojo/dom",
    "dojo/request/xhr",
    "dojo/store/Memory",
    "dojo/topic",
    "dojo/on",
    "dijit/Dialog",
    "dijit/popup",
    "esri/geometry/Extent",
    "dojo/text!./templates/CaseInfo.html",
    "dijit/TooltipDialog",
    "dijit/form/Button",
    "dijit/form/CheckBox",
    "dijit/form/Select",
    "dijit/layout/ContentPane",
    "dijit/layout/LayoutContainer",
    "dijit/form/ComboButton",
    "dojox/form/CheckedMultiSelect",
    "dojox/form/DateTextBox",
    "dojox/form/TimeSpinner",
    "esri/Color",
    "esri/geometry/Point",
    "esri/graphic",
    "esri/symbols/PictureMarkerSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    "widgets/_Widget",
    "widgets/themes/JS/My97DatePicker/WdatePicker",
    "widgets/themes/JS/cutPage",
    "widgets/TitlePartPane"
], function (
    array,
    declare,
    lang,
    ItemFileWriteStore,
    stamp,
    domConstruct,
    domStyle,
    dom,
    xhr,
    Memory,
    topic,
    on,
    Dialog,
    popup,
    Extent,
    template,
    TooltipDialog,
    Button,
    CheckBox,
    Select,
    ContentPane,
    LayoutContainer,
    ComboButton,
    CheckedMultiSelect,
    DateTextBox,
    TimeSpinner,
    Color,
    Point,
    Graphic,
    PictureMarkerSymbol,
    SimpleMarkerSymbol,
    _Widget,
    WdatePicker,
    cutPage,
    TitlePartPane
) {
    var event = declare("widgets.CaseInfo", _Widget, {
        templateString: template,
        map: null,
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
                checked: false,
                onChange: lang.hitch(this, function (check) {
                    if (!check) {
                        this.map.getLayer("caseInfo").clear();
                    }
                })
            }, this.checkBoxNode);
            this._toolTipDialog = new TooltipDialog({
                style: "overflow:hidden;",
                onOpen: lang.hitch(this, function () {
                    topic.publish(this.domNode.id + "open", this._mapPoint, this._toolTipDialog);
                }),
                onClose: lang.hitch(this, function () {
                    topic.publish(this.domNode.id + "close", this._toolTipDialog);
                })
            });
            this._setGrid();
            this._setEvent();
        },
        startup: function () {
            this.inherited(arguments);
            this._setLayerVisible();
            //this._typeSelect.startup();
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
            this._setCaseDialog();
            on(this.checkBox, "change", lang.hitch(this, function (evt) {
                this._setLayerVisible();
                var startVal = document.getElementsByName("caseInfoStart")[0];
                var endVal = document.getElementsByName("caseInfoEnd")[0];
                if (this.checkBox.checked) {
                    this._loadCaseInfoData();
                    domStyle.set(this.caseInfoOptionsNode, "display", "block");
                    var date = new Date();
                    startVal.value = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + "  " + "00:00:00";
                    endVal.value = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + "  " + "23:59:00";
                } else {
                    // 清除图中的元素
                    domStyle.set(this.caseInfoOptionsNode, "display", "none");
                    //this._caseInfolayer.clear();

                    startVal.value = "";
                    endVal.value = "";
                    popup.close();

                }
            }));
        },
        _setGrid: function () {
            this._titlePartPane = new TitlePartPane({
                style: "background-color:lightskyblue",
                onClose: lang.hitch(this, function () {
                    popup.close();
                    //this.clearTime()
                })
            });
            this._contentPane = new ContentPane({
                style: "width:auto;padding:0;margin:0;overflow: hidden;"
            });
            this._toolTipDialog.addChild(this._titlePartPane);
            this._toolTipDialog.addChild(this._contentPane);
        },
        //筛选模板
        _setCaseDialog: function () {
            this._options = "";//重置提交的数据
            this._caseDialog = new LayoutContainer({
                style: "display:none;width:300px;padding:0;margin: 0px auto;" +
                "background-color:#ffffff;font-size: 11px;font-family: 'Microsoft YaHei';"
            }, this.caseInfoOptionsNode);
            ////创建标题栏对象
            //var caseInfoTitleNode = domConstruct.create("div",{
            //    style:"padding:0px;height:26px;font-size:15px;font-family: 'Microsoft YaHei';background-color:lightskyblue;"
            //});
            //var caseInfoTitleLabelNode = domConstruct.create("div",{
            //    innerHTML: "查询选项",
            //    style: "margin-left:6px;color:white;"
            //});
            //caseInfoTitleNode.appendChild(caseInfoTitleLabelNode);

            //创建行对象 案件状态
            var rowNode1 = domConstruct.create("div", {
                style: "padding:4px;height:26px;font-size: 14px;font-family: 'Microsoft YaHei';"
            });
            var labNode1 = domConstruct.create("label", {
                innerHTML: "案件状态：",
                style: "margin-left:6px;"
            });
            this._statusSelect = new Select({
                store: new Memory({
                    data: []
                }),
                labelAttr: "name",
                style: "width:205px"
            });
            rowNode1.appendChild(labNode1);
            rowNode1.appendChild(this._statusSelect.domNode);
            this.newDate = new Date();
            //创建行对象 起始时间
            var rowNode2 = domConstruct.create("div", {
                style: "padding:4px;height:26px;font-size: 14px;font-family: 'Microsoft YaHei';"
            });
            var labNode2 = domConstruct.create("label", {
                innerHTML: "起始时间：",
                style: "margin-left:6px;"
            });
            rowNode2.appendChild(labNode2);
            rowNode2.innerHTML += "<input name='caseInfoStart' type='text' class='Wdate' id='d241' onFocus='WdatePicker()' style='width:204px;text-align:center;'/>"

            //创建行对象 结束时间
            var rowNode3 = domConstruct.create("div", {
                style: "padding:4px;height:26px;font-size: 14px;font-family: 'Microsoft YaHei';"
            });
            var labNode3 = domConstruct.create("label", {
                innerHTML: "截止时间：",
                style: "margin-left:6px;"
            });
            rowNode3.appendChild(labNode3);
            rowNode3.innerHTML += "<input name='caseInfoEnd' type='text' class='Wdate' id='d241' onFocus='WdatePicker()' style='width:204px;text-align:center;'/>"

            //创建行对象 案件类型
            var rowNode4 = domConstruct.create("div", {
                class: "caseType",
                style: "padding:4px;font-size: 14px;font-family: 'Microsoft YaHei';"
            });
            var labNode4 = domConstruct.create("label", {
                innerHTML: "案件类型：",
                style: "margin-left:6px;"
            });
            var $div = document.createElement("div")
            rowNode4.appendChild(labNode4);
            //rowNode4.appendChild($div);
            this._typeSelect = new CheckedMultiSelect({
                multiple: true,
                dropDown: true,
            });
            this._typeSelect.startup()//对于CheckedMultiSelect创建后必须用startup方法来启动
            rowNode4.appendChild(this._typeSelect.domNode);
            var btnCancel = new Button({
                label: "取 消",
                style: "float:right;margin-right:70px;font-size: 14px;font-family: 'Microsoft YaHei';",
                onClick: lang.hitch(this, function () {
                    //this._caseDialog.destroyRecursive();
                    domStyle.set(this.caseInfoOptionsNode, "display", "none");
                    this.checkBox.set("checked", false);
                })
            });
            var btnConfirm = new Button({
                label: "查 询",
                disabled: false,
                style: "float:left;margin-left:70px;font-size: 14px;font-family: 'Microsoft YaHei';",
                onClick: lang.hitch(this, function () {
                    if (this._statusSelect.value != "all") {
                        this._options += " and t_Status.Code='" + this._statusSelect.value + "'";
                    }

                    if (this._typeSelect.value == "all") {
                        
                    } else {
                        var length = this._typeSelect.value.length;
                        if (length == 0) { }
                        else if (length == 1) {
                            this._options += " and t_EventType.Code='" + this._typeSelect.value[0] + "'";
                        }
                        else {
                            this._options += " and t_EventType.Code='" + this._typeSelect.value[0] + "'";
                            for (var i = 1; i < length; i++) {
                                this._options += " or t_EventType.Code='" + this._typeSelect.value[i] + "'";
                            }
                        }
                    }
                   
                    //date97插件的更换；
                    var startVal = document.getElementsByName("caseInfoStart")[0];
                    var endVal = document.getElementsByName("caseInfoEnd")[0];
                    this.startVal = startVal;
                    this.endVal = endVal;
                    if ((startVal.value != "" && startVal.value != undefined)) {
                        this._options += " and RecordingTime >= '" + startVal.value + "'";

                    } else {
                        alert("时间填写格式不正确，请检查！");
                    }
                    if ((endVal.value != "" && endVal.value != undefined)) {
                        this._options += " and RecordingTime <= '" + endVal.value + "'";
                    } else {
                        alert("时间填写格式不正确，请检查！");
                    }
                    this._addGraphics(this._options);
                    this._options = "";
                })
            });
            //this._caseDialog.domNode.appendChild(caseInfoTitleNode);
            this._caseDialog.domNode.appendChild(rowNode1);
            this._caseDialog.domNode.appendChild(rowNode2);
            this._caseDialog.domNode.appendChild(rowNode3);
            this._caseDialog.domNode.appendChild(rowNode4);
            this._caseDialog.domNode.appendChild(btnConfirm.domNode);
            this._caseDialog.domNode.appendChild(btnCancel.domNode);
            var $caseInfoStart = document.getElementsByName('caseInfoStart')[0];
            var date = new Date()
            $caseInfoStart.value = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + "  " + "00:00:00";
            var $caseInfoEnd = document.getElementsByName('caseInfoEnd')[0];
            $caseInfoEnd.value = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + "  " + "23:59:00";
        },
        //加载案件状态与案件类型的格式化数据
        _loadCaseInfoData: function () {
            xhr.post(this._projectName + "/widgets/handler/caseInfo.ashx", {
                handleAs: "text",
                timeout: 10000,
                data: {
                    methodName: "GetCaseType"
                }
            }).then(lang.hitch(this, function (data) {
                var typeData = eval("(" + data + ")");
                this._checkedStore = new ItemFileWriteStore({
                    data: {
                        identifier: "id",
                        label: "label",                          //此处不能用name，只能用label
                        items: typeData
                    }
                });
                this._typeSelect.set("store", this._checkedStore);
            }), lang.hitch(this, function (error) {
            }));
            xhr.post(this._projectName + "/widgets/handler/caseInfo.ashx", {
                handleAs: "text",
                timeout: 10000,
                data: {
                    methodName: "GetCaseStatus"
                }
            }).then(lang.hitch(this, function (status) {
                var statusData = eval("(" + status + ")");
                this._statusSelect.set("store", new Memory({ data: statusData }));
            }), lang.hitch(this, function (error) {
            }));
        },
        _addGraphics: function (options) {
            this._caseInfolayer = this.map.getLayer("caseInfo");
            this._caseInfolayer.clear();
            xhr.post(this._projectName + "/widgets/handler/caseInfo.ashx", {
                handleAs: "text",
                timeout: 10000,
                data: {
                    methodName: "GetAllCaseAreas",
                    where: options
                }
            }).then(lang.hitch(this, function (data) {
                var dataJson = eval("(" + data + ")");
                function order(a, b) {
                    return parseInt(b.EventId.substr(3, 8)) - parseInt(a.EventId.substr(3, 8));
                }
                dataJson.sort(order)
                this._cutData(dataJson)
                this._setLayer(dataJson);
                this._addpoint(dataJson)
            }), lang.hitch(this, function (error) {
                console.log("获取所有满足条件的案件时出现错误：" + error);
            }));
        },
        //数据排序完毕执行分页插件自动生成列表；
        _cutData: function (data) {
            this.TabHost();
            //数据自动加载，以及分页的实现；注意数据格式为：[{},{},{},{}]
            (function (that, popup, tableContentId) {
                var ne = new page()
                ne.pageContentElement = "table";//用哪种 标签进行数据的展示，可以用table与tr+td;或者是ul+li+span;只需要填入table或者ul既可；
                ne.cut_page_id = tableContentId;//整体容器的最外层id
                ne.data = data;//数据；注：数据格式为[{},{},{}];外层为数组，每个数组内的元素为对象的格式；
                ne.pageContentLength = 10;//每页展示数据的长度或个数；
                //ne.orderKey = ["EventId", "EventTypeName", "Author", "Location"];//表格展示的属性名的顺序
                //ne.orderKeyName = ["编号", "类型", "联系人", "地址"]//表格头部的属性名一次的名称与orderKey对应起来；
                ne.orderKey = ["Author", "EventTypeName", "Location"];//表格展示的属性名的顺序
                ne.orderKeyName = ["联系人", "类型", "地址"]//表格头部的属性名一次的名称与orderKey对应起来；
                ne.addDom({
                    that: that,
                    popup: popup
                })//调用主方法；
                ne.addOrRemove("set", "border", 0)//第一个属性为remove和set，第二属性为标签的属性名，第三个属性为属性值；
            })(this, popup, this.tableContentId + 0)
        },

        //首次数据加载为图中坐标点添加事件与数据；
        _setLayer: function (data) {
            this._caseInfolayer.on("click", lang.hitch(this, function (evt) {
                this._mapPoint = evt.mapPoint;
                var nowdata = data[evt.graphic.attributes.eventId];
                topic.publish(this.domNode.id + "click", this._mapPoint, this._toolTipDialog);
                var caseContent = "<table border=1 style='text-align: center;border-collapse:collapse;padding:0;margin:0;font-size:12px;width:402px;'>" +
                                    "<tr><td style='width: 80px;height:20px;'>案件编号</td><td style='width: 100px;'>" + nowdata.EventId + "</td>" +
                                    "<td style='width: 100px;'>污染类型</td><td style='width: 100px;'>" + nowdata.EventTypeName + "</td></tr>" + "<tr><td style='width: 80px;height:20px;'>提交人</td><td style='width: 100px;'>" + nowdata.Author + "</td>" +
                                    "<td style='width: 100px;'>污染程度</td><td style='width: 100px;'>" + nowdata.LevelName + "</td></tr>" +
                                    "<tr><td style='height:20px;'>描述</td><td colspan='3'>" + nowdata.Description + "</td></tr>" +
                                    "<tr><td style='height:20px;'>位置</td><td colspan='3'>" + nowdata.Location + "</td></tr>"

                if (nowdata.OneOpinion != "") {
                    caseContent += "<tr><td>案发时间</td><td>" + nowdata.RecordingTime + "</td>" +
                                    "<td>一次处理意见</td><td>" + nowdata.OneOpinion + "</td></tr>"
                } else {
                    caseContent += "<tr><td>案发时间</td><td colspan='3'>" + nowdata.RecordingTime + "</td></tr>"
                }
                if (nowdata.TwoResult != "") {
                    caseContent += "<tr><td style='height:20px;'>一次处理时间</td><td colspan='3'>" + nowdata.OneTime + "</td></tr>" + "<tr><td style='height:20px;'>二次处理意见</td><td>" + nowdata.Remarks + "</td><td>二次处理时间</td><td>" + nowdata.TwoTime + "</td></tr>" + "<tr><td>处理结果</td><td>" + nowdata.TwoResult + "</td>" + "<td>处理状态</td><td>" + nowdata.StatusName + "<td/></tr>"

                } else {
                    caseContent += "<tr><td style='height:20px;'>一次处理时间</td><td>" + nowdata.OneTime + "</td>" + "<td>处理结果</td><td>" + nowdata.OneResult + "</td></tr>" + "<tr><td style='height:20px;'>处理状态</td><td>" + nowdata.StatusName + "</td>" + "<td></td><td>" + "</td></tr>"
                }
                var aqWidth = nowdata.aqUrl.length * 190;
                var ahWidth = nowdata.ahUrl.length * 190;
                caseContent += "<tr><td style='height:20px;' colspan = '2'>案前图片</td><td colspan = '2'>案后图片</td><tr>" + "<tr></table><div style='height:220px;width:400px;overflow:hidden;position: relative;'><div style='width:190px;height:190px;float:left;overflow:hidden;margin:5px 4px;border:1px solid black;' id='aqout' ><div class='swiper-container' style='height:190px;width:190px;' id='aqinner'><div class='swiper-wrapper'>"
                for (var i in nowdata.aqUrl) {
                    caseContent += "<div class='swiper-slide'><img src='" + nowdata.aqUrl[i].pic + "' style='width:190px;height:190px;float:left;'/></div>"
                }
                caseContent += "</div><div class='swiper-pagination'></div></div></div><div id='aqanniu' class='anniu' style='left: 60px;'>共有" + nowdata.aqUrl.length + "张</div>"
                caseContent += "<div style='width:190px;height:190px;float:left;overflow:hidden;margin:5px 0px 5px 7px;border:1px solid black' id='ahout' ><div class='swiper-container' style='height:190px;width:190px;' id='ahinner'><div class='swiper-wrapper'>"

                for (var i in nowdata.ahUrl) {
                    caseContent += "<div class='swiper-slide'><img src='" + nowdata.ahUrl[i].pic + "' style='width:190px;height:190px;float:left;'/></div>"
                }
                caseContent += "</div><div class='swiper-pagination'></div></div></div><div id='ahanniu' class='anniu' style='left: 275px;'>共有" + nowdata.ahUrl.length + "张</div>"
                //this.aqtime1, this.aqtime2, this.ahtime1, this.ahtime2
                this._contentPane.set("content", caseContent);
                //轮播图的实现
                if (nowdata.aqUrl.length > 1) {
                    var mySwiper = new Swiper('.swiper-container', {
                        autoplay: 3000,
                        loop: true,
                        // 如果需要分页器
                        pagination: '.swiper-pagination',
                        paginationClickable: true,
                        autoplayDisableOnInteraction: false
                    });
                }
                var extent = new Extent(parseFloat(nowdata.Longitude) - 0.03, parseFloat(nowdata.Latitude) - 0.03
                 , parseFloat(nowdata.Longitude) + 0.03, parseFloat(nowdata.Latitude) + 0.03, this.map.spatialReference);
                this.map.setExtent(extent)
            }));
        },
        //添加到坐标点到图中；
        _addpoint: function (data) {
            this._caseInfolayer = this.map.getLayer("caseInfo");
            this._caseInfolayer.clear();
            for (var event = data.length - 1; event >= 0; event--) {
                var point = new Point(data[event].Longitude, data[event].Latitude, this.map.spatialReference);
                var symbol = new PictureMarkerSymbol(this._projectName + "/widgets/assets/images/event_map.png", 20, 20);
                var attr = { "eventId": event };
                var graphic = new Graphic(point, symbol, attr, null);
                this._caseInfolayer.add(graphic);
            }
        },
        //添加表格与图中坐标点数据展示联动
        _pointadd: function (controls) {
            this._tableshow()
            var tableId = dojo.byId(this.tableContentId + 0)
            var that = this;
            var selfDomNode = this.domNode.id
            if (tableId.innerHTML != undefined && tableId.innerHTML != null) {
                var w_cons = tableId.getElementsByTagName("tr")
                for (var item = 1; item < w_cons.length; item++) {
                    w_cons[item].index = item
                    w_cons[item].onclick = function () {
                        that._mapPoint = { type: "point", x: controls[this.index - 1].Longitude, y: controls[this.index - 1].Latitude };
                        var nowdata = controls[this.index - 1];
                        topic.publish(selfDomNode + "click", that._mapPoint, that._toolTipDialog);
                        var caseContent = "<table border=1 style='text-align: center;border-collapse:collapse;padding:0;margin:0;font-size:12px;width:402px;'>" +
                                     "<tr><td style='width: 80px;height:20px;'>案件编号</td><td style='width: 100px;'>" + nowdata.EventId + "</td>" +
                                     "<td style='width: 100px;'>污染类型</td><td style='width: 100px;'>" + nowdata.EventTypeName + "</td></tr>" + "<tr><td style='width: 80px;height:20px;'>提交人</td><td style='width: 100px;'>" + nowdata.Author + "</td>" +
                                     "<td style='width: 100px;'>污染程度</td><td style='width: 100px;'>" + nowdata.LevelName + "</td></tr>" +
                                     "<tr><td style='height:20px;'>描述</td><td colspan='3'>" + nowdata.Description + "</td></tr>" +
                                     "<tr><td style='height:20px;'>位置</td><td colspan='3'>" + nowdata.Location + "</td></tr>"

                        if (nowdata.OneOpinion != "") {
                            caseContent += "<tr><td>案发时间</td><td>" + nowdata.RecordingTime + "</td>" +
                                            "<td>一次处理意见</td><td>" + nowdata.OneOpinion + "</td></tr>"
                        } else {
                            caseContent += "<tr><td>案发时间</td><td colspan='3'>" + nowdata.RecordingTime + "</td></tr>"
                        }
                        if (nowdata.TwoResult != "") {
                            caseContent += "<tr><td style='height:20px;'>一次处理时间</td><td colspan='3'>" + nowdata.OneTime + "</td></tr>" + "<tr><td style='height:20px;'>二次处理意见</td><td>" + nowdata.Remarks + "</td><td>二次处理时间</td><td>" + nowdata.TwoTime + "</td></tr>" + "<tr><td>处理结果</td><td>" + nowdata.TwoResult + "</td>" + "<td>处理状态</td><td>" + nowdata.StatusName + "<td/></tr>"

                        } else {
                            caseContent += "<tr><td style='height:20px;'>一次处理时间</td><td>" + nowdata.OneTime + "</td>" + "<td>处理结果</td><td>" + nowdata.OneResult + "</td></tr>" + "<tr><td style='height:20px;'>处理状态</td><td>" + nowdata.StatusName + "</td>" + "<td></td><td>" + "</td></tr>"
                        }
                        var aqWidth = nowdata.aqUrl.length * 190;
                        var ahWidth = nowdata.ahUrl.length * 190;
                        caseContent += "<tr><td style='height:20px;' colspan = '2'>案前图片</td><td colspan = '2'>案后图片</td><tr>" + "<tr></table><div style='height:220px;width:400px;overflow:hidden;position: relative;'><div style='width:190px;height:190px;float:left;overflow:hidden;margin:5px 4px;border:1px solid black;' id='aqout' ><div class='swiper-container' style='height:190px;width:190px;' id='aqinner'><div class='swiper-wrapper'>"
                        for (var i in nowdata.aqUrl) {
                            caseContent += "<div class='swiper-slide'><img src='" + nowdata.aqUrl[i].pic + "' style='width:190px;height:190px;float:left;'/></div>"
                        }
                        caseContent += "</div><div class='swiper-pagination'></div></div></div><div id='aqanniu' class='anniu' style='left: 60px;'>共有" + nowdata.aqUrl.length + "张</div>"
                        caseContent += "<div style='width:190px;height:190px;float:left;overflow:hidden;margin:5px 0px 5px 7px;border:1px solid black' id='ahout' ><div class='swiper-container' style='height:190px;width:190px;' id='ahinner'><div class='swiper-wrapper'>"

                        for (var i in nowdata.ahUrl) {
                            caseContent += "<div class='swiper-slide'><img src='" + nowdata.ahUrl[i].pic + "' style='width:190px;height:190px;float:left;'/></div>"
                        }
                        caseContent += "</div><div class='swiper-pagination'></div></div></div><div id='ahanniu' class='anniu' style='left: 275px;'>共有" + nowdata.ahUrl.length + "张</div>"
                        //that.aqtime1, that.aqtime2, that.ahtime1, that.ahtime2
                        that._contentPane.set("content", caseContent);
                        //that.aqIscoll(dom.byId(aqout), dom.byId(aqanniu), that, aqanniu, nowdata.aqUrl.length + 2)
                        //that.ahIscoll(dom.byId(ahout), dom.byId(ahanniu), that, ahanniu, nowdata.ahUrl.length + 2)
                        //轮播图的实现
                        if (nowdata.aqUrl.length > 1) {
                            var mySwiper = new Swiper('.swiper-container', {
                                autoplay: 3000,
                                loop: true,
                                // 如果需要分页器
                                pagination: '.swiper-pagination',
                                paginationClickable: true,
                                autoplayDisableOnInteraction: false
                            });
                        }
                        var extent = new Extent(parseFloat(nowdata.Longitude) - 0.03, parseFloat(nowdata.Latitude) - 0.03
                 , parseFloat(nowdata.Longitude) + 0.03, parseFloat(nowdata.Latitude) + 0.03, that.map.spatialReference);
                        that.map.setExtent(extent)
                    }
                }
            }
        },

        //清空所有的计时器；
        //clearTime: function () {
        //    var that = this;
        //    clearInterval(that.aqtime1)
        //    clearInterval(that.aqtime2)
        //    clearInterval(that.ahtime1)
        //    clearInterval(that.ahtime2)
        //},
        ////案前图片的滚动；
        //aqIscoll: function (out, anniu, that, btn, n) {
        //    var lef = (200 - n * 22) / 2;
        //    dom.byId(btn).style.left = lef + "px"
        //    var Linear = function (t, b, c, d) { return c * t / d + b; }
        //    clearInterval(that.aqtime1)
        //    clearInterval(that.aqtime2)
        //    var $out = out;
        //    var $span = anniu.getElementsByTagName('span');
        //    var m = 0;
        //    var imgwidth = 190;
        //    function color() {
        //        for (var i = 1; i < $span.length - 1; i++) {
        //            $span[i].className = "";
        //        };
        //        $span[m + 1].className = "aa";
        //    }
        //    function imgmove() {
        //        console.log('走');
        //        clearInterval(that.aqtime1)
        //        var start = $out.scrollLeft;
        //        var end = m * imgwidth;
        //        var step = 0;
        //        var stepmax = 200;
        //        var everystep = (end - start) / stepmax;
        //        that.aqtime1 = setInterval(move, 1)
        //        function move() {
        //            step++;
        //            start += everystep;
        //            $out.scrollLeft = Linear(step, start, end - start, stepmax)
        //            if (step == stepmax) {
        //                clearInterval(that.aqtime1)
        //            };
        //        }
        //    }
        //    function biaomove() {
        //        m++;
        //        if (m == $span.length - 2) {
        //            m = 0;
        //        };
        //        color();
        //        imgmove();
        //    }
        //    function main() {
        //        that.aqtime2 = setInterval(biaomove, 2000)
        //    }
        //    that.aqtime2 = setInterval(biaomove, 2000);
        //    main();
        //    /////////////////////////////////////////////////////////////////////////////点击事件
        //    for (var i = 1; i < $span.length - 1; i++) {
        //        $span[i].aa = i;
        //        $span[i].onclick = function () {
        //            clearInterval(that.aqtime2)
        //            m = this.aa - 1;
        //            color();
        //            imgmove();
        //            that.aqtime2 = setInterval(biaomove, 2000);
        //        }
        //    };
        //    /////////////////////////////////////////////////////////////////////////左右点击事件
        //    $span[0].onclick = function () {
        //        clearInterval(that.aqtime2);
        //        m--;
        //        if (m == -1) {
        //            m = $span.length - 3;
        //        };
        //        color();
        //        imgmove();
        //        main();
        //    }
        //    $span[$span.length - 1].onclick = function () {
        //        clearInterval(that.aqtime2);
        //        m++;
        //        if (m == $span.length - 2) {
        //            m = 0;
        //        };
        //        color();
        //        imgmove();
        //        main();
        //    }
        //    ///////////////////////////////////////////////////////////////////////////鼠标on与down事件
        //    $out.onmouseover = function () {
        //        clearInterval(that.aqtime2);
        //        clearInterval(that.aqtime1);
        //    }
        //    $out.onmouseout = function () {
        //        main();
        //    }
        //},
        //ahIscoll: function (out, anniu, that, btn, n) {
        //    var lef = (200 - n * 22) / 2 + 200;
        //    dom.byId(btn).style.left = lef + "px"
        //    var Linear = function (t, b, c, d) { return c * t / d + b; }
        //    clearInterval(that.ahtime1)
        //    clearInterval(that.ahtime2)
        //    var $out = out;
        //    var $span = anniu.getElementsByTagName('span');
        //    var m = 0;
        //    var imgwidth = 190;


        //    function color() {
        //        for (var i = 1; i < $span.length - 1; i++) {
        //            $span[i].className = "";
        //        };
        //        $span[m + 1].className = "aa";
        //    }
        //    function imgmove() {
        //        clearInterval(that.ahtime1)
        //        var start = $out.scrollLeft;
        //        var end = m * imgwidth;
        //        var step = 0;
        //        var stepmax = 200;
        //        var everystep = (end - start) / stepmax;
        //        that.ahtime1 = setInterval(move, 1)
        //        function move() {
        //            step++;
        //            start += everystep;
        //            $out.scrollLeft = Linear(step, start, end - start, stepmax)
        //            if (step == stepmax) {
        //                clearInterval(that.ahtime1)
        //            };
        //        }
        //    }
        //    function biaomove() {
        //        m++;
        //        if (m == $span.length - 2) {
        //            m = 0;
        //        };
        //        color();
        //        imgmove();
        //    }
        //    function main() {
        //        that.ahtime2 = setInterval(biaomove, 2000)
        //    }
        //    main();
        //    /////////////////////////////////////////////////////////////////////////////点击事件
        //    for (var i = 1; i < $span.length - 1; i++) {
        //        $span[i].aa = i;
        //        $span[i].onclick = function () {
        //            clearInterval(that.ahtime2)
        //            m = this.aa - 1;
        //            color();
        //            imgmove();
        //            that.ahtime2 = setInterval(biaomove, 2000);
        //        }
        //    };
        //    /////////////////////////////////////////////////////////////////////////左右点击事件
        //    $span[0].onclick = function () {
        //        clearInterval(that.ahtime2);
        //        m--;
        //        if (m == -1) {
        //            m = $span.length - 3;
        //        };
        //        color();
        //        imgmove();
        //        main();
        //    }
        //    $span[$span.length - 1].onclick = function () {
        //        clearInterval(that.ahtime2);
        //        m++;
        //        if (m == $span.length - 2) {
        //            m = 0;
        //        };
        //        color();
        //        imgmove();
        //        main();
        //    }
        //    ///////////////////////////////////////////////////////////////////////////鼠标on与down事件
        //    $out.onmouseover = function () {
        //        clearInterval(that.ahtime2);
        //        clearInterval(that.ahtime1);
        //    }
        //    $out.onmouseout = function () {
        //        main();
        //    }
        //},
        //功能面板与表格面板的切换；
        TabHost: function () {
            var $tableTitleId = dojo.byId(this.tableTitleId + 0);//表格头部对应的标题
            this.tableTitleNode.style.display = "block"//表格头部
            $tableTitleId.style.display = "inline-block"
            $tableTitleId.innerHTML = "案件列表";
            this.dataTemplateContent.style.display = "none";//选项面板隐藏
            this.dataTemplateListNode.style.display = "block";//表格面板展示
            this.TabIconNode.style.backgroundImage = "url(" + this._projectName + "/widgets/assets/images/Tab.png" + ")";
            this.ListIconNode.style.backgroundImage = "url(" + this._projectName + "/widgets/assets/images/List1.png" + ")";
        },
        //表格模板中每个表格的切换与默认显示
        _tableshow: function () {
            var $tableTitle = dojo.query(".CaseTableTitle")
            var $tableContent = dojo.query(".CaseTable")
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
        _setLayerVisible: function () {
            var layer = this.map.getLayer("caseInfo");
            layer.setVisibility(this.checkBox.checked);
        }
    });
    return event;
});