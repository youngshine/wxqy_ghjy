// 管理创建大小班级的课程 by 执行校长
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
					url: gDataUrl + 'createKclist.php',
					data: data,
					dataType: 'json',
					success: function(result){
						console.log(result)
						// 前端添加显示记录，不刷新服务器数据库
						var $node = $listItem.clone(true);
						// 返回新插入记录id，删除用
						$node.find('.id').text(result.data.kclistID);
						
						$node.find('.title').text(data.title); 
						$node.find('.kmType').text(data.kmType); 
						$node.find('.unitprice').text(data.hour);
						//$node.find('.amount').text(data.amount);
						$node.find('.note').text(data.note);

						//display:none
						$node.find('.schoolID').text(data.schoolID);			
						$list.prepend($node);
						
						handleData($list); //新插入的才能操作
						toast('创建一对一课程成功')
					},
				});
			}
		});
	})

	var records = []; // all for search
	
	var params = { 
		"schoolID": gSchoolID,
		"kcType"  : "一对一" 
	}		
	readData(function(data){
		populateData(data)	
		handleData( $list )
		records = data;
	}, params );

	function readData(callback, obj){
		showPrompt('加载中...');		
		$.ajax({
	    	url: gDataUrl + 'readKclist.php',
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
			$node.find('.title').text(item.title); 
			//$node.find('.kcType').text(item.kcType);
			$node.find('.kmType').text(item.kmType);
			$node.find('.unitprice').text(item.unitprice);
			//$node.find('.amount').text(item.amount);
			$node.find('.note').text(item.note);
			$node.find('.schoolID').text(item.schoolID);
			$node.find('.id').text(item.kclistID);			
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
				url: gDataUrl + 'deleteKclist.php',
				data: {"kclistID":ID},
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
			"kclistID"  : selectedLi.find('.id').text(),
			"title": selectedLi.find('.title').text(),
			"kmType": selectedLi.find('.kmType').text(),
			"unitprice": selectedLi.find('.unitprice').text(),
			//"amount": selectedLi.find('.amount').text(),
			"note": selectedLi.find('.note').text(),
		}
		console.log(item)
		App.pick('edit', item, function (data) {
			if(data){ 
				console.log(data)
				$.ajax({
					url: gDataUrl + 'updateKclist.php',
					data: data,
					dataType: 'json',
					success: function(result){
						console.log(result)
						selectedLi.find('.title').text(data.title); 
						selectedLi.find('.kmType').text(data.kmType); 
						selectedLi.find('.unitprice').text(data.unitprice);
						//selectedLi.find('.amount').text(data.amount);
						selectedLi.find('.note').text(data.note);

						//handleData($list); //新插入的才能操作
						toast('修改一对一课程成功')
					},
				});
			}
		});
	}
	
	function doShow(selectedLi){
		var item = {	
			"kclistID"  : selectedLi.find('.id').text(),
			"title": selectedLi.find('.title').text(),
			"kmType": selectedLi.find('.kmType').text(),
			"unitprice": selectedLi.find('.unitprice').text(),
			//"amount": selectedLi.find('.amount').text()
		}
		console.log(item)
		//App.load('classes',item)
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
			    return ele.kmType == choice ;
			});
			console.log(filter)
			populateData(filter)
			handleData( $list )
		  }
		});
	});	
}); // ends controller

App.controller('classes', function (page,request) {
	var $list = $(page).find('.list'),
		$listItem = $(page).find('.listItem').remove()	

	$(page).find('.info').text(request.title)
	
	var params = { 
		"kclistID": request.kclistID
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
	    	url: gDataUrl + 'readClassesListByKclist.php',
			data: obj,
			dataType: "json",
			success: function(result){
				hidePrompt()
				console.log(result)
			    //populateData(result.data)
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
			$node.find('.title').text(item.title); //studentName = ''
			$node.find('.kmType').text(item.kmType);
			$node.find('.persons').text(item.persons);
			$node.find('.schoolsub').text(item.fullname);
			//$node.find('.created').text(item.created.substr(0,10));
			//display:none
			$node.find('.schoolID').text(item.schoolID);
			$node.find('.id').text(item.studentID);			
			$list.append($node);
		});
	}	
}); 

