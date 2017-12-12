/**
 * Created by Administrator on 2015/10/6.
 */
define([
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/data/ItemFileWriteStore",
    "dojo/dom-style",
    "dojo/dom-attr",
    "dojo/request/xhr",
    "dojo/text!./templates/WCtrlInfo.html",
    "dojo/topic",
    "dijit/layout/ContentPane",
    "dojox/charting/Chart",
    "dojox/charting/themes/MiamiNice",
    "dojox/charting/plot2d/Columns",
    "dojox/charting/plot2d/Lines",
    "dojox/charting/action2d/Highlight",
    "dojox/charting/action2d/Tooltip",
    "dojox/charting/plot2d/Markers",
    "dojox/charting/axis2d/Default",
    "dojox/grid/DataGrid",
    "dojox/grid/EnhancedGrid",
    "widgets/_Widget",
    "dojo/domReady!"
], function (
    array,
    declare,
    lang,
    ItemFileWriteStore,
    domStyle,
    domAttr,
    xhr,
    template,
    topic,
    ContentPane,
    Chart,
    theme,
    Columns,
    Lines,
    Highlight,
    Tooltip,
    Markers,
    DefaultAi,
    DataGrid,
    EnhancedGrid,
    _Widget
) {
    var t = declare("widgets.WCtrlInfo", _Widget, {
        title: null,
        code: null,        
        //检测点类型，1为国控点，2为微监控点。
        jcType: null,
        index: null,
        data: null,
        id: null,
        purDeviceId: null,
        templateString: template,
        constructor: function (para) {
            if (para != undefined) {
                if ("code" in para) {
                    this.code = para.code;
                }
                if ("title" in para) {
                    this.title = para.title;
                }
                if ("jcType" in para) {
                    this.jcType = para.jcType;
                }
                if ("index" in para) {
                    this.index = para.index;
                }
                if ("datas" in para) {
                    this.data = para.datas;
                }
                if ("id" in para) {
                    this.id = para.id;
                }
                if ("purDeviceId" in para) {
                    this.purDeviceId = para.purDeviceId;
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
            this._border = new ContentPane({
                style: "border: 1px solid darkgrey;"
            }, this.borderNode);
            this._titlePane = new ContentPane({
            }, this.wCtrlTitleNode);
            this._attrInfoPane = new ContentPane({
            }, this.wCtrlInfoGridNode);
            switch (this.jcType) {
                case "1":
                    {
                        this._getGCtrlInfo();
                    }
                    break;
                case "2":
                    {
                        this._getWCtrlInfo();
                    }
                    break;
                case "3":
                    {
                        this._getSCtrlInfo();
                    }
                    break;
                case "4":
                    {
                        this._getDirtyAnalyzeInfo();
                    }
                    break;
                case "5":
                    {
                        this._getYangchenInfo();
                        this._getYangchentuInfo();
                    }
                    break;
                case "6":
                    {
                        this._getYouyanInfo();
                        this._getYouyantuInfo();
                    }
                    break;
                default:
                    break;
            }
            topic.subscribe(this.domNode.id + "close", lang.hitch(this, "onClick"));
        },
        close: function () {
            topic.publish(this.domNode.id + "close", true);
        },
        startup: function () {
            this.inherited(arguments);
            this._border.startup();

        },
        _getGCtrlInfo: function () {
            xhr.post(this._projectName + "/widgets/handler/ControllerInfo.ashx", {
                handleAs: "text",
                data: {
                    methodName: "GetGControllerInfo",
                    code: this.code
                }
            }).then(lang.hitch(this, function (gCtrlInfo) {
                var gCtrlData = eval("(" + gCtrlInfo + ")");
                var len = gCtrlData.length;
                var lateAttr = gCtrlData[len - 1];
                this._gCtrlContent(lateAttr);
                this._gCtrlChartInfo(gCtrlData, this.index);
            }), lang.hitch(this, function (error) {
                console.log("获取该国控点最近24小时数据时返回错误：" + error);
            }));
        },
        _gCtrlContent: function (attr) {
            /// <summary>
            /// 组装该监控点的表格数据
            /// </summary>
            /// <param name="attr">最新的一条数据</param>
            this._colorFunc = function (indexValue) {
                switch (indexValue) {
                    case "0501":
                        {
                            return "#6ec129";
                            break;
                        }
                    case "0502":
                        {
                            return "#fac305";
                            break;
                        }
                    case "0503":
                        {
                            return "#fd5b30";
                            break;
                        }
                    case "0504":
                        {
                            return "#ba1d26";
                            break;
                        }
                    case "0505":
                        {
                            return "#b414bb";
                            break;
                        }
                    case "0506":
                        {
                            return "#6f0474";
                            break;
                        }
                    default:
                        return "#6ec129";
                        break;
                }
            };
            if (attr.sywrw === "pm2_5" || attr.sywrw === "pm_25") attr.sywrw = "PM2.5";
            var content = "<table border=1 style='text-align: center;border-collapse:collapse;padding:0;margin:0;'>" +
                "<tr><td style='width: 80px;height:20px;'>AQI</td><td style='width: 80px;background-color:" + this._colorFunc(attr.AQIStatus) + ";color:#FFF;'>" + attr.AQI + "</td>" +
                "<td style='width: 80px;'>首要污染</td><td style='width:80px;'>" + attr.sywrw + "</td></tr>" +
                "<tr><td style='height:20px;'>PM2.5</td><td style='background-color:" + this._colorFunc(attr.PM25Status) + ";color:#FFF;'>" + attr.PM25nd + "</td>" +
                "<td>PM10</td><td style='background-color:" + this._colorFunc(attr.PM10Status) + ";color:#FFF;'>" + attr.PM10nd + "</td></tr>" +
                "<tr><td style='height:20px;'>CO</td><td style='background-color:" + this._colorFunc(attr.COStatus) + ";color:#FFF;'>" + attr.COnd + "</td>" +
                "<td>NO2</td><td style='background-color:" + this._colorFunc(attr.NO2Status) + ";color:#FFF;'>" + attr.NO2nd + "</td></tr>" +
                "<tr><td style='height:20px;'>SO2</td><td style='background-color:" + this._colorFunc(attr.SO2Status) + ";color:#FFF;'>" + attr.SO2nd + "</td>" +
                "<td>O3</td><td style='background-color:" + this._colorFunc(attr.O3Status) + ";color:#FFF;'>" + attr.O3nd + "</td></tr>" +
                "<tr><td style='height:20px;'>空气等级</td><td>" + attr.StatusName + "</td><td>站点类型</td><td>国控点</td></tr>" +
                "<tr><td style='height:20px;'>更新时间</td><td colspan='3'>" + attr.MonitoringTime + "</td></tr></table>";
            this._attrInfoPane.set("content", content);
        },
        _getDateArray: function (minDate) {
            var date = {};
            for (var i = 0; i < 24; i++) {
                date[1] = "";
            }
        },
        _gCtrlChartInfo: function (attrInfo, index) {
            /// <summary>
            /// 显示最近24小时PM2.5变化趋势柱状图
            /// </summary>    

            var chartLabel = new ContentPane({
                innerHTML: "最近24小时" + index + "变化趋势",
                style: "padding:0;width:350px;height:24px;line-height:24px;"
            }, this.chartLabelNode);
            //Chart
            var chartData = [];
            var dateArray = {};
            switch (index) {
                case "AQI":
                    {
                        array.forEach(attrInfo, lang.hitch(this, function (item) {
                            chartData.push({ y: item.AQI, status: item.AQIStatus });
                        }));
                        break;
                    }
                case "PM2.5":
                    {
                        array.forEach(attrInfo, lang.hitch(this, function (item) {
                            chartData.push({ y: item.PM25nd, status: item.PM25Status });
                        }));
                        break;
                    }
                case "PM10":
                    {
                        array.forEach(attrInfo, lang.hitch(this, function (item) {
                            chartData.push({ y: item.PM10nd, status: item.PM10Status });
                        }));
                        break;
                    }
                case "CO":
                    {
                        array.forEach(attrInfo, lang.hitch(this, function (item) {
                            chartData.push({ y: item.COnd, status: item.COStatus });
                        }));
                        break;
                    }
                case "NO2":
                    {
                        array.forEach(attrInfo, lang.hitch(this, function (item) {
                            chartData.push({ y: item.NO2nd, status: item.NO2Status });
                        }));
                        break;
                    }
                case "SO2":
                    {
                        array.forEach(attrInfo, lang.hitch(this, function (item) {
                            chartData.push({ y: item.SO2nd, status: item.SO2Status });
                        }));
                        break;
                    }
                case "O3":
                    {
                        array.forEach(attrInfo, lang.hitch(this, function (item) {
                            chartData.push({ y: item.O3nd, status: item.O3Status });
                        }));
                        break;
                    }
                default:
                    chartData.push({ y: parseInt("0"), status: "0501" });
                    break;
            }
            var chart = new Chart(this.chartContentNode);
            // Set the theme
            chart.setTheme(theme);
            // Add the only/default plot
            chart.addPlot("default", {
                type: Columns,
                markers: true,
                gap: 2.5,
                stroke: "gray",
                length: 0,
                styleFunc: function (item) {
                    switch (item.status) {
                        case "0501":
                            {
                                return { fill: "#6ec129" };
                                break;
                            }
                        case "0502":
                            {
                                return { fill: "#fac305" };
                                break;
                            }
                        case "0503":
                            {
                                return { fill: "#fd5b30" };
                                break;
                            }
                        case "0504":
                            {
                                return { fill: "#ba1d26" };
                                break;
                            }
                        case "0505":
                            {
                                return { fill: "#b414bb" };
                                break;
                            }
                        case "0506":
                            {
                                return { fill: "#6f0474" };
                                break;
                            }
                        default:
                            return { fill: "#6ec129" };
                            break;
                    }
                }
            });
            // Add axes
            //chart.addAxis("x");
            chart.addAxis("x", {
                labelFunc: function (index) {
                    return index;
                }, minorTicks: true
            });
            chart.addAxis("y", { vertical: true, fixLower: "major", fixUpper: "major" });
            // Add the series of data
            chart.addSeries("Quality", chartData);
            // Highlight!
            var anim1 = new Highlight(chart, "default");
            var anim2 = new Tooltip(chart, "default", {
                text: function (args) {
                    if (index == "AQI") {
                        return attrInfo[args.x].MonitoringTime +
                            "<br/>" + index + ":" + args.y.y;
                    } else {
                        return attrInfo[args.x].MonitoringTime +
                            "<br/>" + index + ":" + args.y.y + "ug/m³";
                    }
                }
            });
            //domStyle.set(this.domNode,"height","355px");
            // Render the chart!
            chart.render();
        },








        _getWCtrlInfo: function () {
            xhr.post(this._projectName + "/widgets/handler/ControllerInfo.ashx", {
                handleAs: "text",
                data: {
                    methodName: "GetWControllerInfo",
                    code: this.code
                }
            }).then(lang.hitch(this, function (wCtrlInfo) {
                var wCtrlData = eval("(" + wCtrlInfo + ")");
                var len = wCtrlData.length;
                var lateAttr = wCtrlData[len - 1];
                this._wCtrlContent(lateAttr);
                this._wCtrlChartInfo(wCtrlData);
            }), lang.hitch(this, function (error) {
                console.log("获取该微监控点最近24小时数据时返回错误：" + error);
            }));
        },
        _wCtrlContent: function (attr) {
            /// <summary>
            /// 组装该监控点的表格数据
            /// </summary>
            /// <param name="attr">最新的一条数据</param>
            var content = "<table border=1 style='text-align: center;border-collapse:collapse;padding:0;margin:0;'>" +
                "<tr><td style='width: 80px;height:20px;'>AQI</td><td style='width: 80px;'>" + attr.AQI + "</td>" +
                "<td style='width: 80px;'>PM2.5</td><td style='width: 80px;'>" + attr.PM25 + "</td></tr>" +
                "<tr><td style='height:20px;'>空气等级</td><td style='background-color:" + attr.StatusColour +
                ";color:white '>" + attr.StatusName + "</td><td>站点类型</td><td>微环境点</td></tr>" +
                "<tr><td style='height:20px;'>更新时间</td><td colspan='3'>" + attr.MonitoringTime + "</td></tr></table>";
            this._attrInfoPane.set("content", content);
        },
        _wCtrlChartInfo: function (attrInfo) {
            /// <summary>
            /// 显示最近24小时PM2.5变化趋势柱状图
            /// </summary>    
            var chartLabel = new ContentPane({
                innerHTML: "最近24小时PM2.5变化趋势",
                style: "padding:0;width:350px;height:24px;line-height:24px;"
            }, this.chartLabelNode);
            //Chart
            var chartData = [];
            array.forEach(attrInfo, lang.hitch(this, function (item) {
                chartData.push({ y: parseInt(item.PM25), status: item.PM25Status });
                //items.push(item.PM25);
            }));
            var chart = new Chart(this.chartContentNode);
            // Set the theme
            chart.setTheme(theme);

            // Add the only/default plot
            chart.addPlot("default", {
                type: Columns,
                markers: true,
                gap: 1.3,
                stroke: "gray",
                length: 0,
                styleFunc: function (item) {
                    switch (item.status) {
                        case "0501":
                            {
                                return { fill: "#6ec129" };
                                break;
                            }
                        case "0502":
                            {
                                return { fill: "#fac305" };
                                break;
                            }
                        case "0503":
                            {
                                return { fill: "#fd5b30" };
                                break;
                            }
                        case "0504":
                            {
                                return { fill: "#ba1d26" };
                                break;
                            }
                        case "0505":
                            {
                                return { fill: "#b414bb" };
                                break;
                            }
                        case "0506":
                            {
                                return { fill: "#6f0474" };
                                break;
                            }
                        default:
                            return { fill: "#6ec129" };
                            break;
                    }
                }
                //    styleFunc: function (item) {
                //    if (item.y >= 0 && item.y <= 50) {
                //        return {fill: "#6ec129"};
                //    } else if (item.y >= 51 && item.y <= 100) {
                //        return {fill: "#fac305"};
                //    } else if (item.y >= 101 && item.y <= 150) {
                //        return {fill: "#fd5b30"};
                //    }
                //    else if (item.y >= 151 && item.y <= 200) {
                //        return {fill: "#ba1d26"};
                //    }
                //    else if (item.y >= 201 && item.y <= 300) {
                //        return {fill: "#b414bb"};
                //    } else if (item.y > 300) {
                //        return {fill: "#6f0474"};
                //    }
                //    else {
                //        return {fill: "#6ec129"};
                //    }
                //}
            });
            // Add axes
            chart.addAxis("x", {
                labelFunc: function (index) {
                    return index;
                }, minorTicks: true
            });
            chart.addAxis("y", { vertical: true, fixLower: "major", fixUpper: "major" });
            // Add the series of data
            chart.addSeries("AirQuality", chartData);
            // Highlight!
            var anim1 = new Highlight(chart, "default");
            var anim2 = new Tooltip(chart, "default", {
                text: function (args) {
                    return attrInfo[args.x].MonitoringTime +
                            "<br/>PM2.5：" + args.y.y + "ug/m³";
                }
            });
            // Render the chart!
            chart.render();
        },

        _getSCtrlInfo: function () {
            xhr.post(this._projectName + "/widgets/handler/ControllerInfo.ashx", {
                handleAs: "text",
                data: {
                    methodName: "GetSControllerInfo",
                    code: this.code
                }
            }).then(lang.hitch(this, function (wCtrlInfo) {
                var wCtrlData = eval("(" + wCtrlInfo + ")");
                var len = wCtrlData.length;
                var lateAttr = wCtrlData[len - 1];
                this._sCtrlContent(lateAttr);
                this._sCtrlChartInfo(wCtrlData);
            }), lang.hitch(this, function (error) {
                console.log("获取该微监控点最近24小时数据时返回错误：" + error);
            }));
        },
        _sCtrlContent: function (attr) {
            /// <summary>
            /// 组装该监控点的表格数据
            /// </summary>
            /// <param name="attr">最新的一条数据</param>
            var content = "<table border=1 style='text-align: center;border-collapse:collapse;padding:0;margin:0;'>" +
                "<tr><td style='width: 80px;height:20px;'>AQI</td><td style='width: 80px;'>" + attr.AQI + "</td>" +
                "<td style='width: 80px;'>PM2.5</td><td style='width: 80px;'>" + attr.PM25 + "</td></tr>" +
                "<tr><td style='height:20px;'>空气等级</td><td style='background-color:" + attr.StatusColour +
                ";color:white '>" + attr.StatusName + "</td><td>站点类型</td><td>微环境点</td></tr>" +
                "<tr><td style='height:20px;'>更新时间</td><td colspan='3'>" + attr.MonitoringTime + "</td></tr></table>";
            this._attrInfoPane.set("content", content);
        },
        _sCtrlChartInfo: function (attrInfo) {
            /// <summary>
            /// 显示最近24小时PM2.5变化趋势柱状图
            /// </summary>    
            var chartLabel = new ContentPane({
                innerHTML: "最近24小时PM2.5变化趋势",
                style: "padding:0;width:350px;height:24px;line-height:24px;"
            }, this.chartLabelNode);
            //Chart
            var chartData = [];
            array.forEach(attrInfo, lang.hitch(this, function (item) {
                chartData.push({ y: parseInt(item.PM25), status: item.PM25Status });
                //items.push(item.PM25);
            }));
            var chart = new Chart(this.chartContentNode);
            // Set the theme
            chart.setTheme(theme);

            // Add the only/default plot
            chart.addPlot("default", {
                type: Columns,
                markers: true,
                gap: 1.3,
                stroke: "gray",
                length: 0,
                styleFunc: function (item) {
                    switch (item.status) {
                        case "0501":
                            {
                                return { fill: "#6ec129" };
                                break;
                            }
                        case "0502":
                            {
                                return { fill: "#fac305" };
                                break;
                            }
                        case "0503":
                            {
                                return { fill: "#fd5b30" };
                                break;
                            }
                        case "0504":
                            {
                                return { fill: "#ba1d26" };
                                break;
                            }
                        case "0505":
                            {
                                return { fill: "#b414bb" };
                                break;
                            }
                        case "0506":
                            {
                                return { fill: "#6f0474" };
                                break;
                            }
                        default:
                            return { fill: "#6ec129" };
                            break;
                    }
                }
            });
            // Add axes
            chart.addAxis("x", {
                labelFunc: function (index) {
                    return index;
                },
                minorTicks: true
            });
            chart.addAxis("y", { vertical: true, fixLower: "major", fixUpper: "major" });
            // Add the series of data
            chart.addSeries("AirQuality", chartData);
            // Highlight!
            var anim1 = new Highlight(chart, "default");
            var anim2 = new Tooltip(chart, "default", {
                text: function (args) {
                    return attrInfo[args.x].MonitoringTime +
                            "<br/>PM2.5：" + args.y.y + "ug/m³";
                }
            });
            // Render the chart!

            chart.render();
        },


        _getDirtyAnalyzeInfo: function () {
            var data = this.data
            //var len = data.count.length;
            //var lateAttr = data.count[len - 1];
            this._DirtyAnalyzeContent(data);
            this._DirtyAnalyzeInfo(data);
        },
        _DirtyAnalyzeContent: function (attr) {
            /// <summary>
            /// 组装该监控点的表格数据
            /// </summary>
            /// <param name="attr">最新的一条数据</param>
            var content = "<table border=1 style='text-align: center;border-collapse:collapse;padding:0;margin:0;'>"
            var conpanynum = 0;
            for (var i = 0; i < attr.length; i++) {
                if (attr[i].length != 0) {
                    if (attr[i][0].attributes.Industry == "101") {
                        content += "<tr><td style='width: 160px;height:20px;'>餐饮</td><td style='width: 160px;'>" + attr[i].length + "</td></tr>"
                    } else if (attr[i][0].attributes.Industry == "104") {
                        content += "<tr><td style='width: 160px;height:20px;'>建筑工地</td><td style='width: 160px;'>" + attr[i].length + "</td></tr>"
                    } else if (attr[i][0].attributes.Industry == "106") {
                        content += "<tr><td style='width: 160px;height:20px;'>污水排放口</td><td style='width: 160px;'>" + attr[i].length + "</td></tr>"
                    } else if (attr[i][0].attributes.Industry == "103") {
                        content += "<tr><td style='width: 160px;height:20px;'>养殖场</td><td style='width: 160px;'>" + attr[i].length + "</td></tr>"
                    } else if (attr[i][0].attributes.Industry == "102") {
                        content += "<tr><td style='width: 160px;height:20px;'>锅炉</td><td style='width: 160px;'>" + attr[i].length + "</td></tr>"
                    } else if (attr[i][0].attributes.Industry == "105") {
                        content += "<tr><td style='width: 160px;height:20px;'>煤经销点</td><td style='width: 160px;'>" + attr[i].length + "</td></tr>"
                    } else if (attr[i][0].attributes.Industry == "108") {
                        content += "<tr><td style='width: 160px;height:20px;'>料土堆</td><td style='width: 160px;'>" + attr[i].length + "</td></tr>"
                    } else if (attr[i][0].attributes.Industry == "109") {
                        content += "<tr><td style='width: 160px;height:20px;'>渣土车</td><td style='width: 160px;'>" + attr[i].length + "</td></tr>"
                    } else if (attr[i][0].attributes.Industry == "110") {
                        content += "<tr><td style='width: 160px;height:20px;'>涉水企业</td><td style='width: 160px;'>" + attr[i].length + "</td></tr>"
                    } else if (attr[i][0].attributes.Industry == "111") {
                        content += "<tr><td style='width: 160px;height:20px;'>排污企业</td><td style='width: 160px;'>" + attr[i].length + "</td></tr>"
                    } else if (attr[i][0].attributes.Industry == "112") {
                        content += "<tr><td style='width: 160px;height:20px;'>涉危废企业</td><td style='width: 160px;'>" + attr[i].length + "</td></tr>"
                    } else if (attr[i][0].attributes.Industry == "113") {
                        content += "<tr><td style='width: 160px;height:20px;'>涉重金属企业</td><td style='width: 160px;'>" + attr[i].length + "</td></tr>"
                    }
                }
            }
            content += "</table>"
            this._attrInfoPane.set("content", content);
        },
        _DirtyAnalyzeInfo: function (attrInfo) {
            /// <summary>
            /// 显示最近24小时PM2.5变化趋势柱状图
            /// </summary>    
            var chartLabel = new ContentPane({
                innerHTML: "此范围内的污染源种类与数量统计",
                style: "padding:0;width:350px;height:24px;line-height:24px;"
            }, this.chartLabelNode);
            //Chart
            var chartData = [];
            var chartxName = [];
            array.forEach(attrInfo, lang.hitch(this, function (item) {
                if (item.length != 0) {
                    chartData.push({ y: parseInt(item.length), selfclass: parseInt(item[0].attributes.Industry) });
                    switch (item[0].attributes.Industry) {
                        case "101": {
                            chartxName.push("餐饮")
                        } break;
                        case "102": {
                            chartxName.push("锅炉")
                        } break;
                        case "103": {
                            chartxName.push("养殖场")
                        } break;
                        case "104": {
                            chartxName.push("建筑工地")
                        } break;
                        case "105": {
                            chartxName.push("煤经销点")
                        } break;
                        case "106": {
                            chartxName.push("污水排放口")
                        } break;
                        case "108": {
                            chartxName.push("料土堆")
                        } break;
                        case "109": {
                            chartxName.push("渣土车")
                        } break;
                        case "110": {
                            chartxName.push("涉水企业")
                        } break;
                        //case "111": {
                        //    chartxName.push("涉气企业")
                        //} break;
                        case "111": {
                            chartxName.push("排污企业")
                        } break;
                        case "112": {
                            chartxName.push("涉危废企业")
                        } break;
                        case "113": {
                            chartxName.push("涉重金属企业")
                        } break;
                    }
                }
            }));
            var chart = new Chart(this.chartContentNode);
            // Set the theme
            chart.setTheme(theme);
            // Add the only/default plot
            chart.addPlot("default", {
                type: Columns,
                markers: true,
                gap: 1.3,//柱子之间的距离
                stroke: "gray",
                length: 0,
                styleFunc: function (item) {
                    if (item.y >= 0 && item.y <= 5) {
                        return { fill: "#6ec129" };
                    } else if (item.y >= 6 && item.y <= 10) {
                        return { fill: "#fac305" };
                    } else if (item.y >= 11 && item.y <= 15) {
                        return { fill: "#fd5b30" };
                    }
                    else if (item.y >= 16 && item.y <= 20) {
                        return { fill: "#ba1d26" };
                    }
                    else if (item.y >= 21 && item.y <= 25) {
                        return { fill: "#b414bb" };
                    }
                    else {
                        return { fill: "red" };
                    }
                }

            });
            // Add axes

            chart.addAxis("x", {
                labelFunc: function (text, value, precision) {
                    return chartxName[text - 1];
                },
                //minorTicks: true
            });
            chart.addAxis("y", { vertical: true, fixLower: "major", fixUpper: "major", includeZero: true });
            // Add the series of data
            chart.addSeries("AirQuality", chartData);
            // Highlight!
            var anim1 = new Highlight(chart, "default"
            );
            var anim2 = new Tooltip(chart, "default", {
                text: function (args) {
                    switch (args.y.selfclass) {
                        case 101: {
                            return "餐饮" + args.y.y + "处";
                        } break;
                        case 102: {
                            return "锅炉" + args.y.y + "处";
                        } break;
                        case 103: {
                            return "养殖场" + args.y.y + "处";
                        } break;
                        case 104: {
                            return "建筑工地" + args.y.y + "处";
                        } break;
                        case 105: {
                            return "煤经销点" + args.y.y + "处";
                        } break;
                        case 106: {
                            return "污水排放口" + args.y.y + "处";
                        } break;
                        case 108: {
                            return "料土堆" + args.y.y + "处";
                        } break;
                        case 109: {
                            return "渣土车" + args.y.y + "处";
                        } break;
                        case 110: {
                            return "涉水企业" + args.y.y + "处";
                        } break;
                        case 111: {
                            return "排污企业" + args.y.y + "处";
                        } break;
                        case 112: {
                            return "涉危废企业" + args.y.y + "处";
                        } break;
                        case 113: {
                            return "涉重金属企业" + args.y.y + "处";
                        } break;
                    }
                }
            });
            // Render the chart!
            var svg = this.chartContentNode.getElementsByTagName("svg")[0];
            domAttr.set(svg, "height", "150")
            domAttr.set(svg, "width", "350")
            chart.render();
        },
        //扬尘
        _getYangchenInfo: function () {
            var th = this;
            var XHR = null;
            if (window.XMLHttpRequest) {
                // 非IE内核  
                XHR = new XMLHttpRequest();
            } else if (window.ActiveXObject) {
                // IE内核,这里早期IE的版本写法不同,具体可以查询下  
                XHR = new ActiveXObject("Microsoft.XMLHTTP");
            } else {
                XHR = null;
            }

            if (XHR) {
                var url = "http://192.168.30.242:8065/api/raise/GetRaiseReal";
                url = url + "?id=" + this.id;
                XHR.open("GET",url,true);
                XHR.onreadystatechange = function () {
                    if (XHR.readyState == 4 && XHR.status == 200) {
                        sController = XHR.responseText;
                        var gCtrlData = eval("(" + sController + ")");
                        var lateAttr = gCtrlData.NewID;
                        th._ycCtrlContent(lateAttr);
                        //th._ycCtrlChartInfo(gCtrlData.NewID, this.index);
                        // 主动释放,JS本身也会回收的  
                        //XHR = null;
                    }
                };
                XHR.send();
            }
        },
        _getYangchentuInfo: function () {
            var th = this;
            var XHR = null;
            if (window.XMLHttpRequest) {
                // 非IE内核  
                XHR = new XMLHttpRequest();
            } else if (window.ActiveXObject) {
                // IE内核,这里早期IE的版本写法不同,具体可以查询下  
                XHR = new ActiveXObject("Microsoft.XMLHTTP");
            } else {
                XHR = null;
            }

            if (XHR) {
                var url = "http://192.168.30.242:8065/api/raise/GetRaiseValuesHistoryHour";
                url = url + "?id=" + this.code + "&totalHour=24";
                XHR.open("GET", url, true);
                console.log(url);
                XHR.onreadystatechange = function () {
                    if (XHR.readyState == 4 && XHR.status == 200) {
                        sController = XHR.responseText;
                        var gCtrlData = eval("(" + sController + ")");
                        var lateAttr = gCtrlData.NewID;
                        //th._ycCtrlContent(lateAttr);
                        th._ycCtrlChartInfo(gCtrlData.Data);
                        // 主动释放,JS本身也会回收的  
                        //XHR = null;
                    }
                };
                XHR.send();
            }
        },
        _ycCtrlContent: function (attr) {
            /// <summary>
            /// 组装该监控点的表格数据
            /// </summary>
            /// <param name="attr">最新的一条数据</param>
            //if (attr.sywrw === "pm2_5" || attr.sywrw === "pm_25") attr.sywrw = "PM2.5";
            var content = "<table border=1 style='text-align: center;border-collapse:collapse;padding:0;margin:0;'>" +
                "<tr><td style='width: 80px;height:20px;'>PM2.5</td><td style='width:80px;'>" + attr.JCJG1PM25 + "</td>" +
                "<td style='width: 80px;'>PM10</td><td style='width:80px;'>" + attr.JCJG2PM10 + "</td></tr>" +
                "<tr><td style='height:20px;'>TSP</td><td>" + attr.JCJG3TSP + "</td>" +
                "<td>噪声</td><td>" + attr.JCJG4ZS + "</td></tr>" +
                "<tr><td style='height:20px;'>温度</td><td>" + attr.JCJG5WD + "</td>" +
                "<td>湿度</td><td>" + attr.JCJG6SD + "</td></tr>" +
                "<tr><td style='height:20px;'>风向</td><td>" + attr.JCJG7FX + "</td>" +
                "<td>风速</td><td>" + attr.JCJG8FS + "</td></tr>" +
                "<tr><td style='height:20px;'>气压</td><td>" + attr.JCJG9QY + "</td>" +
                "<td>负责人姓名</td><td>" + attr.Person + "</td></tr>" +
                "<tr><td style='height:20px;'>更新时间</td><td colspan='3'>" + attr.JCRQSJ + "</td></tr></table>";
            this._attrInfoPane.set("content", content);
        },
        _ycCtrlChartInfo: function (attrInfo) {
            /// <summary>
            /// 显示最近24小时PM2.5变化趋势柱状图
            /// </summary>    
            var chartLabel = new ContentPane({
                innerHTML: "最近24小时PM2.5变化率",
                style: "padding:0;width:350px;height:24px;line-height:24px;"
            }, this.chartLabelNode);
            //Chart
            var chartData = [];
            array.forEach(attrInfo, lang.hitch(this, function (item) {
                chartData.push({ y: parseInt(item.JCJG1PM25) });
                //items.push(item.PM25);
            }));
            var chart = new Chart(this.chartContentNode);
            // Set the theme
            chart.setTheme(theme);

            // Add the only/default plot
            chart.addPlot("default", {
                type: Lines,
                markers: true,
                gap: 1.3,
                stroke: "gray",
                length: 0,
                fill: "#6ec129"
                //styleFunc: function (item) {
                //    switch (item.status) {
                //        case "0501":
                //            {
                //                return { fill: "#6ec129" };
                //                break;
                //            }
                //        case "0502":
                //            {
                //                return { fill: "#fac305" };
                //                break;
                //            }
                //        case "0503":
                //            {
                //                return { fill: "#fd5b30" };
                //                break;
                //            }
                //        case "0504":
                //            {
                //                return { fill: "#ba1d26" };
                //                break;
                //            }
                //        case "0505":
                //            {
                //                return { fill: "#b414bb" };
                //                break;
                //            }
                //        case "0506":
                //            {
                //                return { fill: "#6f0474" };
                //                break;
                //            }
                //        default:
                //            return { fill: "#6ec129" };
                //            break;
                //    }
                //}

            });
            // Add axes
            chart.addAxis("x", {
                labelFunc: function (index) {
                    return index;
                }, minorTicks: true
            });
            chart.addAxis("y", { vertical: true, fixLower: "major", fixUpper: "major" });
            // Add the series of data
            chart.addSeries("AirQuality", chartData);
            // Highlight!
            var anim1 = new Highlight(chart, "default");
            var anim2 = new Tooltip(chart, "default", {
                text: function (args) {
                    return attrInfo[args.x].JCRQSJ +
                            "<br/>PM2.5：" + args.y.y + "ug/m3";
                }
            });
            // Render the chart!
            chart.render();
        },
        //油烟
        _getYouyanInfo: function () {
            var th = this;
            var XHR = null;
            if (window.XMLHttpRequest) {
                // 非IE内核  
                XHR = new XMLHttpRequest();
            } else if (window.ActiveXObject) {
                // IE内核,这里早期IE的版本写法不同,具体可以查询下  
                XHR = new ActiveXObject("Microsoft.XMLHTTP");
            } else {
                XHR = null;
            }

            if (XHR) {
                var url = "http://192.168.30.242:8065/api/soot/GetSootReal";
                url = url + "?id=" + this.id;
                XHR.open("GET", url, true);
                XHR.onreadystatechange = function () {
                    if (XHR.readyState == 4 && XHR.status == 200) {
                        sController = XHR.responseText;
                        var gCtrlData = eval("(" + sController + ")");
                        var lateAttr = gCtrlData.Data;
                        th._yyCtrlContent(lateAttr);
                        //th._yyCtrlChartInfo(gCtrlData.Data, this.index);
                        // 主动释放,JS本身也会回收的  
                        //XHR = null;
                    }
                };
                XHR.send();
            }
        },
        _getYouyantuInfo: function () {
            var th = this;
            var XHR = null;
            if (window.XMLHttpRequest) {
                // 非IE内核  
                XHR = new XMLHttpRequest();
            } else if (window.ActiveXObject) {
                // IE内核,这里早期IE的版本写法不同,具体可以查询下  
                XHR = new ActiveXObject("Microsoft.XMLHTTP");
            } else {
                XHR = null;
            }

            if (XHR) {
                var url = "http://192.168.30.242:8065/api/Soot/GetSootValuesHistoryHour";
                url = url + "?cropId=" + this.id + "&deviceid=" + this.purDeviceId + "&totalHour=24";
                XHR.open("GET", url, true);
                XHR.onreadystatechange = function () {
                    if (XHR.readyState == 4 && XHR.status == 200) {
                        sController = XHR.responseText;
                        var gCtrlData = eval("(" + sController + ")");
                        var lateAttr = gCtrlData.Data;
                        //th._yyCtrlContent(lateAttr);
                        th._yyCtrlChartInfo(gCtrlData.Data);
                        // 主动释放,JS本身也会回收的  
                        //XHR = null;
                    }
                };
                XHR.send();
            }
        },
        _yyCtrlContent: function (attr) {
            /// <summary>
            /// 组装该监控点的表格数据
            /// </summary>
            /// <param name="attr">最新的一条数据</param>
            //if (attr.sywrw === "pm2_5" || attr.sywrw === "pm_25") attr.sywrw = "PM2.5";
            var openStatus = attr.PurRealTimeStatus;
            if (openStatus == 'open') {
                openStatus = '开';
            } else if (openStatus == 'close') {
                openStatus = '关';
            }
            var fjStatus = attr.FanRealTimeStatus;
            if (fjStatus == 'open') {
                fjStatus = '开';
            } else if (fjStatus == 'close') {
                fjStatus = '关';
            }

            var content = "<table border=1 style='text-align: center;border-collapse:collapse;padding:0;margin:0;'>" +
                "<tr><td style='width: 80px;height:20px;'>净化器名称</td><td style='width:80px;'>" + attr.PurifierName + "</td>" +
                "<td style='width: 80px;'>净化器台数</td><td style='width:80px;'>1</td></tr>" +
                "<tr><td style='height:20px;'>净化器开关状态</td><td>" + openStatus + "</td>" +
                "<td>风机名称</td><td>" + attr.FanName + "</td></tr>" +
                "<tr><td style='height:20px;'>风机台数</td><td>1</td>" +
                "<td>风机开关状态</td><td>" + fjStatus + "</td></tr>" +
                "<tr><td style='height:20px;'>出口浓度</td><td>" + attr.ConcentrationOut + "</td>" +
                "<td>净化效率</td><td>" + attr.RealTimeEfficiency + "</td></tr>" +
                "<tr><td style='height:20px;'>地址</td><td colspan='3'>" + attr.Address + "</td>" +
            "<tr><td style='height:20px;'>更新时间</td><td colspan='3'>" + attr.MonitorTime + "</td></tr></table>";
            this._attrInfoPane.set("content", content);
        },
        _yyCtrlChartInfo: function (attrInfo) {
            /// <summary>
            /// 显示最近24小时PM2.5变化趋势柱状图
            /// </summary>    
            var chartLabel = new ContentPane({
                innerHTML: "最近24小时净化器运行时长",
                style: "padding:0;width:350px;height:24px;line-height:24px;"
            }, this.chartLabelNode);
            //Chart
            var chartData = [];
            var charxData = [];
            array.forEach(attrInfo, lang.hitch(this, function (item) {
                chartData.push({ y: parseInt(item.RunTime) });
                //items.push(item.PM25);
            }));
            console.log(chartData);
            array.forEach(attrInfo, lang.hitch(this, function (item) {    
                charxData.push({ x:parseInt(item.RunTime) });
            }));
            console.log(charxData);
            var chart = new Chart(this.chartContentNode);
            // Set the theme
            chart.setTheme(theme);

            // Add the only/default plot
            chart.addPlot("default", {
                type: Columns,
                markers: true,
                gap: 1.3,
                stroke: "gray",
                length: 0,
                fill: "#6ec129"
                //styleFunc: function (item) {
                //    switch (item.status) {
                //        case "0501":
                //            {
                //                return { fill: "#6ec129" };
                //                break;
                //            }
                //        case "0502":
                //            {
                //                return { fill: "#fac305" };
                //                break;
                //            }
                //        case "0503":
                //            {
                //                return { fill: "#fd5b30" };
                //                break;
                //            }
                //        case "0504":
                //            {
                //                return { fill: "#ba1d26" };
                //                break;
                //            }
                //        case "0505":
                //            {
                //                return { fill: "#b414bb" };
                //                break;
                //            }
                //        case "0506":
                //            {
                //                return { fill: "#6f0474" };
                //                break;
                //            }
                //        default:
                //            return { fill: "#6ec129" };
                //            break;
                //    }
                //}

            });
            // Add axes
            //var xtime = [];
            //for (var i = 0; i < attrInfo.length; i++){
            //    xtime.push(attrInfo[i].StatDate);
            //}
            //chart.addAxis("x", {
            //    labelFunc: function (xtime) {
            //        return xtime;
            //    }, minorTicks: true
            //});
            chart.addAxis("x", { fixLower: "major", fixUpper: "major" });
            chart.addAxis("y", { vertical: true, fixLower: "major", fixUpper: "major" });
            // Add the series of data
            chart.addSeries("AirQuality", chartData);
            // Highlight!
            var anim1 = new Highlight(chart, "default");
            var anim2 = new Tooltip(chart, "default", {
                text: function (args) {
                    return attrInfo[args.x].StatDate +
                            "<br/>运行时长：" + args.y.y + "分钟";
                }
            });
            // Render the chart!
            chart.render();
        },
        onClick: function (wCtrlInfo) {

        }
    });
    return t;
});