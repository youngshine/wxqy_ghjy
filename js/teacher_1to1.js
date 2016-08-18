// 一对一上下课记录，并自定义消费的上课课时 1，1.5，2
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
			$node.find('.weekday').text(item.teach_weekday);
			$node.find('.timespan').text(item.teach_timespan);
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
			if(e.target.className == 'endClass' && e.target.innerText == '下课'){
				//doEndclass($(this), request.courseID)
				App.pick('endclass', {'courseID':request.courseID}, function (data) {
					if(data){ 
						console.log(data)
						// 保存新增,ajax，这里data是数组（全部学生）
						toast('下课成功')
						//App.back(); // 或者list.insert()? handleData()
						
						$.ajax({
							url: gDataUrl + 'updateTeachcourse.php',
							data: {
								'studentstudyID': request.studentstudyID
							},
							dataType: 'json',
							success: function(result){
								console.log(result)
								toast('一对一下课成功')
								//App.back('home')
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
 			},
 		});
		// 发模版消息
	}
}); 


// 多选学生，点名，并发送模版消息－》公众号
App.controller('rollcall', function (page,request) {
	var me = this;
	var $list = $(page).find('.app-list'),
		$listItem = $(page).find('.app-list li').remove()	
	
	var btnOk = $(page).find('.ok')
	var selPeople = []; //旷课不选择的人数，默认全部选择 selPeople

	var params = {
		"classID": request.classID
	}	
	readData(function(data){
		populateData(data)	
		handleData( $list ) // 才能处理动态添加列表项
		// 该班级全部学生，默认全选，旷课搭上标志
		data.forEach(function(item){
			var obj = {
				studentName: item.studentName,
				studentID  : item.studentID,
				wxID       : item.wxID,
				schoolsub  : item.fullname, //分校区
				flag       : 1, //默认1出勤，2迟到，0旷课（请假）
				classID    : request.classID
			}
			selPeople.push(obj);
		})
		console.log(selPeople)
	}, params );
	
	function readData(callback,obj){
		showPrompt('读取班级学生...'); // 
		$.ajax({
			url: gDataUrl + 'readStudentListByClass.php',
			dataType: "json", 
			data: obj,
			//timeout: 6000,
			success: function(result){
				hidePrompt();	
				console.log(result)
				callback(result.data)
			},
			error: function (XMLHttpRequest, textStatus, errorThrown){	
				console.log(XMLHttpRequest)
				showPrompt('出错');
			}
		});
  	}

	function populateData(items){
		items.forEach(function (item) {
			var $node = $listItem.clone(true);
			$node.find('.name').text(item.studentName);
			$node.find('.wxID').text(item.wxID); //hidden
			//$node.find('.schoolsub').text(item.fullname); //学生所在分校区名称，发消息抬头
			$node.find('.id').text(item.studentID);
			$list.append($node);
		});	
	}
	
	function handleData(list){
		list.find('li').bind('click', function (e){
			doSelect($(this));
		})
	}

	function doSelect(clicked){
		// 点击选择的人员
		var obj = {
			"studentName": clicked.find('.name').text(),
			"wxID": clicked.find('.wxID').text(), //e.target.innerText
			"schoolsub": clicked.find('.schoolsub').text(),
			"studentID": clicked.find('.id').text()
		} 
		
		var $checked = clicked.find('.checked')
		
		if($checked.text() == ''){
			$checked.text('✔'); //选择打勾、变色
			clicked.css('color','#000'); //$,js this.style.color 
			//添加选择人员到已选数组
			//selPeople.push(obj);
			for(var i in selPeople){
				if(selPeople[i].studentID == obj.studentID){
					selPeople[i].flag = 1 //出勤
					break;  
				}
			}
		}else{
			$checked.text('')
			clicked.css('color','orange');
			// 根据元素值，删除指定数组元素-旷课学生
			for(var i in selPeople){
				//if(selected[i].name == obj.name){
				if(selPeople[i].studentID == obj.studentID){
					//reutrn i;//i就是下标
					//selPeople.splice(i, 1); 
					selPeople[i].flag = 0 //还没来上课
					break;  // 中断循环
				}
			} 
		}
		console.log(selPeople);
		// 按钮状态
		// selPeople.length > 0 ? btnOk.show() : btnOk.hide()
	}
	
	// 当天不能重复点名 beginDate在后台php
	btnOk.bind('click', function () {		
		App.dialog({
		  title	       : '选择学生无误，点名上课？', //'删除当前公告？',
		  okButton     : '确定',
		  cancelButton : '取消'
		}, function (choice) {
			if(choice){
				// 先添加到数据库，不重复，成功后，再发模版消息
				createData(selPeople,request.classID)		
			}
		});
		// 二维数组全部学生，插入数据库，成功后再发模版消息
		function createData(arr,classID){
			$.ajax({
				url: gDataUrl + 'createClasscourse.php',
				data: {
					'arrStudent': JSON.stringify(arr),
					'classID'   : classID
				},
				dataType: 'json',
				success: function(result){
					console.log(result)
					toast(result.message)
					if(result.success){
						// 发模版消息
						selPeople.forEach(function(person){
							// 来上课的，一个个发模版消息，通知家长
							if(person.flag==1) wxTpl(person) 
						})
						me.reply(selPeople)
					}
				},
			});
		}
		// 从企业号切换到服务号，整个数组selPeople群发不行，循环发
		function wxTpl(person){
			console.log(person);
			var obj = {
				wxID       : person.wxID, // 发消息学生家长
				studentName: person.studentName,
				schoolsub  : person.schoolsub, //分校区，发消息抬头
				classDate  : new Date(), // 用于判断今天补点名、不重复点名
				msg        : '学生已经到校上课，请放心。'
			}
			console.log(obj)
			$.ajax({
			    url: gDataUrl + 'weixinJS_gongzhonghao/wx_msg_tpl_class_begin.php',
			    data: obj,
			    success: function(response){
			        var text = response.responseText;
			        // process server response here
					console.log(response)//JSON.parse
			    }
			});
		}
	})	
}); 

// 课时明细（班级学生出勤状况），补点名？
App.controller('attendee', function (page,request) {
	var me = this;
	var $list = $(page).find('.app-list'),
		$listItem = $(page).find('.app-list li').remove()	
	
	var btnEndclass = $(page).find('.endClass'),
		records = [] //all
	
	// 课时，按日期分组
	var params = {
		"beginDate": request.beginDate,
		"classID"  : request.classID
	}	
	readData(function(data){
		populateData(data)	
		
		// 有下课时间，表示已经下课，不能再操作
		if(data[0].endTime.substr(0,10) == '0000-00-00'){
			handleData( $list ) // 才能处理动态添加列表项
			btnEndclass.show()
		}else{
			btnEndclass.hide()
		}
		
		records = data;	
	}, params );
	
	function readData(callback,obj){
		showPrompt('读取课时明细...'); // 
		$.ajax({
			url: gDataUrl + 'readClasscourseAttendee.php',
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
		items.forEach(function (item) {
			var $node = $listItem.clone(true);
			$node.find('.studentName').text(item.studentName);
			var flag = item.flag
			if(flag==1){
				flag = '✔'
			}else if(flag==2){
				flag = '迟到✔'
			}else{
				flag = '未到'
			}
			$node.find('.flag').text(flag);
			if(flag=='未到'){
				$node.css('background','pink')
			}
			$node.find('.studentID').text(item.studentID);
			$node.find('.wxID').text(item.wxID);
			$node.find('.schoolsub').text(item.fullname);//分校区名称，发消息用
			$node.find('.id').text(item.classcourseID);
			$list.append($node);
		});	
	}
	
	function handleData(list){
		list.find('li').bind('click', function (e){
			doRollcall($(this)); //补点名
		})
	}
	
	// 单个学生，迟到，补点名
	function doRollcall(selectedLi){
		var text = selectedLi.find('.flag').text()
		console.log(text)
		if(text != '未到') return false

		var person = {
			wxID       : selectedLi.find('.wxID').text(),
			studentName: selectedLi.find('.studentName').text(),
			schoolsub  : selectedLi.find('.schoolsub').text(),
			classDate  : new Date(), // 用于判断今天补点名、不重复点名
			msg        : '学生今天上课迟到，请家长多关注。',
			classcourseID: selectedLi.find('.id').text(),
		}
		console.log(person)
		
		App.dialog({
		  title	       : '该学生迟到，补点名？', //并发微信模版消息
		  okButton     : '确定',
		  cancelButton : '取消'
		}, function (choice) {
			if(choice){
				wxTpl(person)
				updateData(person)
			}
		});
		
		// 发微信模版消息
		function wxTpl(obj){
			$.ajax({
			    url: gDataUrl + 'weixinJS_gongzhonghao/wx_msg_tpl_class_begin.php',
			    data: obj,
			    success: function(response){
			        var text = response.responseText;
					console.log(response)//JSON.parse
			    }
			});
		}
		// 更新数据库，依据classcourseID = 唯一
		function updateData(obj){
			$.ajax({
				url: gDataUrl + 'updateClasscourse.php',
				data: obj,
				dataType: 'json',
				success: function(result){
					console.log(result)
					toast('补点名成功')
					App.back(); // 补点名后，返回，重新加载后台数据，下课才准确
				},
			});
		}
	}

	// 下课，所有来上课的发消息，循环
	btnEndclass.bind('click', function () {		
		if(btnEndclass.text() != '下课') return
			
		App.dialog({
		  title	       : '时间到，下课？', //'删除当前公告？',
		  okButton     : '确定',
		  cancelButton : '取消'
		}, function (choice) {
			if(choice){
				// 1、添加到数据库 2、循环发微信模版消息
				// selPeople, classID 添加到数据库
				//createData(classID,selPeople)
				console.log(records)
				records.forEach(function(person){
					// 一个个出勤发模版消息，通知学生家长
					if(person.flag != 0) wxTpl(person) 
				})
				// 2. 添加到数据库，全部一次性统一填写更改时间，
				// classID+当天beginDate(time)唯一
				var obj = {
					"classID"  : records[0].classID,
					"beginDate": records[0].beginTime.substr(0,10) //取日期
				}
				updateData(obj)
			}
		});
		
		// 从企业号切换到服务号，整个数组selPeople群发不行，循环发
		function wxTpl(person){
			console.log(person);
			var obj = {
				wxID       : person.wxID, // 发消息学生家长
				studentName: person.studentName,
				schoolsub  : person.fullname, //学生所在分校区，发消息抬头用
				classDate  : new Date(), // 用于判断今天补点名、不重复点名
			}
			console.log(obj)
			$.ajax({
			    url: gDataUrl + 'weixinJS_gongzhonghao/wx_msg_tpl_class_end.php',
			    data: obj,
			    success: function(response){
			        var text = response.responseText;
			        // process server response here
					console.log(response)//JSON.parse
			    }
			});
		}
		// 下课时间全部一样，依据classcourseID = 唯一
		function updateData(obj){
			$.ajax({
				url: gDataUrl + 'updateClasscourseByEndclass.php',
				data: obj,
				dataType: 'json',
				success: function(result){
					console.log(result)
					toast('下课成功')
					//btnEndclass.text('已下课')
					App.load('home')
				},
			});
		}
	})	
}); 	


