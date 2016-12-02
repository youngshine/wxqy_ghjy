// 咨询师: 今天班级上课通知
App.controller('home', function (page) {
	var $search = $(page).find('input[type=search]'),
		$list = $(page).find('.list'),
		$listItem = $(page).find('.listItem').remove()	

	var records = []; // all for search

	var params = { 
		"consultID": gUserID,
	}
		
	readData(function(data){
		populateData(data)	
		handleData( $list )
		records = data;
	}, params );


	function readData(callback, obj){
		showPrompt('读取班级...'); console.log(obj)		
		$.ajax({
	    	url: gDataUrl + 'readClassesListByConsultNotify.php',
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
			
			var arrTimely = item.timely_list.split(',')
			var filter = arrTimely.filter(function(ele,pos){
			    return ele.indexOf(item.weekday ) >= 0  ;
			});
			console.log(filter)			
			$node.find('.timely_list').text(filter);
			
			$node.find('.teacher').text(item.teacherName);
			$node.find('.schoolsub').text(item.schoolsub);
			//display:none
			$node.find('.id').text(item.classID);
			$node.find('.userId').text(item.teacherUserId); //教师企业账号，推送消息		
			$list.append($node);
		});
	}
	
	function handleData(list){
		list.find('.listItem').on({
			click: function () {
				var selected = $(this)
				var rec = {	
					"classID"    : $(this).find('.id').text(),
					"title"      : $(this).find('.title').text(),
					"timely_list": $(this).find('.timely_list').text(),
					"schoolsub"  : $(this).find('.schoolsub').text(),
					"teacher"    : $(this).find('.teacher').text(),
					"userId"     : $(this).find('.userId').text(), //教师企业账号，推送消息
				}
				
				App.dialog({
					title     : '班级上课通知',
					text     : '向学生家长＋教师推送微信提醒消息',
					okButton : '确定',
					cancelButton : '取消',
				}, function (choice) {
				  if (choice) {
				    //wxTpl() //循环发送
					showPrompt('推送微信消息给班级学生...'); // 
					var objClass = {
						"classID": rec.classID
					}
					$.ajax({
						url: gDataUrl + 'readStudentListByClass.php',
						dataType: "json", 
						data: objClass,
						//timeout: 6000,
						success: function(result){
							hidePrompt();	
							console.log(result)
							selected.find('.check').text('✔')
							
							// 1. 推送给学生家长－公众号
							var students = result.data
							students.forEach(function(person){
								var objWx = {
									wxID: person.wxID,
									studentName: person.studentName,
									title: rec.title,
									timely_list: rec.timely_list,
									schoolsub: rec.schoolsub
								}
								wxTpl(objWx)
							})
							
							// 2. 推送给上课教师－企业号
							doWxMsgText(rec)
						},
					});
				  }
				});
			},	
		})
	}
	
	// 从企业号切换到服务号，整个数组selPeople群发不行，循环发
	function wxTpl(objWx){
		console.log(objWx);
		$.ajax({
		    url: gDataUrl + 'weixinJS_gongzhonghao/wx_msg_tpl_class_notify.php',
		    data: objWx,
		    success: function(response){
		        var text = response.responseText;
		        // process server response here
				console.log(response)//JSON.parse
		    }
		});
	}
	
	// 微信文本通知教师，上课提醒
	function doWxMsgText(rec){		
		var objMsg = {
			userId : rec.userId, // all = '@all
			type : "［上课提醒］",
			msg : "班级："+rec.title + '\n时间：' + rec.timely_list + '\n校区：' + rec.schoolsub,
			agentId : 10, // 9=咨询模块，0系统小助手
			link : '' //'news-notify-zepto.php?id=' + result.data.news_id // 刚新增的公文id
		}
		console.log(objMsg)
		wxMsgText(objMsg)
	}
}); // ends controller

	


