// 教师的班级上课要点和作业，推送给家长
App.controller('home', function (page,request) {
	// 存储变量
	var classID = 0, //班级
		studentID = 0, //班级
		classes = '', 
		schoolsub = '',
		student = '', 
	    wxID = '', //学生微信，用于发送模版消息
		note = '', //班级上课内容
		localPhotos = [], // 选择或拍照的图片，未上传
		remotePhotos = [], // 上传服务器多图
		fileNames = []; //数据库图片文件名
	// 页面组件
	var $classes = $(page).find('.classes'),
		$student = $(page).find('.student'),
		$note = $(page).find('.note'),
		btnHist = $(page).find('.hist'), // 历史记录
		btnSubmit = $(page).find('.submit'),
		$list = $(page).find('.photos-wrapper'),
		$listItem = $(page).find('.photos-wrapper .imgContainer').remove()	
	
	// 当前教师的上课班级	企业号微信teacher是userId，不是teacherID
	$classes.parent().on('singleTap',function(e){
		App.pick('select-classes', {teacher:gUserID}, function (data) {
			if(data){ 
				console.log(data)
				classes = data.title;
				classID = data.classID;
				schoolsub = data.schoolsub
				$classes.text(classes);
			}
		});	
	})	
	$student.parent().on('singleTap',function(e){
		if(classID==0){
			toast('请先选择班级'); return;		
		}
		App.pick('select-student', {classID:classID}, function (data) {
			if(data){ 
				console.log(data)
				student = data.studentName
				wxID = data.wxID 
				studentID = data.studentID
				$student.text(student);
			}
		});	
	})	
	$note.parent().on('singleTap', function () {
		App.pick('input-textarea', {'value':note,'title':'留言'}, function (data) {
			if(data){ // 取消返回没有数值
				console.log(data)
				note = data.value;
				$note.text(note);
			}
		});
	});
	
	// 照片列表添加，预览或删除，$转换为jquery对象方便操作
	$list.on('singleTap',function(e){
		e.stopPropagation(); 
		console.log(e.target.className)
		var el = e.target.className
		
		if (el == 'imgPlus'){
			addImg()
		}else if(el == 'imgMinus'){
			// 删除图片，数组元素src
			var src = $(e.target).siblings()[0].src
			//alert(localPhotos.length)
			//e.target.parentNode.remove();
			$(e.target).parent().remove()
			
			//本地photos数组删除元素，通过src比对
			for(var i in localPhotos){	
				if(localPhotos[i] == src){	
					//reutrn i;//i就是下标
					//alert(localPhotos[i])
					localPhotos.splice(i, 1); 
					console.log(localPhotos)
					break; 
				}
			} 
		}else if(el == 'imgUpload'){ // class=imgUpload to preview
			wx.previewImage({
				current: e.target.src, 
				urls: [e.target.src]
			});
		}
		
		// + 
		function addImg(){			
			console.log('add multi img')
			wx.chooseImage({
	            count: 9, // 默认9
	            sizeType: ['original', 'compressed'], 
	            sourceType: ['album', 'camera'],
	            success: function (res) {
	                var localIds = res.localIds; 
					// 多选
					for (var i=0; i<localIds.length; i++)
					{
						var $node = $listItem.clone(true);
						$node.find('.imgUpload').attr('src',localIds[i])
						$node.find('.imgUpload').attr('id',localIds[i]); // localId
						$list.prepend($node); //append
						// 本地
						//localPhotos.push(localIds[i]) //mediaId
					}
	            }
	        });
		}
	})

		
	// 提交保存按钮
	btnSubmit.on('singleTap',function(e){				
		if(classID == 0){
			toast('请选择班级'); return;		
		}
		if(studentID == 0){
			toast('请选择推送学生'); return;		
		}
		if(note == ''){
			toast('请填写留言'); return;		
		}
		
		var imgs = $list.find('.imgUpload');
		if(imgs.length == 0){
		//if(localPhotos.length == 0 ){
			toast('请添加照片'); return;		
		}
		
		App.dialog({
			title	     : '提交、推送？', //'删除当前公告？',
			okButton     : '确定',
			cancelButton : '取消'
		}, function (choice) {
			if(choice){
				imgs.each(function(index){
					//localPhotos.push(imgs[index].src) //mediaId
					localPhotos.push(imgs[index].id)
				})
				showPrompt('正在上传...');
				syncUpload(localPhotos); // 递归调用，不是循环		
			}
		});
    });	
	// 1. 上传多图到微信服务器
	var syncUpload = function(localIds){
		var localId = localIds.pop(); //递归，逐步减少
		wx.uploadImage({
			localId: localId,
			isShowProgressTips: 0,
			success: function (res) {
				var serverId = res.serverId; // 返回图片的服务器端ID
				remotePhotos.push(res.serverId);
				//其他对serverId做处理的代码
				if(localIds.length > 0){
					syncUpload(localIds); //递归，循环上传
				}else{
					syncDownload(remotePhotos)				
				}
			}
		});
	};
	// 2. 下载刚才上传的到自己服务器或腾讯云cos，长久保存
	var syncDownload = function(serverIds){
		var serverId = serverIds.pop(); //递归，逐步减少
		/*
		var fileName = 'script/img/classjxt/' + 
			new Date().getTime() + '_' + Math.floor(Math.random()*100) + '.jpg';
		fileNames.push(fileName); // photo多图的文件名 */
		var obj = {
			"mediaId": serverId,
			//"fileName": fileName
		}
		$.ajax({
			//不保存服务器，保存云存储cos
			url: 'script/weixinJS/wx_img_down_each.php',
			data: obj, //必须符合json标准，才能执行success
			dataType: "json",//jsonp: 'callback',
			success: function(result){
				console.log(result)
				fileNames.push(result.photofile); // photo多图的文件名
				
				if(serverIds.length > 0){
					syncDownload(serverIds); //递归recursive
				}else{
					// 3、保存数据库记录
					var obj = {
						"classID": classID,
						"studentID": studentID,
						"classes": classes, //班级名称
						"schoolsub": schoolsub, //所在分校区
						"student": student,
						"wxID": wxID, //学生微信
						"note": note,
						"photos": fileNames.join(','), // 数组转字符串
						//"mediaIds": '' // remotePhotos.join(',') 
						// 微信服务器保存3天的图片
						"userId": gUserID, //教师账号，没有取得数据库ID
						"schoolID": gSchoolID
					}
					createData(obj)
				}
			},
		});
	};
	
	function createData(obj){		   
		//showPrompt('正在保存');
		$.ajax({
			url: gDataUrl + 'createClassesEach.php',
			dataType: "json",
			data: obj, //jsonp: 'callback',
			success: function(result){
				console.log(result.data)
				hidePrompt();
				
				obj.classeachID = result.data.classeachID // 当前这次推送
				console.log(obj)
				
				// 微信模版通知家长
				wxTpl(obj)
				
				toast('推送成功')
				
				//App.load('hist',params); 
				//App.load('home'); // 清空
				$student.text('未选择') //换另外一个学生？
				student = ''
				wxID = ''
				studentID = 0
			},
		});
	} 
	
	// 发送模版消息: 企业号－>服务号
	function wxTpl(person){
		console.log(person);
		
		//var msg = '学生精彩瞬间：' + person.note ;
		
		var objWx = {
			msg        : person.note,
			wxID       : person.wxID, // 发消息学生家长
			studentName: person.student,
			schoolsub  : person.schoolsub, //分校区，发消息抬头
			classDate  : new Date(), // 用于判断今天补点名、不重复点名
			className  : person.classes,
			classeachID: person.classeachID,
		}
		console.log(objWx)
		
		$.ajax({
		    url: gDataUrl + 'weixinJS_gongzhonghao/wx_msg_tpl_class_each.php',
		    data: objWx,
		    success: function(res){
		        var text = res.responseText;
		        // process server response here
				console.log(res)//JSON.parse
		    }
		});
	}
	

	// 历史记录			
	btnHist.on('singleTap',function(e){
		var params = {
			"userId"      : gUserID,
			"schoolID"    : gSchoolID,
			//"classjxtType": '教师'
		}
		App.load('hist',params)
	})
}); // photo upload & save ends

