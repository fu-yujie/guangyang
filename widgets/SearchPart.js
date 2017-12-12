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
    "dojo/text!./templates/SearchPart.html",
    "widgets/_Widget",
    "dojo/dom",
    "dojo/request/xhr",
    "esri/geometry/Point",
    "esri/graphic",
    "esri/symbols/PictureMarkerSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/TextSymbol",
    "esri/Color",
    "dojox/grid/DataGrid",
    "widgets/TitlePartPane",
    "dojo/data/ItemFileWriteStore",
    "dijit/TooltipDialog",
    "esri/geometry/Extent",
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
    dom,
    xhr,
    Point,
    Graphic,
    PictureMarkerSymbol,
     SimpleMarkerSymbol,
    TextSymbol,
    Color,
    DataGrid,
    TitlePartPane,
    ItemFileWriteStore,
    TooltipDialog,
    Extent
) {
    var t = declare("widgets.SearchPart", [_Widget], {
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
        //加载popup模板
        _setGrid: function () {
            this._attrGrid = new DataGrid({
                style: "padding:0;font-size: 12px;width:220px;font-family: 'Microsoft YaHei';float:left;",
                structure: this._createAttrGridLayout(),
                autoHeight: true,
                autoWidth: true,
                store: this._createGridStore([])
            });
            this._titlePartPane = new TitlePartPane({
                style: "background-color:lightskyblue",
                onClose: lang.hitch(this, function () {
                    popup.close();
                })
            });
            this._contentPane = new ContentPane({
                style: "width:auto;padding:0;margin:0;overflow: hidden;"
            });
            this._toolTipDialog = new TooltipDialog({
                onOpen: lang.hitch(this, function () {
                    topic.publish(this.domNode.id + "open", this._mapPoint, this._toolTipDialog);
                }),
                onClose: lang.hitch(this, function () {
                    topic.publish(this.domNode.id + "close", this._toolTipDialog);
                })
            });
            this._toolTipDialog.addChild(this._titlePartPane);
            this._contentPane.addChild(this._attrGrid);
            this._toolTipDialog.addChild(this._contentPane);
        },
        postCreate: function () {
            /// <summary>
            /// 小部件的DOM准备好后并被插入到页面后调用该方法，保存图层信息
            /// </summary>

            //this.inherited(arguments);
            this.searchPartTitleTextNode.innerHTML = "搜索";
            var $searchPartContentNode = this.searchPartContentNode;
            this.tabContentNode.innerHTML += "<lable style='display:none'>关键字:</lable><input type='text' id='searchCon'/><button id='partSearch'>搜索</button>"
           
            this.searchParm()
            on(this.deleteIconNode, "click", lang.hitch(this, function () {
                this.domNode.style.display = "none"
                this._searchPartlayer = this.map.getLayer("searchPart");
                this._searchPartlayer.clear()
                this.map._searchPartPaneSwitching.setOpened(false);
                
            }))
            this.state = true;
            on(this.shrinkIconNode, "click", lang.hitch(this, function () {
                if (this.state) {
                    this.searchPartConNode.style.display = "none"
                    this.state = false;
                } else {
                    this.searchPartConNode.style.display = "block"
                    this.state = true;
                }
                

            }))
            this._setGrid();
            //this._setEvent();
        },
        //获取数据
        searchParm: function () {
            var $partSearch = dojo.byId(partSearch)
            var $searchCon = dojo.byId(searchCon)
            on($partSearch, "click", lang.hitch(this, function (evt) {
                xhr.post(this._projectName + "/widgets/handler/SearchHandler.ashx", {
                    handleAs: "text",
                    timeout: 10000,
                    data: {
                        methodName: "GetAllSearch",
                        strCon: $searchCon.value
                    }
                }).then(lang.hitch(this, function (data) {
                    var dataJson = eval("(" + data + ")")
                    this.newData(dataJson.data)
                }), lang.hitch(this, function (error) {
                    console.log("获取所有微监控点时返回错误：" + error);
                }));
            }))
        },
        newData: function (data) {
            (function (that) {
                var ne = new taskMessage_page()
                ne.pageContentElement = "table";//用哪种 标签进行数据的展示，可以用table与tr+td;或者是ul+li+span;只需要填入table或者ul既可；
                ne.cut_page_id = "searchPartContent";//整体容器的最外层id
                ne.data = data;//数据；注：数据格式为[{},{},{}];外层为数组，每个数组内的元素为对象的格式；
                ne.pageContentLength = 8;//每页展示数据的长度或个数；
                ne.orderKey = ["", "Name"];//表格展示的属性名的顺序
                ne.orderKeyName = ["序号", "名称"]//表格头部的属性名一次的名称与orderKey对应起来；
                ne.allWidth=250
                ne.addDom({
                    that: that,
                })//调用主方法；
                ne.addOrRemove("set", "border", 0)//第一个属性为remove和set，第二属性为标签的属性名，第三个属性为属性值；
            })(this)
        },
        _pointadd: function (data) {
            this._searchPartlayer = this.map.getLayer("searchPart");
            this._searchPartlayer.clear()
            this.textLayer = this.map.getLayer("searchPartTextSymbol");
            this.textLayer.clear()
            var that = this;
            var tableId = dojo.byId(searchPartContent)
            if (tableId.innerHTML != undefined && tableId.innerHTML != null) {
                var w_cons = tableId.getElementsByTagName("tr")
                var that = this;
                for (var i = 1; i < w_cons.length; i++) {
                    w_cons[i].index = i
                    w_cons[i].onclick = function () {
                        that._searchPartlayer.clear()
                        that.textLayer.clear()
                        if (data[this.index - 1].lon != "" && data[this.index - 1].Lat != "") {
                            var point = new Point(parseFloat(data[this.index - 1].lon), parseFloat(data[this.index - 1].Lat), that.map.spatialReference);
                            var symbol = new PictureMarkerSymbol(that._projectName + "/widgets/assets/images/position1.png", 20, 20);
                            var graphic = new Graphic(point, symbol, null);
                            that._searchPartlayer.add(graphic);
                            var textSymbol = new TextSymbol({
                                text: data[this.index-1].Name,
                                font: "12px",
                                color: new Color("red"),
                                haloColor: new Color([255, 0, 0]),
                                haloSize: "1",
                                horizontalAlignment: "left",
                                xoffset: 10,
                            });
                            var labelGraphic = new Graphic(point, textSymbol);
                        
                            that._searchPartlayer.add(labelGraphic);
                            var extent = new Extent(parseFloat(data[this.index - 1].lon) - 0.03, parseFloat(data[this.index - 1].Lat) - 0.03
                 , parseFloat(data[this.index - 1].lon) + 0.03, parseFloat(data[this.index - 1].Lat) + 0.03, that.map.spatialReference);
                            that.map.setExtent(extent)
                            //that.arrTemplate(data[this.index - 1])
                        } else {
                            alert("无坐标")
                        }
                      
                    }
                }
            }
        },
        //弹出框形式展示
        arrTemplate:function(data){
            this._mapPoint = { type: "point", x: data.经度, y: data.纬度 };
            this._searchPartlayer = this.map.getLayer("searchPart");
            topic.publish("widgets_CarPollution_0" + "click", this._mapPoint, this._toolTipDialog);
            var attrData = [];
            var attrIndex = 0;
            var resultJson = data
            for (var item in resultJson) {
                attrIndex++;
                if (item != "lat" && item != "lon" && item != "所属网格") {
                    attrData.push({
                        ID: attrIndex,
                        name: item,
                        value: resultJson[item]
                    });
                }
            }
            this._attrGrid.setStore(this._createGridStore(attrData));
        //    var extent = new Extent(parseFloat(controls[this.index - 1].经度) - 0.03, parseFloat(controls[this.index - 1].纬度) - 0.03
        //, parseFloat(controls[this.index - 1].经度) + 0.03, parseFloat(controls[this.index - 1].纬度) + 0.03, that.map.spatialReference);
        //    that.map.setExtent(extent)
        },
        startup: function () {
            this.inherited(arguments);

        },
        _createAttrGridLayout: function () {
            var layout = [
                {
                    name: '序号', field: 'ID', width: '36px', hidden: true, cellStyles: 'text-align:center;',
                    headerStyles: "text-align:center;font-size: 12px;font-family: 'Microsoft YaHei';font-weight: normal;"
                },
                {
                    name: '属性名称', field: 'name', width: '88px', cellStyles: 'text-align:center;',
                    headerStyles: "text-align:center;font-size: 12px;font-family: 'Microsoft YaHei';font-weight: normal;"
                },
                {
                    name: '属性值', field: 'value', width: '88px', cellStyles: 'text-align:center;',
                    headerStyles: "text-align:center;font-size: 12px;font-family: 'Microsoft YaHei';font-weight: normal;"
                }
            ];
            return layout;
        },
        _createGridStore: function (items) {
            var store = new ItemFileWriteStore({
                data: {
                    identifier: "ID",
                    items: items
                }
            });
            return store;
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
