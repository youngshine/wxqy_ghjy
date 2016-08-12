App.controller('input-text', function (page,request) {
	var me = this;
	
	// 动态标题
	$(page).find('.app-title').html(request.title)

	var input = $(page).find('input');
	input.val(request.value); // 传入值

	$(page).find('.done').on('click', function (e){
		input.blur(); // 关闭软键盘
		var obj = {
			"value": input.val().trim()
		}
		me.reply(obj); // app.pick
	})	
});

App.controller('input-textarea', function (page,request) {
	var me = this;
	
	// 动态标题
	$(page).find('.app-title').html(request.title)

	var input = $(page).find('textarea');
	input.val(request.value); // 传入值

	$(page).find('.done').on('click', function (e){	
		input.blur(); // 关闭软键盘
		var obj = {
			"value": input.val().trim()
		}
		me.reply(obj); // app.pick
	})
});

App.controller('input-number', function (page,request) {
	var me = this;
	
	// 动态标题
	$(page).find('.app-title').html(request.title)
	
	var input = $(page).find('input');
	var val = request.value;
	val = val==0?'':val
	input.val(val); // 传入值:数字

	$(page).find('.done').on('click', function (e){
		input.blur(); // 关闭软键盘
		var obj = {
			"value": input.val()
		}
		me.reply(obj); // app.pick
	})	
});

App.controller('input-date', function (page,request) {
	var me = this;
	
	// 动态标题
	$(page).find('.app-title').html(request.title)

	var input = $(page).find('input');
		
	var value = request.value
	if(value == ''){
		value = new Date();
		var year = value.getFullYear(),
			month = value.getMonth()+1,
			day = value.getDate();
		// 转字符
		year = year.toString()
		month = month.toString()
		day = day.toString()
		month = month.length==1?'0'+month : month;	
		day = day.length==1?'0'+day : day
		value = year + '-' + month + '-' + day //value.toLocaleString()
	}
		
	console.log(value)
	input.val(value); // 传入值

	$(page).find('.done').on('click', function (e){
		var obj = {
			"value": input.val()
		}
		me.reply(obj); // app.pick
	})	
});

