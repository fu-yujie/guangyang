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
    "dojo/text!./templates/DataTemplate.html",
    "widgets/_Widget",
], function (
    declare,
    lang,
    on,
    topic,
    ContentPane,
    popup,
    template,
    _Widget
) {
    var t = declare("widgets.DataTemplate", [_Widget], {
        templateString: template,
        _popupMapPoint: null,
        _toolTipDialog: null,
        map: null,
        constructor: function (para) {
            if (para != undefined) {
                if ("titleName" in para) {
                    this.titleName = para.titleName;
                }
                if ("map" in para) {
                    this.map = para.map;
                }
                if ("dataTemplateContent" in para) {
                    this.dataTemplateContent = para.dataTemplateContent;
                }
                if ("tableTitleId" in para) {
                    this.tableTitleId = para.tableTitleId;
                }
                if ("tableContentId" in para) {
                    this.tableContentId = para.tableContentId;
                }
                if ("tableNum" in para) {
                    this.tableNum = para.tableNum;
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
            this.dataTemplateTitleTextNode.innerHTML = this.titleName;
            var $tableContentNode = this.tableContentNode;
            var $tableTitleNode = this.tableTitleNode
            for (var i = 0; i < this.tableNum; i++) {
                $tableTitleNode.innerHTML += "<span id='" + this.tableTitleId + i + "' class='" + this.tableTitleId + "'></span>"
                $tableContentNode.innerHTML += "<div id='" + this.tableContentId + i + "' class='" + this.tableContentId + "'></div>"
            }
            this.dataTemplateContents = new this.dataTemplateContent({
                map: this.map,
                that:this
            }, this.dataTemplateContentNode);
            on(this.deleteIconNode, "click", lang.hitch(this, function () {
                this.dataTemplateContents.stateListener()
                var $titleSpan = this.tableTitleNode.getElementsByTagName("span");
                this.dataTemplateListNode.style.display = "none"
                this.dataTemplateContents.set("style", "display:block");
                this.domNode.style.display = "none"
                
            }))
            on(this.TabIconNode, "click", lang.hitch(this, function () {
                this.dataTemplateContents.set("style", "display:block");
                this.dataTemplateListNode.style.display = "none";
                this.TabIconNode.style.backgroundImage = "url(" + this._projectName + "/widgets/assets/images/Tab1.png" + ")";
                this.ListIconNode.style.backgroundImage = "url(" + this._projectName + "/widgets/assets/images/List.png" + ")";
            }))
            this.state = true;
            on(this.shrinkIconNode, "click", lang.hitch(this, function () {
                if (this.state) {
                    this.dataContentNode.style.display = "none"
                    this.state = false;
                } else {
                    this.dataContentNode.style.display = "block"
                    this.state = true;
                }
            }))
            on(this.ListIconNode, "click", lang.hitch(this, function () {
                this.dataTemplateContents.set("style", "display:none");
                this.TabIconNode.style.backgroundImage = "url(" + this._projectName + "/widgets/assets/images/Tab.png" + ")";
                this.ListIconNode.style.backgroundImage = "url(" + this._projectName + "/widgets/assets/images/List1.png" + ")";
                this.dataTemplateListNode.style.display = "block"
                var $titleSpan = this.tableTitleNode.getElementsByTagName("span");
                var num = 0;
                for(var i=0;i<$titleSpan.length;i++){
                    if($titleSpan[i].innerHTML==""){
                        num++
                    }
                }
                if (num == this.tableNum) {
                    this.dataTemplateListNode.style.display = "none"
                }
            }))
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
