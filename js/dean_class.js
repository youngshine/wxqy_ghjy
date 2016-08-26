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
						$node.find('.classType').text(data.classType); 
						$node.find('.beginDate').text(data.beginDate);
						$node.find('.persons').text(data.persons);
						$node.find('.weekday').text(data.weekday);
						$node.find('.timespan').text(data.timespan);
						$node.find('.teacher').text(data.teacherName);
						$node.find('.teacherID').text(data.teacherID);
						$node.find('.schoolsub').text(data.fullname);
						$node.find('.schoolsubID').text(data.schoolsubID);
						//display:none
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
	readData(function(data){
		populateData(data)	
		handleData( $list )
		records = data;
	}, params );

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
		var grp = ''
		items.forEach(function (item) {
			if(item.fullname != grp){
				grp = item.fullname
				$list.append('<label style="padding:10px;color:#888;">' + grp + '</label>')
			}
			var $node = $listItem.clone(true);
			$node.find('.title').text(item.title); 
			$node.find('.classType').text(item.classType);
			$node.find('.beginDate').text(item.beginDate);
			$node.find('.persons').text(item.persons);
			
			$node.find('.weekday').text(item.weekday);
			$node.find('.timespan').text(item.timespan);
			$node.find('.hour').text(item.hour);
			$node.find('.amount').text(item.amount);
			
			$node.find('.teacher').text(item.teacherName);
			$node.find('.teacherID').text(item.teacherID);
			$node.find('.schoolsub').text(item.fullname);
			$node.find('.schoolsubID').text(item.schoolsubID);
			$node.find('.schoolID').text(item.schoolID);
			//$node.find('.created').text(item.created.substr(0,10));
			//display:none
			//$node.find('.userId').text(item.userId);
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
				}else if(e.target.className == 'btnEdit'){
					doEdit( $(this) )	
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

	function doEdit(selectedLi){
		var item = {	
			"classID"  : selectedLi.find('.id').text(),
			"title": selectedLi.find('.title').text(),
			"classType": selectedLi.find('.classType').text(),
			"beginDate": selectedLi.find('.beginDate').text(),
			"persons": selectedLi.find('.persons').text(),
			"weekday": selectedLi.find('.weekday').text(),
			"timespan": selectedLi.find('.timespan').text(),
			"hour": selectedLi.find('.hour').text(),
			"amount": selectedLi.find('.amount').text(),
			"teacher": selectedLi.find('.teacher').text(),
			"teacherID": selectedLi.find('.teacherID').text(),
			"schoolsub": selectedLi.find('.schoolsub').text(),
			"schoolsubID": selectedLi.find('.schoolsubID').text()
		}
		console.log(item)
		App.pick('edit', item, function (data) {
			if(data){ 
				console.log(data)
				$.ajax({
					url: gDataUrl + 'updateClass.php',
					data: data,
					dataType: 'json',
					success: function(result){
						console.log(result)
						selectedLi.find('.title').text(data.title); 
						selectedLi.find('.classType').text(data.classType); 
						selectedLi.find('.beginDate').text(data.beginDate);
						selectedLi.find('.persons').text(data.persons);
						selectedLi.find('.weekday').text(data.weekday);
						selectedLi.find('.timespan').text(data.timespan);
						selectedLi.find('.teacher').text(data.teacherName);
						selectedLi.find('.teacherID').text(data.teacherID);
						selectedLi.find('.schoolsub').text(data.fullname);
						selectedLi.find('.schoolsubID').text(data.schoolsubID);

						//handleData($list); //新插入的才能操作
						toast('修改班级成功')
					},
				});
			}
		});
	}
	
	function doShow(selectedLi){
		var item = {	
			"classID"  : selectedLi.find('.id').text(),
			"beginDate": selectedLi.find('.beginDate').text(),
			"hour": selectedLi.find('.hour').text(),
			"amount": selectedLi.find('.amount').text()
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

App.controller('student', function (page,request) {
	var $list = $(page).find('.list'),
		$listItem = $(page).find('.listItem').remove()	

	$(page).find('.info')
		.text(request.hour+'课时'+request.amount+'元｜'+request.beginDate+'开课')
	
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


/* 选择任课教师
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
	
}); // addnew	*/

// new新增
App.controller('addnew', function (page) {
	var me = this;

	var title='',classType='', beginDate='', persons = 0,
	hour=0,amount=0,weekday='',timespan='',
	teacherName='',teacherID=0,
	schoolsubID=0,fullname='';

	var btnSubmit = $(page).find('.submit'),
		$title = $(page).find('.title'),
		$classType = $(page).find('.classType'),
		$beginDate = $(page).find('.beginDate'),
		$persons = $(page).find('.persons'),
		$hour = $(page).find('.hour'),
		$amount = $(page).find('.amount'),
		$weekday = $(page).find('.weekday'),
		$timespan = $(page).find('.timespan'),
		$teacher = $(page).find('.teacher'),
		$schoolsub = $(page).find('.schoolsub')

	// 选择学校所有教师，不是来自企业号department_id=1根部门，而是来自数据库 
	$teacher.parent().on('click', function () {
		// 传入企业号部门id，根部门1，fetch=1 全部包括子部门
		App.pick('select-member', {"schoolID":gSchoolID}, function (data) {
			if(data){ // 取消返回
				console.log(data)
				$teacher.text(data.teacherName);
				teacherName = data.teacherName;
				teacherID = data.teacherID
			}
		});
	})	
	// 分校区
	$schoolsub.parent().on('click', function () {
		// 传入企业号部门id，根部门1，fetch=1 全部包括子部门
		App.pick('select-schoolsub', {"schoolID":gSchoolID}, function (data) {
			if(data){ // 取消返回
				console.log(data)
				$schoolsub.text(data.fullname);
				fullname = data.fullname;
				schoolsubID = data.schoolsubID
			}
		});
	})	

	// 空白不能点击所以用parent()???
	$title.parent().on('click', function () {
		App.pick('input-text', {'value':title,'title':'班级名称'}, function (data) {
			if(data){ // 取消返回没有数值
				console.log(data)
				$title.text(data.value);
				title = data.value;
			}
		});
	})	
	$beginDate.parent().on('click', function () {	
		//var value = inputdate.val();
		//value = value.substring(0,10)
		App.pick('input-date', {'value':beginDate,'title':'开课日期'}, function (data) {
			if(data && data.value !=''){ // 取消返回没有数值
				//inputdate.val('开始日期：'+data.value);
				$beginDate.text(data.value)
				beginDate = data.value;
			}
		});
	})	
	$persons.parent().on('click', function () {
		App.pick('input-number', {'value':persons,'title':'计划人数'}, function (data) {
			if(data && data.value !=''){ 
				$persons.text(data.value)
				persons = data.value;
			}
		});
	})
	$hour.parent().on('click', function () {
		App.pick('input-number', {'value':hour,'title':'课时数'}, function (data) {
			if(data && data.value !=''){ 
				$hour.text(data.value)
				hour = data.value;
			}
		});
	})
	$amount.parent().on('click', function () {
		App.pick('input-number', {'value':amount,'title':'金额'}, function (data) {
			if(data && data.value !=''){ 
				$amount.text(data.value)
				amount = data.value;
			}
		});
	})
	$classType.parent().on('click', function () {
		/* v2.0有的小米手机，无法点击‘确定’
		App.dialog({
			数理化Button     : '数理化',
			史地生Button     : '史地生',
			语政英Button     : '语政英',
			艺术Button     : '艺术'
		}, function (tryAgain) {
		  if (tryAgain) {
			  classType = tryAgain
			  $classType.text(classType);
		  }
		}); */
		var arr = ['数理化','史地生','语政英','艺术'];
		App.pick('select-option', arr, function (data) {
			if(data){ // 取消返回
				console.log(data)
				classType = data.value;
				$classType.text(classType);
			}
		});
	}) 
	$timespan.parent().on('click', function () {
		var arr = [
			'08:00','08:30','09:00','09:30','10:00','10:30','11:00',
			'14:00','14:30','15:00','15:30','16:00','16:30','17:00',
			'18:30','19:00','19:30','20:00'
			];
		App.pick('select-option', arr, function (data) {
			if(data){ // 取消返回
				console.log(data)
				timespan = data.value;
				$timespan.text(timespan);
			}
		});
	}) 
	$weekday.parent().on('click', function () {
		/*
		App.dialog({
			周一Button     : '周一',
			周二Button     : '周二',
			周三Button     : '周三',
			周四Button     : '周四',
			周五Button     : '周五',
			周六Button     : '周六',
			周日Button     : '周日'
		}, function (tryAgain) {
		  if (tryAgain) {
			  weekday = tryAgain
			  $weekday.text(weekday);
		  }
		}); */
		var arr = ['周一','周二','周三','周四','周五','周六','周日'];
		App.pick('select-option', arr, function (data) {
			if(data){ // 取消返回
				console.log(data)
	  			  weekday = data.value
	  			  $weekday.text(weekday);
			}
		});
	}) 

	btnSubmit.on('click', function () {			
		if(title=='' || classType=='' ||beginDate==''|| persons==0 || 
			hour==0||amount==0||weekday==''||timespan==''||schoolsubID==0){
			toast('项目填写不完整',3000)
			return;	
	    }
	
		App.dialog({
			title	     : '新增保存？', 
			okButton     : '确定',
			cancelButton : '取消'
		}, function (choice) {
			if(choice){
				var obj = {
					"title": title,
					"classType": classType,
					"beginDate": beginDate,
					"persons": persons,
					"hour": hour, 
					"amount": amount,
					"weekday": weekday,
					"timespan": timespan, 
					"teacherName": teacherName,
					"teacherID": teacherID,
					"fullname": fullname,
					"schoolsubID": schoolsubID, //分校区
					"schoolID": gSchoolID, //所属学校
				}
				console.log(obj);
				me.reply(obj); // app.pick
			}	
		});
	})	
}); // 新增new	

// 修改edit
App.controller('edit', function (page,request) {
	var me = this; console.log(request)

	var title = request.title,
		classType = request.classType, 
		beginDate = request.beginDate, 
		persons = request.persons, 
	    hour = request.hour,
		amount = request.amount,
		weekday = request.weekday,
	    timespan = request.timespan,
		teacherName = request.teacher,
		teacherID = request.teacherID,
		fullname = request.schoolsub, //分校区
		schoolsubID = request.schoolsubID,
		classID = request.classID // unique

	var btnSubmit = $(page).find('.submit'),
		$title = $(page).find('.title').text(title),
		$classType = $(page).find('.classType').text(classType),
		$beginDate = $(page).find('.beginDate').text(beginDate),
		$persons = $(page).find('.persons').text(persons),
		$hour = $(page).find('.hour').text(hour),
		$amount = $(page).find('.amount').text(amount),
		$weekday = $(page).find('.weekday').text(weekday),
		$timespan = $(page).find('.timespan').text(timespan),
		$teacher = $(page).find('.teacher').text(teacherName),
		$schoolsub = $(page).find('.schoolsub').text(fullname)

	// 选择学校所有教师，不是来自企业号department_id=1根部门，而是来自数据库 
	$teacher.parent().on('click', function () {
		// 传入企业号部门id，根部门1，fetch=1 全部包括子部门
		App.pick('select-member', {"schoolID":gSchoolID}, function (data) {
			if(data){ // 取消返回
				console.log(data)
				$teacher.text(data.teacherName);
				teacherName = data.teacherName;
				teacherID = data.teacherID
			}
		});
	})	
	// 分校区
	$schoolsub.parent().on('click', function () {
		// 传入企业号部门id，根部门1，fetch=1 全部包括子部门
		App.pick('select-schoolsub', {"schoolID":gSchoolID}, function (data) {
			if(data){ // 取消返回
				console.log(data)
				$schoolsub.text(data.fullname);
				fullname = data.fullname;
				schoolsubID = data.schoolsubID
			}
		});
	})	

	// 空白不能点击所以用parent()???
	$title.parent().on('click', function () {
		App.pick('input-text', {'value':title,'title':'班级名称'}, function (data) {
			if(data){ // 取消返回没有数值
				console.log(data)
				$title.text(data.value);
				title = data.value;
			}
		});
	})	
	$beginDate.parent().on('click', function () {	
		//var value = inputdate.val();
		//value = value.substring(0,10)
		App.pick('input-date', {'value':beginDate,'title':'开课日期'}, function (data) {
			if(data && data.value !=''){ // 取消返回没有数值
				//inputdate.val('开始日期：'+data.value);
				$beginDate.text(data.value)
				beginDate = data.value;
			}
		});
	})	
	$persons.parent().on('click', function () {
		App.pick('input-number', {'value':persons,'title':'计划人数'}, function (data) {
			if(data && data.value !=''){ 
				$persons.text(data.value)
				persons = data.value;
			}
		});
	})
	$hour.parent().on('click', function () {
		App.pick('input-number', {'value':hour,'title':'课时数'}, function (data) {
			if(data && data.value !=''){ 
				$hour.text(data.value)
				hour = data.value;
			}
		});
	})
	$amount.parent().on('click', function () {
		App.pick('input-number', {'value':amount,'title':'金额'}, function (data) {
			if(data && data.value !=''){ 
				$amount.text(data.value)
				amount = data.value;
			}
		});
	})
	$classType.parent().on('click', function () {
		/*App.dialog({
			数理化Button     : '数理化',
			史地生Button     : '史地生',
			语政英Button     : '语政英',
			艺术Button     : '艺术'
		}, function (tryAgain) {
		  if (tryAgain) {
			  classType = tryAgain
			  $classType.text(classType);
		  }
		}); */
		var arr = ['数理化','史地生','语政英','艺术'];
		App.pick('select-option', arr, function (data) {
			if(data){ // 取消返回
				console.log(data)
				classType = data.value;
				$classType.text(classType);
			}
		});
	}) 
	$timespan.parent().on('click', function () {
		var arr = [
			'08:00','08:30','09:00','09:30','10:00','10:30','11:00',
			'14:00','14:30','15:00','15:30','16:00','16:30','17:00',
			'18:30','19:00','19:30','20:00'
		];
		App.pick('select-option', arr, function (data) {
			if(data){ // 取消返回
				console.log(data)
				timespan = data.value;
				$timespan.text(timespan);
			}
		});
	}) 
	$weekday.parent().on('click', function () {
		/*App.dialog({
			周一Button     : '周一',
			周二Button     : '周二',
			周三Button     : '周三',
			周四Button     : '周四',
			周五Button     : '周五',
			周六Button     : '周六',
			周日Button     : '周日'
		}, function (tryAgain) {
		  if (tryAgain) {
			  weekday = tryAgain
			  $weekday.text(weekday);
		  }
		}); */
		var arr = ['周一','周二','周三','周四','周五','周六','周日'];
		App.pick('select-option', arr, function (data) {
			if(data){ // 取消返回
				console.log(data)
	  			  weekday = data.value
	  			  $weekday.text(weekday);
			}
		});
	}) 

	btnSubmit.on('click', function () {			
		if(title=='' || classType=='' ||beginDate==''|| persons==0 || 
			hour==0||amount==0||weekday==''||timespan==''||schoolsubID==0){
			toast('项目填写不完整',3000)
			return;	
	    }
	
		App.dialog({
			title	     : '修改保存？', 
			okButton     : '确定',
			cancelButton : '取消'
		}, function (choice) {
			if(choice){
				var obj = {
					"title": title,
					"classType": classType,
					"beginDate": beginDate,
					"persons": persons,
					"hour": hour, 
					"amount": amount,
					"weekday": weekday,
					"timespan": timespan, 
					"teacherName": teacherName,
					"teacherID": teacherID,
					"schoolsubID": schoolsubID, //分校区
					"fullname": fullname,
					//"schoolID": gSchoolID, //所属学校
					"classID": request.classID // 修改unique
				}
				console.log(obj);
				me.reply(obj); // app.pick
			}	
		});
	})	
}); // edit ends	

//选择固定项（带入数组参数）－－公用类，对应app.pick
App.controller('select-option', function (page,request) {
	var me = this; console.log(request)

	var $list = $(page).find('.app-list'),
		$listitem = $(page).find('li').remove();

	request.forEach(function (item) {
		var $node = $listitem.clone(true); console.log(item)
		$node.find('.name').text(item); 
		$list.append($node);	
	});
	
	$list.find('li').on('click', function (e){
		$(this).css('color','blue')
		var obj = {
			"value"	: $(this).find('.name').text()
		}
		me.reply(obj); // app.pick
		console.log(obj)
	})
}); // select-option ends

//员工列表－－公用类，对应app.pick
App.controller('select-member', function (page,request) {
	var me = this; 

	var $list = $(page).find('.app-list'),
		$listitem = $(page).find('li').remove();

	var params = {
		"schoolID": request.schoolID,
	}	
	readMemberList(params); 
	console.log(params)
	function readMemberList(obj){	
		showPrompt('加载教师...');	
		$.ajax({
			url: gDataUrl + 'readTeacherList.php',
			data: obj,
			dataType: "json",
			success: function(result){
				populateData(result.data); // all
				console.log(result.data)
				hidePrompt()
			},
		});
  	}

	function populateData(items){
		var subject = ''; // 学科分组
		items.forEach(function (item) {
			var $node = $listitem.clone(true);
			if(item.subjectName != subject){
				subject = item.subjectName;
				$list.append('<label className="group">'+ subject + '</label>')
			}
			$node.find('.name').text(item.teacherName); 
			$node.find('.id').text(item.teacherID);
			$list.append($node);	
		});
		
		$list.find('li').on('click', function (e){
			if(e.target.className == 'group') return false // 点击分组标签
			//this.style.color = 'blue';
			$(this).css('color','blue')
			var obj = {
				"teacherID"		: $(this).find('.id').text(),
				"teacherName"	: $(this).find('.name').text()
			}
			me.reply(obj); // app.pick
			console.log(obj)
		})
	}
});

// 选择分校区
App.controller('select-schoolsub', function (page,request) {
	var me = this; 

	var $list = $(page).find('.app-list'),
		$listitem = $(page).find('li').remove();

	var params = {
		"schoolID": request.schoolID,
	}	
	readMemberList(params); 
	console.log(params)
	function readMemberList(obj){	
		showPrompt('加载分校区...');	
		$.ajax({
			url: gDataUrl + 'readSchoolsubList.php',
			data: obj,
			dataType: "json",
			success: function(result){
				populateData(result.data); // all
				console.log(result.data)
				hidePrompt()
			},
		});
  	}

	function populateData(items){
		items.forEach(function (item) {
			var $node = $listitem.clone(true);
			$node.find('.name').text(item.fullname); 
			$node.find('.id').text(item.schoolsubID);
			$list.append($node);	
		});
		
		$list.find('li').on('click', function (e){
			//if(e.target.className == 'group') return false // 点击分组标签
			//this.style.color = 'blue';
			$(this).css('color','blue')
			var obj = {
				"schoolsubID": $(this).find('.id').text(),
				"fullname"	: $(this).find('.name').text()
			}
			me.reply(obj); // app.pick
			console.log(obj)
		})
	}
});



