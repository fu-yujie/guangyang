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
    "dojo/text!./templates/RealTime.html",
    "widgets/_Widget",
    "widgets/VideoPollution",
    "widgets/DirtyAnalyze",
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
    VideoPollution,
    DirtyAnalyze,
    Search
) {
    var t = declare("widgets.RealTime", [_Widget], {
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
            /// С������DOM׼���ú󲢱����뵽ҳ�����ø÷���������ͼ����Ϣ
            /// </summary>
            this.inherited(arguments);
            ////����ҳ�湦�ܿ��ʹ�ã�
            //����Ƶ��ʾ����this._ctrlContent �� height ֵΪ130px
            this.videoPollution = new VideoPollution({
                map: this.map,
                that: this,
            }, this.videoPollutionNode);
            on(this.allVideoNode,'click', lang.hitch(this, function () {
                window.open("http://192.168.20.254")
                //window.open("http://192.168.31.1/")
            }))
        },
        //�رչ���ģ��ʱ�����е�checkbox�رգ�
        stateListener: function (pamre) {
            //console.log(this.videoPollution)
            if (this.videoPollution.checkBox.checked) {
                this.videoPollution.checkBox.set("checked", !this.videoPollution.checkBox.checked);
            }
        },
        startup: function () {
            this.inherited(arguments);
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
