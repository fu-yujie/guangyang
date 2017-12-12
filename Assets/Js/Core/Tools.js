//弹层自动消失
function showMsg(msg, type, callback) {
    var d = dialog({
        content: msg,
        onremove: callback
    });
    d.show();
    //var bgcolor = "#EBEBEB";
    //switch (type) {
    //    case 1:
    //        bgcolor = "#9AFF9A";
    //        break;
    //    case 2:
    //        bgcolor = "#EEEE00";
    //        break;
    //    case 3:
    //        bgcolor = "#FF4040";
    //        break;
    //    case 4:
    //        bgcolor = "#FFFACD";
    //        break;
    //}

    //$("div[i='dialog']").css("background-color", bgcolor);
    setTimeout(function () {
        d.close().remove();
    }, 2000);
}
//成功信息提示框（自动消失）  
function showSuccessMsg(msg, callback) {
    if (msg) {
        showMsg(msg, 1, callback)
    }
    else {
        showMsg("操作成功", 1, callback)
    }

}
//警告信息提示框（自动消失）  
function showWarningMsg(msg) {
    showMsg(msg, 2)
}
//错误信息提示框（自动消失）  
function showErrorMsg(msg, callback) {
    if (msg) {
        showMsg(msg, 3, callback)
    }
    else {
        showMsg("操作失败", 3, callback)
    }
}
//信息提示框（自动消失）  
function showInfoMsg(msg) {
    showMsg(msg, 4)
}

//信息提示框
function alertMsg(msg) {

    var d = dialog({
        title: '提示',
        content: msg
    });
    d.show();
}

//确认
function confirmMsg(msg, callback) {

    var d = dialog({
        title: '确认',
        content: msg,
        
        button: [{
            value: '确定',
            autofocus: true,
            callback: callback
        },
        {
            value: '取消',
            callback: function () { },
        }]
    });
    d.show();
}
//确认后进行ajax操作
function confirmAfterDoAjax(msg, url, data, callback) {

    confirmMsg(msg, function () {
        $.ajax({
            url: url,
            data: data,
            type: "POST",
            dataType: "json"
        }).done(function (d) {
            if (callback) {
                callback(d);
            }
        }).fail(function () {
            showErrorMsg("网络繁忙，请稍后再试")
        })
    })
}
//删除确认框
function confirmDelete(url, data, callback) {
    confirmAfterDoAjax("确定要删除此记录吗?", url, data, callback)
}
//修改确认框
function confirmUpdate(url, data, callback) {
    confirmAfterDoAjax("确定要保存更改吗?", url, data, callback)
}


//弹出模态框
function showModalDialog(title, content, buttons, width, height,Id) {

    var d = dialog({
        id:Id,
        title: title,
        content: content,
        button: buttons,
        width: width,
        height: height

    });
    d.showModal();
}



//提交完成
function showSubmitResult(e, textStatus, jqXHR, callback) {
    if (e.IsSuccess) {
        dialog({ id: 'UpdateForm' }).close().remove();
        showSuccessMsg("操作成功", function () {
            if (callback) {
                callback(e);
            }
            else {
                window.frames["workspace"].location.reload();
            }
        });
    }
    else {
        showErrorMsg(e.Message);
    }
}
//弹出数据模态框框
function showDataFormModalDialog(url, title, width, height) {

    var buttons = [
        {
            value: "确定",
            autofocus: true,
            callback: function () {
                $("#editForm").submit();
                return false;
            }
        },
        {
            value: '取消'
        }
    ]

    $.get(url, function (content) {
        showModalDialog(title, content, buttons, width, height,'UpdateForm')
    });
}

function showDataFormModalDialogWithCallback(url, title, Callback, width, height) {

    var buttons = [
        {
            value: "确定",
            autofocus: true,
            callback: Callback
        },
        {
            value: '取消'
        }
    ]

    $.get(url, function (content) {
        showModalDialog(title, content, buttons, width, height,'UpdateForm')
    });
}

function showDataFormModalDialogWithId(url, title,width, height, Id) {
    var buttons = [
        
        {
            value: '取消'
        }
    ]

    $.get(url, function (content) {
        showModalDialog(title, content, buttons, width, height,Id)
    });
}


function htmldecode(s) {
    var div = document.createElement('div');
    div.innerHTML = s;
    return div.innerText || div.textContent;
}


function htmlEncode(str) {
    var ele = document.createElement('span');
    ele.appendChild(document.createTextNode(str));
    return ele.innerHTML;
}