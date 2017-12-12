
define([
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/data/ItemFileWriteStore",
    "dojo/request/xhr",
    "dojo/on",
    "dojo/topic",
    "dijit/popup",
    "dojo/text!./templates/VideoPollution.html",
    "dijit/TooltipDialog",
    "dijit/form/CheckBox",
    "dijit/layout/ContentPane",
    "widgets/TitlePartPane",
    "dojox/grid/DataGrid",
    "esri/Color",
    "esri/geometry/Point",
    "esri/graphic",
    "esri/InfoTemplate",
    "esri/dijit/InfoWindow",
    "esri/symbols/PictureMarkerSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/TextSymbol",
    "widgets/_Widget"
], function (
    array,
    declare,
    lang,
    ItemFileWriteStore,
    xhr,
    on,
    topic,
    popup,
    template,
    TooltipDialog,
    CheckBox,
    ContentPane,
    TitlePartPane,
    DataGrid,
    Color,
    Point,
    Graphic,
    InfoTemplate,
    InfoWindow,
    PictureMarkerSymbol,
    SimpleMarkerSymbol,
    TextSymbol,
    _Widget
) {
    var video = declare("widgets.VideoPollution", _Widget, {
        templateString: template,
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
            this.checkBox = new CheckBox({
                checked: false,
                onChange: lang.hitch(this, function (checked) {
                    if (checked) {
                    } else {
                        // 清除图中的元素
                        this.map.graphics.clear();
                        this.map.infoWindow.hide();
                    }
                })
            }, this.checkBoxNode);
            this._toolTipDialog = new TooltipDialog({
                onOpen: lang.hitch(this, function () {
                    topic.publish(this.domNode.id + "open", this._mapPoint, this._toolTipDialog);
                }),
                onClose: lang.hitch(this, function () {
                    topic.publish(this.domNode.id + "close", this._toolTipDialog);
                })
            });
            this._setGrid();
            this._setEvent();
        },
        startup: function () {
            this.inherited(arguments);
            this._setLayerVisible();
        },
        select: function (evt) {
            this.checkBox.set("checked", !this.checkBox.checked);
        },
        _setMapAttr: function (map) {
            if (map) {
                this.map = map;
            }
        },
        _getMapAttr: function () {
            return this.map;
        },
        _setEvent: function () {
            on(this.checkBox, "change", lang.hitch(this, function (evt) {
                this._setLayerVisible();
                if (this.checkBox.checked) {
                    this._addGraphics();
                } else {
                    // 清除图中的元素                      
                    this._clearTable();
                    this.textLayer.clear();
                    popup.close();
                    this._popupMapPoint = null;
                    this._searchInterval && window.clearInterval(this._searchInterval);
                    this._searchInterval = null;
                }
            }));


        },
        //_setGrid: function () {
        //    this.infoTemplate = new InfoTemplate("视频监测点信息", '名称：' +
        //                    '<a href="http://www.baidu.com" target="_blank">${videoName}</a>');
        //    this._toolTipDialog.addChild(this.infoTemplate);
        //},
        _setGrid: function () {
            //this._attrGrid = new DataGrid({
            //    style: "padding:0;font-size: 12px;width:550px;font-family: 'Microsoft YaHei';float:left;",
            //    structure: this._createAttrGridLayout(),
            //    autoHeight: true,
            //    autoWidth: true,
            //    store: this._createGridStore([])
            //});
            this._titlePartPane = new TitlePartPane({
                style: "background-color:lightskyblue",
                onClose: lang.hitch(this, function () {
                    popup.close();
                    this._popupMapPoint = null;
                })
            });
            this._contentPane = new ContentPane({
                style: "width:540px;padding:0;margin:0;overflow: hidden;"
            });

            this._toolTipDialog.addChild(this._titlePartPane);

            this._toolTipDialog.addChild(this._contentPane);
        },
        _addGraphics: function () {
            var t = this;
            //t._searchInterval = setInterval(function () {
                //t._searchCamera(t);
            //}, 30000);
            this._videoPollutionlayer = this.map.getLayer("videoPollution");
            this._videoPollutionlayer.clear();
            xhr.post(this._projectName + "/widgets/handler/VideoPollution.ashx", {
                handleAs: "text",
                timeout: 10000,
                data: {
                    methodName: "GetAllVideoAreas",
                    name: '',
                    state: -1,
                    type: 0
                }
            }).then(lang.hitch(this, function (data) {
                var data = eval("(" + data + ")");
                this._cutData(data);
                this._setLayer(data);
                this._addpoint(data)
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
                ne.orderKey = ["status2", "name", "Contact", "Phone"];//表格展示的属性名的顺序
                ne.orderKeyName = ["开关状态", "名称","联系人","联系电话"]//表格头部的属性名一次的名称与orderKey对应起来；
                ne.addDom({
                    that: that,
                    popup: popup
                })//调用主方法；
                ne.addOrRemove("set", "border", 0)//第一个属性为remove和set，第二属性为标签的属性名，第三个属性为属性值；
            })(this, popup, this.tableContentId + 0)

        },
        //首次数据加载为图中坐标点添加事件与数据；
        _setLayer: function (data) {
            this._videoPollutionlayer = this.map.getLayer("videoPollution");
            document.getElementsByTagName("if")
            var arr = ["http://192.168.30.242:8010/video-index.html", "http://localhost:23287/video-index.html"];
            this._videoPollutionlayer.on("click", lang.hitch(this, function (evt) {
                if (this._contentPane.domNode.childNodes.length > 0) {
                    this._contentPane.domNode.removeChild(this._contentPane.domNode.childNodes[0])
                }
                var indexvideo = evt.graphic.attributes.videoName;
                var attributesData = evt.graphic.attributes.attributesData;
                   
                window.ChannelID = data[indexvideo].id;//当前监测点的id
                window.videoName = data[indexvideo].Address;//名称
                this._popupMapPoint = evt.mapPoint
                var screenPoint = this.map.toScreen(evt.mapPoint);
                var shipings = dojo.create('iframe', {
                    src: arr[0] + '?CamIndexCode=' + attributesData['CamIndexCode'] + '&DevIndexCode=' + attributesData['DevIndexCode'] + '&name=' + attributesData['name'],
                    width: "550",
                    height: "460",
                    style: ""
                })
                this._contentPane.domNode.appendChild(shipings);
                if (this._toolTipDialog != null) {
                    popup.open({
                        popup: this._toolTipDialog,
                        x: screenPoint.x,
                        y: screenPoint.y + 80
                    });
                }
            }))
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
        //添加到坐标点到图中；
        _addpoint: function (data) {
            alert
            this._videoPollutionlayer = this.map.getLayer("videoPollution");
            this.textLayer = this.map.getLayer("realTextSymbol");
            /// <summary>
            /// 根据微监控点的属性信息，生成点，并将点绘制到地图中。
            /// </summary>
            /// <param name="controls">微监控点的属性信息</param>
            // 清除图中的元素    
            this._videoPollutionlayer.clear();
            this.textLayer && this.textLayer.clear();
            var length = data.length;
            var num = 0
            if (length > 0) {
                var spatialReference = this.map.spatialReference;
                for (var video in data) {
                    var point = new Point(data[video].longitude, data[video].latitude, this.map.spatialReference);
                    var symbol;
                    if (data[video].status) {
                        symbol = new PictureMarkerSymbol(this._projectName + "/widgets/assets/images/VedioGreen.png", 20, 20);
                    } else {
                        symbol = new PictureMarkerSymbol(this._projectName + "/widgets/assets/images/VedioRed.png", 20, 20);
                    }
                   
                    var attr = { "videoName": video,'attributesData':data[video] };
                    var graphic = new Graphic(point, symbol, attr);
                    this._videoPollutionlayer.add(graphic);


                    var textSymbol = new TextSymbol({
                        text: data[video].name,
                        font: "12px",
                        color: new Color("red"),
                        haloColor: new Color([255, 0, 0]),
                        haloSize: "1",
                        horizontalAlignment: "left",
                        xoffset: 10,
                    });
                    var labelGraphic = new Graphic(point, textSymbol);
                    this.textLayer.add(labelGraphic);
                    num++;
                }
            }
        },
        //添加表格与图中坐标点数据展示联动
        _pointadd: function (controls) {
            this._tableshow()
            var tableId = dojo.byId(this.tableContentId + 0)
            var that = this;

            if (tableId.innerHTML != undefined && tableId.innerHTML != null) {
                var w_cons = tableId.getElementsByTagName("tr")
                that.textLayer = that.map.getLayer("realTextSymbol");
                for (var i = 1; i < w_cons.length; i++) {
                    w_cons[i].index = i
                    w_cons[i].onclick = function () {
                        var graphic = that._videoPollutionlayer.graphics[this.index - 1]
                        if (that._contentPane.domNode.childNodes.length > 0) {
                            that._contentPane.domNode.removeChild(that._contentPane.domNode.childNodes[0])
                        }
                        that._popupMapPoint = graphic.geometry;
                        var textSymbol = new TextSymbol({
                            text: "",
                            font: "12px",
                            color: new Color("red"),
                            haloColor: new Color([255, 0, 0]),
                            haloSize: "1",
                            horizontalAlignment: "left",
                            xoffset: 10,
                        });
                        var labelGraphic = new Graphic(that._popupMapPoint, textSymbol);
                        that.textLayer.add(labelGraphic);
                        that.map.centerAt(that._popupMapPoint);
                        var popupScreenPoint = that.map.toScreen(graphic.geometry);
                        var attributesData = controls[this.index - 1] || {};
                        window.ChannelID = controls[this.index - 1].id;//监控点id
                        window.videoName = controls[this.index - 1].Address;//监控点名称
                        var arr = ["http://192.168.30.242:8010/video-index.html", "http://localhost:23287/video-index.html"];
                        var shipings = dojo.create('iframe', {
                            src: arr[0] + '?CamIndexCode=' + attributesData['CamIndexCode'] + '&DevIndexCode=' + attributesData['DevIndexCode'] + '&name=' + attributesData['name'],
                            width: "550",
                            height: "460",
                            style: ""
                        })
                        that._contentPane.domNode.appendChild(shipings);
                        popup.open({
                            popup: that._toolTipDialog,
                            x: popupScreenPoint.x - 10,
                            y: popupScreenPoint.y + 80
                        });

                    }
                }
            }
        },
        //功能面板与表格面板的切换；
        TabHost: function () {
            var $tableTitleId = dojo.byId(this.tableTitleId + 0);//表格头部对应的标题
            this.tableTitleNode.style.display = "block"//表格头部
            $tableTitleId.style.display = "inline-block"
            $tableTitleId.innerHTML = "视频点列表";
            this.dataTemplateContent.style.display = "none";//选项面板隐藏
            this.dataTemplateListNode.style.display = "block";//表格面板展示
            this.TabIconNode.style.backgroundImage = "url(" + this._projectName + "/widgets/assets/images/Tab.png" + ")";
            this.ListIconNode.style.backgroundImage = "url(" + this._projectName + "/widgets/assets/images/List1.png" + ")";
            if (!dojo.byId('search_panel')) {
                //this.dataTemplateListNode.afterbegin(this._createSearch());
                this.dataTemplateListNode.innerHTML = this._createSearch().outerHTML + this.dataTemplateListNode.outerHTML;
            }
        },
        //创建检索条件
        _createSearch: function () {
            var t = this;
            var parentElement = document.createElement('div');
            parentElement.id = 'search_panel';
            var txtSearch = document.createElement('input');
            txtSearch.type = 'text';
            txtSearch.id = 'txt-camera-name';
            txtSearch.style.margin = '5px';
            txtSearch.style.height = '24px';
            txtSearch.style.width = '120px';
            txtSearch.placeholder = '请输入名称...';
            var cmState = document.createElement('select');
            cmState.id = 'cm-status-camera';
            cmState.style.margin = '5px';
            cmState.style.height = '28px';
            cmState.style.width = '80px';
            var lsStates = [{ name: '请选择', id: -1 }, { name: '运行中', id: 1 }, { name: '异常', id: 0 }];
            for (var i = 0, length = lsStates.length; i < length; i++) {
                var item = lsStates[i];
                var optionElement = document.createElement('option');
                optionElement.innerText = item.name;
                optionElement.id = 'cm_state_' + item.id;
                optionElement.setAttribute('attr-status', item.id);
                cmState.appendChild(optionElement);
            }
            var cmType = document.createElement('select');
            cmType.id = 'cm-type-camera';
            cmType.style.margin = '5px';
            cmType.style.height = '28px';
            cmType.style.width = '80px';
            var lsTypes = [{ name: '请选择', id: 0 }, { name: '餐饮', id: 1 }, { name: '扬尘', id: 2 }, { name: 'VOC企业', id: 3 },{ name: '小散乱污企业', id: 4 }];
            for (var i = 0, length = lsTypes.length; i < length; i++) {
                var item = lsTypes[i];
                var optionElement = document.createElement('option');
                optionElement.innerText = item.name;
                optionElement.id = 'cm_type_' + item.id;
                optionElement.setAttribute('attr-type', item.id);
                cmType.appendChild(optionElement);
            }
            var btnSearch = document.createElement('input');
            btnSearch.id = 'btnSearch';
            btnSearch.style.margin = '5px';
            btnSearch.style.height = '28px';
            btnSearch.style.width = '64px';
            btnSearch.style.verticalAlign = 'middle';
            btnSearch.type = 'button';
            btnSearch.value = '搜索';
            btnSearch.style.border = 'solid 1px #333';
            btnSearch.style.backgroundColor = '#fff';
            setTimeout(function () {
                dojo.connect(dojo.byId('btnSearch'), 'onclick', function () {
                    t._searchCamera(t);
                });
            }, 100);
            //btnSearch.onclick = function () {
            //    console.log(123);
            //    t._searchCamera(t);
            //}
            //if (btnSearch.addEventListener) {
            //    btnSearch.addEventListener('click', function () {
            //        t._searchCamera(t);
            //    }, false);
            //}
            //if (btnSearch.attachEvent) {
            //    btnSearch.attachEvent('onclick', function () {
            //        t._searchCamera(t);
            //    });
            //}  

            parentElement.appendChild(txtSearch);
            parentElement.appendChild(cmState);
            parentElement.appendChild(cmType);
            parentElement.appendChild(btnSearch);
            return parentElement;
        },
        _searchCamera: function (t) {
            var txtCameraName = document.getElementById('txt-camera-name');
            var cmStateElement = document.getElementById('cm-status-camera');
            var cmStateIndex = cmStateElement.selectedIndex;
            var cmStateAttr = cmStateElement.options[cmStateIndex].getAttribute('attr-status');
            var cmTypeElement = document.getElementById('cm-type-camera');
            var cmTypeIndex = cmTypeElement.selectedIndex;
            var cmTypeAttr = cmTypeElement.options[cmTypeIndex].getAttribute('attr-type');
            xhr.post(t._projectName + "/widgets/handler/VideoPollution.ashx", {
                handleAs: "text",
                timeout: 10000,
                data: {
                    methodName: "GetAllVideoAreas",
                    name: txtCameraName.value,
                    state: parseInt(cmStateAttr),
                    type: parseInt(cmTypeAttr)
                }
            }).then(lang.hitch(this, function (data) {
                var data = eval("(" + data + ")");
                if (data) {
                    t._cutData(data);
                    t._setLayer(data);
                    t._addpoint(data);
                }
            }), lang.hitch(this, function (error) {

            }));
        },
        //表格模板中每个表格的切换与默认显示
        _tableshow: function () {
            var $tableTitle = dojo.query(".RealTimeTableTitle")
            var $tableContent = dojo.query(".RealTimeTable")
            for (var i = 0; i < $tableTitle.length; i++) {
                $tableTitle[i].style.background = "white";
                $tableContent[i].style.display = "none";
            }
            $tableTitle[0].style.background = "#f1ab00";
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
            $tableTitleId.style.display = "inline"
            $tableTitleId.innerHTML = "";
            $tableContentId.innerHTML = "";
        },
        _setLayerVisible: function () {
            var layer = this.map.getLayer("videoPollution");
            layer.setVisibility(this.checkBox.checked);
        }
    });
    return video;
});