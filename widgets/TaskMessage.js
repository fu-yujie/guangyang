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
    "dojo/text!./templates/TaskMessage.html",
    "widgets/_Widget",
    "dojo/dom",
    "widgets/themes/JS/taskMessagePage"
], function (
    declare,
    lang,
    on,
    topic,
    ContentPane,
    popup,
    template,
    _Widget,
    dom
) {
    var t = declare("widgets.TaskMessage", [_Widget], {
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
                    this.dataTemplateContent = para.dataTemplateContent.domNode;
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
        newData: function (data) {
            (function (that) {
                var ne = new taskMessage_page()
                ne.pageContentElement = "table";//用哪种 标签进行数据的展示，可以用table与tr+td;或者是ul+li+span;只需要填入table或者ul既可；
                ne.cut_page_id = "taskMessageContent";//整体容器的最外层id
                ne.data = data;//数据；注：数据格式为[{},{},{}];外层为数组，每个数组内的元素为对象的格式；
                ne.pageContentLength = 10;//每页展示数据的长度或个数；
                ne.orderKey = ["name", "content","time"];//表格展示的属性名的顺序
                ne.orderKeyName = ["巡查员", "内容", "时间"]//表格头部的属性名一次的名称与orderKey对应起来；
                ne.allWidth=240
                ne.addDom({
                    that: that,
                })//调用主方法；
                ne.addOrRemove("set", "border", 0)//第一个属性为remove和set，第二属性为标签的属性名，第三个属性为属性值；
            })(this)
        },
        postCreate: function () {
            /// <summary>
            /// 小部件的DOM准备好后并被插入到页面后调用该方法，保存图层信息
            /// </summary>

            //this.inherited(arguments);
            this.taskMessageTitleTextNode.innerHTML = "任务消息";
            var $taskMessageContentNode = this.taskMessageContentNode;
            //var $tableTitleNode = this.tableTitleNode
            //for (var i = 0; i < this.tableNum; i++) {
            //    $tableTitleNode.innerHTML += "<span id='" + this.tableTitleId + i + "' class='" + this.tableTitleId + "'></span>"
            $taskMessageContentNode.innerHTML += "<div id='taskMessageContent' class='taskMessageContent'></div>"

            //}

            //this.dataTemplateContents = new this.dataTemplateContent({
            //    map: this.map,
            //    tableTitleNode: this.tableTitleNode,
            //    tableContentNode: this.tableContentNode,
            //    tableContentId: this.tableContentId,//分页器所需要的id
            //    tableTitleId: this.tableTitleId,
            //    dataTemplateListNode:this.dataTemplateListNode

            //}, this.dataTemplateContentNode);
            //this.dataTemplateContents = new this.dataTemplateContent({
            //    map: this.map,
            //    that:this
            //}, this.dataTemplateContentNode);
            //on(this.deleteIconNode, "click", lang.hitch(this, function () {
            //    this.dataTemplateContents.stateListener()
            //    var $titleSpan = this.tableTitleNode.getElementsByTagName("span");
            //    this.dataTemplateListNode.style.display = "none"
            //    this.dataTemplateContents.set("style", "display:block");
            //    this.domNode.style.display = "none"

            //}))
            //on(this.TabIconNode, "click", lang.hitch(this, function () {
            //    this.dataTemplateContents.set("style", "display:block");
            //    this.dataTemplateListNode.style.display = "none";
            //    this.TabIconNode.style.backgroundImage = "url(" + this._projectName + "/widgets/assets/images/Tab1.png" + ")";
            //    this.ListIconNode.style.backgroundImage = "url(" + this._projectName + "/widgets/assets/images/List.png" + ")";
            //}))
            //on(this.ListIconNode, "click", lang.hitch(this, function () {
            //    this.dataTemplateContents.set("style", "display:none");
            //    this.TabIconNode.style.backgroundImage = "url(" + this._projectName + "/widgets/assets/images/Tab.png" + ")";
            //    this.ListIconNode.style.backgroundImage = "url(" + this._projectName + "/widgets/assets/images/List1.png" + ")";
            //    this.dataTemplateListNode.style.display = "block"
            //    var $titleSpan = this.tableTitleNode.getElementsByTagName("span");
            //    var num = 0;
            //    for(var i=0;i<$titleSpan.length;i++){
            //        if($titleSpan[i].innerHTML==""){
            //            num++
            //        }
            //    }
            //    if (num == this.tableNum) {
            //        this.dataTemplateListNode.style.display = "none"
            //    }

            //}))
        },
        _pointadd:function(data){

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
