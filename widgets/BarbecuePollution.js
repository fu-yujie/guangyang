/**
 * Created by Administrator on 2015/10/13.
 */
define([
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/data/ItemFileWriteStore",
    "dojo/request/xhr",
    "dojo/topic",
    "dojo/on",
    "dojo/dom",
    "dojo/dom-construct",
    "dijit/popup",
    "dojo/text!./templates/BarbecuePollution.html",
    "dijit/TooltipDialog",
    "dijit/form/CheckBox",
    "dijit/layout/ContentPane",
    "dojox/grid/DataGrid",
    "esri/Color",
    "esri/geometry/Point",
    "esri/graphic",
    "esri/symbols/PictureMarkerSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    "widgets/_Widget",
    "widgets/TitlePartPane",
    "esri/symbols/TextSymbol",
    "esri/geometry/Extent",
],function(
    array,
    declare,
    lang,
    ItemFileWriteStore,
    xhr,
    topic,
    on,
    dom,
    domConstruct,
    popup,
    template,
    TooltipDialog,
    CheckBox,
    ContentPane,
    DataGrid,
    Color,
    Point,
    Graphic,
    PictureMarkerSymbol,
    SimpleMarkerSymbol,
    _Widget,
    TitlePartPane,
    TextSymbol,
    Extent
){
    var barbecue = declare("widgets.BarbecuePollution",_Widget,{
        templateString: template,
        map:null,
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
        //项目路径
        postMixInProperties: function(){
            this.inherited(arguments);
            var pathName = window.document.location.pathname;
            this._projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);
        },
        buildRendering:function(){
            this.inherited(arguments);
        },
        postCreate: function () {
            /// <summary>
            /// 小部件的DOM准备好后并被插入到页面后调用该方法，保存图层信息
            /// </summary>
            this.inherited(arguments);
            this.checkBox = new CheckBox({
                checked:false
            },this.checkBoxNode);
            this._toolTipDialog = new TooltipDialog({
                onOpen:lang.hitch(this,function () {
                    topic.publish(this.domNode.id + "open", this._mapPoint, this._toolTipDialog);
                }),
                onClose:lang.hitch(this,function(){
                    topic.publish(this.domNode.id + "close", this._toolTipDialog);
                })
            });
            this._setGrid();
            this._setEvent();
        },
        startup:function(){
            this.inherited(arguments);
            this._setLayerVisible();
        },
        select:function(evt){
            this.checkBox.set("checked",!this.checkBox.checked);
        },
        onClick: function (popupPoint,toolTipDialog) {

        },
        onClose:function(popupPoint,toolTipDialog){

        },
        onOpen:function(tooltipDialog){

        },
        _setMapAttr:function(map){
            if(map){
                this.map = map;
                
            }
        },
        _getMapAttr:function(){
            return this.map;
        },
        _setEvent:function(){
            topic.subscribe(this.domNode.id + "click", lang.hitch(this, "onClick"));
            topic.subscribe(this.domNode.id + "close", lang.hitch(this, "onClose"));
            topic.subscribe(this.domNode.id + "open", lang.hitch(this, "onOpen"));
            on(this.checkBox,"change",lang.hitch(this,function(evt){
                this._setLayerVisible();
                if(this.checkBox.checked){
                    this._addGraphics();
                } else {
                    this._clearTable()
                    this._barbecuePollutionlayer.clear();
                    popup.close();
                }
            }));
        },
        _setGrid:function(){
            this._attrGrid = new DataGrid({
                style:"padding:0;font-size: 12px;width:220px;font-family: 'Microsoft YaHei';float:left;",
                structure:this._createAttrGridLayout(),
                autoHeight:true,
                autoWidth: true,
                store: this._createGridStore([])
            });
            this._titlePartPane = new TitlePartPane({
                style:"background-color:lightskyblue",
                onClose:lang.hitch(this,function(){
                    popup.close();
                })
            });
            this._contentPane = new ContentPane({
                style:"width:auto;padding:0;margin:0;overflow: hidden;"
            });
            this._toolTipDialog.addChild(this._titlePartPane);
            this._contentPane.addChild(this._attrGrid);
            this._toolTipDialog.addChild(this._contentPane);
        },
        //请求数据；
        _addGraphics:function() {
            this._barbecuePollutionlayer = this.map.getLayer("barbecuePollution");
            this._barbecuePollutionlayer.clear();
            xhr.post(this._projectName + "/widgets/handler/BarbecuePollution.ashx", {
                handleAs: "text",
                timeout: 10000,
                data: {
                    methodName: "GetAllBarbecueAreas"
                }
            }).then(lang.hitch(this, function (data) {
                var data = eval("(" + data + ")");
                this._cutData(data)
                this._addpointAll(data)
                this._setLayer(data)
                this.secondaryFilter(data)
            }), lang.hitch(this, function (error) {
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
                //ne.orderKey = ["名称", "编码", "联系人", "地址"];//表格展示的属性名的顺序
                ne.orderKey = ["名称","联系人", "地址"];//表格展示的属性名的顺序
                //ne.orderKeyName = ["污染源名称", "编码", "联系人", "地址"]//表格头部的属性名一次的名称与orderKey对应起来；
                ne.orderKeyName = ["污染源名称", "联系人", "地址"]//表格头部的属性名一次的名称与orderKey对应起来；
                ne.addDom({
                    that: that,
                    popup: popup
                })//调用主方法；
                ne.addOrRemove("set", "border", 0)//第一个属性为remove和set，第二属性为标签的属性名，第三个属性为属性值；
            })(this, popup, this.tableContentId + 0)
        },
        //首次数据加载为图中坐标点添加事件与数据；
        _setLayer: function (data) {
            this._barbecuePollutionlayer = this.map.getLayer("barbecuePollution");
            this._barbecuePollutionlayer.on("click", lang.hitch(this, function (evt) {
                this._mapPoint = evt.mapPoint;
                var nowdata = data[evt.graphic.attributes.barbecueCode]
                topic.publish(this.domNode.id + "click", this._mapPoint, this._toolTipDialog);
                var attrData = [];
                var attrIndex = 0;
                for (var item in nowdata) {
                    attrIndex++;
                    if (item != "纬度" && item != "经度") {
                        attrData.push({
                            ID: attrIndex,
                            name: item,
                            value: nowdata[item]
                        });
                    }
                }
                this._attrGrid.setStore(this._createGridStore(attrData));
                var extent = new Extent(parseFloat(evt.mapPoint.x) - 0.03, parseFloat(evt.mapPoint.y) - 0.03
                , parseFloat(evt.mapPoint.x) + 0.03, parseFloat(evt.mapPoint.y) + 0.03, this.map.spatialReference);
                //this.map.setExtent(extent)
                this.map.centerAt(evt.mapPoint);
            }));
        },
        //根据改造类型进行锅炉信息的二次筛选并展示；
        secondaryFilter: function (dataJsons) {
            var data = dataJsons;
            var lables = [];
            var lab = domConstruct.create("p", {
                style: "overflow:hidden;padding-left:20px;",
                id: this.tableContentId + 0 + "_p"
            });
            dojo.byId(this.tableContentId + 0).insertBefore(lab, dojo.byId(this.tableContentId + 0).firstElementChild)
            //只分已改造和未改造；
            lab.innerHTML = "<span style='float:left;width:120px;height:25px'><input type='checkbox' style='width:15px;height:15px;vertical-align:bottom;display:inline-block'/><em style='font-size:12px;'>" + "未安装油净化器" + "</em></span>"
            lab.innerHTML += "<span style='float:left;width:120px;height:25px'><input type='checkbox' style='width:15px;height:15px;vertical-align:bottom;display:inline-block'/><em style='font-size:12px;'>" + "已安装油净化器" + "</em></span>"
            for (itme in data) {
                ////分为未改造和不同的改造类型；
                //for (i in data[itme].barbecueAreaInfo) {
                if (lables.indexOf(data[itme].净化器类型) == -1) {
                    lables.push(data[itme].净化器类型)
                }
            }
            this._clik(dataJsons)
        },
        //赋予二次筛选中不同字段相应的事件，并根据checkbox的选中与否进行数据的过滤，得到新的数据；
        _clik: function (dt) {
            var dat = dt
            var $p = dojo.byId(this.tableContentId + 0 + "_p");
            var alllabipt = $p.getElementsByTagName("input");
            var alllab = $p.getElementsByTagName("span");
            var alllabem = $p.getElementsByTagName("em");
            var that = this;
            function filte() {
                for (var j = 0; j < alllabipt.length; j++) {
                    if (alllabipt[j].checked == true) {
                        if (alllabem[j].innerHTML == "未安装油净化器") {
                            arr.push("")
                        } else {
                            arr.push("静电吸附")
                        }
                    }
                }
                var arrcontect = [];
                for (var i = 0; i < arr.length; i++) {
                    var d;
                    (function (j) {
                        function fl(element, index, array) {
                            //for (item in element.rows) {
                            return (element.净化器类型 == arr[j])
                            //}
                        }
                        d = dat.filter(fl)
                    })(i)
                    arrcontect = arrcontect.concat(d)
                }
                that._barbecuePollutionlayer.clear();
                popup.close();
                that._cutData(arrcontect)
                that._addpointAll(arrcontect)
                that._setLayer(arrcontect)
            }
            for (var q = 0; q < alllab.length; q++) {
                //alllabipt[q].checked = true;
                (function (p) {
                    on(alllabipt[p], "change", lang.hitch(this, function (evt) {
                        arr = [];
                        filte();
                    }))
                    on(alllabem[q], "click", lang.hitch(this, function () {
                        arr = [];
                        var ipt = alllabipt[p]
                        if (ipt.checked == true) {
                            ipt.checked = false;
                        } else {
                            ipt.checked = true;
                        }
                        filte();
                    }));
                })(q)
            }
            //}
        },
        //添加到坐标点到图中；
        _addpointAll: function (data) {
            this._barbecuePollutionlayer = this.map.getLayer("barbecuePollution");
            this._barbecuePollutionlayer.clear()
            this.textLayer = this.map.getLayer("barbecueTextSymbol");
            this.textLayer.clear()
            for(var barbecue in data){
                var point = new Point(data[barbecue].经度, data[barbecue].纬度, this.map.spatialReference);
                var symbol = new PictureMarkerSymbol(this._projectName + "/widgets/assets/images/barbecue.png", 20, 20);
                var attr = {"barbecueCode":barbecue};
                var graphic = new Graphic(point,symbol,attr,null);
                this._barbecuePollutionlayer.add(graphic);
                var textSymbol = new TextSymbol({
                    text: data[barbecue].名称,
                    font: "12px",
                    color: new Color("red"),
                    haloColor: new Color([255, 0, 0]),
                    haloSize: "1",
                    horizontalAlignment: "left",
                    xoffset: 10,
                });
                var labelGraphic = new Graphic(point, textSymbol);
                this.textLayer.add(labelGraphic);
            }
            this.textLayer.setScaleRange(0, 0);
            //this.textLayer.setScaleRange(15000, 0);
        },
        //分页数据添加到坐标点到图中；
        _addpoint:function(){
            //预留
        },
        //添加表格与图中坐标点数据展示联动
        _pointadd: function (controls) {
            this._tableshow()
            var that = this;
            var tableId = dojo.byId(this.tableContentId + 0)
            if (tableId.innerHTML != undefined && tableId.innerHTML != null) {
                var w_cons = tableId.getElementsByTagName("tr")
                var i = 1;
                for (var item in controls) {
                    w_cons[i].index = item
                    w_cons[i].onclick = function () {
                        that._mapPoint = { type: "point", x: controls[this.index].经度, y: controls[this.index].纬度 };
                        that._barbecuePollutionlayer = that.map.getLayer("barbecuePollution");
                        topic.publish("widgets_BarbecuePollution_0" + "click", that._mapPoint, that._toolTipDialog);
                            var attrData = [];
                            var attrIndex = 0;
                            for (var item in controls[this.index]) {
                                attrIndex++;
                                if (item != "纬度" && item != "经度") {
                                    attrData.push({
                                        ID: attrIndex,
                                        name: item,
                                        value: controls[this.index][item]
                                    });
                                }
                            }
                            that._attrGrid.setStore(that._createGridStore(attrData));
                            var extent = new Extent(parseFloat(controls[this.index].经度) - 0.03, parseFloat(controls[this.index].纬度) - 0.03
                   , parseFloat(controls[this.index].经度) + 0.03, parseFloat(controls[this.index].纬度) + 0.03, that.map.spatialReference);
                            //that.map.setExtent(extent)
                            that.map.centerAt(that._mapPoint);
                    }
                    i++;
                }
            }
        },
        _createAttrGridLayout:function(){
            var layout = [
                {
                    name: '序号', field: 'ID', width:'36px',hidden: true, cellStyles: 'text-align:center;',
                    headerStyles: "text-align:center;font-size: 12px;font-family: 'Microsoft YaHei';font-weight: normal;"
                },
                {
                    name: '属性名称', field: 'name',width:'88px',cellStyles: 'text-align:center;',
                    headerStyles: "text-align:center;font-size: 12px;font-family: 'Microsoft YaHei';font-weight: normal;"
                },
                {
                    name: '属性值', field: 'value',width:'88px', cellStyles: 'text-align:center;',
                    headerStyles: "text-align:center;font-size: 12px;font-family: 'Microsoft YaHei';font-weight: normal;"
                }
            ];
            return layout;
        },
        //功能面板与表格面板的切换；
        TabHost: function () {
            var $tableTitleId = dojo.byId(this.tableTitleId + 0);//表格头部对应的标题
            this.tableTitleNode.style.display = "block"//表格头部
            $tableTitleId.style.display = "inline-block"
            $tableTitleId.innerHTML = "餐饮列表";
            this.dataTemplateContent.style.display = "none";//选项面板隐藏
            this.dataTemplateListNode.style.display = "block";//表格面板展示
            this.TabIconNode.style.backgroundImage = "url(" + this._projectName + "/widgets/assets/images/Tab.png" + ")";
            this.ListIconNode.style.backgroundImage = "url(" + this._projectName + "/widgets/assets/images/List1.png" + ")";
        },
        //表格模板中每个表格的切换与默认显示
        _tableshow: function () {
            var $tableTitle = dojo.query(".PollutionSourcesTableTitle")
            var $tableContent = dojo.query(".PollutionSourcesTable")
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
        _createGridStore:function(items){
            var store = new ItemFileWriteStore({
                data: {
                    identifier: "ID",
                    items: items
                }
            });
            return store;
        },
        _setLayerVisible:function() {
            var layer = this.map.getLayer("barbecuePollution");
            layer.setVisibility(this.checkBox.checked);
            this.textLayer = this.map.getLayer("barbecueTextSymbol");
            this.textLayer.setVisibility(this.checkBox.checked);
        }
    });
    return barbecue;
});