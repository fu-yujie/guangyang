$(function() {
	var num = 1;
	$('em').on('click', function() {	
		num *= -1;
		if(num == 1) {
			$(this).text('启用');
			$(this).css('color', '#333333');
		} else if(num == -1) {
			$(this).text('停用');
			$(this).css('color', 'red');
		}
	})
})
