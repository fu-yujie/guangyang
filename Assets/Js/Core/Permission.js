$(function () {
    checkPermission();
    $(document).ajaxSuccess(checkPermission)
})
function checkPermission() {
    var blacklist = $.cookie('blacklist');
    if (typeof (blacklist) != "undefined") {
        var path = window.location.pathname;
        path = (0 == path.indexOf('/') ? path.substr(1) : path);
        var regExStr = "'" + path + "~[^']*";
        var regEx = new RegExp(regExStr, "gi");
        var items = regEx.exec(blacklist);
        if (items != null && items.length > 0) {
            var selector = items[0].split('~')[1];
            $(selector).hide();
        }
    }
}