// new新增
App.controller('addnew', function (page) {
	var me = this;

	var title='',kmType='', unitprice=0, note=''

	var btnSubmit = $(page).find('.submit'),
		$title = $(page).find('.title'),
		$kmType = $(page).find('.kmType'),
		$unitprice = $(page).find('.unitprice'),
		//$amount = $(page).find('.amount'),
		$note = $(page).find('.note')

	// 空白不能点击所以用parent()???
	$title.parent().on('click', function () {
		App.pick('input-text', {'value':title,'title':'课程名称'}, function (data) {
			if(data){ // 取消返回没有数值
				console.log(data)
				$title.text(data.value);
				title = data.value;
			}
		});
	})	
	$unitprice.parent().on('click', function () {
		App.pick('input-number', {'value':unitprice,'title':'单价'}, function (data) {
			if(data && data.value !=''){ 
				$unitprice.text(data.value)
				unitprice = data.value;
			}
		});
	})
	$kmType.parent().on('click', function () {
		var arr = ['数理化','史地生','语政英','艺术'];
		App.pick('select-option', arr, function (data) {
			if(data){ // 取消返回
				console.log(data)
				kmType = data.value;
				$kmType.text(kmType);
			}
		});
	}) 
	$note.parent().on('click', function () {
		App.pick('input-textarea', {'value':note,'title':'备注'}, function (data) {
			if(data){ // 取消返回没有数值
				console.log(data)
				note = data.value;
				$note.text(note);
			}
		});
	})	

	btnSubmit.on('click', function () {			
		if(title=='' || kmType=='' || unitprice==0){
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
					"kcType": '一对一',
					"title": title,
					"kmType": kmType,
					"unitprice": unitprice, 
					"hour": 0, // 一对一才有
					"amount": 0,
					"note": note, //分校区
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
		kmType = request.kmType, 
	    unitprice = request.unitprice,
		//amount = request.amount,
		note = request.note,
		kclistID = request.kclistID // unique

	var btnSubmit = $(page).find('.submit'),
		$title = $(page).find('.title').text(title),
		$kmType = $(page).find('.kmType').text(kmType),
		$unitprice = $(page).find('.unitprice').text(unitprice),
		//$amount = $(page).find('.amount').text(amount),
		$note = $(page).find('.note').text(note)

	// 空白不能点击所以用parent()???
	$title.parent().on('click', function () {
		App.pick('input-text', {'value':title,'title':'课程名称'}, function (data) {
			if(data){ // 取消返回没有数值
				console.log(data)
				title = data.value;
				$title.text(title);
			}
		});
	})	

	$unitprice.parent().on('click', function () {
		App.pick('input-number', {'value':unitprice,'title':'单价'}, function (data) {
			if(data && data.value !=''){ 
				$unitprice.text(data.value)
				unitprice = data.value;
			}
		});
	})

	$kmType.parent().on('click', function () {
		var arr = ['数理化','史地生','语政英','艺术'];
		App.pick('select-option', arr, function (data) {
			if(data){ // 取消返回
				console.log(data)
				kmType = data.value;
				$kmType.text(kmType);
			}
		});
	}) 
	$note.parent().on('click', function () {
		App.pick('input-textarea', {'value':note,'title':'备注'}, function (data) {
			if(data){ // 取消返回没有数值
				console.log(data)
				note = data.value;
				$note.text(note);
			}
		});
	})	

	btnSubmit.on('click', function () {			
		if(title=='' || kmType=='' ||unitprice==0){
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
					"kmType": kmType,
					"unitprice": unitprice, 
					"hour": 0, //一对一才有 
					"amount": 0,
					"note": note,
					"kclistID": request.kclistID // 修改unique
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



