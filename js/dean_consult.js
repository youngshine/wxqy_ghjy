// 管理咨询师 by 执行校长
App.controller('home', function (page) {
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
						$node.find('.name').text(data.userName);
						$node.find('.userId').text(data.userId); 
						$node.find('.gender').text(data.gender);
						$node.find('.phone').text(data.phone);
						//display:none
						$node.find('.schoolsub').text(data.fullname);
						$node.find('.schoolsubID').text(data.schoolsubID);
						$node.find('.schoolID').text(data.schoolID);			
						$list.prepend($node);
						
						handleData($list); //新插入的才能操作
						//toast('添加咨询师成功')
						
						// 2. 在企业号通讯录创建成员，必须弄一个 schoolID与department的对应表
						var objQy = data
						objQy.department = 1, //企业号通讯录根部门？？？
						objQy.position = '咨询', //用于企业号 职务
						//obj.tag = 3, //用于企业号标签，咨询2，教师3，创建成员无法添加标签

						doAdd2Contact(objQy)
					},
				});
			}
		});
	})
	
	// 2. 成功后，企业号通讯录新增人员，如果重复？
	function doAdd2Contact(obj){
		console.log(obj)
		$.ajax({
			url: 'script/weixinJS/wx_user_create.php',
			dataType: "json", 
			data: obj,
			success: function(data){	
                console.log(data)
				toast('添加咨询成功') //数据库和通讯录都添加
				doAdd2Tag(obj)
			},
		});
	}
	// 3. 添加企业号通讯录成功后，设置标签（咨询2、教师3）
	function doAdd2Tag(obj){
		console.log(obj)
		$.ajax({
			url: 'script/weixinJS/wx_user_addtag.php',
			dataType: "json", 
			data: obj,
			success: function(data){	
                console.log(data)
				toast('设置标签成功') //数据库和通讯录都添加
			},
		});
	}

	var params = { 
		"schoolID": gSchoolID 
	}	
	readData(function(data){
		populateData(data)	
		handleData( $list )
		//records = data;
	}, params );

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
		var grp = '';
		items.forEach(function (item) {
			if(item.fullname != grp){
				grp = item.fullname
				$list.append('<label style="padding:0 10px;color:#888;">' + grp + '</label>')
			}
			var $node = $listItem.clone(true);
			$node.find('.name').text(item.consultName); 
			$node.find('.gender').text(item.gender);
			$node.find('.phone').text(item.phone);
			//display:none
			$node.find('.schoolsub').text(item.fullname);
			$node.find('.schoolsubID').text(item.schoolsubID);
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

	function doEdit(selectedLi){
		var item = {	
			"consultID"  : selectedLi.find('.id').text(),
			"consultName": selectedLi.find('.name').text(),
			"userId": selectedLi.find('.userId').text(),
			"gender": selectedLi.find('.gender').text(),
			"phone": selectedLi.find('.phone').text(),
			"schoolsub": selectedLi.find('.schoolsub').text(),
			"schoolsubID": selectedLi.find('.schoolsubID').text(),
		}
		console.log(item)
		App.pick('edit', item, function (data) {
			if(data){ 
				console.log(data)
				$.ajax({
					url: gDataUrl + 'updateConsult.php',
					data: data,
					dataType: 'json',
					success: function(result){
						console.log(result)
						selectedLi.find('.name').text(data.teacherName); 
						selectedLi.find('.gender').text(data.gender); 
						selectedLi.find('.phone').text(data.phone); 
						selectedLi.find('.schoolsub').text(data.fullname);
						selectedLi.find('.schoolsubID').text(data.schoosubID);

						//handleData($list); //新插入的才能操作
						toast('修改成功')
					},
				});
			}
		});
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


/*
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
}); // addnew	*/

// 选择分配归属咨询师
App.controller('addnew', function (page,request) {
	var me = this;

	var consultName = '',
		gender = '', 
		phone = '', 
		schoolsub = '',
		subjectID = 0,
		userId = '' //根据名字拼音＋学校id生成，同个学校不能同名
	
	var btnSubmit = $(page).find('.submit'),
		$userId = $(page).find('.userId'),
		$name = $(page).find('.name'),
		$gender = $(page).find('.gender'),
		$phone = $(page).find('.phone'),
		$schoolsub = $(page).find('.schoolsub')
	
	// 空白不能点击所以用parent()???
	$name.on('click', function () {
		App.pick('input-text', {'value':consultName,'title':'姓名'}, function (data) {
			if(data){ // 取消返回没有数值
				console.log(data)
				consultName = data.value;
				$name.text(consultName);
				
				// 转换生成userId （拼音＋学校ID）
				userId = pinyin.getFullChars(consultName) + gSchoolID;
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
	
	// 数据源来自远程数据库，不能通用固定select-option
	$schoolsub.parent().on('click', function () {
		App.pick('select-schoolsub', {"schoolID":gSchoolID}, function (data) {
			if(data){ // 取消返回
				console.log(data)
				schoolsub = data.fullname;
				schoolsubID = data.schoolsubID
				$schoolsub.text(schoolsub);
			}
		});
	})	
	
	btnSubmit.on('click', function () {			
		var userId = $(page).find('.userId').text()
		console.log(phone)
		if(phone=='' || isNaN(phone)){
			toast('手机号格式错误',3000); return;	
	    }
		if(consultName=='' || gender=='' || schoolsub==''){
			toast('项目填写不完整',3000); return;	
	    }
	
		App.dialog({
			title	     : '新增保存？', 
			okButton     : '确定',
			cancelButton : '取消'
		}, function (choice) {
			if(choice){
				var obj = {
					"userName": consultName, //userName统一到通讯录
					"userId": userId,
					"gender": gender,
					"phone": phone,
					"schoolsub": schoolsub,
					"schoolsubID": schoolsubID,
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

	var consultName = request.consultName,
		gender = request.gender, 
		phone = request.phone, 
		schoolsub = request.schoolsub,
		schoolsubID = request.schoolsubID,
		consultID = request.consultID // unique

	var btnSubmit = $(page).find('.submit'),
		$userId = $(page).find('.userId').text(request.userId),
		$name = $(page).find('.name').text(consultName),
		$gender = $(page).find('.gender').text(gender),
		$phone = $(page).find('.phone').text(phone),
		$schoolsub = $(page).find('.schoolsub').text(schoolsub)

	// 空白不能点击所以用parent()???
	$name.parent().on('click', function () {
		App.pick('input-text', {'value':consultName,'title':'咨询师姓名'}, function (data) {
			if(data){ // 取消返回没有数值
				console.log(data)
				consultName = data.value;
				$name.text(consultName);
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
	
	// 数据源来自远程数据库，不能通用固定select-option
	$schoolsub.parent().on('click', function () {
		App.pick('select-schoolsub', {"schoolID":gSchoolID}, function (data) {
			if(data){ // 取消返回
				console.log(data)
				schoolsub = data.fullname;
				schoolsubID = data.schoolsubID
				$schoolsub.text(schoolsub);
			}
		});
	})	

	btnSubmit.on('click', function () {			
		if(phone == '' || isNaN(phone)){
			toast('手机号格式错误',3000); return;	
	    }
		if(consultName == '' || gender=='' || schoolsub ==''){
			toast('项目填写不完整',3000); return;	
	    }
	
		App.dialog({
			title	     : '修改保存？', 
			okButton     : '确定',
			cancelButton : '取消'
		}, function (choice) {
			if(choice){
				var obj = {
					"consultName": consultName,
					"gender": gender,
					"phone": phone,
					"schoolsub": schoolsub,
					"schoolsubID": schoolsubID,
					"consultID": request.consultID // 修改unique
				}
				console.log(obj);
				me.reply(obj); // app.pick
			}	
		});
	})	
}); // edit ends

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


