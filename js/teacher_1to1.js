// 一对一上下课记录，并自定义消费的上课课时 1，1.5，2
// 下课要模版消息通知？？？
App.controller('home', function (page) {
	var $list = $(page).find('.list'),
		$listItem = $(page).find('.listItem').remove()	
	
	var params = { 
		"teacher": gUserID //userId
	}
	
	readData(function(data){
		populateData(data)	
		handleData( $list )
		//records = data;
	}, params );

	function readData(callback, obj){
		showPrompt('加载一对一课程...');		
		$.ajax({
	    	url: gDataUrl + 'readStudyListByTeacher.php',
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
			$node.find('.zsdName').text(item.zsdName); 
			$node.find('.timely').text(item.timely_list);
			$node.find('.student').text(item.studentName);
			//display:none
			$node.find('.userId').text(item.wxID); //学生userId，发模版消息
			$node.find('.id').text(item.studentstudyID);			
			$list.append($node);
		});
	}	

	function handleData(list){	
		list.find('.listItem').on({
			click: function (e) {
				doShow( $(this) )
			},	
		})
	}

	function doShow(selectedLi){
		var item = {	
			"studentstudyID": selectedLi.find('.id').text(),
		}
		console.log(item)
		// 如果下面存在删除记录，用pick，否则用load
		App.load('teachcourse',item) 
	}
}); // ends controller

// 课时列表
App.controller('teachcourse', function (page,request) {
	var me = this;
	var $list = $(page).find('.app-list'),
		$listItem = $(page).find('.app-list li').remove()	

	// 一个班级，一天不能上2次课程？
	var btnAddnew = $(page).find('.addnew')
	
	var params = {
		"studentstudyID": request.studentstudyID
	}	
	readData(function(data){
		populateData(data)	
		handleData( $list,data ) // 才能处理动态添加列表项
	}, params );
	
	function readData(callback,obj){
		showPrompt('读取上课课时...'); // 
		$.ajax({
			url: gDataUrl + 'readTeachcourseList.php',
			dataType: "json", 
			data: obj,
			//timeout: 6000,
			success: function(result){
				hidePrompt();	
				console.log(result)
				callback(result.data)
			},
		});
  	}

	function populateData(items){
		console.log(items)
		items.forEach(function (item) {
			var $node = $listItem.clone(true);
			$node.find('.courseDate').text(item.beginTime.substr(2,8)) 
			if(item.hour > 0){
				$node.find('.hour').text(item.hour+'课时');
				$node.find('.hour').css('display','inline')
			}else{
				$node.find('.endClass').text('下课');
				$node.find('.endClass').css('display','inline')
			}

			$node.find('.id').text(item.courseID);
			$list.append($node);
		});	
	}
	
	function handleData(list){
		list.find('li').bind('click', function (e){
			console.log(e.target)
			var $selLi = $(this)
			if(e.target.className == 'endClass' && e.target.innerText == '下课'){
				//doEndclass($(this), request.courseID)
				var courseID = $selLi.find('.id').text()
				App.pick('endclass', {'courseID':courseID}, function (data) {
					if(data){ 
						console.log(data)
						$.ajax({
							url: gDataUrl + 'updateTeachcourse.php',
							data: {
								'courseID': data.courseID,
								'hour': data.hour
							},
							dataType: 'json',
							success: function(result){
								console.log(result)
								toast('一对一下课成功')
								$selLi.find('.endClass').text('')
								$selLi.find('.endClass').css('display','none')
								$selLi.find('.hour').css('display','inline')
								$selLi.find('.hour').text(data.hour+'课时')
								//App.back()
							},
						}); 
					}
				});	
			}	
			
		})
	}

	// 一对一上课，保存时间
	btnAddnew.on('click',function(){
		var d = new Date();
		var now = '当前时间：'+ 
			d.getDate()+'日'+ d.getHours()+'点'+d.getMinutes()+'分';
		
		App.dialog({
			title	     : '开始一对一上课？', 
			text		 : now, //(new Date()).toLocaleString(),
			okButton     : '确定',
			cancelButton : '取消'
		}, function (choice) {
			if(choice){
				createData()
			}
		});	
	})

	function createData(){
		var obj = {
			studentstudyID: request.studentstudyID
		}
		$.ajax({
 			url: gDataUrl + 'createTeachcourse.php',
 			dataType: "json",
 			data: obj,
 			success: function(result){
 				console.log(result)
				toast('一对一上课成功')
				var $node = $listItem.clone(true);
				$node.find('.courseDate').text('刚刚')
				$node.find('.endClass').text('下课')
				$node.find('.endClass').css('display','inline')
				$node.find('.id').text(result.data.courseID);//刚刚插入的
				$list.prepend($node)
				handleData( $list )
 			},
 		});
		// 发模版消息
	}
}); 

App.controller('endclass', function (page,request) {
	var me = this;
	var btnSubmit = $(page).find('.submit'),
		input = $(page).find('input')
	btnSubmit.on('click', function (e){
		input.blur(); // 关闭软键盘
		var value = input.val()
		if(value == 0 || isNaN(value)||value%0.5 !=0 ){
			toast('课时格式错误'); return;		
		}
		
		App.dialog({
			title	     : '本次课时'+value+'，下课？', //'删除当前公告？',
			okButton     : '确定',
			cancelButton : '取消'
		}, function (choice) {
			if(choice){
				var obj = {
					"hour": input.val(),
					"courseID": request.courseID
				}
				me.reply(obj); // app.pick
			}
		});
	
	})	
});


