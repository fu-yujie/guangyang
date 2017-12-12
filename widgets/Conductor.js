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
    "dojo/text!./templates/Conductor.html",
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
    "widgets/Search",
     "widgets/ConductorTool",
], function (
    declare,
    lang,
    on,
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
    Search,
    ConductorTool
) {
    var t = declare("widgets.Conductor", [_Widget], {
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

            this.conductorTool = new ConductorTool({
                map: this.map,
                that: this,
                style: " left: 350px;top:0px;z-index: 51;"
            }, this.conductorToolNode);
            this.map.conductorTool = this.conductorTool;
        },
        //关闭功能模板时将所有的checkbox关闭；
        stateListener: function (pamre) {
            if (this.conductorTool.checkBox.checked) {
                this.conductorTool.checkBox.set("checked", !this.conductorTool.checkBox.checked);
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