// 选择教师的班级
App.controller('select-classes', function (page,request) {
	var me = this; 
	var $list = $(page).find('.list'),
		$listItem = $(page).find('.listItem').remove();

	var params = {
		"teacher": request.teacher, //userId
	}	
	readMemberList(params); 
	console.log(params)
	function readMemberList(obj){	
		showPrompt('加载班级...');	
		$.ajax({
			url: gDataUrl + 'readClassesListByTeacher.php',
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
			var $node = $listItem.clone(true);
			$node.find('.title').text(item.title); 
			$node.find('.timely_list').text(item.timely_list); 
			$node.find('.schoolsub').text(item.fullname); 
			$node.find('.id').text(item.classID);
			$list.append($node);	
		});
		
		$list.find('.listItem').on('singleTap', function (e){
			//if(e.target.className == 'group') return false // 点击分组标签
			//this.style.color = 'blue';
			$(this).css('color','blue')
			var obj = {
				"classID": $(this).find('.id').text(),
				"title"	: $(this).find('.title').text(),
				"schoolsub"	: $(this).find('.schoolsub').text()
			}
			me.reply(obj); // app.pick
			console.log(obj)
		})
	}
});

// 选择当前班级的学生
App.controller('select-student', function (page,request) {
	var me = this; 
	var $list = $(page).find('.list'),
		$listItem = $(page).find('.listItem').remove();

	var params = {
		"classID": request.classID, //userId
	}	
	readMemberList(params); 
	console.log(params)
	function readMemberList(obj){	
		showPrompt('加载班级...');	
		$.ajax({
			url: gDataUrl + 'readClassesStudent.php',
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
			var $node = $listItem.clone(true);
			$node.find('.name').text(item.studentName); 
			$node.find('.gender').text(item.gender); 
			$node.find('.wxID').text(item.wxID); //方便发送微信模版信息
			$node.find('.id').text(item.studentID);
			$list.append($node);	
		});
		
		$list.find('.listItem').on('singleTap', function (e){
			//if(e.target.className == 'group') return false // 点击分组标签
			//this.style.color = 'blue';
			$(this).css('color','blue')
			var obj = {
				"studentID"  : $(this).find('.id').text(),
				"wxID"       : $(this).find('.wxID').text(),
				"studentName": $(this).find('.name').text()
			}
			me.reply(obj); // app.pick
			console.log(obj)
		})
	}
});

// 
App.controller('hist', function (page,request) {
	var $list = $(page).find('.list'),
		$listItem = $(page).find('.listItem').remove()	
	
	console.log(request)	
	readData(function(data){
		populateData(data)	
		handleData( $list )
		//records = data;
	}, request );

	function readData(callback, obj){
		showPrompt('加载记录...');		
		$.ajax({
	    	url: gDataUrl + 'readClassesEach.php',
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
			$node.find('.classes').text(item.title);
			$node.find('.student').text(item.studentName);
			$node.find('.time').text(item.created.substr(2,8));
			$node.find('.note').text(item.note);//课程内容
			//display:none
			$node.find('.id').text(item.classjxtID);	
			
			var $photos = $node.find('.photos')
			// 图片列表：尚未下载到自己服务器的 mediaIds
			var photos = item.photos.split(',');
			/*
			if(photos==''){
				photos = item.mediaIds.split(','); 
			} */
			$.each(photos, function(i,photo){      
				console.log(photo)
				var $img = '<img src='+photo+' style="width:100px;height:100px;padding:2px;" />'
				$photos.append($img)
			});	
			
			$node.find('.removeItem').show()
					
			$list.append($node);
		});
	}	
}); // ends controller



