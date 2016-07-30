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
					url: gDataUrl + 'createTeacher.php',
					data: data,
					dataType: 'json',
					success: function(result){
						console.log(result)
						// 前端添加显示记录，不刷新服务器数据库
						var $node = $listItem.clone(true);
						// 返回新插入记录id，删除用，无法马上操作li??，没绑定handledata?
						$node.find('.id').text(result.data.teacherID);
						$node.find('.name').text(data.username); 
						$node.find('.subject').text(data.subjectName); 
						//$node.find('.gender').text(data.gender);
						//display:none
						$node.find('.schoolID').text(data.schoolID);			
						$list.prepend($node);
						toast('添加教师成功')
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
	    	url: gDataUrl + 'readTeacherList.php',
			data: obj,
			dataType: "json",
			success: function(result){
				hidePrompt()
				console.log(result)
			    //populateData(result.data)
				callback(result.data)
			},
			error: function(xhr, type){
				showPrompt('读取教师出错');	
			}
		});
	}

	function populateData(items){
		if($list.children().length != 0){
			$list.empty(); //清除旧的列表项 if any
		}
		items.forEach(function (item) {
			var $node = $listItem.clone(true);
			$node.find('.name').text(item.teacherName); 
			$node.find('.subject').text(item.subjectName);
			//display:none
			$node.find('.schoolID').text(item.schoolID);
			//$node.find('.created').text(item.created.substr(0,10));
			$node.find('.id').text(item.teacherID);			
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
				url: gDataUrl + 'deleteTeacher.php',
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
		//var obj = {
		var obj = {	
			"teacherID": selectedLi.find('.id').text(),
			"teacherName": selectedLi.find('.name').text(),
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
		var subjectName = '数学' //$(page).find("#selSubject").text();
		var subjectID = $(page).find("#selSubject").val();
		if(subjectID == 0){
			toast('请选择学科');return;		
		}
		if(subjectID == 2){
			subjectName = '物理'
		}else if(subjectID == 3){
			subjectName = '化学'
		}
		
	    var username = $(page).find('input[name=username]').val()			
		if(username == ''){
			toast('请输入教师姓名');return;		
		}
		
		App.dialog({
			title	     : '保存？', //'删除当前公告？',
			okButton     : '确定',
			cancelButton : '取消'
		}, function (choice) {
			if(choice){		
				var obj = {
					username: username,
					subjectID: subjectID,
					subjectName: subjectName, //显示用
					schoolID: gSchoolID
				}
				me.reply(obj)
			}
		});
    });	
	
}); // addnew	


