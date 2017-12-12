function buttonClick() {
    $.ajax({
        url: '/BasicDataArea/NoticeMess/AddEntity',
        type: 'POST',
        dataType: 'json',
        data: { 'Title': $("input[name='Title']").val(), 'Content': UM.getEditor('myEditor').getContent() },
    })
}