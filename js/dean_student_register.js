// 公众号注册的学生，分配给咨询师
App.controller('home', function (page) {
	// 离开页面appForward、隐藏删除按钮if any
	var $list = $(page).find('.list'),
		$listItem = $(page).find('.listItem').remove()	

	var params = { 
		"schoolID": gSchoolID //7 //USER_SCHOOL_ID,
	}
	console.log(params)	
	readData(function(data){
		populateData(data)	
		handleData( $list )
		//records = data;
	}, params );


	function readData(callback, obj){
		showPrompt('加载中...');		
		$.ajax({
	    	url: gDataUrl + 'readStudentListByRegister.php',
			data: obj,
			dataType: "json",
			success: function(result){
				hidePrompt()
				console.log(result)
			    //populateData(result.data)
				callback(result.data)
			},
			error: function(xhr, type){
				showPrompt('读取微信学生出错');	
			}
		});
	}

	function populateData(items){
		if($list.children().length != 0){
			$list.empty(); //清除旧的列表项 if any
		}
		items.forEach(function (item) {
			var $node = $listItem.clone(true);
			$node.find('.name').text(item.studentName); //studentName = ''
			$node.find('.phone').text(item.phone);
			$node.find('.schoolsub').text(item.fullname);
			$node.find('.created').text(item.created.substr(0,10));
			//display:none
			$node.find('.schoolID').text(item.schoolID);
			$node.find('.id').text(item.studentID);			
			$list.append($node);
		});
	}	
	function handleData(list){
		//var removeItem = null; //当前行删除按钮		
		list.find('.listItem').on({
			click: function () {
				var selected = $(this)
				var item = {	
					"studentID": $(this).find('.id').text(),
					"studentName": $(this).find('.name').text(),
					//"created": $(this).find('.created').text(),
					//"schoolName": $(this).find('.school').text(),
					"schoolID": $(this).find('.schoolID').text(),
				}
				console.log(item)
				//App.load('detail', obj);
				App.pick('select-member', item, function (data) {
					if(data){ 	
						// 后台更新资料 updateStudent.php
						console.log(data.consultID)
						showPrompt('正在更新...');		
						$.ajax({
					    	url: gDataUrl + 'updateStudent.php',
							data: data,
							dataType: "json",
							success: function(result){
								hidePrompt()
								console.log(result)
								toast('学生归属成功')
								// 结贴，相应的列表项listItem 移除消失
								selected.remove()
								
								// 微信通知咨询师, result返回咨询师userId
								doWxMsgText(result.data.userId)
							},
						});					
					}
				});
			},	
		})
	}
	
	// 微信文本通知咨询师有新的学生，全局函数公用
	function doWxMsgText(userId){		
		var objMsg = {
			userId : userId, // all = '@all
			type : "归属学生",
			msg : '你有新的学生',
			agentId : 9, // 9=咨询模块，0系统小助手
			link : '' //'news-notify-zepto.php?id=' + result.data.news_id // 刚新增的公文id
		}
		console.log(objMsg)
		wxMsgText(objMsg)
	}

}); // ends controller


// 选择分配归属咨询师
App.controller('select-member', function (page,request) {
	var me = this;
	var $list = $(page).find('.app-list'),
		$listItem = $(page).find('.app-list li').remove()	
	
	var btnOk = $(page).find('.ok')
	
	var consultID = 0 //未选中咨询师

	var params = {
		"schoolID": request.schoolID //gSchoolID
	}	
	readData(params); 
	
	function readData(obj){
		showPrompt('读取咨询师...');		
		$.ajax({
	    	url: gDataUrl + 'readConsultList.php',
			data: obj,
			dataType: "json",
			success: function(result){
				hidePrompt()
				console.log(result)
			    populateData(result.data)
			},
			error: function(xhr, type){
				showPrompt('读取咨询师出错');	
			}
		});
  	}

	function populateData(items){
		if($list.children().length != 0){
			$list.empty(); //清除旧的列表项 if any
		}
		items.forEach(function (item) {
			var $node = $listItem.clone(true); 
			$node.find('.name').text(item.consultName);
			$node.find('.id').text(item.consultID);			
			$list.append($node);
		});
		
		$list.find('li').on('click', function (e){		
			$('li').css('background','#fff'); // all 
			$(this).css('background','#E0FFFF'); //me
			//$('.nj li', this).hide();//css('color','blue'); 
			consultID = $(this).find('.id').text();
			btnOk.show();
		})
		
		btnOk.bind('click', function () {		
			var objRet = {
				"consultID": consultID,
				"studentID": request.studentID
			}
			App.dialog({
			  title	       : '归属学生给该咨询师？', //'删除当前公告？',
			  okButton     : '确定',
			  cancelButton : '取消'
			}, function (choice) {
				if(choice){
					me.reply(objRet);
				}
			});
			
		})	
	}
}); // select-member	


