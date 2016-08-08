// 管理咨询师 by 执行校长
App.controller('home', function (page) {
	// 离开页面、隐藏删除按钮if any
	$(page).on('appForward', function () {
		$('.btnRemove').hide();
	}); 
	
	var $list = $(page).find('.list'),
		$listItem = $(page).find('.listItem').remove()	
	
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
						//$node.find('.gender').text(data.gender);
						$node.find('.schoolsub').text(data.fullname);
						//display:none
						//$node.find('.userId').text(data.userId);
						$node.find('.schoolID').text(data.schoolID);			
						$list.prepend($node);
						
						handleData($list); //新插入的才能操作
						toast('添加咨询师成功')
					},
				});
			}
		});
	})


	var params = { 
		"schoolID": gSchoolID 
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
			//$node.find('.gender').text(item.gender);
			$node.find('.schoolsub').text(item.fullname);
			//display:none
			$node.find('.schoolID').text(item.schoolID);
			//$node.find('.created').text(item.created.substr(0,10));
			$node.find('.userId').text(item.userId);
			$node.find('.id').text(item.consultID);			
			$list.append($node);
		});
	}	

	function handleData(list){	
		list.find('.listItem').on({
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
					//doRemove($(this))
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
		var item = {	
			"consultID": selectedLi.find('.id').text(),
			"consultName": selectedLi.find('.name').text(),
			"userId": selectedLi.find('.userId').text(),
		}
		console.log(item)
		App.load('student',item)
	}
}); // ends controller


// 选择分配归属咨询师
App.controller('addnew', function (page,request) {
	var me = this; console.log(request)
	
	// 读取该学校的分校区列表（至少都有一个分校区）
	$.ajax({
    	url: gDataUrl + 'readSchoolsubList.php',
		data: {"schoolID":request.schoolID},
		dataType: "json",
		success: function(result){
			console.log(result.data)
			$.each(result.data,function(index,item){
				$(page).find("#selSchoolsub")
				.append("<option value=" + 
				item.schoolsubID + ">" + 
				item.fullname + "</option>");
			})
		},
		error: function(xhr, type){
			showPrompt('读取分校区出错');	
		}
	});

	var btnSubmit = $(page).find('.submit')
	
	// 提交保存按钮
	btnSubmit.on('click',function(e){		
	    var username = $(page).find('input[name=username]').val()			
		if(username == ''){
			toast('请输入姓名');return;		
		}
		var gender = $(page).find("#selGender").val(); //text()
		if(gender == '无'){
			toast('请选择性别');return;		
		}
		var schoolsubID = $(page).find("#selSchoolsub").val(); //text()
		if(schoolsubID == 0){
			toast('请选择分校区');return;		
		}
		// zepto select
		var fullname = $(page).find("#selSchoolsub").find('option').not(function(){ return !this.selected })
		fullname = fullname.text()
		
		App.dialog({
			title	     : '保存？', //'删除当前公告？',
			okButton     : '确定',
			cancelButton : '取消'
		}, function (choice) {
			if(choice){		
				var obj = {
					gender: gender,
					username: username,
					schoolsubID: schoolsubID,
					fullname: fullname,
					schoolID: request.schoolID
				}
				me.reply(obj)
			}
		});
    });	
	
}); // addnew	

App.controller('student', function (page,request) {
	var $list = $(page).find('.list'),
		$listItem = $(page).find('.listItem').remove()	

	var params = { 
		"consultID": request.userId //consultID
	}
	
	readData(function(data){
		populateData(data)	
		//handleData( $list )
		//records = data;
	}, params );

	function readData(callback, obj){
		showPrompt('加载中...');		
		$.ajax({
	    	url: gDataUrl + 'readStudentListByConsult.php',
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
			$node.find('.grade').text(item.gender+'•'+item.grade);
			$node.find('.created').text(item.created.substr(0,10));
			//display:none
			$node.find('.schoolID').text(item.schoolID);
			$node.find('.id').text(item.studentID);			
			$list.append($node);
		});
	}	
}); 


