// 教师及其课程表
App.controller('home', function (page,request) {
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
				// 保存新增,ajax 1.添加到数据库 2.在企业通讯录创建成员
				createData(data)
			}
		});
	})
	
	// 1. 添加到数据库
	function createData(data){
		$.ajax({
			url: gDataUrl + 'createTeacher.php',
			data: data,
			dataType: 'json',
			success: function(result){
				console.log(result)
				if(result.success){
					// 前端添加显示记录，不刷新服务器数据库
					var $node = $listItem.clone(true);
					// 返回新插入记录id，删除用，无法马上操作li??，没绑定handledata?
					$node.find('.id').text(result.data.teacherID);
					$node.find('.name').text(data.userName); //user，统一
					$node.find('.userId').text(data.userId); 
					$node.find('.gender').text(data.gender); 
					$node.find('.phone').text(data.phone); 
					$node.find('.subject').text(data.subjectName); //修改用
					$node.find('.subjectID').text(data.subjectID);
					//display:none
					$node.find('.schoolID').text(data.schoolID);			
					$list.prepend($node);		
					handleData($list); //新插入的才能操作
					//toast('添加教师成功')
				
					// 2. 在企业号通讯录创建成员，必须弄一个 schoolID与department的对应表
					var objQy = data
					objQy.department = 1, //企业号通讯录根部门？？？
					objQy.position = '教师', //用于企业号 职务
					//obj.tag = 3, //用于企业号标签，咨询2，教师3，创建成员无法添加标签

					doAdd2Contact(objQy)
				}	
			},
		});
	}
	// 2. 成功后，企业号通讯录新增人员
	function doAdd2Contact(obj){
		console.log(obj)
		$.ajax({
			url: 'script/weixinJS/wx_user_create.php',
			dataType: "json", 
			data: obj,
			success: function(data){	
                console.log(data)
				toast('添加教师成功') //数据库和通讯录都添加
			},
		});
	}

	var params = { 
		"schoolID": gSchoolID //7 //USER_SCHOOL_ID,
	}	
	readData(function(data){
		populateData(data)	
		handleData( $list )
		//records = data;
	}, params );

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
		
		var grp = ''; // 分组
		items.forEach(function (item) {
			if(item.subjectName != grp){
				grp = item.subjectName
				$list.append('<label style="padding:0 10px;color:#888;">' + grp + '</label>')
			}
			var $node = $listItem.clone(true);
			$node.find('.name').text(item.teacherName); 
			$node.find('.gender').text(item.gender);
			//display:none
			$node.find('.phone').text(item.phone);
			$node.find('.subject').text(item.subjectName); //修改用
			$node.find('.subjectID').text(item.subjectID);
			$node.find('.schoolID').text(item.schoolID);
			$node.find('.userId').text(item.userId);
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

	function doEdit(selectedLi){
		var item = {	
			"teacherID"  : selectedLi.find('.id').text(),
			"teacherName": selectedLi.find('.name').text(),
			"userId": selectedLi.find('.userId').text(),
			"gender": selectedLi.find('.gender').text(),
			"phone": selectedLi.find('.phone').text(),
			"subjectName": selectedLi.find('.subject').text(),
			"subjectID": selectedLi.find('.subjectID').text(),
		}
		console.log(item)
		App.pick('edit', item, function (data) {
			if(data){ 
				console.log(data)
				$.ajax({
					url: gDataUrl + 'updateTeacher.php',
					data: data,
					dataType: 'json',
					success: function(result){
						console.log(result)
						selectedLi.find('.name').text(data.teacherName); 
						selectedLi.find('.gender').text(data.gender); 
						selectedLi.find('.phone').text(data.phone); 
						selectedLi.find('.subject').text(data.subjectName);
						selectedLi.find('.subjectID').text(data.subjectID);

						//handleData($list); //新插入的才能操作
						toast('修改成功')
					},
				});
			}
		});
	}
	
	function doShow(selectedLi){
		//var obj = {
		var item = {	
			"teacherID": selectedLi.find('.id').text(),
			"teacherName": selectedLi.find('.name').text(),
			'userId': selectedLi.find('.userId').text()
		}
		console.log(item)
		App.load('kcb',item)
		// 如果下面存在删除记录，用pick，否则用load
	}
}); // ends controller

