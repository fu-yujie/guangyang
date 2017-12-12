/**
 * Created by Administrator on 2015/9/29.
 */
define([
    "dojo/_base/declare",
    "dojo/store/Memory",
    "dojo/text!./templates/PollutionList.html",
    "dijit/form/Button",
    "dijit/form/Select",
    "dijit/form/TextBox",
    "dijit/layout/ContentPane",
    "widgets/_Widget"
],function(
    declare,
    Memory,
    template,
    Button,
    Select,
    TextBox,
    ContentPane,
    _Widget
){
    var t = declare("widgets.PollutionList",_Widget,{
        templateString: template,
        title:"锅炉",
        constructor: function (para) {
            if (para != undefined) {

            }
        },
        postMixInProperties: function(){
            this.inherited(arguments);
        },
        buildRendering:function(){
            this.inherited(arguments);
        },
       
        postCreate: function () {
           
            /// <summary>
            /// 小部件的DOM准备好后并被插入到页面后调用该方法，保存图层信息
            /// </summary>
            this.inherited(arguments);
            this.select = new Select({
                store: new Memory({ data: [{ id: "1", name: "超大型锅炉" }, { id: "0", name: "小型锅炉" }] }),
                labelAttr: "name",
                style: "height:10px;font-size:12px;width:222px;margin-left:7px;margin-top:8px;"
            },this.pSelectNode);
            this.textBox = new TextBox({
                style: "height:21px;font-size:12px;width:174px;margin-left:7px;margin-top:8px;"
            },this.pTextBoxNode);
            this.button = new Button({
                label: "搜索",
                style: "height:21px;font-size:12px;margin-top:8px;"
            },this.pButtonNode);
            this.content = new ContentPane({

            },this.pContentNode);
        },
        startup:function(){
            this.inherited(arguments);
        }
    });
    return t;
});