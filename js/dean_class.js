// 管理创建大小班级 by 执行校长
App.controller('home', function (page) {
	// 离开页面、隐藏删除按钮if any
	$(page).on('appForward', function () {
		$('.btnRemove').hide();
	}); 
	
	var $list = $(page).find('.list'),
		$listItem = $(page).find('.listItem').remove()	
	var $search = $(page).find('input[type=search]')
	var btnAddnew = $(page).find('.addnew')
	
	btnAddnew.on('click',function(){
		//App.load('addnew',{schoolID: gSchoolID})
		App.pick('addnew', {'schoolID':gSchoolID}, function (data) {
			if(data){ 
				console.log(data)
				// 保存新增,ajax
				$.ajax({
					url: gDataUrl + 'createClass.php',
					data: data,
					dataType: 'json',
					success: function(result){
						console.log(result)
						// 前端添加显示记录，不刷新服务器数据库
						var $node = $listItem.clone(true);
						// 返回新插入记录id，删除用
						$node.find('.id').text(result.data.classID);
						$node.find('.title').text(data.title); 
						$node.find('.hour').text(data.hour+'小时');
						$node.find('.amount').text(data.amount+'元');
						$node.find('.teacher').text('教师：'+data.teacherName);
						//display:none
						//$node.find('.userId').text(data.userId);
						$node.find('.schoolID').text(data.schoolID);			
						$list.prepend($node);
						
						handleData($list); //新插入的才能操作
						toast('创建班级成功')
					},
				});
			}
		});
	})

	var records = []; // all for search
	var params = { 
		"schoolID": gSchoolID 
	}
	//loadData(params); 
	
	//function loadData(obj){		
		readData(function(data){
			populateData(data)	
			handleData( $list )
			records = data;
		}, params );
	//}

	function readData(callback, obj){
		showPrompt('加载中...');		
		$.ajax({
	    	url: gDataUrl + 'readClassesList.php',
			data: obj,
			dataType: "json",
			success: function(result){
				hidePrompt()
				console.log(result)
				callback(result.data)
			},
			error: function(xhr, type){
				showPrompt('读取班级出错');	
			}
		});
	}

	function populateData(items){
		if($list.children().length != 0){
			$list.empty(); //清除旧的列表项 if any
		}
		items.forEach(function (item) {
			var $node = $listItem.clone(true);
			$node.find('.title').text(item.title); 
			$node.find('.hour').text(item.hour+'小时');
			$node.find('.amount').text(item.amount+'元');
			$node.find('.teacher').text('教师：'+item.teacherName);
			//display:none
			$node.find('.schoolID').text(item.schoolID);
			//$node.find('.created').text(item.created.substr(0,10));
			$node.find('.userId').text(item.userId);
			$node.find('.id').text(item.classID);			
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
				url: gDataUrl + 'deleteClasses.php',
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
			"classID": selectedLi.find('.id').text(),
		}
		console.log(item)
		App.load('student',item)
	}
	
	$search.on('click', function () {
		App.dialog({
			数理化Button     : '数理化',
			史地生Button     : '史地生',
			语政英Button     : '语政英',
			艺术Button     : '艺术',
			cancelButton : '取消'
		}, function (choice) {
		  if (choice) {
		    console.log(choice)
			$search.val(choice)  
			var filter = records.filter(function(ele,pos){
			    return ele.classType == choice ;
			});
			console.log(filter)
			populateData(filter)
			handleData( $list )
		  }
		});
	});	
}); // ends controller


// 选择任课教师
App.controller('addnew', function (page,request) {
	var me = this; console.log(request)
	
	// 读取该学校的分校区列表（至少都有一个分校区）
	$.ajax({
    	url: gDataUrl + 'readTeacherList.php',
		data: {"schoolID":request.schoolID},
		dataType: "json",
		success: function(result){
			console.log(result.data)
			$.each(result.data,function(index,item){
				$(page).find("#selTeacher")
				.append("<option value=" + 
				item.teacherID + ">" + 
				item.teacherName + "</option>");
			})
		},
		error: function(xhr, type){
			showPrompt('读取教师出错');	
		}
	});

	var btnSubmit = $(page).find('.submit')
	
	// 提交保存按钮
	btnSubmit.on('click',function(e){		
	    var title = $(page).find('input[name=title]').val()			
		if(title == ''){
			toast('请输入班级名称');return;		
		}
		var classType = $(page).find("#selClasstype").val(); //text()
		if(classType == '无'){
			toast('请选择班级分类');return;		
		}
		var hour = $(page).find('input[name=hour]').val()	
		if(hour == 0){
			toast('请填写课时');return;		
		}
		var amount = $(page).find('input[name=amount]').val()	
		if(amount == 0){
			toast('请填写金额');return;		
		}
		
		var teacherID = $(page).find("#selTeacher").val(); //text()
		if(teacherID == 0){
			toast('请选择任课教师');return;		
		}
		// zepto select
		var teacherName = $(page).find("#selTeacher").find('option').not(function(){ return !this.selected })
		teacherName = teacherName.text()
		
		var weekday = $(page).find("#selWeekday").val(); 
		var timespan = $(page).find("#selTimespan").val(); 
		
		App.dialog({
			title	     : '保存？', //'删除当前公告？',
			okButton     : '确定',
			cancelButton : '取消'
		}, function (choice) {
			if(choice){		
				var obj = {
					classType: classType,
					title: title,
					hour: hour,
					amount: amount,
					weekday: weekday,
					timespan: timespan,
					teacherID: teacherID,
					teacherName: teacherName,
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
		"classID": request.classID //consultID
	}
	console.log(params)
	readData(function(data){
		populateData(data)	
		//handleData( $list )
		//records = data;
	}, params );

	function readData(callback, obj){
		showPrompt('加载中...');		
		$.ajax({
	    	url: gDataUrl + 'readStudentListByClass.php',
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
			$node.find('.gender').text(item.gender);
			$node.find('.schoolsub').text(item.fullname);
			//$node.find('.created').text(item.created.substr(0,10));
			//display:none
			$node.find('.schoolID').text(item.schoolID);
			$node.find('.id').text(item.studentID);			
			$list.append($node);
		});
	}	
}); 