// 教师大小班课程表
App.controller('kcb', function (page,request) {
	var $list = $(page).find('.list'),
		$listItem = $(page).find('.listItem').remove()	

	var records = []
	
	if(request.userId == '') return false
		
	var params = { 
		"teacher": request.userId,
		"teacherID": request.teacherID
	}
	
	readData(function(data){
		populateData(data)	
		//handleData( $list )
		records = data;
	}, params );

	function readData(callback, obj){
		showPrompt('加载中...');		
		$.ajax({
	    	url: gDataUrl + 'readClassesListByTeacher.php',
			data: obj,
			dataType: "json",
			success: function(result){
				hidePrompt()
				console.log(result)
				callback(result.data)
			},
		});
	}

	function populateData(items){
		if($list.children().length != 0){
			$list.empty(); //清除旧的列表项 if any
		}
		items.forEach(function (item) {
			var $node = $listItem.clone(true);
			$node.find('.title').text(item.weekday); 
			$node.find('.timespan').text(item.timespan);
			//$node.find('.id').text(item.pricelistID);			
			$list.append($node);
		});
	}	
	
	var tabClass = $(page).find('.class'),
		tabOne2one = $(page).find('.one2one')
	
	tabClass.on('click',function(e){
		$(this).css('background','#fff');
		tabOne2one.css('background','#eee')
		$list.empty()
		populateData(records)	/*
		var obj = {
			"userId"      : '', //空白，表示全部 userId like ''
			"classjxtType": '咨询'		
		}
		readData(obj) */
	})
	tabOne2one.on('click',function(e){
		$(this).css('background','#fff');
		tabClass.css('background','#eee')
		$list.empty()
		//populateData(records)	
		//handleData($list,records);
		$.ajax({
	    	url: gDataUrl + 'readStudentstudyListByTeacher.php',
			data: params,
			dataType: "json",
			success: function(result){
				console.log(result)
				//populateData(result.data)
				result.data.forEach(function (item) {
					var $node = $listItem.clone(true);
					$node.find('.title').text(item.teach_weekday); 
					$node.find('.timespan').text(item.teach_timespan);
					//$node.find('.id').text(item.pricelistID);			
					$list.append($node);
				});
			},
		});
	})
}); // ends controller


// 选择分配归属咨询师
App.controller('addnew', function (page,request) {
	var me = this;
	/* 提交保存按钮
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
    });	 */	
	
	var teacherName = '',
		gender = '', 
		phone = '', 
		subjectName = '',
		subjectID = 0,
		userId = '' //根据名字拼音＋学校id生成，同个学校不能同名
	
	var btnSubmit = $(page).find('.submit'),
		$userId = $(page).find('.userId'),
		$teacher = $(page).find('.name'),
		$gender = $(page).find('.gender'),
		$phone = $(page).find('.phone'),
		$subject = $(page).find('.subject')
	
	// 空白不能点击所以用parent()???
	$teacher.on('click', function () {
		App.pick('input-text', {'value':teacherName,'title':'教师姓名'}, function (data) {
			if(data){ // 取消返回没有数值
				console.log(data)
				teacherName = data.value;
				$teacher.text(teacherName);
				
				// 转换生成userId （拼音＋学校ID）
				userId = pinyin.getFullChars(teacherName) + gSchoolID;
				$userId.text(userId);
			}
		});
	});

	$phone.on('click', function () {
		App.pick('input-text', {'value':phone,'title':'电话'}, function (data) {
			if(data){ // 取消返回没有数值
				console.log(data)
				phone = data.value; 
				$phone.text(phone);
			}
		});
	});
	
	$gender.on('click', function () {
		var arr = ['男','女']; //无id
		App.pick('select-option', arr, function (data) {
			if(data){ // 取消返回
				console.log(data)
				gender = data.value;
				$gender.text(gender);
			}
		});
	});
	
	// 有name，id，不能通用select-option
	$subject.on('click', function () {
		//var arr = [id:0,???'数学','物理','化学'];
		App.pick('select-subject', {value:''}, function (data) {
			if(data){ // 取消返回
				console.log(data)
				$subject.text(data.name);
				subjectName = data.name;
				subjectID = data.id
			}
		});
	})
	
	btnSubmit.on('click', function () {			
		var userId = $(page).find('.userId').text()
		console.log(phone,teacherName)
		if(phone=='' || isNaN(phone)){
			toast('手机号格式错误',3000); return;	
	    }
		if(teacherName=='' || gender=='' || subjectName==''){
			toast('项目填写不完整',3000); return;	
	    }
	
		App.dialog({
			title	     : '新增保存？', 
			okButton     : '确定',
			cancelButton : '取消'
		}, function (choice) {
			if(choice){
				var obj = {
					"userName": teacherName, //user，通讯录添加人员统一user
					"userId": userId,
					"gender": gender,
					"phone": phone,
					"subjectName": subjectName,
					"subjectID": subjectID,
					"schoolID": gSchoolID // 新增，属于哪个学校unique
				}
				console.log(obj);
				me.reply(obj); // app.pick
			}	
		});
	})
}); // addnew	

