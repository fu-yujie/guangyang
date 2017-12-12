/**
 * Created by Administrator on 2015/12/4.
 */
define([
    "dijit/form/TextBox",
    "dijit/layout/ContentPane",
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/on",
    "dojo/request/xhr",
    "dojo/text!./templates/Search.html",
    "dojo/topic",
    "esri/geometry/Extent",
    "esri/geometry/Point",
    "esri/graphic",
    "esri/symbols/PictureMarkerSymbol",
    "widgets/_Widget"
],function(
    TextBox,
    ContentPane,
    array,
    declare,
    lang,
    domClass,
    domStyle,
    on,
    xhr,
    template,
    topic,
    Extent,
    Point,
    Graphic,
    PictureMarkerSymbol,
    _Widget
) {
    var Search = declare("widgets.Search", _Widget, {
        // templateString: html||Object
        //    控件的html模板
        templateString: template,
        map:null,
        constructor:function(para){
            if (para != undefined) {
                if("map" in para)
                {
                    this.map =para.map;
                }
            }
        },
        postMixInProperties: function(){
            this.inherited(arguments);
            var pathName = window.document.location.pathname;
            this._projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);
        },
        postCreate: function () {
            this.inherited(arguments);
            this._searchGroup = new ContentPane({
                style:"padding:0;margin:0;"
            },this.searchGroupNode);
            this._menuButton = new ContentPane({
                style:"padding:0;margin:0;width:30px;height:30px;",
                onClick:lang.hitch(this,function(){
                    if(this._searchLayerPane.domNode.style.display == "block")
                    {
                        domStyle.set(this.menuButtonNode,"background-image","url('./widgets/assets/images/pointerbottom.png')");
                        domStyle.set(this.searchLayerPaneNode,"display","none");
                    }else{
                        domStyle.set(this.menuButtonNode,"background-image","url('./widgets/assets/images/pointertop.png')");
                        domStyle.set(this.searchLayerPaneNode,"display","block");
                    }
                }),
                onMouseDown:lang.hitch(this,function(){
                    domStyle.set(this.menuButtonNode,"background-color","darkgray");
                }),
                onMouseUp:lang.hitch(this,function(){
                    domStyle.set(this.menuButtonNode,"background-color","white");
                }),
                onMouseOver:lang.hitch(this,function(){
                    domStyle.set(this.menuButtonNode,"background-color","#dddddd");
                }),
                onMouseOut:lang.hitch(this,function(){
                    domStyle.set(this.menuButtonNode,"background-color","white");
                })
            },this.menuButtonNode);
            this._searchInput = new TextBox({
                style:'border:1px solid #454545;padding-top:3px;font-size:15px;width:200px;height:27px;border-width:1px 0;font-size: 15px;font-family: "Microsoft YaHei";vertical-align: middle;',
                placeHolder:"查找名称或地址",
                onChange:lang.hitch(this,function(value){
                    if(value == "") {
                        var layer = this.map.getLayer("searchResult");
                        layer.clear();
                    }
                }),
                selectOnClick:true
            },this.searchInputNode);
            this._searchButton =new ContentPane({
                style:"padding:0;margin:0;width:30px;height:30px;",
                tooltip:"查询",
                onMouseDown:lang.hitch(this,function(){
                    domStyle.set(this.searchButtonNode,"background-color","darkgray");
                }),
                onMouseUp:lang.hitch(this,function(){
                    domStyle.set(this.searchButtonNode,"background-color","white");
                }),
                onMouseOver:lang.hitch(this,function(){
                    domStyle.set(this.searchButtonNode,"background-color","#dddddd");
                }),
                onMouseOut:lang.hitch(this,function(){
                    domStyle.set(this.searchButtonNode,"background-color","white");
                }),
                onClick: lang.hitch(this, function (evt) {
                    domStyle.set(this.menuButtonNode,"background-image","url('./widgets/assets/images/pointerbottom.png')");
                    domStyle.set(this.searchLayerPaneNode,"display","none");
                    switch (this._searchIndex)
                    {
                        case "all":
                        {
                            this._searchAllData();
                            break;
                        }
                        case "gController":
                        {
                            this._searchGControllerData();
                            break;
                        }
                        case "wController":
                        {
                            this._searchWControllerData();
                            break;
                        }
                        //case "caseInfo":
                        //{
                        //    this._searchCaseInfoData();
                        //    break;
                        //}
                        case "sitePollution":
                        {
                            this._searchSiteData();
                            break;
                        }
                        case "carPollution":
                        {
                            this._SearchCarData();
                            break;
                        }
                        case "coalPollution":
                        {
                            this._searchCoalData();
                            break;
                        }
                        case "exposedLandPollution":
                        {
                            this._searchExposedLandData();
                            break;
                        }
                        case "barbecuePollution":
                        {
                            this._searchBarbecueData();
                            break;
                        }
                        default:
                            break;
                    }
                })
            },this.searchButtonNode);
            this._searchLayerPane =new ContentPane({},this.searchLayerPaneNode);
            //this._searchAll=new ContentPane({},this.searchAllNode);
            this._searchGControl =new ContentPane({},this.searchGControlNode);
            this._searchWControl =new ContentPane({},this.searchWControlNode);
            //this._searchCaseInfo =new ContentPane({},this.searchCaseInfoNode);
            this._searchSite =new ContentPane({},this.searchSiteNode);
            this._searchCar=new ContentPane({},this.searchCarNode);
            this._searchCoal =new ContentPane({},this.searchCoalNode);
            this._searchExposedLand =new ContentPane({},this.searchExposedLandNode);
            this._searchBarbecue =new ContentPane({},this.searchBarbecueNode);
            //this._setSearchEvent();
        },
        startup: function () {
            this.inherited(arguments);
        },
        _setSearchEvent: function () {
            topic.subscribe(this.domNode.id + "searchGController", lang.hitch(this, "onSearchGController"));
            topic.subscribe(this.domNode.id + "searchWController", lang.hitch(this, "onSearchWController"));
            //topic.subscribe(this.domNode.id +"searchCaseInfo",lang.hitch(this,"onSearchCaseInfo"));
            topic.subscribe(this.domNode.id +"searchSite",lang.hitch(this,"onSearchSite"));
            topic.subscribe(this.domNode.id +"searchCar",lang.hitch(this,"onSearchCar"));
            topic.subscribe(this.domNode.id +"searchCoal",lang.hitch(this,"onSearchCoal"));
            topic.subscribe(this.domNode.id +"searchExposedLand",lang.hitch(this,"onSearchExposedLand"));
            topic.subscribe(this.domNode.id +"searchBarbecue",lang.hitch(this,"onSearchBarbecue"));
            //默认国控点
            this._searchIndex = "gController";
            this._searchInput.set("placeHolder","查找国控监测点");
            this._searchDomNodeId = this._searchGControl.domNode;
            domStyle.set(this.searchGControlNode,"background-image","url('./widgets/assets/images/searchList_back.png')");
            domStyle.set(this.searchGControlNode,"color","white");
            //this._searchIndex = "all";
            //this._searchDomNodeId = this._searchAll.domNode;
            //domStyle.set(this.searchAllNode,"background-image","url('./widgets/assets/images/searchList_back.png')");
            //domStyle.set(this.searchAllNode,"color","white");
            //on(this.searchAllNode,"mouseover",lang.hitch(this,function(){
            //    domStyle.set(this.searchAllNode,"background-color","#dddddd");
            //}));
            //on(this.searchAllNode,"mouseout",lang.hitch(this,function(){
            //    domStyle.set(this.searchAllNode,"background-color","white");
            //}));
            //on(this.searchAllNode,"mousedown",lang.hitch(this,function(){
            //    if (this._searchIndex == "all"){
            //    }else{
            //        domStyle.set(this._searchDomNodeId,"background-image","none");
            //        domStyle.set(this._searchDomNodeId,"color","black");
            //        this._searchIndex = "all";
            //        this._searchDomNodeId = this._searchAll.domNode;
            //    }
            //    domStyle.set(this.searchAllNode,"background-image","url('./widgets/assets/images/searchList_back.png')");
            //    domStyle.set(this.searchAllNode,"color","white");
            //    this._searchInput.set("placeHolder","查找名称或地址");
            //    domStyle.set(this.searchLayerPaneNode,"display","none");
            //    domStyle.set(this.menuButtonNode,"background-image","url('./widgets/assets/images/pointerbottom.png')");
            //}));
            on(this.searchGControlNode,"mouseover",lang.hitch(this,function(){
                domStyle.set(this.searchGControlNode,"background-color","#dddddd");
            }));
            on(this.searchGControlNode,"mouseout",lang.hitch(this,function(){
                domStyle.set(this.searchGControlNode,"background-color","white");
            }));
            on(this.searchGControlNode,"mousedown",lang.hitch(this,function(){
                if (this._searchIndex == "gController"){
                }else{
                    domStyle.set(this._searchDomNodeId,"background-image","none");
                    domStyle.set(this._searchDomNodeId,"color","black");
                    this._searchIndex = "gController";
                    this._searchDomNodeId = this._searchGControl.domNode;
                }
                domStyle.set(this.searchGControlNode,"background-image","url('./widgets/assets/images/searchList_back.png')");
                domStyle.set(this.searchGControlNode,"color","white");
                this._searchInput.set("placeHolder","查找国控监测点");
                domStyle.set(this.searchLayerPaneNode,"display","none");
                domStyle.set(this.menuButtonNode,"background-image","url('./widgets/assets/images/pointerbottom.png')");
            }));
            on(this.searchWControlNode,"mouseover",lang.hitch(this,function(){
                domStyle.set(this.searchWControlNode,"background-color","#dddddd");
            }));
            on(this.searchWControlNode,"mouseout",lang.hitch(this,function(){
                domStyle.set(this.searchWControlNode,"background-color","white");
            }));
            on(this.searchWControlNode,"mousedown",lang.hitch(this,function(){
                if (this._searchIndex == "wController"){
                }else{
                    domStyle.set(this._searchDomNodeId,"background-image","none");
                    domStyle.set(this._searchDomNodeId,"color","black");
                    this._searchIndex = "wController";
                    this._searchDomNodeId = this._searchWControl.domNode;
                }
                domStyle.set(this.searchWControlNode,"background-image","url('./widgets/assets/images/searchList_back.png')");
                domStyle.set(this.searchWControlNode,"color","white");
                this._searchInput.set("placeHolder","查找微监测点");
                domStyle.set(this.searchLayerPaneNode,"display","none");
                domStyle.set(this.menuButtonNode,"background-image","url('./widgets/assets/images/pointerbottom.png')");
            }));
            //on(this.searchCaseInfoNode,"mouseover",lang.hitch(this,function(){
            //    domStyle.set(this.searchCaseInfoNode,"background-color","#dddddd");
            //}));
            //on(this.searchCaseInfoNode,"mouseout",lang.hitch(this,function(){
            //    domStyle.set(this.searchCaseInfoNode,"background-color","white");
            //}));
            //on(this.searchCaseInfoNode,"mousedown",lang.hitch(this,function(){
            //    if (this._searchIndex == "caseInfo"){
            //    }else{
            //        domStyle.set(this._searchDomNodeId,"background-image","none");
            //        domStyle.set(this._searchDomNodeId,"color","black");
            //        this._searchIndex = "caseInfo";
            //        this._searchDomNodeId = this._searchCaseInfo.domNode;
            //    }
            //    domStyle.set(this.searchCaseInfoNode,"background-image","url('./widgets/assets/images/searchList_back.png')");
            //    domStyle.set(this.searchCaseInfoNode,"color","white");
            //    this._searchInput.set("placeHolder","查找案件类型或地址");
            //    domStyle.set(this.searchLayerPaneNode,"display","none");
            //    domStyle.set(this.menuButtonNode,"background-image","url('./widgets/assets/images/pointerbottom.png')");
            //}));
            on(this.searchSiteNode,"mouseover",lang.hitch(this,function(){
                domStyle.set(this.searchSiteNode,"background-color","#dddddd");
            }));
            on(this.searchSiteNode,"mouseout",lang.hitch(this,function(){
                domStyle.set(this.searchSiteNode,"background-color","white");
            }));
            on(this.searchSiteNode,"mousedown",lang.hitch(this,function(){
                if (this._searchIndex == "sitePollution"){
                }else{
                    domStyle.set(this._searchDomNodeId,"background-image","none");
                    domStyle.set(this._searchDomNodeId,"color","black");
                    this._searchIndex = "sitePollution";
                    this._searchDomNodeId = this._searchSite.domNode;
                }
                domStyle.set(this.searchSiteNode,"background-image","url('./widgets/assets/images/searchList_back.png')");
                domStyle.set(this.searchSiteNode,"color","white");
                this._searchInput.set("placeHolder","查找工地名称或地址");
                domStyle.set(this.searchLayerPaneNode,"display","none");
                domStyle.set(this.menuButtonNode,"background-image","url('./widgets/assets/images/pointerbottom.png')");
            }));
            on(this.searchCarNode,"mouseover",lang.hitch(this,function(){
                domStyle.set(this.searchCarNode,"background-color","#dddddd");
            }));
            on(this.searchCarNode,"mouseout",lang.hitch(this,function(){
                domStyle.set(this.searchCarNode,"background-color","white");
            }));
            on(this.searchCarNode,"mousedown",lang.hitch(this,function(){
                if (this._searchIndex == "carPollution"){
                }else{
                    domStyle.set(this._searchDomNodeId,"background-image","none");
                    domStyle.set(this._searchDomNodeId,"color","black");
                    this._searchIndex = "carPollution";
                    this._searchDomNodeId = this._searchCar.domNode;
                }
                domStyle.set(this.searchCarNode,"background-image","url('./widgets/assets/images/searchList_back.png')");
                domStyle.set(this.searchCarNode,"color","white");
                this._searchInput.set("placeHolder","查找大车位置");
                domStyle.set(this.searchLayerPaneNode,"display","none");
                domStyle.set(this.menuButtonNode,"background-image","url('./widgets/assets/images/pointerbottom.png')");
            }));
            on(this.searchCoalNode,"mouseover",lang.hitch(this,function(){
                domStyle.set(this.searchCoalNode,"background-color","#dddddd");
            }));
            on(this.searchCoalNode,"mouseout",lang.hitch(this,function(){
                domStyle.set(this.searchCoalNode,"background-color","white");
            }));
            on(this.searchCoalNode,"mousedown",lang.hitch(this,function(){
                if (this._searchIndex == "coalPollution"){
                }else{
                    domStyle.set(this._searchDomNodeId,"background-image","none");
                    domStyle.set(this._searchDomNodeId,"color","black");
                    this._searchIndex = "coalPollution";
                    this._searchDomNodeId = this._searchCoal.domNode;
                }
                domStyle.set(this.searchCoalNode,"background-image","url('./widgets/assets/images/searchList_back.png')");
                domStyle.set(this.searchCoalNode,"color","white");
                this._searchInput.set("placeHolder","查找煤经销点名称或地址");
                domStyle.set(this.searchLayerPaneNode,"display","none");
                domStyle.set(this.menuButtonNode,"background-image","url('./widgets/assets/images/pointerbottom.png')");
            }));
            on(this.searchExposedLandNode,"mouseover",lang.hitch(this,function(){
                domStyle.set(this.searchExposedLandNode,"background-color","#dddddd");
            }));
            on(this.searchExposedLandNode,"mouseout",lang.hitch(this,function(){
                domStyle.set(this.searchExposedLandNode,"background-color","white");
            }));
            on(this.searchExposedLandNode,"mousedown",lang.hitch(this,function(){
                if (this._searchIndex == "exposedLandPollution"){
                }else{
                    domStyle.set(this._searchDomNodeId,"background-image","none");
                    domStyle.set(this._searchDomNodeId,"color","black");
                    this._searchIndex = "exposedLandPollution";
                    this._searchDomNodeId = this._searchExposedLand.domNode;
                }
                domStyle.set(this.searchExposedLandNode,"background-image","url('./widgets/assets/images/searchList_back.png')");
                domStyle.set(this.searchExposedLandNode,"color","white");
                this._searchInput.set("placeHolder","查找裸露土地地址");
                domStyle.set(this.searchLayerPaneNode,"display","none");
                domStyle.set(this.menuButtonNode,"background-image","url('./widgets/assets/images/pointerbottom.png')");
            }));
            on(this.searchBarbecueNode,"mouseover",lang.hitch(this,function(){
                domStyle.set(this.searchBarbecueNode,"background-color","#dddddd");
            }));
            on(this.searchBarbecueNode,"mouseout",lang.hitch(this,function(){
                domStyle.set(this.searchBarbecueNode,"background-color","white");
            }));
            on(this.searchBarbecueNode,"mousedown",lang.hitch(this,function(){
                if (this._searchIndex == "barbecuePollution"){
                }else{
                    domStyle.set(this._searchDomNodeId,"background-image","none");
                    domStyle.set(this._searchDomNodeId,"color","black");
                    this._searchIndex = "barbecuePollution";
                    this._searchDomNodeId = this._searchBarbecue.domNode;
                }
                domStyle.set(this.searchBarbecueNode,"background-image","url('./widgets/assets/images/searchList_back.png')");
                domStyle.set(this.searchBarbecueNode,"color","white");
                this._searchInput.set("placeHolder","查找烧烤名称或地址");
                domStyle.set(this.searchLayerPaneNode,"display","none");
                domStyle.set(this.menuButtonNode,"background-image","url('./widgets/assets/images/pointerbottom.png')");
            }));
        },
        _searchAllData:function() {
            if (this._searchInput.value != "") {
                xhr.post(this._projectName + "/widgets/handler/Search.ashx", {
                    handleAs: "text",
                    data: {
                        methodName: "SearchAllData",
                        index: this._searchIndex,
                        where: this._searchInput.value
                    }
                }).then(lang.hitch(this, function (result) {
                    if (result) {
                        topic.publish(this.domNode.id + "searchAll", true);
                    }
                    this._displayPoints(result);
                }), lang.hitch(this, function (error) {
                    console.log("查找污染源时返回错误：" + error);
                }));
            }
        },
        _searchGControllerData: function () {
            if(this._searchInput.value != "") {
                xhr.post(this._projectName + "/widgets/handler/Search.ashx", {
                    handleAs: "text",
                    data: {
                        methodName: "SearchControllerData",
                        where: this._searchInput.value,
                        JcType: "1"
                    }
                }).then(lang.hitch(this, function (result) {
                    if(result) {
                        topic.publish(this.domNode.id + "searchGController", true);
                    }
                    this._displayPoints(result);
                }), lang.hitch(this, function (error) {
                    console.log("查找国控监测点时返回错误：" + error);
                }));
            }
        },
        _searchWControllerData:function(){
            if(this._searchInput.value != "") {
                xhr.post(this._projectName + "/widgets/handler/Search.ashx", {
                    handleAs: "text",
                    data: {
                        methodName: "SearchControllerData",
                        where: this._searchInput.value,
                        JcType: "2"
                    }
                }).then(lang.hitch(this, function (result) {
                    if (result) {
                        topic.publish(this.domNode.id + "searchWController", true);
                    }
                    this._displayPoints(result);
                }), lang.hitch(this, function (error) {
                    console.log("查找微监测点时返回错误：" + error);
                }));
            }
        },
        //_searchCaseInfoData:function(){
        //    xhr.post(this._projectName + "/widgets/handler/Search.ashx", {
        //        handleAs: "text",
        //        data: {
        //            methodName: "SearchCaseInfoData",
        //            where: this._searchInput.value
        //        }
        //    }).then(lang.hitch(this, function (result) {
        //        if(result) {
        //            topic.publish(this.domNode.id +"searchCaseInfo",true);
        //            this._displayPoints(eval("(" + result + ")"));
        //        }
        //    }), lang.hitch(this, function (error) {
        //        console.log("查找案件时返回错误：" + error);
        //    }));
        //},
        _searchSiteData:function(){
            if(this._searchInput.value != "") {
                xhr.post(this._projectName + "/widgets/handler/Search.ashx", {
                    handleAs: "text",
                    data: {
                        methodName: "SearchSiteData",
                        where: this._searchInput.value,
                        industryCode: "03"
                    }
                }).then(lang.hitch(this, function (result) {
                    if (result) {
                        topic.publish(this.domNode.id + "searchSite", true);
                    }
                    this._displayPoints(result);
                }), lang.hitch(this, function (error) {
                    console.log("查找工地污染源时返回错误：" + error);
                }));
            }
        },
        _SearchCarData:function(){
            if(this._searchInput.value != "") {
                xhr.post(this._projectName + "/widgets/handler/Search.ashx", {
                    handleAs: "text",
                    data: {
                        methodName: "SearchCarData",
                        where: this._searchInput.value,
                        industryCode: "04"
                    }
                }).then(lang.hitch(this, function (result) {
                    if (result) {
                        topic.publish(this.domNode.id + "searchCar", true);
                    }
                    this._displayPoints(result);
                }), lang.hitch(this, function (error) {
                    console.log("查找大车位置时返回错误：" + error);
                }));
            }
        },
        _searchCoalData:function(){
            if(this._searchInput.value != "") {
                xhr.post(this._projectName + "/widgets/handler/Search.ashx", {
                    handleAs: "text",
                    data: {
                        methodName: "SearchCoalData",
                        where: this._searchInput.value,
                        industryCode: "05"
                    }
                }).then(lang.hitch(this, function (result) {
                    if (result) {
                        topic.publish(this.domNode.id + "searchCoal", true);
                    }
                    this._displayPoints(result);
                }), lang.hitch(this, function (error) {
                    console.log("查找煤经销点时返回错误：" + error);
                }));
            }
        },
        _searchExposedLandData:function(){
            if(this._searchInput.value != "") {
                xhr.post(this._projectName + "/widgets/handler/Search.ashx", {
                    handleAs: "text",
                    data: {
                        methodName: "SearchExposedLandData",
                        where: this._searchInput.value,
                        industryCode: "06"
                    }
                }).then(lang.hitch(this, function (result) {
                    if (result) {
                        topic.publish(this.domNode.id + "searchExposedLand", true);
                    }
                    this._displayPoints(result);
                }), lang.hitch(this, function (error) {
                    console.log("查找裸露土地点时返回错误：" + error);
                }));
            }
        },
        _searchBarbecueData:function(){
            if(this._searchInput.value != "") {
                xhr.post(this._projectName + "/widgets/handler/Search.ashx", {
                    handleAs: "text",
                    data: {
                        methodName: "SearchBarbecueData",
                        where: this._searchInput.value,
                        industryCode: "07"
                    }
                }).then(lang.hitch(this, function (result) {
                    if (result) {
                        topic.publish(this.domNode.id + "searchBarbecue", true);
                    }
                    this._displayPoints(result);
                }), lang.hitch(this, function (error) {
                    console.log("查找烧烤点时返回错误：" + error);
                }));
            }
        },
        onSearchGController: function (value) {},
        onSearchWController:function(value){},
        //onSearchCaseInfo:function(value){},
        onSearchSite:function(value){},
        onSearchCar:function(value){},
        onSearchCoal:function(value){},
        onSearchExposedLand:function(value){},
        onSearchBarbecue:function(value){},
        _displayPoints: function (itemString) {
            var layer = this.map.getLayer("searchResult");
            layer.clear();
            if(itemString) {
                items = eval("(" + itemString + ")");
                var graphics = [];
                if (!layer.visible) {
                    layer.setVisibility(true);
                }
                for (var item in items) {
                    var point = new Point(items[item].x, items[item].y, this.map.spatialReference);
                    var symbol = new PictureMarkerSymbol({
                        "url": this._projectName + "/widgets/assets/images/temp.png",
                        "height": 21,
                        "width": 21
                    });
                    var attr = {
                        "type": this._searchIndex
                    };
                    var graphic = new Graphic(point, symbol, attr);
                    layer.add(graphic);
                    graphics.push(graphic);
                }
                if (graphics != []) {
                    this._zoomToGraphics(graphics);
                }
            }
        },
        _zoomToGraphics:function(graphics){
            /// <summary>
            /// 将graphics缩放到到地图
            /// </summary>
            /// <param name="graphics">图形</param>
            var maxExtent;
            if (dojo.isArray(graphics)) {
                maxExtent = this._getPointExtent(graphics[0].geometry);
                array.forEach(graphics, lang.hitch(this,function (graphic, i) {
                    var extent = this._getPointExtent(graphic.geometry);
                    maxExtent = this._getMaxExtent(maxExtent, extent);
                }));
            }
            else {
                maxExtent = this._getPointExtent(graphics.geometry);
            }
            this.map.setExtent(maxExtent);
        },
        _getPointExtent:function(point){
            /// <summary>
            /// 计算Point的最优显示范围
            /// </summary>
            /// <param name="point">点</param>
            /// <returns type="">显示范围</returns>
            var extent = new Extent(parseFloat(point.x)-0.03,parseFloat(point.y)-0.03
                ,parseFloat(point.x)+0.03,parseFloat(point.y)+0.03,this.map.spatialReference);
            return extent;
        },
        _getMaxExtent:function(maxExtent, extent){
            /// <summary>
            /// 获取最大地图范围
            /// </summary>
            /// <param name="maxExtent">最大地图范围</param>
            /// <param name="extent">对比地图范围</param>
            /// <returns type="">返回最大地图范围</returns>
            if (maxExtent.xmin > extent.xmin) {
                maxExtent.xmin = extent.xmin;
            }
            if (maxExtent.xmax < extent.xmax) {
                maxExtent.xmax = extent.xmax;
            }
            if (maxExtent.ymin > extent.ymin) {
                maxExtent.ymin = extent.ymin;
            }
            if (maxExtent.ymax < extent.ymax) {
                maxExtent.ymax = extent.ymax;
            }
            return maxExtent;
        }
    });
    return Search;
});