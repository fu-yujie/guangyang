//分页初始化器,专为UPMS定制

//每个页面只需提供一个initPager()方法，就可以自动分页。

//初始化分页条
function initPager() {

    //页码的容器ID
    p_pagerContainerId = "pagerContainer";
    //列表以及页码的容器ID
    p_listContainerId = "listContainer";
    //获取数据的地址
    p_pagerUrl = $("#searchForm").attr("action");
    if (p_pagerUrl == null||p_pagerUrl==""||p_pagerUrl==undefined) {
        p_pagerUrl = "Index";
    }
    //获取数据的参数
    var dataPara = $("#searchForm").serialize();
    if (dataPara.length == 0) {
        p_pagerData = "PageIndex=";
    }
    else {
        p_pagerData = dataPara + "&PageIndex=";
    }

    //总记录数
    p_total_count = parseInt($("#" + p_pagerContainerId).attr("total_count"));
    //页码大小
    p_page_size = parseInt($("#" + p_pagerContainerId).attr("page_size"));
    //当前页码
    p_current_page = 1;
    //分页条长度
    p_pager_length = 7;
    //分页条头部长度
    p_header_length = 1;
    //分页条尾部长度
    p_tailer_length = 1;

}

$(function () {
    renderPager();
})