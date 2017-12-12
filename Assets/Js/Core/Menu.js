//Index Menu

$(document).ready(function () {

    //顶部菜单切换
    $.each($('#nav li'), function (i) {
        $(this).click(function () {
            $(this).addClass('actived').siblings('li').removeClass('actived');
            $('#mainMenu #sort_' + i + '').show().siblings('div').hide().find('li a').removeClass('selected');
        })
    });

    //左侧菜单切换
    $("#mainMenu dl li").click(function () {
        $(this).parents("div").find("a").removeClass("selected");
        $(this).find("a").removeClass("main-menu-hover").addClass("selected")
        $("#workspace").attr("src", $(this).find("a").attr("hr"));
    });
    //左侧菜单悬浮
    $("#mainMenu dl li").hover(function () {
        if ($(this).find("a").attr('class')!="selected") {
            $(this).find("a").addClass("main-menu-hover")
        }
    },function() {
        $(this).find("a").removeClass("main-menu-hover")
    });
    

    $("#mainMenu dt").click(function () {
        $(this).toggleClass("fold");
        $(this).next("dd").children("ul").toggle();
    });

    $(".tn-user-name").hover(function () {
        $(this).find(".tn-sub").toggle();
        $(this).find(".tn-smallicon-triangle-down").removeClass("tn-icon-up").addClass("tn-icon-down");
    }, function () { $(this).find(".tn-sub").toggle(); $(this).find(".tn-smallicon-triangle-down").removeClass("tn-icon-down").addClass("tn-icon-up"); })

});