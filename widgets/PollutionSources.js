/**
 * Created by Administrator on 2015/10/13.
 */
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/on",
    "dojo/dom-style",
    "dojo/topic",
    "dijit/layout/ContentPane",
    "dijit/popup",
    "dojo/text!./templates/PollutionSources.html",
    "widgets/_Widget",
    "widgets/BoilerPollution",
    "widgets/FirstGrid",
    "widgets/SecondGrid",
    "widgets/ThirdGrid",
    "widgets/GController",
    "widgets/WController",
    "widgets/SController",
    "widgets/BarbecuePollution",
    "widgets/CompanyPollution",
    "widgets/CarPollution",
    //"widgets/CaseInfo",
    "widgets/CoalPollution",
    "widgets/ExposedLandPollution",
    "widgets/SitePollution",
    "widgets/VideoPollution",
    "widgets/DirtyAnalyze",
    "widgets/SewagePollution",
    "widgets/FarmPollution",
    "widgets/PatrolChildren",
    "widgets/RoadPollution",
    "widgets/Search",
], function (
    declare,
    lang,
    on,
    style,
    topic,
    ContentPane,
    popup,
    template,
    _Widget,
    BoilerPollution,
    FirstGrid,
    SecondGrid,
    ThirdGrid,
    GController,
    WController,
    SController,
    BarbecuePollution,
    CompanyPollution,
    CarPollution,
    //CaseInfo,
    CoalPollution,
    ExposedLandPollution,
    SitePollution,
    VideoPollution,
    DirtyAnalyze,
    SewagePollution,
    FarmPollution,
    PatrolChildren,
    RoadPollution,
    Search
) {
    var t = declare("widgets.PollutionSources", [_Widget], {
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
                if ("tableNum" in para.that) {
                    this.tableNum = para.that.tableNum;
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
            var that = this;
            var tabledata = [that.barbecuePollution, that.coalPollution, that.sewagePollution, that.boilerPollution, that.sitePollution, that.farmPollution, that.roadPollution, that.exposedLandPollution, that.companyPollution,that.carPollution]
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
            this.search = new Search({
                map: this.map,
                style: "position: absolute; right: 35px;top:2px;z-index: 51;display:block;"
            }, this.searchNode);
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
            this._pollutionContent = new ContentPane({}, this.pollutionContentNode);
            //污染源面板
            this.barbecuePollution = new BarbecuePollution({
                map: this.map,
                that: this,
            }, this.barbecuePollutionNode);
            on(this.barbecuePollution, "click", lang.hitch(this, function (popupPoint, toolTipDialog) {
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
            on(this.barbecuePollution, "open", lang.hitch(this, function (popupPoint, toolTipDialog) {
                this._popupMapPoint = popupPoint;
                this._toolTipDialog = toolTipDialog;
            }));
            on(this.barbecuePollution, "close", lang.hitch(this, function (tooltipDialog) {
                this._popupMapPoint = null;
                this._toolTipDialog = null;
            }));
            
            this.coalPollution = new CoalPollution({
                map: this.map,
                that: this,
            }, this.coalPollutionNode);
            on(this.coalPollution, "click", lang.hitch(this, function (popupPoint, toolTipDialog) {
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
            on(this.coalPollution, "open", lang.hitch(this, function (popupPoint, toolTipDialog) {
                this._popupMapPoint = popupPoint;
                this._toolTipDialog = toolTipDialog;
            }));
            on(this.coalPollution, "close", lang.hitch(this, function (tooltipDialog) {
                this._popupMapPoint = null;
                this._toolTipDialog = null;
            }));

            this.sewagePollution = new SewagePollution({
                map: this.map,
                that: this,
            }, this.sewagePollutionNode);
            on(this.sewagePollution, "click", lang.hitch(this, function (popupPoint, toolTipDialog) {
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
            on(this.sewagePollution, "open", lang.hitch(this, function (popupPoint, toolTipDialog) {
                this._popupMapPoint = popupPoint;
                this._toolTipDialog = toolTipDialog;
            }));
            on(this.sewagePollution, "close", lang.hitch(this, function (tooltipDialog) {
                this._popupMapPoint = null;
                this._toolTipDialog = null;
            }));

            this.boilerPollution = new BoilerPollution({
                map: this.map,
                that: this,
            }, this.boilerPollutionNode);
            on(this.boilerPollution, "click", lang.hitch(this, function (popupPoint, toolTipDialog) {
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
            on(this.boilerPollution, "open", lang.hitch(this, function (popupPoint, toolTipDialog) {
                this._popupMapPoint = popupPoint;
                this._toolTipDialog = toolTipDialog;
            }));
            on(this.boilerPollution, "close", lang.hitch(this, function (tooltipDialog) {
                this._popupMapPoint = null;
                this._toolTipDialog = null;
            }));

            this.sitePollution = new SitePollution({
                map: this.map,
                that: this,
            }, this.sitePollutionNode);
            on(this.sitePollution, "click", lang.hitch(this, function (popupPoint, toolTipDialog) {
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
            on(this.sitePollution, "open", lang.hitch(this, function (popupPoint, toolTipDialog) {
                this._popupMapPoint = popupPoint;
                this._toolTipDialog = toolTipDialog;
            }));
            on(this.sitePollution, "close", lang.hitch(this, function (tooltipDialog) {
                this._popupMapPoint = null;
                this._toolTipDialog = null;
            }));

            this.farmPollution = new FarmPollution({
                map: this.map,
                that: this,
            }, this.farmPollutionNode);
            on(this.farmPollution, "click", lang.hitch(this, function (popupPoint, toolTipDialog) {
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
            on(this.farmPollution, "open", lang.hitch(this, function (popupPoint, toolTipDialog) {
                this._popupMapPoint = popupPoint;
                this._toolTipDialog = toolTipDialog;
            }));
            on(this.farmPollution, "close", lang.hitch(this, function (tooltipDialog) {
                this._popupMapPoint = null;
                this._toolTipDialog = null;
            }));
            
            this.roadPollution = new RoadPollution({
                map: this.map,
                that: this,
            }, this.roadPollutionNode);
            on(this.roadPollution, "click", lang.hitch(this, function (popupPoint, toolTipDialog) {
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
            on(this.roadPollution, "open", lang.hitch(this, function (popupPoint, toolTipDialog) {
                this._popupMapPoint = popupPoint;
                this._toolTipDialog = toolTipDialog;
            }));
            on(this.roadPollution, "close", lang.hitch(this, function (tooltipDialog) {
                this._popupMapPoint = null;
                this._toolTipDialog = null;
            }));
            this.exposedLandPollution = new ExposedLandPollution({
                map: this.map,
                that: this,
            }, this.exposedLandPollutionNode);
            on(this.exposedLandPollution, "click", lang.hitch(this, function (popupPoint, toolTipDialog) {
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
            on(this.exposedLandPollution, "open", lang.hitch(this, function (popupPoint, toolTipDialog) {
                this._popupMapPoint = popupPoint;
                this._toolTipDialog = toolTipDialog;
            }));
            on(this.exposedLandPollution, "close", lang.hitch(this, function (tooltipDialog) {
                this._popupMapPoint = null;
                this._toolTipDialog = null;
            }));

            this.companyPollution = new CompanyPollution({
                map: this.map,
                that: this,
            }, this.companyPollutionNode);
            this.companyPollution.set("map", this.map);
            on(this.companyPollution, "click", lang.hitch(this, function (popupPoint, toolTipDialog) {
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
            on(this.companyPollution, "open", lang.hitch(this, function (popupPoint, toolTipDialog) {
                this._popupMapPoint = popupPoint;
                this._toolTipDialog = toolTipDialog;
            }));
            on(this.companyPollution, "close", lang.hitch(this, function (tooltipDialog) {
                this._popupMapPoint = null;
                this._toolTipDialog = null;
            }));

            this.carPollution = new CarPollution({
                map: this.map,
                that: this,
            }, this.carPollutionNode);
            on(this.carPollution, "click", lang.hitch(this, function (popupPoint, toolTipDialog) {
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
            on(this.carPollution, "open", lang.hitch(this, function (popupPoint, toolTipDialog) {
                this._popupMapPoint = popupPoint;
                this._toolTipDialog = toolTipDialog;
            }));
            on(this.carPollution, "close", lang.hitch(this, function (tooltipDialog) {
                this._popupMapPoint = null;
                this._toolTipDialog = null;
            }));
            
            

           


           

           
           
            
            

            this.dirtyAnalyze = new DirtyAnalyze({
                map: this.map,
                barbecuePollution: this.barbecuePollution,
                coalPollution: this.coalPollution,
                sewagePollution: this.sewagePollution,
                boilerPollution: this.boilerPollution,
                sitePollution: this.sitePollution,
                farmPollution: this.farmPollution,
                roadPollution: this.roadPollution,
                exposedLandPollution: this.exposedLandPollution,
                companyPollution: this.companyPollution,
                carPollution: this.carPollution,
                //style: "position: absolute; left: 350px;top:0px;z-index: 51;"
            }, this.dirtyAnalyzeNode);
            this.map.dirtyAnalyze = this.dirtyAnalyze

            //var allPollution = [this.barbecuePollution, this.coalPollution, this.sewagePollution, this.boilerPollution, this.sitePollution, this.farmPollution, this.roadPollution, this.exposedLandPollution, this.companyPollution, this.carPollution]
            //var MapAllPollution = [];
            //array.forEach(allPollution, lang.hitch(this,function(every) {

            //}))
            var dpartdata = eval("(" + sessionStorage.getItem('dat') + ")");
            //环保局权限下切换不同部门获得到权限数据后进行污染源显示的过滤；
            this.map.filed = function (dpartdata, that) {
                var dpartArr = [that.sitePollution,
                        that.carPollution,
                        that.sewagePollution,
                        that.farmPollution,
                        that.companyPollution,
                        that.coalPollution,
                        that.exposedLandPollution,
                        that.barbecuePollution,
                        that.boilerPollution,
                        that.roadPollution]
                if (dpartdata != null && dpartdata != undefined) {
                    dpartArr.forEach(function(its) {
                        its.set("style","display:none;")
                    })
                    dpartdata.Rows.forEach(function(item) {
                        switch (item.IndustryName) {
                            case "餐饮": {
                                that.barbecuePollution.set("style", "display:block;")
                            }
                                break;
                            case "锅炉": {
                                that.boilerPollution.set("style", "display:block;")
                            }
                                break;
                            case "养殖场": {
                                that.farmPollution.set("style", "display:block;")
                            }
                                break;
                            case "建筑工地": {
                                that.sitePollution.set("style", "display:block;")
                            }
                                break;
                            case "煤经销点": {
                                that.coalPollution.set("style", "display:block;")
                            }
                                break;
                            case "污水排放口": {
                                that.sewagePollution.set("style", "display:block;")
                            }
                                break;
                            case "道路": {
                                that.roadPollution.set("style", "display:block;")
                            }
                                break;
                            case "料土堆": {
                                that.exposedLandPollution.set("style", "display:block;")
                            }
                                break;
                            case "污染企业": {
                                that.companyPollution.set("style", "display:block;")
                            }
                                break;
                            case "渣土车": {
                                that.carPollution.set("style", "display:block;")
                            }
                                break;
                        }
                    })
    
                }
            }
            this.map.filed(dpartdata, this)

            //地图位置的改变popup也会随之改变
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
            var that = this
            this.defaultTable()

        },
        //关闭功能模板时将所有的checkbox关闭；
        stateListener: function (pamre) {
            if (this.barbecuePollution.checkBox.checked) {
                this.barbecuePollution.checkBox.set("checked", !this.barbecuePollution.checkBox.checked);
            }
            if (this.boilerPollution.checkBox.checked) {
                this.boilerPollution.checkBox.set("checked", !this.boilerPollution.checkBox.checked);
            }
            if (this.farmPollution.checkBox.checked) {
                this.farmPollution.checkBox.set("checked", !this.farmPollution.checkBox.checked);
            }
            if (this.sitePollution.checkBox.checked) {
                this.sitePollution.checkBox.set("checked", !this.sitePollution.checkBox.checked);
            }
            if (this.coalPollution.checkBox.checked) {
                this.coalPollution.checkBox.set("checked", !this.coalPollution.checkBox.checked);
            }
            if (this.sewagePollution.checkBox.checked) {
                this.sewagePollution.checkBox.set("checked", !this.sewagePollution.checkBox.checked);
            }
            if (this.roadPollution.checkBox.checked) {
                this.roadPollution.checkBox.set("checked", !this.roadPollution.checkBox.checked);
            }
            if (this.exposedLandPollution.checkBox.checked) {
                this.exposedLandPollution.checkBox.set("checked", !this.exposedLandPollution.checkBox.checked);
            }
            if (this.companyPollution.checkBox.checked) {
                this.companyPollution.checkBox.set("checked", !this.companyPollution.checkBox.checked);
            }
            if (this.carPollution.checkBox.checked) {
                this.carPollution.checkBox.set("checked", !this.carPollution.checkBox.checked);
            }
            if (this.carPollution.checkBox.checked) {
                this.carPollution.checkBox.set("checked", !this.carPollution.checkBox.checked);
            }
            this.dirtyAnalyze._closeCurrentDrawTool();
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
