// 问题反馈论坛bbs
App.controller('home', function (page) {
	// 离开页面、隐藏删除按钮if any
	$(page).on('appForward', function () {
		$('.btnRemove').hide();
	}); 
	/* 工具栏向下滑动，清零刷新, android不行？
	$(page).find('.app-title').swipeDown(function(){
		search.val('');	
		//$list.empty();			
		readData(callback??,params)
	}); */
	
	var $list = $(page).find('.app-list'),
		$listItem = $(page).find('.app-list li').remove()	
	
	var btnAddnew = $(page).find('.addnew')
	btnAddnew.on('click',function(){
		//App.load('addnew',{schoolID: gSchoolID})
		App.pick('addnew', {'schoolID':gSchoolID}, function (data) {
			if(data){ 
				console.log(data)
				// 保存新增,ajax
				$.ajax({
					url: gDataUrl + 'createConsult.php',
					data: data,
					dataType: 'json',
					success: function(result){
						console.log(result)
						// 前端添加显示记录，不刷新服务器数据库
						var $node = $listItem.clone(true);
						// 返回新插入记录id，删除用
						$node.find('.id').text(result.data.consultID);
						$node.find('.name').text(data.username); 
						$node.find('.gender').text(data.gender);
						//display:none
						$node.find('.schoolID').text(data.schoolID);			
						$list.prepend($node);
						toast('添加咨询师成功')
					},
				});
			}
		});
	})


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
	    	url: gDataUrl + 'readConsultList.php',
			data: obj,
			dataType: "json",
			success: function(result){
				hidePrompt()
				console.log(result)
				callback(result.data)
			},
			error: function(xhr, type){
				showPrompt('读取咨询出错');	
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
			$node.find('.gender').text(item.gender);
			//display:none
			$node.find('.schoolID').text(item.schoolID);
			//$node.find('.created').text(item.created.substr(0,10));
			$node.find('.id').text(item.consultID);			
			$list.append($node);
		});
	}	

	function handleData(list){	
		list.find('li').on({
			// for android
			longTap: function (e) {
				$('.btnRemove').hide()
				$('.btnRemove', this).show()
			},
			swipeLeft: function (e) {
				$('.btnRemove').hide()
				$('.btnRemove', this).show()
			},
			click: function (e) {
				console.log(e.target.className)
				if(e.target.className == 'btnRemove'){
					doRemove($(this))
				}else{	
					var hasBtn = false 
					var btns = $('.btnRemove');
					btns.forEach(function(btn){
						console.log($(btn).css('display'))
						if( $(btn).css('display')=='inline' ){
							$(btn).hide()
							hasBtn = true;
							return false //exit循环
						}
					})
					if(!hasBtn){
						doShow( $(this) )
						console.log('show')
					}
				}
			},	
		})
/*		
		// click删除
		list.find('li').find('.removeItem').on('click',function(){
			//toRemoveItem($(this).parent('li'))
			//$(this).parent('li').remove()	
			var selectedLi = $(this).parent('li');		
			var id = selectedLi.find('.id').text();
			console.log(id)
			//listItem.remove()
		
			App.dialog({
			  title	       : '删除当前记录？', //'删除当前公告？',
			  okButton     : '确定',
			  cancelButton : '取消'
			}, function (choice) {
				if(choice){
					deleteData(id,selectedLi);
				}
			});
		}) */
	}

	function doRemove(listItem){
		//listItem.remove()		
		App.dialog({
		  title	       : '删除当前记录？', //'删除当前公告？',
		  okButton     : '确定',
		  cancelButton : '取消'
		}, function (choice) {
			if(choice){
				var id = listItem.find('.id').text();
				console.log(id)
				deleteData(id,listItem);
			}
		});
		
		function deleteData(ID,selected){
			showPrompt('正在删除...');
			$.ajax({
				url: gDataUrl + 'deleteConsult.php',
				data: {teacherID:ID},
				dataType: "json", // 返回的也是 json
				success: function(result){
					if(result.success){
						hidePrompt();
						//显示服务端出错信息,有跟贴子表记录，不能删除
						selected.remove()
					}else{
						toast(result.message)
					}						
				},
			});
		}	
	}	

	function doShow(selectedLi){
		var obj = {	
			"consultID": selectedLi.find('.id').text(),
			"consultName": selectedLi.find('.name').text(),
		}
		console.log(item)
		// 如果下面存在删除记录，用pick，否则用load
		/*
		App.pick('detail', item, function (data) {
			if(data){ 	
				// 结贴，相应的列表项listItem 移除消失
				selectedLi.remove()
			}
		});	 */
	}
}); // ends controller


// 选择分配归属咨询师
App.controller('addnew', function (page,request) {
	var me = this;

	var btnSubmit = $(page).find('.submit')
	
	// 提交保存按钮
	btnSubmit.on('click',function(e){		
		var gender = $(page).find("#selGender").val(); //text()
		if(gender == '无'){
			toast('请选择性别');return;		
		}
	    var username = $(page).find('input[name=username]').val()			
		if(username == ''){
			toast('请输入姓名');return;		
		}
		
		App.dialog({
			title	     : '保存？', //'删除当前公告？',
			okButton     : '确定',
			cancelButton : '取消'
		}, function (choice) {
			if(choice){		
				var obj = {
					gender: gender,
					username: username,
					schoolID: gSchoolID
				}
				me.reply(obj)
			}
		});
    });	
	
}); // addnew	


