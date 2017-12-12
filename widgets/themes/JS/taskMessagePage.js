/**
 * Created by guang on 2016/7/14.
 */
//创建的js分页对象
function taskMessage_page() {
    this.pageContentId = ""
    this.data = "";//数据；注：数据格式为[{},{},{}];外层为数组，每个数组内的元素为对象的格式；
    this.cut_page_id = "";//整体容器的最外层id
    this.pageContentLength = 10;//每页展示数据的长度或个数；
    this.pageContentElement = "table";//用哪种 标签进行数据的展示，可以用table与tr+td;或者是ul+li+span;只需要填入table或者ul既可；
    this.orderKey = "";//表格展示的属性名的顺序
    this.orderKeyName = "";//表格头部的属性名一次的名称与orderKey对应起来；
}
//增加dom，调用主方法；
taskMessage_page.prototype.addDom = function (parme) {
    var $cut_page_id = dojo.byId(this.cut_page_id);
    var $cut_page_id_p = dojo.query("#" + this.cut_page_id + " .pageIndexP")[0];
    var $cut_page_id_table = dojo.query("#" + this.cut_page_id + " .pageContent")[0];
    if ($cut_page_id_p != undefined) {
        $cut_page_id.removeChild($cut_page_id_p)
    }
    if ($cut_page_id_table != undefined) {
        $cut_page_id.removeChild($cut_page_id_table)
    }
    //var $pageContentElement = document.createElement(this.pageContentElement)
    var $pageContentElement = document.createElement("div")
    var $pageIndexElement = document.createElement("p")
    $pageContentElement.setAttribute("class", "pageContent")
    $pageIndexElement.setAttribute("class", "pageIndexP")
    $cut_page_id.appendChild($pageContentElement)
    $cut_page_id.appendChild($pageIndexElement)
    //搜索模块的样式更变
    if (this.allWidth <= 250) {
        var $pageLength = Math.ceil(this.data.length / this.pageContentLength)
        $pageIndexElement.style.overflow = "auto"
        var allE;
        allE = "<section class='first' style='overflow:hidden;margin-bottom:5px;margin-left:35px;'><b class='upAndDownPage'>上一页</b><b class='upAndDownPage'>下一页</b></section><section style='overflow:hidden;'><span class='pageIndex nowPage'>1</span><em style='float: left;'>...</em>"
        for (var i = 2; i <= $pageLength - 1; i++) {
            allE += "<span class='pageIndex'>" + i + "</span>"
        }
        allE += "<em style='float: left;'>...</em><span class='pageIndex'>" + $pageLength + "</span></section>"
        $pageIndexElement.innerHTML = allE
    } else {
        var $pageLength = Math.ceil(this.data.length / this.pageContentLength)
        $pageIndexElement.innerHTML = "<b class='upAndDownPage'>上一页</b><span class='pageIndex nowPage'>1</span><em style='float: left;'>...</em>"
        for (var i = 2; i <= $pageLength - 1; i++) {
            $pageIndexElement.innerHTML += "<span class='pageIndex'>" + i + "</span>"
        }
        $pageIndexElement.innerHTML += "<em style='float: left;'>...</em><span class='pageIndex'>" + $pageLength + "</span><b class='upAndDownPage'>下一页</b>"
    }
    var $cut_page_id = document.getElementById(this.cut_page_id);
    var $pageIndexP = dojo.query("#" + this.cut_page_id + " .pageIndexP")[0];

    var $pageSpan = $pageIndexP.getElementsByTagName("span");
    var $pageEm = $pageIndexP.getElementsByTagName("em");
    var $pageB = $pageIndexP.getElementsByTagName("b");

    //首次加载显示的页码；
    $pageEm[0].style.display = "none";
    $pageEm[1].style.display = "inline-block";
    if ($pageLength <= 5) {
        $pageEm[1].style.display = "none";
        for (var s = 0; s < $pageLength; s++) {
            $pageSpan[s].style.display = "inline-block"
        }
        //给页码进行居中；
        if (this.allWidth <= 250) {
            console.log(this.allWidth);
            var w = (20 + 2) * $pageLength;
            //$pageIndexP.style.marginLeft = (this.allWidth - w) / 2 + "px"
        } else {
            var w = (20 + 2) * $pageLength + (50 + 2) * 2;
            //$pageIndexP.style.marginLeft = (this.allWidth - w) / 2 + "px"
        }
    } else {
        var arr = [0, 1, 2, 3, 4, $pageLength - 1];
        for (var i in arr) {
            $pageSpan[arr[i]].style.display = "inline-block"
        }
        //给页码进行居中；
        if (this.allWidth <= 250) {
            var $pageIndexS = dojo.query("#" + this.cut_page_id + " .first")[0];
            var w = (20 + 2) * 7 + (20 + 2);
            //$pageIndexS.style.marginLeft = 26 + "px"
            //$pageIndexP.style.marginLeft = (this.allWidth - w) / 2 + "px"
        } else {
            var w = (20 + 2) * 7 + (50 + 2) * 2 + (20 + 2);
            //$pageIndexP.style.marginLeft = (this.allWidth - w) / 2 + "px"
        }
    }
    this.cutData(parme)

    //2016-12-16分页样式修改
    if ($pageLength == 1) {
        $('.pageIndexP').find('section').eq(1).css('marginLeft', '78px');
    }
    if ($pageLength == 2) {
        $('.pageIndexP').find('section').eq(1).css('marginLeft', '65px');
    }
    if ($pageLength == 3) {
        $('.pageIndexP').find('section').eq(1).css('marginLeft', '52px');
    }
    if ($pageLength == 4) {
        $('.pageIndexP').find('section').eq(1).css('marginLeft', '39px');
    }
    if ($pageLength == 5) {
        $('.pageIndexP').find('section').eq(1).css('marginLeft', '26px');
    }
    if ($pageLength == 6) {
        $('.pageIndexP').find('section').eq(1).css('marginLeft', '13px');
    }
}
//table增加或者删除属性；
taskMessage_page.prototype.addOrRemove = function (addOr, name, value) {
    var $cut_page_id = document.getElementById(this.cut_page_id);
    var $pageIndexP = dojo.query("#" + this.cut_page_id + " .pageContent")[0];
    if (addOr == "set") {
        $pageIndexP.setAttribute(name, value)
    } else if (addOr == "remove") {
        $pageIndexP.removeAttribute(name)
    }
}
//对当前页以及其前后页的展示；
taskMessage_page.prototype.cutPage = function (index, $pageLength) {
    var $cut_page_id = document.getElementById(this.cut_page_id);
    var $pageIndexP = dojo.query("#" + this.cut_page_id + " .pageIndexP")[0];
    var $pageEm = $pageIndexP.getElementsByTagName("em");
    var $pageSpan = $pageIndexP.getElementsByTagName("span");
    var $pageB = $pageIndexP.getElementsByTagName("b");
    for (var i = 0; i < $pageSpan.length; i++) {
        $pageSpan[i].style.display = "none"
        $pageSpan[i].setAttribute("class", "pageIndex")
    }
    //主要分成三种形式
    //（1）当前页的下标为大于3小于最后页减3
    if (index >= 3 && index < ($pageLength - 3)) {
        $pageEm[0].style.display = "inline-block";
        $pageEm[1].style.display = "inline-block";
        var classVal = $pageSpan[index].getAttribute("class");
        classVal = classVal.concat(" nowPage");
        $pageSpan[index].setAttribute("class", classVal)
        var arr = [0, index - 1, index - 2, index, index + 1, index + 2, $pageLength - 1];
        for (var i in arr) {
            $pageSpan[arr[i]].style.display = "inline-block"
        }
        //给页码进行居中；
        if (this.allWidth <= 250) {
            var w = ($pageSpan[0].offsetWidth + 2) * 7 + ($pageEm[0].offsetWidth + 2) * 2;
            var $pageIndexS = dojo.query("#" + this.cut_page_id + " .first")[0];
            //$pageIndexS.style.marginLeft = (this.allWidth - 104) / 2 - (this.allWidth - w) / 2 + "px"
            //$pageIndexP.style.marginLeft = (this.allWidth - w) / 2 + "px"
        } else {
            var w = ($pageSpan[0].offsetWidth + 2) * 7 + ($pageB[0].offsetWidth + 2) * 2 + ($pageEm[0].offsetWidth + 2) * 2;
            //$pageIndexP.style.marginLeft = ($cut_page_id.clientWidth - w) / 2 + "px"
        }

        //当前页的下标小于3
    } else if (index < 3) {
        $pageEm[0].style.display = "none";
        $pageEm[1].style.display = "inline-block";
        var classVal = $pageSpan[index].getAttribute("class");
        classVal = classVal.concat(" nowPage");
        $pageSpan[index].setAttribute("class", classVal)
        if ($pageLength <= 5) {
            $pageEm[1].style.display = "none";
            for (var s = 0; s < $pageLength; s++) {
                $pageSpan[s].style.display = "inline-block"
            }

            //给页码进行居中；
            if (this.allWidth <= 250) {
                var w = ($pageSpan[0].offsetWidth + 2) * $pageLength + ($pageEm[0].offsetWidth + 2);
                //$pageIndexP.style.marginLeft = ($cut_page_id.clientWidth - w) / 2 + "px"
                var $pageIndexS = dojo.query("#" + this.cut_page_id + " .first")[0];
                //$pageIndexS.style.marginLeft = (this.allWidth - 104) / 2 - (this.allWidth - w) / 2 + "px"
            } else {
                var w = ($pageSpan[0].offsetWidth + 2) * $pageLength + ($pageB[0].offsetWidth + 2) * 2 + ($pageEm[0].offsetWidth + 2);
                //$pageIndexP.style.marginLeft = ($cut_page_id.clientWidth - w) / 2 + "px"
            }
        } else {
            var arr = [0, 1, 2, 3, 4, $pageLength - 1];
            for (var i in arr) {
                $pageSpan[arr[i]].style.display = "inline-block"
            }
            //给页码进行居中；
            if (this.allWidth <= 250) {
                var w = ($pageSpan[0].offsetWidth + 2) * 7 + ($pageEm[0].offsetWidth + 2);
                //$pageIndexP.style.marginLeft = ($cut_page_id.clientWidth - w) / 2 + "px"
                var $pageIndexS = dojo.query("#" + this.cut_page_id + " .first")[0];
                //$pageIndexS.style.marginLeft = (this.allWidth - 104) / 2 - (this.allWidth - w) / 2 + "px"
            } else {
                var w = ($pageSpan[0].offsetWidth + 2) * 7 + ($pageB[0].offsetWidth + 2) * 2 + ($pageEm[0].offsetWidth + 2);
                //$pageIndexP.style.marginLeft = ($cut_page_id.clientWidth - w) / 2 + "px"
            }
        }

        //当前页的下标为大于最后页减3
    } else {
        $pageEm[0].style.display = "inline-block";
        $pageEm[1].style.display = "none";
        var classVal = $pageSpan[index].getAttribute("class");
        classVal = classVal.concat(" nowPage");
        $pageSpan[index].setAttribute("class", classVal)
        var arr = [0, $pageLength - 1, $pageLength - 2, $pageLength - 3, $pageLength - 4, $pageLength - 5];
        for (var i in arr) {
            $pageSpan[arr[i]].style.display = "inline-block"
        }
        //给页码进行居中；
        if (this.allWidth <= 250) {
            var w = ($pageSpan[0].offsetWidth + 2) * 7 + ($pageEm[0].offsetWidth + 2);
            //$pageIndexP.style.marginLeft = ($cut_page_id.clientWidth - w) / 2 + "px"
            var $pageIndexS = dojo.query("#" + this.cut_page_id + " .first")[0];
            //$pageIndexS.style.marginLeft = 26 + "px"
        } else {
            var w = ($pageSpan[0].offsetWidth + 2) * 7 + ($pageB[0].offsetWidth + 2) * 2 + ($pageEm[0].offsetWidth + 2);
            //$pageIndexP.style.marginLeft = ($cut_page_id.clientWidth - w) / 2 + "px"
        }
    }
}
//上下也点击主方法；
taskMessage_page.prototype.upordown = function (index, lengh, cutData, parme) {
    var $cut_page_id = document.getElementById(this.cut_page_id);
    var $pageupdown = dojo.query("#" + this.cut_page_id + " .upAndDownPage");
    var that = this;
    //上一页
    $pageupdown[0].onclick = function () {
        index--;
        if (index <= 0) {
            index = 0;
        }
        that.addContent(cutData[index])
        that.cutPage(index, lengh)

        //分页后数据分批进行其他展示的方法；
        //parme.that._addpoint(cutData[index])
        //parme.that._setLayer(cutData[index])
        parme.that._pointadd(cutData[index])
        //parme.popup.close();
    }
    //下一页
    $pageupdown[1].onclick = function () {
        index++;
        if (index >= lengh - 1) {
            index = lengh - 1;
        }
        that.addContent(cutData[index])
        that.cutPage(index, lengh)

        //分页后数据分批进行其他展示的方法；
        //parme.that._addpoint(cutData[index])
        //parme.that._setLayer(cutData[index])
        parme.that._pointadd(cutData[index])
        //parme.popup.close();
    }
}
//对整体数据的切割；
taskMessage_page.prototype.cutData = function (parme) {
    var cutData = [];
    var $pageLength = Math.ceil(this.data.length / this.pageContentLength)
    for (var i = 0; i < $pageLength; i++) {
        cutData.push(this.data.slice(i * this.pageContentLength, (i + 1) * this.pageContentLength))
    }
    this.connectEvent(cutData, parme)
}
//每页点击事件的调连；
taskMessage_page.prototype.connectEvent = function (cutData, parme) {
    var $cut_page_id = document.getElementById(this.cut_page_id);
    var $pageIndexP = dojo.query("#" + this.cut_page_id + " .pageIndexP")[0];
    var $pageSpan = $pageIndexP.getElementsByTagName("span");
    var $pageLength = Math.ceil(this.data.length / this.pageContentLength)
    this.addContent(cutData[0])

    //分页后数据分批进行其他展示的方法；
    //parme.that._addpoint(cutData[0])
    //parme.that._setLayer(cutData[0])
    parme.that._pointadd(cutData[0])
    //parme.popup.close();

    this.upordown(0, $pageLength, cutData, parme)
    for (var i = 0; i < $pageSpan.length; i++) {
        $pageSpan[i].index = i;
        var that = this;
        $pageSpan[i].onclick = function () {
            that.addContent(cutData[this.index])
            that.cutPage(this.index, $pageLength)
            that.upordown(this.index, $pageLength, cutData, parme)


            //分页后数据分批进行其他展示的方法；
            //parme.that._addpoint(cutData[this.index])
            //parme.that._setLayer(cutData[this.index])
            parme.that._pointadd(cutData[this.index])
            //parme.popup.close();
        }
    }
}
//table内容展示区的调用；
taskMessage_page.prototype.addContent = function (data) {
    var $cut_page_id = document.getElementById(this.cut_page_id);
    var $pageContentElement = dojo.query("#" + this.cut_page_id + " .pageContent")[0];
    if (this.pageContentElement == "table") {
        var $tableInnerHTML = "<table cellpadding='0' cellspacing='0'><thead><tr>"
        for (var i in this.orderKeyName) {
            if (this.orderKeyName[i] != undefined && this.orderKeyName[i] != "" && this.orderKeyName[i] != null) {
                $tableInnerHTML += "<td class='a" + i + "'>" + this.orderKeyName[i] + "</td>"
            } else {
                $tableInnerHTML += "<td class='a" + i + "'>" + "</td>"
            }
        }
        $tableInnerHTML += "</tr></thead><tbody>"
        for (var t in data) {
            $tableInnerHTML += "<tr>"
            var everyData = data[t]
            for (var g in this.orderKey) {
                if (this.orderKey[g] != undefined && this.orderKey[g] != "" && this.orderKey[g] != null) {
                    if (everyData[this.orderKey[g]] != "NULL" && everyData[this.orderKey[g]] != undefined) {
                        $tableInnerHTML += "<td class='a" + g + "'>" + everyData[this.orderKey[g]] + "</td>"
                    } else {
                        $tableInnerHTML += "<td class='a" + g + "'>" + "无" + "</td>"
                    }
                } else if (this.cut_page_id == "searchPartContent") {
                    if (everyData[this.orderKey[g]] != "NULL" && everyData[this.orderKey[g]] != undefined) {
                        $tableInnerHTML += "<td class='a" + g + "'>" + everyData[this.orderKey[g]] + "</td>"
                    } else {
                        $tableInnerHTML += "<td class='a" + g + "'>" + (parseInt(t) + 1) + "</td>"
                    }

                } else {
                    $tableInnerHTML += "<td class='a" + g + "'>" + "</td>"
                }
            }
            $tableInnerHTML += "</tr>"
        }
        $tableInnerHTML += "</tbody></table>"
        $pageContentElement.innerHTML = $tableInnerHTML
    }
}
