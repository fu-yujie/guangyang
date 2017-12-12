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
    "dojo/request/xhr",
    "dojo/text!./templates/PaTrol.html",
    "dijit/layout/LayoutContainer",
    "dijit/TooltipDialog",
    "dijit/form/Button",
    "dijit/form/CheckBox",
    "dijit/form/Select",
    "dojox/form/CheckedMultiSelect",
    "dojox/form/DateTextBox",
    "dojox/form/TimeSpinner",
    "dojo/dom-construct",
    "dojo/store/Memory",
    "widgets/_Widget",
    "widgets/Search",
    "widgets/PatrolChildren",
    "esri/Color",
    "esri/geometry/Point",
    "esri/graphic",
    "esri/symbols/PictureMarkerSymbol",
    "esri/symbols/SimpleMarkerSymbol",
     "dojox/form/CheckedMultiSelect",
     "dojo/data/ItemFileWriteStore",
     "dojo/dom",
     "dojo/dom-style",
], function (
    declare,
    lang,
    on,
    topic,
    ContentPane,
    popup,
    xhr,
    template,
    LayoutContainer,
    TooltipDialog,
    Button,
    CheckBox,
    Select,
    CheckedMultiSelect,
    DateTextBox,
    TimeSpinner,
    domConstruct,
    Memory,
    _Widget,
    Search,
    PatrolChildren,
     Color,
    Point,
    Graphic,
    PictureMarkerSymbol,
    SimpleMarkerSymbol,
    CheckedMultiSelect,
    ItemFileWriteStore,
    dom,
    domStyle
) {
    var t = declare("widgets.PaTrol", [_Widget], {
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
            //搜索框部分
            //this.departmentSHNode.innerHTML= '<ul class="department_tit"><li class="department"><span> 部门：</span><input data-dojo-attach-point="dptvalueNode" type="text" id="dptvalue"/></li><li><input type="button" data-dojo-attach-point="scvalueNode" value="搜索" class="department_search" id="scvalue"></li></ul>'
            this.patrolChildren = new PatrolChildren({
                map: this.map,
                that: this,
            }, this.patrolChildrenNode);
            this.map.patrolChildren = this.patrolChildren
            on(this.patrolChildren, "click", lang.hitch(this, function (popupPoint, toolTipDialog) {
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
            on(this.patrolChildren, "open", lang.hitch(this, function (popupPoint, toolTipDialog) {
                this._popupMapPoint = popupPoint;
                this._toolTipDialog = toolTipDialog;
            }));
            on(this.patrolChildren, "close", lang.hitch(this, function (tooltipDialog) {
                this._popupMapPoint = null;
                this._toolTipDialog = null;
            }));
            var labOnNode = domConstruct.create("label", {
                innerHTML: "状&nbsp;&nbsp;&nbsp;&nbsp;态：",
                style: "margin-left:6px;font-size:15px;display:inline-block;width:80px;"
            });
            this.patrolCheckNode.appendChild(labOnNode);
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
            this.patrolCheckNode.appendChild(this._typeSelect.domNode);

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
            this.departmentGridNode.appendChild(labGridNameNode);
            var labGridNode = domConstruct.create("input", {
                innerHTML: "网格名称：",
                id: "txtGridNameConductor2",
                style: "margin-top:1px;font-size:14px;display:inline-block;width:102px;"
            });
            this.departmentGridNode.appendChild(labGridNode);
            //搜索框结束

            //搜索框开始,按姓名查询
            var labNameNode = domConstruct.create("label", {
                innerHTML: "姓&nbsp;&nbsp;&nbsp;&nbsp;名：",
                style: "margin-left:6px;font-size:15px;display:inline-block;width:80px;"
            });
            this.departmentPersonNode.appendChild(labNameNode);
            var labTestNode = domConstruct.create("input", {
                innerHTML: "姓&nbsp;&nbsp;&nbsp;&nbsp;名：",
                id: "txtNameConductor2",
                style: "margin-top:1px;font-size:14px;display:inline-block;width:102px;"
            });
            this.departmentPersonNode.appendChild(labTestNode);
            //搜索框结束

            //dojo.byId(dijit_form_ComboButton_1).style.width = "230px";
            //dojo.byId(dijit_form_ComboButton_1).style.height = "30px"
            this.btnNode = domConstruct.create("button", {
                innerHTML: "搜索",
                style: "width: 190px;height: 28px; background: #0899ff;color: #fff;border: 1px solid #0899ff;border-radius: 2px;box-sizing: border-box;margin:5px;"
            });
            this.departmentBtnNode.appendChild(this.btnNode);
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
        },
        //关闭功能模板时将所有的checkbox关闭；
        stateListener: function (pamre) {
            if (this.patrolChildren.checkBox.checked) {
                this.patrolChildren.checkBox.set("checked", !this.patrolChildren.checkBox.checked);
            }
        },
        startup: function () {
            this.inherited(arguments);
            this.menuContent.startup();
            //this._setCaseDialog();
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
