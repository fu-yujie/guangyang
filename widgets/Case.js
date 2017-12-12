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
    "dojo/text!./templates/Case.html",
    "widgets/_Widget",
    "widgets/CaseInfo",
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
    CaseInfo,
    Search
) {
    var t = declare("widgets.Case", [_Widget], {
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
        postCreate: function () {
            /// <summary>
            /// 小部件的DOM准备好后并被插入到页面后调用该方法，保存图层信息
            /// </summary>
            this.inherited(arguments);
            this.caseInfo = new CaseInfo({
                map: this.map,
                that: this,
            }, this.caseInfoNode);
            on(this.caseInfo, "click", lang.hitch(this, function (popupPoint, toolTipDialog) {
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
            on(this.caseInfo, "open", lang.hitch(this, function (popupPoint, toolTipDialog) {
               
                this._popupMapPoint = popupPoint;
                this._toolTipDialog = toolTipDialog;
            }));
            on(this.caseInfo, "close", lang.hitch(this, function (tooltipDialog,clearTime) {
                //this.caseInfo.clearTime();
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
        },
        //关闭功能模板时将所有的checkbox关闭；
        stateListener: function (pamre) {
            if (this.caseInfo.checkBox.checked) {
                this.caseInfo.checkBox.set("checked", !this.caseInfo.checkBox.checked);
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
