// 创建点名 
// 或者已经点名过（按当天日子判断）可以补点名刚才没来的迟到
// 下课，给点过名的发通知 
App.controller('home', function (page) {
	var $list = $(page).find('.list'),
		$listItem = $(page).find('.listItem').remove()	
	
	var params = { 
		"teacherID": gUserID
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
		showPrompt('加载班级...');		
		$.ajax({
	    	url: gDataUrl + 'readClassesListByTeacher.php',
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
			$node.find('.title').text(item.title); 
			$node.find('.weekday').text(item.weekday);
			//display:none
			$node.find('.id').text(item.classID);			
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
			"classID": selectedLi.find('.id').text(),
		}
		console.log(item)
		// 如果下面存在删除记录，用pick，否则用load
		App.load('classcourse',item) 
	}
}); // ends controller

// 课时
App.controller('classcourse', function (page,request) {
	var me = this;
	var $list = $(page).find('.app-list'),
		$listItem = $(page).find('.app-list li').remove()	

	var params = {
		"classID": request.classID
	}	
	readData(function(data){
		//records = data;
		populateData(data)	
		handleData( $list ) // 才能处理动态添加列表项
	}, params );
	
	function readData(callback,obj){
		showPrompt('读取上课课时...'); // 
		$.ajax({
			url: gDataUrl + 'readClasscourseList.php',
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
			$node.find('.courseDate').text(item.beginTime,0,10);
			$node.find('.id').text(item.classcourseID);
			$list.append($node);
		});	
	}
	
	function handleData(list){
		list.find('li').bind('click', function (e){
			doShow($(this));
		})
	}
	function doShow(selectedLi){
		var item = {	
			"classcourseID": selectedLi.find('.id').text(),
		}
		console.log(item)
		// 如果下面存在删除记录，用pick，否则用load
		App.load('attendee',item) 
	}
	
	var btnRollcall = $(page).find('.rollcall')
	btnRollcall.on('click',function(){
		App.pick('rollcall', {'classID':request.classID}, function (data) {
			if(data){ 
				console.log(data)
				var obj = {
					arrStudent: data
				}
				// 保存新增,ajax，这里data是数组（全部学生）
				$.ajax({
					url: gDataUrl + 'createClasscourse.php',
					data: obj,
					dataType: 'json',
					success: function(result){
						console.log(result)
						toast('上课点名成功')
						App.back('home')
					},
				});
			}
		});
	})
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
		//records = data;
		populateData(data)	
		handleData( $list ) // 才能处理动态添加列表项
		// 默认全选
		data.forEach(function(item){
			var obj = {
				studentName: item.studentName,
				studentID  : item.studentID,
				wxID       : item.wxID,
				flag       : 1, //默认1出勤，2迟到，3旷课（请假）
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
		var obj = {
			"studentName": clicked.find('.id').text(),
			"studentID": clicked.find('.id').text(), // e.target.id,
			"wxID": clicked.find('.wxID').text() //e.target.innerText
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
	
	btnOk.bind('click', function () {		
		App.dialog({
		  title	       : '选择学生无误，点名上课？', //'删除当前公告？',
		  okButton     : '确定',
		  cancelButton : '取消'
		}, function (choice) {
			if(choice){
				// 1、添加到数据库 2、循环发微信模版消息
				// selPeople, classID 添加到数据库
				//createData(classID,selPeople)
				selPeople.forEach(function(person){
					// 一个个出勤发模版消息，通知学生家长
					if(person.flag==1) wxTpl(person) 
				})
				// 2. 添加到数据库
				me.reply(selPeople)
			}
		});
		
		// 从企业号切换到服务号，整个数组selPeople群发不行，循环发
		function wxTpl(person){
			console.log(person);
			var obj = {
				wxID       : person.wxID, // 发消息学生家长
				studentName: person.studentName,
				classDate  : new Date(), // 用于判断今天补点名、不重复点名
			}
			console.log(obj)
			$.ajax({
			    url: gDataUrl + 'weixinJS_gongzhonghao/wx_msg_tpl_class.php',
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


