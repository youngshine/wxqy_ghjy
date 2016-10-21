// 一对一上下课记录，并自定义消费的上课课时 1，1.5，2
// 一对一课时courseID，大小班多人共用一个课时courseNo
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
			$node.find('.schoolsub').text(item.fullname);
			//display:none
			$node.find('.teacher').text(item.teacherName);
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
			"wxID": selectedLi.find('.userId').text(), // 学生微信，发模版消息用
			"studentName": selectedLi.find('.student').text(),
			"zsdName": selectedLi.find('.zsdName').text(),
			"teacherName": selectedLi.find('.teacher').text(),
			"schoolsub": selectedLi.find('.schoolsub').text()
		}
		console.log(item)
		// 如果下面存在删除记录，用pick，否则用load
		App.load('teachcourse',item) 
	}
}); // ends controller

// 1 课时列表
App.controller('teachcourse', function (page,request) {
	var me = this;
	var $list = $(page).find('.app-list'),
		$listItem = $(page).find('.app-list li').remove()	
	
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
			//$node.find('.userId').text(item.request.wxID); //学生微信，发模版消息
			$list.append($node);
		});	
	}
	
	function handleData(list){
		list.find('li').bind('click', function (e){
			console.log(e.target)
			var $selLi = $(this)
			if(e.target.className == 'endClass' && e.target.innerText == '下课'){
				//doEndclass($(this), request.courseID)
				//var courseID = $selLi.find('.id').text()
				var objCourse = {
					"courseID"    : $selLi.find('.id').text(),
					"wxID"        : request.wxID,
					"studentName" : request.studentName,
					"zsdName"     : request.zsdName,
					"teacherName" : request.teacherName,
					"schoolsub"   : request.schoolsub
				}
				App.pick('endclass', objCourse, function (data) {
					if(data){ 
						console.log(data)
						toast('一对一下课成功')
						$selLi.find('.endClass').text('')
						$selLi.find('.endClass').css('display','none')
						$selLi.find('.hour').css('display','inline')
						$selLi.find('.hour').text(data.hour+'课时')
					}
				});	
			}	
			
		})
	}

	var btnAddnew = $(page).find('.addnew')
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
				$node.find('.endClass').text(''); //不能下课（尚无li信息）
				$node.find('.endClass').css('display','inline')
				$node.find('.id').text(result.data.courseID);//刚刚插入的
				$list.prepend($node)
				handleData( $list )
				
				// 同时发送模版消息request wxid,student,schoolsub 
				wxTpl(request)
 			},
 		});
		// 发模版消息
	}
	
	// 一对一单个学生，从企业号发消息到服务号
	function wxTpl(person){
		console.log(person);
		var obj = {
			wxID       : person.wxID, // 发消息学生家长
			studentName: person.studentName,
			zsdName:     person.zsdName,
			//teacherName: person.teacherName,
			schoolsub  : person.schoolsub, //学生所在分校区，发消息抬头用
			//courseDate : new Date(), // 用于判断今天补点名、不重复点名
		}
		console.log(obj)
		$.ajax({
		    url: gDataUrl + 'weixinJS_gongzhonghao/wx_msg_tpl_one2one_begin.php',
		    data: obj,
		    success: function(response){
		        var text = response.responseText;
		        // process server response here
				console.log(response)//JSON.parse
		    }
		});
	}
}); 

// 2 下课界面
App.controller('endclass', function (page,request) {
	var me = this; console.log(request)
	var btnSubmit = $(page).find('.submit')
		//input = $(page).find('input')
	btnSubmit.on('click', function (e){
		//input.blur(); // 关闭软键盘
		/*var value = input.val()
		if(value == 0 || isNaN(value)||value%0.5 !=0 ){
			toast('课时格式错误'); return;		
		} */
		var hour = $(page).find("#selHour").val(); //text()
		console.log(hour)
		App.dialog({
			title	     : '本次一对一上 '+hour+'课时，下课？', //'删除当前公告？',
			okButton     : '确定',
			cancelButton : '取消'
		}, function (choice) {
			if(choice){
				var obj = {
					"hour": hour, //input.val(),
					"courseID": request.courseID,
					//"wxID": request.wxID //学生微信，用于发送模版消息
				}
				//me.reply(obj); // app.pick
				updateData(obj)
			}
		});	
	})	
	
	// 下课，更新下课时间＋课时
	function updateData(obj){
		$.ajax({
			url: gDataUrl + 'updateTeachcourse.php',
			data: obj,
			dataType: 'json',
			success: function(result){
				console.log(result)
				//toast('一对一下课成功')
				me.reply(obj); // app.pick
				
				// 同时发送模版消息 request: wxid,student,schoolsub 
				wxTpl(request)
			},
		});
	}
	
	// 一对一单个学生，从企业号发消息到服务号
	function wxTpl(person){
		console.log(person);
		var obj = {
			wxID       : person.wxID, // 发消息学生家长
			studentName: person.studentName,
			zsdName:     person.zsdName,
			teacherName: person.teacherName,
			schoolsub  : person.schoolsub, //学生所在分校区，发消息抬头用
			courseDate : new Date(), // 用于判断今天补点名、不重复点名
		}
		console.log(obj)
		$.ajax({
		    url: gDataUrl + 'weixinJS_gongzhonghao/wx_msg_tpl_one2one_end.php',
		    data: obj,
		    success: function(response){
		        var text = response.responseText;
		        // process server response here
				console.log(response)//JSON.parse
		    }
		});
	}
});


