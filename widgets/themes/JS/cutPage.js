/**
 * Created by guang on 2016/7/14.
 */
//创建的js分页对象
function page() {
    this.pageContentId = ""
    this.data = "";//数据；注：数据格式为[{},{},{}];外层为数组，每个数组内的元素为对象的格式；
    this.cut_page_id = "";//整体容器的最外层id
    this.pageContentLength = 10;//每页展示数据的长度或个数；
    this.pageContentElement = "table";//用哪种 标签进行数据的展示，可以用table与tr+td;或者是ul+li+span;只需要填入table或者ul既可；
    this.orderKey = "";//表格展示的属性名的顺序
    this.orderKeyName = "";//表格头部的属性名一次的名称与orderKey对应起来；
}


//增加dom，调用主方法；
page.prototype.addDom = function (parme) {
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
    if (this.cut_page_id == "ConductorTable0") {
        var $taskcontent = document.getElementById("taskcontent");
        if ($taskcontent != null && $taskcontent != undefined) {
            $cut_page_id.removeChild($taskcontent)
        }
        var taskContent = document.createElement("div");
        taskContent.innerHTML = "<ul><li style='margin:5px 0'><b>标题:</b><input type='text'style='width:323px'id='taskTittle' maxlength='10'/></li><li style='margin:5px 0'><b>内容:</b><textarea style='width:325px;height:50px;vertical-align:top;' id='sendContent' maxlength='50'></textarea></li><li style='margin:5px 0'><b>形式:</b><em style='display:inling-block;margin:0px 10px;'>App</em><input type='checkbox' style='width:18px;height:18px;vertical-align:top;' id='app'/><em style='display:inling-block;margin:0px 10px;'>短信</em><input id='tel' type='checkbox'style='width:18px;height:18px;vertical-align:top;'/></li><li><button style='width:265px;height:30px;border-radius:5px;background-color:#0899ff;color:white;line-height:30px;text-align:center;margin:5px 0px 0px 52px;' id='trackSend'>发&nbsp;&nbsp;送</button></li>";
        taskContent.setAttribute("id", "taskcontent");
        taskContent.setAttribute("style", "background: lightblue;padding: 5px; margin-top: 10px;font-size:14px;");
        $cut_page_id.appendChild(taskContent)
    }
    var $pageLength;
    if (typeof this.data.length === 'undefined') {
        $pageLength = Math.ceil(this.data.Data.length / this.pageContentLength);
    } else {
        $pageLength = Math.ceil(this.data.length / this.pageContentLength);
    } 
    $pageIndexElement.innerHTML = "<b class='upAndDownPage'>上一页</b><span class='pageIndex nowPage'>1</span><em style='float: left;'>...</em>"
    for (var i = 2; i <= $pageLength - 1; i++) {
        $pageIndexElement.innerHTML += "<span class='pageIndex'>" + i + "</span>"
    }
    $pageIndexElement.innerHTML += "<em style='float: left;'>...</em><span class='pageIndex'>" + $pageLength + "</span><b class='upAndDownPage'>下一页</b>";
    $pageIndexElement.innerHTML += "<span style='font-size:12px;display:inline-block;float: left;height: 20px;border: 1px solid #bbbbbb;text-align: center;line-height: 20px;margin: 0 1px;'>共" + this.data.length + "条</span>";//总条数20161117修改
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
        var w = (20 + 2) * $pageLength + (50 + 2) * 3;

        $pageIndexP.style.marginLeft = (390 - w) / 2 + "px"

    } else {
        var arr = [0, 1, 2, 3, 4, $pageLength - 1];
        for (var i in arr) {
            $pageSpan[arr[i]].style.display = "inline-block"
        }
        //给页码进行居中；
        var w = (20 + 2) * 7 + (50 + 2) * 3 + (20 + 2);

        $pageIndexP.style.marginLeft = (390 - w) / 2 + "px"
    }

    if (typeof this.data.length === 'undefined') {
        this.cutData(parme, this.data.Data.length);
    } else {
        this.cutData(parme, this.data.length);
    }
    //this.cutData(parme, this.data.length)
}
//table增加或者删除属性；
page.prototype.addOrRemove = function (addOr, name, value) {
    var $cut_page_id = document.getElementById(this.cut_page_id);
    var $pageIndexP = dojo.query("#" + this.cut_page_id + " .pageContent table")[0];
    if (addOr == "set") {
        $pageIndexP.setAttribute(name, value)
    } else if (addOr == "remove") {
        $pageIndexP.removeAttribute(name)
    }
}
//对当前页以及其前后页的展示；
page.prototype.cutPage = function (index, $pageLength) {
    var $cut_page_id = document.getElementById(this.cut_page_id);
    var $pageIndexP = dojo.query("#" + this.cut_page_id + " .pageIndexP")[0];
    var $pageEm = $pageIndexP.getElementsByTagName("em");
    var $pageSpan = $pageIndexP.getElementsByTagName("span");
    var $pageB = $pageIndexP.getElementsByTagName("b");
    for (var i = 0; i < $pageSpan.length; i++) {
        $pageSpan[i].style.display = "none"
        $pageSpan[i].setAttribute("class", "pageIndex");

        if (i == $pageSpan.length - 1) {
            $pageSpan[i].style.display = "inline-block";
            $pageSpan[i].style.width = "50px";

        }
    }
    //主要分成四种形式
    //（1）总页数等于4的情况下
    if ($pageLength == 4) {
        $pageEm[0].style.display = "none";
        $pageEm[1].style.display = "none";
        var classVal = $pageSpan[index].getAttribute("class");
        classVal = classVal.concat(" nowPage");
        $pageSpan[index].setAttribute("class", classVal);
        for (var s = 0; s < $pageLength; s++) {
            $pageSpan[s].style.display = "inline-block";
        }
        //给页码进行居中；
        var w = ($pageSpan[0].offsetWidth + 2) * $pageLength + ($pageB[0].offsetWidth + 2) * 3 + ($pageEm[0].offsetWidth + 2);

        $pageIndexP.style.marginLeft = ($cut_page_id.clientWidth - w) / 2 + "px"
    } else if (index >= 3 && index < ($pageLength - 3)) {//（2）当前页的下标为大于3小于最后页减3
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
        var w = ($pageSpan[0].offsetWidth + 2) * 7 + ($pageB[0].offsetWidth + 2) * 3 + ($pageEm[0].offsetWidth + 2) * 2;

        $pageIndexP.style.marginLeft = ($cut_page_id.clientWidth - w) / 2 + "px"
        //（3）当前页的下标小于3
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
            var w = ($pageSpan[0].offsetWidth + 2) * $pageLength + ($pageB[0].offsetWidth + 2) * 3 + ($pageEm[0].offsetWidth + 2);

            $pageIndexP.style.marginLeft = ($cut_page_id.clientWidth - w) / 2 + "px"

        } else {
            var arr = [0, 1, 2, 3, 4, $pageLength - 1];
            for (var i in arr) {
                $pageSpan[arr[i]].style.display = "inline-block"
            }
            //给页码进行居中；
            var w = ($pageSpan[0].offsetWidth + 2) * 7 + ($pageB[0].offsetWidth + 2) * 3 + ($pageEm[0].offsetWidth + 2);

            $pageIndexP.style.marginLeft = ($cut_page_id.clientWidth - w) / 2 + "px"
        }

        //（4）当前页的下标为大于等于最后页减3
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
        var w = ($pageSpan[0].offsetWidth + 2) * 7 + ($pageB[0].offsetWidth + 2) * 3 + ($pageEm[0].offsetWidth + 2);

        $pageIndexP.style.marginLeft = ($cut_page_id.clientWidth - w) / 2 + "px"

    }

}
//上下页点击主方法；
page.prototype.upordown = function (index, lengh, cutData, parme, count) {
    var $cut_page_id = document.getElementById(this.cut_page_id);
    var $pageupdown = dojo.query("#" + this.cut_page_id + " .upAndDownPage");
    var that = this;
    //上一页
    $pageupdown[0].onclick = function () {
        index--;
        if (index <= 0) {
            index = 0;
        }
        that.addContent(cutData[index], parme)
        that.cutPage(index, lengh)

        //分页后数据分批进行其他展示的方法；
        //parme.that._addpoint(cutData[index])
        //parme.that._setLayer(cutData[index])
        parme.that._pointadd(cutData[index])
        parme.popup.close();

    }
    //下一页
    $pageupdown[1].onclick = function () {
        index++;
        if (index >= lengh - 1) {
            index = lengh - 1;
        }
        that.addContent(cutData[index], parme)
        that.cutPage(index, lengh)

        //分页后数据分批进行其他展示的方法；
        //parme.that._addpoint(cutData[index])
        //parme.that._setLayer(cutData[index])
        parme.that._pointadd(cutData[index])
        parme.popup.close();

    }
}
//对整体数据的切割；
page.prototype.cutData = function (parme, count) {
    var cutData = [];
    var $pageLength = Math.ceil(this.data.length / this.pageContentLength)
    for (var i = 0; i < $pageLength; i++) {
        cutData.push(this.data.slice(i * this.pageContentLength, (i + 1) * this.pageContentLength))
    }
    //console.log(count);
    this.connectEvent(cutData, parme, count)
}
//每页点击事件的调连；
page.prototype.connectEvent = function (cutData, parme, count) {
    //console.log(count);
    var $cut_page_id = document.getElementById(this.cut_page_id);
    var $pageIndexP = dojo.query("#" + this.cut_page_id + " .pageIndexP")[0];
    var $pageSpan = $pageIndexP.getElementsByTagName("span");
    var $pageLength = Math.ceil(this.data.length / this.pageContentLength)
    this.addContent(cutData[0], parme)

    //分页后数据分批进行其他展示的方法；
    //parme.that._addpoint(cutData[0])
    //parme.that._setLayer(cutData[0])
    parme.that._pointadd(cutData[0])
    parme.popup.close();

    this.upordown(0, $pageLength, cutData, parme, count)
    for (var i = 0; i < $pageSpan.length; i++) {
        $pageSpan[i].index = i;
        var that = this;
        $pageSpan[i].onclick = function () {
            that.addContent(cutData[this.index], parme)
            that.cutPage(this.index, $pageLength)
            that.upordown(this.index, $pageLength, cutData, parme, count)


            //分页后数据分批进行其他展示的方法；
            //parme.that._addpoint(cutData[this.index])
            //parme.that._setLayer(cutData[this.index])
            parme.that._pointadd(cutData[this.index])
            parme.popup.close();
        }
    }
}
//table内容展示区的调用；
page.prototype.addContent = function (data, parme) {
    var $cut_page_id = document.getElementById(this.cut_page_id);
    var $pageContentElement = dojo.query("#" + this.cut_page_id + " .pageContent")[0];
    if (this.pageContentElement == "table") {
        var $tableInnerHtml = "<table cellpadding='0' cellspacing='0'><thead><tr>";
        for (var i in this.orderKeyName) {
            if (this.orderKeyName[i] != undefined && this.orderKeyName[i] != "" && this.orderKeyName[i] != null) {
                $tableInnerHtml += "<td class='a" + i + "'>" + this.orderKeyName[i] + "</td>";
            } else {
                $tableInnerHtml += "<td class='a" + i + "'>" + "</td>";
            }
        }
        $tableInnerHtml += "</tr></thead><tbody>";
        for (var t in data) {
            $tableInnerHtml += "<tr>";
            var everyData = data[t];
            var num = 0;
            for (var g in this.orderKey) {

                if (this.orderKey[g] != undefined && this.orderKey[g] != "" && this.orderKey[g] != null) {
                    if (everyData[this.orderKey[g]] != "NULL" && everyData[this.orderKey[g]] != undefined) {
                        $tableInnerHtml += "<td class='a" + g + "'>" + everyData[this.orderKey[g]] + "</td>";
                    } else {
                        $tableInnerHtml += "<td class='a" + g + "'>" + "无" + "</td>";
                    }
                } else {
                    $tableInnerHtml += "<td class='a" + g + "'>" + "</td>";
                }
            }
            $tableInnerHtml += "</tr>";
        }
        $tableInnerHtml += "</tbody></table>";
        $pageContentElement.innerHTML = $tableInnerHtml;
        //parme.that.addAllParme()
    }
}
