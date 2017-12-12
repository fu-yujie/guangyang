/**
 * Created by Administrator on 2015/10/13.
 */
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/on",
    "dojo/topic",
    "dijit/layout/ContentPane",
    "dijit/popup",
    "dojo/text!./templates/MonitoringPoint.html",
    "widgets/_Widget",
    "widgets/GController",
    "widgets/WController",
    "widgets/SController",
    "widgets/Yangchen",
    "widgets/Youyan",
    "widgets/Search",
], function (
    declare,
    lang,
    on,
    topic,
    ContentPane,
    popup,
    template,
    _Widget,
    GController,
    WController,
    SController,
    Yangchen,
    Youyan,
    Search
) {
    var t = declare("widgets.MonitoringPoint", [_Widget], {
        templateString: template,
        _popupMapPoint: null,
        _toolTipDialog: null,
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
        //功能按钮取消选中状态时自动筛选显示当前选中的第一个按钮的列表
        defaultTable: function () {
            var $tableTitleId = document.getElementsByClassName(this.tableTitleId);
            var $tableContentId = document.getElementsByClassName(this.tableContentId);
            var tabledata = [this.gController, this.wController, this.sController]
            tabledata.forEach(function (item) {
                on(item.checkBox, "change", lang.hitch(this, function (evt) {
                    if (item.checkBox.checked) {

                    } else {
                        var num = []
                        tabledata.forEach(function (item, index) {
                            $tableTitleId[index].style.background = "white"
                            $tableContentId[index].style.display = "none";
                            if (item.checkBox.checked == true) {
                                num.push(index)
                            }
                        })
                        if (num.length != 0) {
                            $tableTitleId[num[0]].style.background = "red"
                            $tableContentId[num[0]].style.display = "block";
                        }
                    }
                }));
            })
        },
        postCreate: function () {
            
            /// <summary>
            /// 小部件的DOM准备好后并被插入到页面后调用该方法，保存图层信息
            /// </summary>
            this.inherited(arguments);
            this.menuTitle = new ContentPane({}, this.menuTitleNode);
            this.menuContent = new ContentPane({
                style: "padding:0;margin:0;"
            }, this.menuContentNode);
            // 格网面板
            this._gridContent = new ContentPane({}, this.gridContentNode);
           

            ////查找页面功能框的使用；
            //this.search = new Search({
            //    map: this.map,
            //    style: "position: absolute; right: 35px;top:2px;z-index: 51;display:block;"
            //}, this.searchNode);
            //on(this.search, "searchGController", lang.hitch(this, function () {
            //    this.menuBar.gController.checkBox.set("checked", "true");
            //}));
            //on(this.search, "searchWController", lang.hitch(this, function () {
            //    this.menuBar.wController.checkBox.set("checked", "true");
            //}));
            ////on(this.search,"searchCaseInfo",lang.hitch(this,function(){
            ////    this.menuBar.caseInfo.checkBox.set("checked","true");
            ////}));
            //on(this.search, "searchSite", lang.hitch(this, function () {
            //    this.menuBar.sitePollution.checkBox.set("checked", "true");
            //}));
            //on(this.search, "searchCar", lang.hitch(this, function () {
            //    this.menuBar.carPollution.checkBox.set("checked", "true");
            //}));
            //on(this.search, "searchCoal", lang.hitch(this, function () {
            //    this.menuBar.coalPollution.checkBox.set("checked", "true");
            //}));
            //on(this.search, "searchExposedLand", lang.hitch(this, function () {
            //    this.menuBar.exposedLandPollution.checkBox.set("checked", "true");
            //}));
            //on(this.search, "searchBarbecue", lang.hitch(this, function () {
            //    this.menuBar.barbecuePollution.checkBox.set("checked", "true");
            //}));
            //控制点面板
            this._ctrlContent = new ContentPane({}, this.ctrlContentNode);
            this.gController = new GController({
                map: this.map,
                that:this,
            }, this.gControllerNode);
            on(this.gController, "click", lang.hitch(this, function (popupPoint, toolTipDialog) {
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
            on(this.gController, "open", lang.hitch(this, function (popupPoint, toolTipDialog) {
                this._popupMapPoint = popupPoint;
                this._toolTipDialog = toolTipDialog;
            }));
            on(this.gController, "close", lang.hitch(this, function (tooltipDialog) {
                this._popupMapPoint = null;
                this._toolTipDialog = null;
            }));

            //

            this.yangchen = new Yangchen({
                map: this.map,
                that: this,
            }, this.yangchenNode);
            on(this.yangchen, "click", lang.hitch(this, function (popupPoint, toolTipDialog) {
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
            on(this.yangchen, "open", lang.hitch(this, function (popupPoint, toolTipDialog) {
                this._popupMapPoint = popupPoint;
                this._toolTipDialog = toolTipDialog;
            }));
            on(this.yangchen, "close", lang.hitch(this, function (tooltipDialog) {
                this._popupMapPoint = null;
                this._toolTipDialog = null;
            }));

            this.youyan = new Youyan({
                map: this.map,
                that: this,
            }, this.youyanNode);
            on(this.youyan, "click", lang.hitch(this, function (popupPoint, toolTipDialog) {
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
            on(this.youyan, "open", lang.hitch(this, function (popupPoint, toolTipDialog) {
                this._popupMapPoint = popupPoint;
                this._toolTipDialog = toolTipDialog;
            }));
            on(this.youyan, "close", lang.hitch(this, function (tooltipDialog) {
                this._popupMapPoint = null;
                this._toolTipDialog = null;
            }));
            //


            this.wController = new WController({
                map: this.map,
                that:this,
                //tableTitleNode: this.tableTitleNode,
                //tableContentNode: this.tableContentNode,
                //tableContentId: this.tableContentId,
                //tableTitleId: this.tableTitleId,
                //dataTemplateContent: this.domNode,
                //dataTemplateListNode: this.dataTemplateListNode
            }, this.wControllerNode);
            on(this.wController, "click", lang.hitch(this, function (popupPoint, toolTipDialog) {
                this._popupMapPoint = popupPoint;
                this._toolTipDialog = toolTipDialog;
                if (this._toolTipDialog != null && this._popupMapPoint != null) {
                    var popupScreenPoint = this.map.toScreen(this._popupMapPoint);
                    popup.open({
                        popup: this._toolTipDialog,
                        x: popupScreenPoint.x-10,
                        y: popupScreenPoint.y+80
                    });
                }
            }));
            on(this.wController, "open", lang.hitch(this, function (popupPoint, toolTipDialog) {
                this._popupMapPoint = popupPoint;
                this._toolTipDialog = toolTipDialog;
            }));
            on(this.wController, "close", lang.hitch(this, function (tooltipDialog) {
                this._popupMapPoint = null;
                this._toolTipDialog = null;
            }));

            this.sController = new SController({
                map: this.map,
                that:this,
                //tableTitleNode: this.tableTitleNode,
                //tableContentNode: this.tableContentNode,
                //tableContentId: this.tableContentId,
                //tableTitleId: this.tableTitleId,
                //dataTemplateContent: this.domNode,
                //dataTemplateListNode: this.dataTemplateListNode
            }, this.sControllerNode);
            
            on(this.sController, "click", lang.hitch(this, function (popupPoint, toolTipDialog) {
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
            on(this.sController, "open", lang.hitch(this, function (popupPoint, toolTipDialog) {
                this._popupMapPoint = popupPoint;
                this._toolTipDialog = toolTipDialog;
            }));
            on(this.sController, "close", lang.hitch(this, function (tooltipDialog) {
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
            this.defaultTable()
        },
        //关闭功能模板时将所有的checkbox关闭；
        stateListener: function (pamre) {
            if (this.gController.checkBox.checked) {
                this.gController.checkBox.set("checked", !this.gController.checkBox.checked);
            }
            if (this.wController.checkBox.checked) {
                this.wController.checkBox.set("checked", !this.wController.checkBox.checked);
            }
            if (this.sController.checkBox.checked) {
                this.sController.checkBox.set("checked", !this.sController.checkBox.checked);
            }
            if (this.yangchen.checkBox.checked) {
                this.yangchen.checkBox.set("checked", !this.yangchen.checkBox.checked);
            }
            if (this.youyan.checkBox.checked) {
                this.youyan.checkBox.set("checked", !this.youyan.checkBox.checked);
            }
        },
        startup: function () {
            this.inherited(arguments);
            this.menuContent.startup();
            
        },
        onMapExtentChange: function () {
        },
       
        _setMapAttr: function (map) {
            if (map) {
                this.map = map;
            }
        },
        _getMapAttr: function () {
            return this.map;
        }
    });
    return t;
});
