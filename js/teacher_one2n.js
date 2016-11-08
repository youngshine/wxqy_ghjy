/* 一对N上下课记录，并自定义消费的上课课时 1，1.5，2
 * 一对N课时,多人共用一个课时courseNo，前端生成
 * 从当前教师获得school，从一对多出勤学生获得kclist课程
 */

App.controller('home', function (page) {
	var $list = $(page).find('.list'),
		$listItem = $(page).find('.listItem').remove()	
	
	var params = { 
		"teacher": gUserID //userId
	}
	
	readData(function(data){
		populateData(data)	
		handleData( $list )
	}, params );

	function readData(callback, obj){
		showPrompt('加载一对N...');		
		$.ajax({
	    	url: gDataUrl + 'readTeacher.php',
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
		console.log(items['timely_list_one2n'])
		// 只有一条记录[0]，拆分上课时间列表
		var timely_list = items.timely_list_one2n.split(',')
		var arrTimely = []
		$.each(timely_list, function(i, timely){     
			arrTimely.push(timely  )     
		});
		console.log(arrTimely)
		
		var weekdays = ['周一','周二','周三','周四','周五','周六','周日']
		$.each(weekdays, function(i, weekday){     
			console.log(weekday)
			var grp = ''
			$.each(arrTimely, function(i, time){     
				if(time.indexOf(weekday)>=0){
					if(time.substr(0,2) != grp){
						grp = time.substr(0,2)
						$list.append('<label style="padding:10px;color:#888;">' + grp + '</label>')
					}
					
					var $node = $listItem.clone(true);
					//var time = time.substr(2) //只有时间，没有星期
					$node.find('.timely').text(time); //星期＋时间
					// hidden: teacherID,schoolName
					$node.find('.id').text(items.teacherID); 
					$node.find('.teacher').text(items.teacherName); // 教师：用于模版消息
					$node.find('.school').text(items.schoolName); // 学校：用于模版消息
					$list.append($node); 
				}				   
			}); 
		});
	}	

	function handleData(list){	
		list.find('.listItem').on({
			singleTap: function (e) {
				doShow( $(this) )
			},	
		})
	}

	function doShow(selLi){
		var item = {	
			"timely"    : selLi.find('.timely').text(),
			"teacherID" : selLi.find('.id').text(), 
			"teacherName" : selLi.find('.teacher').text(), //
			"schoolName": selLi.find('.school').text(), 
		}
		console.log(item)
		// 如果下面存在删除记录，用pick，否则用load
		App.load('one2ncourse',item) 
	}
}); // ends controller

// 1 课时列表 courseNo
App.controller('one2ncourse', function (page,request) {
	var me = this;
	var $list = $(page).find('.app-list'),
		$listItem = $(page).find('.app-list li').remove()	
	
	$(page).find('.app-title').text(request.timely) // 标题
	
	var params = {
		"teacherID": request.teacherID,
		"timely": request.timely
	}	
	readData(function(data){
		populateData(data)	
		handleData( $list,data ) // 才能处理动态添加列表项
	}, params );
	
	function readData(callback,obj){
		showPrompt('读取上课课时...'); // 
		$.ajax({
			url: gDataUrl + 'readOne2nCourse.php',
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
			$node.find('.courseDate').text(item.courseDate) //beginTime.substr(2,8)) 
			if(item.hour > 0){
				$node.find('.hour').text(item.hour+'课时');
				$node.find('.hour').css('display','inline')
			}else{
				$node.find('.endClass').text('下课');
				$node.find('.endClass').css('display','inline')
			}
			
			// hidden: courseNo,schoolName
			// 多个学生共用一个courseNo,group by
			$node.find('.courseNo').text(item.courseNo); 
			$node.find('.kcTitle').text(item.kcTitle); 
			//$node.find('.school').text(item.schoolName); // 学校：用于模版消息
			$list.append($node);
		});	
	}
	
	function handleData(list){
		list.find('li').bind('singleTap', function (e){
			console.log(e.target)
			if(e.target.className == 'endClass' && e.target.innerText == '下课'){
				doEndclass($(this)) // 下课
			}else{
				doShow($(this) ); // 考勤学生列表，
			}
		})
		
		function doShow(selLi){
			var item = {	
				"courseNo"  : selLi.find('.courseNo').text(),
				"kcTitle"  : selLi.find('.kcTitle').text(),
				"teacherName": request.teacherName, //hidden传递参数：教师，用于模版消息
				"schoolName": request.schoolName, //传递参数：学校，用于模版消息
			}
			console.log(item)
			// 如果下面存在删除记录，用pick，否则用load
			App.load('attendee',item) 
		}
		
		function doEndclass(selLi){
			var objCourse = {
				"courseNo"  : selLi.find('.courseNo').text(),
				"kcTitle"  : selLi.find('.kcTitle').text(),
				"teacherName": request.teacherName, //hidden传递参数：教师，用于模版消息
				"schoolName": request.schoolName, //传递参数：学校，用于模版消息
			}
			console.log(objCourse)
			App.pick('endclass', objCourse, function (data) {
				if(data){ 
					console.log(data)
					toast('一对N下课成功')
					selLi.find('.endClass').text('')
					selLi.find('.endClass').css('display','none')
					selLi.find('.hour').css('display','inline')
					selLi.find('.hour').text(data.hour+'课时')
				}
			});
		}
	}

	// 上课点名，当天不能重复，在php后台处理beginDate_time，带入unique参数
	var btnAddnew = $(page).find('.addnew')
	btnAddnew.on('singleTap',function(){
		var objCourse = {
			'timely'     : request.timely,
			'teacherID'  : request.teacherID,
			'teacherName': request.teacherName,
			'schoolName' : request.schoolName //学校，用于模版消息 
		}
		App.pick('rollcall', objCourse, function (data) {
			if(data){ 
				console.log(data)
				// 保存新增,ajax，这里data是数组（全部学生）
				toast('上课点名成功')
				//App.back(); // 或者list.insert()? handleData()
				// ajax here?
				var $node = $listItem.clone(true);
				$node.find('.courseDate').text('刚刚')
				$node.find('.courseNo').text(data.courseNo);//刚刚插入的 unique
				$node.find('.endClass').text('下课')
				$node.find('.endClass').css('display','inline')
				$node.find('.hour').css('display','none')
				$node.find('.hour').text('')
				$list.prepend($node)
				handleData( $list )
			}
		});
	})
}); 

// 多选学生，点名，并发送模版消息－》公众号
App.controller('rollcall', function (page,request) {
	var me = this;
	var $list = $(page).find('.app-list'),
		$listItem = $(page).find('.app-list li').remove()	
	
	var selPeople = []; //该一对多或班级的全部学生，默认全选 selPeople

	var params = {
		"teacherID": request.teacherID,
		"timely"   : request.timely, //某个上课时间
	}	
	console.log(params)
	readData(function(data){
		populateData(data)	
		handleData( $list ) // 才能处理动态添加列表项
		
		// 该一对N全部学生，默认全选，旷课搭上标志
		data.forEach(function(item){
			var obj = {
				studentName   : item.studentName,
				studentID     : item.studentID,
				wxID          : item.wxID,
				//schoolsub   : item.fullname, //分校区
				flag          : 1, //默认1出勤，2迟到，0旷课（请假）
				kcTitle       : item.kcTitle,
				kclistID      : item.kclistID,
				one2nstudentID: item.one2nstudentID, //追踪学生排课购买信息
				//school      : item.schoolName
			}
			selPeople.push(obj);
		})
		console.log(selPeople)
	}, params );
	
	function readData(callback,obj){
		showPrompt('读取一对N学生...'); // 
		$.ajax({
			url: gDataUrl + 'readOne2nStudent.php',
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
			$node.find('.name').text(item.studentName);
			$node.find('.wxID').text(item.wxID); //hidden
			//$node.find('.schoolsub').text(item.fullname); 
			$node.find('.id').text(item.studentID);
			$list.append($node);
		});	
	}
	
	function handleData(list){
		list.find('li').bind('singleTap', function (e){
			doSelect($(this));
		})
	}

	// 点击 更改 学生出勤状态012，而不是选择学生
	function doSelect(clicked){
		var obj = {
			"studentName": clicked.find('.name').text(),
			"wxID": clicked.find('.wxID').text(), //e.target.innerText
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

	var btnOk = $(page).find('.ok')	
	btnOk.bind('singleTap', function () {		
		if(selPeople.length === 0){
			toast('没有选择学生'); return false
		}
		
		App.dialog({
			title	     : '选择学生无误，点名上课？', //'删除当前公告？',
			okButton     : '确定',
			cancelButton : '取消'
		}, function (choice) {
			if(choice){
				// 当前课时唯一编号 teacherID + time()，一个课时有多条学生记录
				var courseNo = request.teacherID + '_' + (new Date()).getTime() 

				// 先添加到数据库，分组teacherID+timely+beginTime，成功后，再发模版消息
				var objCourse = {
					"courseNo"  : courseNo,
					"arrStudent": JSON.stringify(selPeople),
					"teacherID" : request.teacherID,
					"timely"    : request.timely,
				}
				console.log(objCourse)
				createData(objCourse)		
			}
		});
		
		// 二维数组全部学生，插入数据库，成功后再发模版消息
		function createData(obj){
			$.ajax({
				url: gDataUrl + 'createOne2nCourse.php',
				data: obj,
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
						
						// 返回，参数当前课时编号 app.pick
						me.reply({"courseNo":obj.courseNo})
					}
				},
			});
		}
		
		// 从企业号切换到服务号，整个数组selPeople群发不行，循环发
		function wxTpl(person){
			console.log(person);
			var obj = {
				//courseDate  : new Date(), // 用于判断今天补点名、不重复点名
				msg     : '今天的一对N课程上课开始。',
				kcTitle : person.kcTitle, //课程
				wxID    : person.wxID, // 发消息学生家长微信
				student : person.studentName,
				teacher : request.teacherName,
				school  : request.schoolName, //校区，发消息抬头
			}
			console.log(obj)
			$.ajax({
			    url: gDataUrl + 'weixinJS_gongzhonghao/wx_msg_tpl_one2n_begin.php',
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

// 2 下课界面
App.controller('endclass', function (page,request) {
	var me = this; console.log(request)
	
	var hour = 0 //本次一对多课时数
	var btnSubmit = $(page).find('.submit')
	btnSubmit.on('singleTap', function (e){
		//input.blur(); // 关闭软键盘
		/*var value = input.val()
		if(value == 0 || isNaN(value)||value%0.5 !=0 ){
			toast('课时格式错误'); return;		
		} */
		hour = $(page).find("#selHour").val(); //text()

		App.dialog({
			title	     : '本次一对N课程上 '+hour+'课时，下课？', //'删除当前公告？',
			okButton     : '确定',
			cancelButton : '取消'
		}, function (choice) {
			if(choice){
				var obj = {
					"hour": hour, //input.val(),
					"courseNo": request.courseNo, //unique
					"kcTitle"   : request.kcTitle,
					"teacherName": request.teacherName,
					"schoolName": request.schoolName,
				}
				console.log(obj)
				updateData(obj)
			}
		});	
	})	
	
	// 下课，更新下课时间＋课时
	function updateData(obj){
		$.ajax({
			url: gDataUrl + 'updateOne2nCourseByEndclass.php',
			data: obj,
			dataType: 'json',
			success: function(result){
				console.log(result)
				toast('一对N下课成功！')			
				
				$.ajax({
					url: gDataUrl + 'readOne2nCourseAttendee.php',
					dataType: "json", 
					data: obj,
					success: function(result){	
						console.log(result.data)
						// 给出勤学生发送下课模版消息，通知接送等
						result.data.forEach(function(person){
							if(person.flag != 0) wxTpl(person) 
						})
					},
				});
				
				// 返回 app.pick，更改状态
				me.reply(obj); 
			},
		});
	}
	
	// 一对N学生多个，从企业号发消息到服务号
	function wxTpl(person){
		console.log(person);
		var obj = {
			//courseDate  : new Date(), // 用于判断今天补点名、不重复点名
			msg     : '今天的一对N课程下课了，如有接送请安排。\n同时，请对本次上课教师进行评价。',
			wxID    : person.wxID, // 发消息学生家长微信
			student : person.studentName,
			teacher : request.teacherName,
			school  : request.schoolName, //校区，发消息抬头
			studentID: person.studentID, // 学生id，评价链接用
			courseNo: request.courseNo, //courseNo+studentID作为评价唯一链接
			kcTitle : request.kcTitle, //课程
			hour    : hour 
		}
		console.log(obj)
		$.ajax({
		    url: gDataUrl + 'weixinJS_gongzhonghao/wx_msg_tpl_one2n_end.php',
		    data: obj,
		    success: function(response){
		        var text = response.responseText;
		        // process server response here
				console.log(response)//JSON.parse
		    }
		});
	}
});

// 当前课时的明细（班级学生出勤状况，未下课可补点名），以及下课按钮
App.controller('attendee', function (page,request) {
	var me = this;
	var $list = $(page).find('.app-list'),
		$listItem = $(page).find('.app-list li').remove()	
	
	var btnEndclass = $(page).find('.endClass')
	
	// 当前课时的学生出勤，可以补点名或下课
	var params = {
		"courseNo": request.courseNo
	}	
	readData(function(data){
		populateData(data)	

		//尚未下课的hour==0，才能补点名handleData
		if(data[0].hour == 0){ 
			handleData( $list ) 
			//btnEndclass.show()
		}
	}, params );
	
	function readData(callback,obj){
		showPrompt('读取学生出勤...'); // 
		$.ajax({
			url: gDataUrl + 'readOne2nCourseAttendee.php',
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
			
			// hidden
			$node.find('.studentID').text(item.studentID);
			$node.find('.wxID').text(item.wxID);
			//$node.find('.schoolsub').text(item.fullname);//分校区名称，发消息用
			$node.find('.id').text(item.one2ncourseID);
			$list.append($node);
		});	
	}
	
	function handleData(list){
		list.find('li').bind('singleTap', function (e){
			doRollcall($(this)); //补点名
		})
	}
	
	// 迟到学生补点名，已经下课的不能补点名 hour>0
	function doRollcall(selLi){
		var flag = selLi.find('.flag').text()
		
		if(flag != '未到' ) return false

		var person = {
			one2ncourseID: selLi.find('.id').text(), // unique
			wxID       : selLi.find('.wxID').text(),
			student    : selLi.find('.studentName').text(),
			teacher    : request.teacherName,
			school     : request.schoolName,
			//schoolsub  : selLi.find('.schoolsub').text(),
			kcTitle    : request.kcTitle,
			//courseDate : new Date(), // 用于判断今天补点名、不重复点名
			msg        : '今天的一对N课程上课迟到，请家长多加关注。',
		}
		console.log(person)
		
		App.dialog({
			title	     : '该学生迟到，补点名？', //并发微信模版消息
			okButton     : '确定',
			cancelButton : '取消'
		}, function (choice) {
			if(choice){
				updateData(person)
			}
		});
		
		// 更新数据库，依据classcourseID = 唯一
		function updateData(obj){
			$.ajax({
				url: gDataUrl + 'updateOne2nCourse.php',
				data: obj,
				dataType: 'json',
				success: function(result){
					console.log(result)
					toast('补点名成功')
					
					// 补点名后，返回，重新加载后台数据，下课才准确
					//App.back(); 
					selLi.find('.flag').text('迟到✔') // 改变该学生签到状态
					selLi.css('background','#fff')
					
					// 微信模版消息通知
					wxTpl(person)
				},
			});
		}
		
		// 发微信模版消息
		function wxTpl(obj){
			$.ajax({
			    url: gDataUrl + 'weixinJS_gongzhonghao/wx_msg_tpl_one2n_begin.php',
			    data: obj,
			    success: function(response){
			        var text = response.responseText;
					console.log(response)//JSON.parse
			    }
			});
		}
	}

}); 


