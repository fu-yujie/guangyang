//纯js分页

//页码的容器ID
var p_pagerContainerId;
//列表以及页码的容器ID
var p_listContainerId;
//获取数据的地址
var p_pagerUrl;
//获取数据的参数
var p_pagerData;
//总记录数
var p_total_count;
//页码大小
var p_page_size;
//当前页码
var p_current_page;
//分页条长度
var p_pager_length;
//分页条头部长度
var p_header_length;
//分页条尾部长度
var p_tailer_length;

//渲染分页条
function renderPager() {
    initPager();
    doRenderPager();
}

//开始渲染分页条
function doRenderPager() {
    if (p_total_count == 0) {
        $("#" + p_pagerContainerId).html("");
        return;
    }
    //页码输出到页面
    var pagerHtml = getPagerHtmlString(p_total_count, p_page_size, p_current_page, p_pager_length, p_header_length, p_tailer_length);
    $("#" + p_pagerContainerId).html(pagerHtml);

    //绑定页面跳转事件
    var total_page = parseInt((p_total_count + p_page_size - 1) / p_page_size);
    $("#gopage").blur(function () {
        confirmEnterNum(total_page);
    }).keydown(function (e) {
        if (e.keyCode == 13) {
            //confirmEnterNum(total_page);
            return false;
        }
    })

}

//页面跳转
function confirmEnterNum(total_page) {

    var pageNum = parseInt($("#gopage").val());
    if (pageNum.toString() == "NaN") {
        $("#gopage").val("");
    }
    else if (pageNum > total_page || pageNum == p_current_page) {
        $("#gopage").val("");
    }
    else {
        go(pageNum);
    }
}

//加载数据
function go(index) {

    $.ajax({
        url: p_pagerUrl,
        data: p_pagerData + index,
        cache: false,
    }).done(function (result) {
        $("#" + p_listContainerId).html(result);
        p_current_page = index;
        doRenderPager();
    });
}
//页码全部的html
function getPagerHtmlString(total_count, page_size, current_page, pager_length, header_length, tailer_length) {
    //上一页
    var prev = "";
    if (current_page == 1) {
        prev = "<li ><span>上一页</span></li>";
    }
    else {
        prev = "<li ><span onclick=\"go(" + (current_page - 1) + ")\">上一页</span></li>";
    }
    //页码
    var pagerItemsHtml = getPagerItemsHtmlString(total_count, page_size, current_page, pager_length, header_length, tailer_length, function (isCurrent, title) {

        var span_class = "";
        var span_event = "";

        if (isCurrent > 0) {
            span_class = " class=currentpage";
        }
        if (!isNaN(title)) {
            span_event = " onclick=\"go(" + title + ")\" ";
        }
        var li = "<li><span" + span_class + span_event + ">" + title + "</span></li>";
        return li;
    });
    //下一页
    var next = "";
    var total_page = parseInt((total_count + page_size - 1) / page_size);
    if (total_page == current_page) {
        next = "<li><span>下一页</span></li>";
    }
    else {
        next = "<li><span onclick=\"go(" + (current_page + 1) + ")\">下一页</span></li>";
    }
    //页码跳转
    var goPage = "<li><span class=\"goli\">第<input type=\"text\" id=\"gopage\"/>页</span></li>"
    //最终返回
    pagerhtml = "<ul>" + prev + pagerItemsHtml + next + goPage + "</ul>";

    return pagerhtml;
}


//获取分页条的html
//total_count 总记录数
//page_size   页码大小
//current_page 当前页码
//pager_length 分页条长度
//header_length  分页条头部长度
//tailer_length  分页条尾部长度
//fill_tag 渲染页码的函数，例如 fil_tag(1,2)表示渲染第二页，该页选中。fil_tag(0,2)表示渲染第二页，该页不选中
function getPagerItemsHtmlString(total_count, page_size, current_page, pager_length, header_length, tailer_length, fill_tag) {

    var total_page = parseInt((total_count + page_size - 1) / page_size);
    var pager = new Array(pager_length);

    //header_length + tailer_length 必须为偶数
    var main_length = pager_length - header_length - tailer_length; //必须为奇数

    var i;
    var code = '';
    if (total_page < current_page) {
        //页码不能大于总页数
        return "";
    }
    //判断总页数是不是小于 分页的长度，若小于则直接显示
    if (total_page < pager_length) {
        for (i = 0; i < total_page; i++) {

            code += (i + 1 != current_page) ? fill_tag(0, i + 1) : fill_tag(1, i + 1);
        }
    }
        //如果总页数大于分页长度，则为一下函数
    else {
        //先计算中心偏移量
        var offset = (pager_length - 1) / 2;
        //分三种情况，第一种左边没有...
        if (current_page <= offset + 1) {
            var tailer = '';
            //前header_length + main_length 个加直接输出之后一个...然后输出倒数的    tailer_length 个
            for (i = 0; i < header_length + main_length - 1; i++)
                code += (i + 1 != current_page) ? fill_tag(0, i + 1) : fill_tag(1, i + 1);
            code += fill_tag(0, '...');
            for (i = total_page; i > total_page - tailer_length; i--)
                tailer = fill_tag(0, i) + tailer;

            code += tailer;
        }
            //第二种情况是右边没有...
        else if (current_page >= total_page - offset) {
            var header = '';
            //后tailer_length + main_length 个直接输出之前加一个...然后拼接 最前面的 header_length 个
            for (i = total_page; i > total_page - main_length; i--)
                code = ((current_page != i) ? fill_tag(0, i) : fill_tag(1, i)) + code;
            code = fill_tag(0, '...') + code;
            for (i = 0; i < header_length; i++)
                header += fill_tag(0, i + 1);

            code = header + code;
        }
            //最后一种情况，两边都有...
        else {
            var header = '';
            var tailer = '';
            //首先处理头部
            for (i = 0; i < header_length; i++)
                header += fill_tag(0, i + 1);
            header += fill_tag(0, '...');
            //处理尾巴
            for (i = total_page; i > total_page - tailer_length; i--)
                tailer = fill_tag(0, i) + tailer;
            tailer = fill_tag(0, '...') + tailer;
            //处理中间
            //计算main的中心点
            var offset_m = (main_length - 1) / 2;
            var partA = '';
            var partB = '';
            var j;
            var counter = (parseInt(current_page) + parseInt(offset_m));
            for (i = j = current_page; i <= counter; i++, j--) {
                partA = ((i == j) ? '' : fill_tag(0, j)) + partA;
                partB += (i == j) ? fill_tag(1, i) : fill_tag(0, i);
            }
            //拼接
            code = header + partA + partB + tailer;
        }
    }
    return code;
}