// 修改edit
App.controller('edit', function (page,request) {
	var me = this; console.log(request)

	var teacherName = request.teacherName,
		gender = request.gender, 
		phone = request.phone, 
		subjectName = request.subjectName,
		subjectID = request.subjectID,
		teacherID = request.teacherID // unique

	var btnSubmit = $(page).find('.submit'),
		$userId = $(page).find('.userId').text(request.userId),
		$teacher = $(page).find('.name').text(teacherName),
		$gender = $(page).find('.gender').text(gender),
		$phone = $(page).find('.phone').text(phone),
		$subject = $(page).find('.subject').text(subjectName)

	// 空白不能点击所以用parent()???
	$teacher.parent().on('click', function () {
		App.pick('input-text', {'value':teacherName,'title':'教师姓名'}, function (data) {
			if(data){ // 取消返回没有数值
				console.log(data)
				$teacher.text(data.value);
				teacherName = data.value;
			}
		});
	});
	
	$phone.parent().on('click', function () {
		App.pick('input-text', {'value':phone,'title':'电话'}, function (data) {
			if(data){ // 取消返回没有数值
				console.log(data)
				phone = data.value; //无id
				$phone.text(phone);
			}
		});
	});
	
	$gender.parent().on('click', function () {
		var arr = ['男','女'];
		App.pick('select-option', arr, function (data) {
			if(data){ // 取消返回
				console.log(data)
				gender = data.value;
				$gender.text(gender);
			}
		});
	});
	
	// 有name，id，不能通用select-option
	$subject.parent().on('click', function () {
		//var arr = [id:0,???'数学','物理','化学'];
		App.pick('select-subject', {value:''}, function (data) {
			if(data){ // 取消返回
				console.log(data)
				$subject.text(data.name);
				subjectName = data.name;
				subjectID = data.id
			}
		});
	})

	btnSubmit.on('click', function () {			
		if(phone == '' || isNaN(phone)){
			toast('手机号格式错误',3000)
			return;	
	    }
		if(teacherName=='' || gender=='' || subjectName==''){
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
					"teacherName": teacherName,
					"gender": gender,
					"phone": phone,
					"subjectName": subjectName,
					"subjectID": subjectID,
					"teacherID": request.teacherID // 修改unique
				}
				console.log(obj);
				me.reply(obj); // app.pick
			}	
		});
	})	
}); // edit ends	

/*选择固定项（带入数组参数）－－公用类，对应app.pick
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
}); // select-option ends  */

App.controller('select-subject', function (page,request) {
	var me = this; 
	var $list = $(page).find('.app-list'),
		$listitem = $(page).find('li')//.remove();

	$list.find('li').on('click', function (e){
		$(this).css('color','blue')
		var obj = {
			"name"	: $(this).find('.name').text(),
			"id"	: $(this).find('.id').text()
		}
		me.reply(obj); // app.pick
		console.log(obj)
	})
}); 


