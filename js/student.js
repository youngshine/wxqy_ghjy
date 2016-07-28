// 问题反馈论坛bbs
App.controller('home', function (page) {
	// 离开页面、隐藏删除按钮if any
	/*
	$(page).on('appForward', function () {
		$('.removeItem').hide();
	}); */
	/* 工具栏向下滑动，清零刷新, android不行？
	$(page).find('.app-title').swipeDown(function(){
		search.val('');	
		//$list.empty();			
		readData(callback??,params)
	}); */
	
	var $list = $(page).find('.app-list'),
		$listItem = $(page).find('.app-list li').remove()	
	/*
	search.bind('click', function () {
		selectOptions(records)
	});	 */

	//var records = []; // 全局表量，列表

	var params = { 
		"schoolID": gSchoolID //7 //USER_SCHOOL_ID,
	}
	//loadData(params); 
	
	//function loadData(obj){		
		readData(function(data){
			populateData(data)	
			handleData( $list )
			//records = data;
		}, params );
	//}

	function readData(callback, obj){
		showPrompt('加载中...');		
		$.ajax({
	    	url: gDataUrl + 'readStudentListByUn.php',
			data: obj,
			dataType: "json",
			success: function(result){
				hidePrompt()
				console.log(result)
			    //populateData(result.data)
				callback(result.data)
			},
			error: function(xhr, type){
				showPrompt('读取学生出错');	
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
			//display:none
			$node.find('.schoolID').text(item.schoolID);
			$node.find('.created').text(item.created.substr(0,10));
			$node.find('.id').text(item.studentID);			
			$list.append($node);
		});
	}	
	function handleData(list){
		//var removeItem = null; //当前行删除按钮		
		list.find('li').on({
			click: function () {
				var selected = $(this)
				var item = {	
					"studentID": $(this).find('.id').text(),
					"studentName": $(this).find('.name').text(),
					"created": $(this).find('.created').text(),
					"schoolName": $(this).find('.school').text(),
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
								toast('学生归属咨询师成功')
								// 结贴，相应的列表项listItem 移除消失
								selected.remove()
							},
							error: function(xhr, type){
								showPrompt('更新学生出错');	
							}
						});
						
					}
				});
			},	
		})
	}

}); // ends controller


// 选择分配归属咨询师
App.controller('select-member', function (page,request) {
	var me = this;
	var $list = $(page).find('.app-list'),
		$listItem = $(page).find('.app-list li').remove()	
	
	var btnOk = $(page).find('.ok'),
		consultID = 0

	var params = {
		"schoolID": gSchoolID
	}	
	readMemberList(params); 
	
	function readMemberList(obj){
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
			me.reply(objRet);
		})	
	}
}); // select-member	


