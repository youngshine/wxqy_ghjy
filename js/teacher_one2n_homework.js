// 教师一对N上课要点和作业，推送给家长
App.controller('home', function (page,request) {
	// 存储变量
	var //school = '', // 学校名称，用于发送模版消息，统一用学生归属分校区schoolsub
		students = [],//学生列表，name,wxID微信,id，用于发送模版消息
		keypoint = '', //一对多上课要点
		localPhotos = [], // 选择或拍照的图片，未上传
		remotePhotos = [], // 上传服务器多图
		fileNames = []; //数据库图片文件名
	
	// 页面组件
	var $students = $(page).find('.students'),
		$keypoint = $(page).find('.keypoint'),
		btnHist = $(page).find('.hist'), // 历史记录
		btnSubmit = $(page).find('.submit'),
		$list = $(page).find('.photos-wrapper'),
		$listItem = $(page).find('.photos-wrapper .imgContainer').remove()	

    // 多选学生
	$students.parent().on('singleTap',function(e){
		App.pick('select-students', {teacher: gUserID}, function (data) {
			if(data){ 
				console.log(data)
				students = data.persons	
				// 显示多选人员的姓名，
				var name_list = []		
				students.forEach(function (student) {
					name_list.push(student.studentName)
				});
				$students.text(name_list.join('、'))
			}
		});	
	})	
	
	$keypoint.parent().on('singleTap', function () {
		App.pick('input-textarea', {'value':keypoint,'title':'课程要点'}, function (data) {
			if(data){ // 取消返回没有数值
				console.log(data)
				keypoint = data.value;
				$keypoint.text(keypoint);
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
		if( students.length == 0 ){
			toast('请选择学生'); return;		
		}
		
		if(keypoint == ''){
			toast('请填写课程要点'); return;		
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
			url: 'script/weixinJS/wx_img_down_homework.php',
			data: obj, //必须符合json标准，才能执行success
			dataType: "json",//jsonp: 'callback',
			success: function(result){
				console.log(result)
				fileNames.push(result.photofile); // photo多图的文件名
				
				if(serverIds.length > 0){
					syncDownload(serverIds); //递归recursive
				}else{
					// 3、保存数据库记录
					var studentID_list = []	// 学生id列表
					students.forEach(function (student) {
						studentID_list.push(student.studentID)
					});
					
					var obj = {
						"students"      : students, //数组，包含学生微信wxID
						"studentID_list": studentID_list.join(','),
						"keypoint"      : keypoint,
						"photos"        : fileNames.join(','), // 数组转字符串
						//"mediaIds": '' // remotePhotos.join(',') 
						// 微信服务器保存3天的图片
						"userId": gUserID, //教师企业账号，没有取得数据库ID
						"schoolID": gSchoolID
					}
					console.log(obj)
					createData(obj)
				}
			},
		});
	};
	
	function createData(obj){		   
		//showPrompt('正在保存');
		$.ajax({
			url: gDataUrl + 'createOne2nHomework.php',
			dataType: "json",
			data: obj, //jsonp: 'callback',
			success: function(result){
				console.log(result.data)
				hidePrompt();
				
				//obj.one2nhomeworkID = result.data.one2nhomeworkID // 当前这次推送
				//console.log(obj)
				
				toast('上课作业推送成功')
				
				// 循环微信模版通知家长
				students.forEach(function (student) {
					var objWx = {
						"studentName": student.studentName,
						"wxID": student.wxID,
						"schoolsub": student.schoolsub, //学生所属分校区
						"keypoint": keypoint,
						"one2nhomeworkID": result.data.one2nhomeworkID //用于详情链接id
					}
					console.log(objWx)
					wxTpl(objWx) //??
				});

				App.load('home'); // 清空，包括图片
				//$students.text('未选择') //换另外一个学生？
				//students = []
				//keypoint = ''
			},
		});
	} 
	
	// 发送模版消息: 企业号－>服务号
	function wxTpl(objWx){
		$.ajax({
		    url: gDataUrl + 'weixinJS_gongzhonghao/wx_msg_tpl_one2n_homework.php',
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

// 多选学生列表－－公用类，对应app.pick
App.controller('select-students', function (page,request) {
	var me = this;

	var $list     = $(page).find('.app-list'),
		$listItem = $(page).find('.app-list li').remove()

	var selPeople = []; //选择多人存入数组
	
	var params = {
		"teacher": request.teacher //一对多教师
	}
	console.log(params)
	
	readData(params); 
	
	function readData(obj){
		showPrompt('读取一对N学生...'); // 
		$.ajax({
			url: gDataUrl + 'readOne2nStudent.php',
			data: obj,
			dataType: "json",
			success: function(result){
				hidePrompt();	
				populateData(result.data);
				console.log(result.data)
			},
		});
  	}

	function populateData(items){
		// 先移除旧的
		items.forEach(function (item) {
			var $node = $listItem.clone(true);
			$node.find('.name').text(item.studentName);
			// hidden
			$node.find('.id').text(item.studentID);
			$node.find('.wxID').text(item.wxID);
			$node.find('.schoolsub').text(item.schoolsub); //用于微信消息
			$list.append($node);
		});
		
		$list.find('li').bind('singleTap', function (e){
			doSelect( $(this) );
		})
	}

	// 点击打勾选择或不选择
	function doSelect(selLi){
		var person = {
			"studentID"   : selLi.find('.id').text(), // e.target.id,
			"studentName" : selLi.find('.name').text(), //e.target.innerText
			"wxID"        : selLi.find('.wxID').text(),
			"schoolsub"   : selLi.find('.schoolsub').text(),
		}
		
		var $checked = selLi.find('.checked')
		if($checked.text() == ''){
			$checked.text('✔'); //选择打勾、变色
			//selLi.css('color','blue'); //js this.style.color 
			//添加选择人员到已选数组selPeople
			selPeople.push(person);
		}else{
			$checked.text('')
			//selLi.css('color','#000');
			// 根据元素值，删除指定数组元素
			for(var i in selPeople){
				//if(selPeople[i].name == obj.name){
				if(selPeople[i].wxID == person.wxID){
					//reutrn i;//i就是下标
					selPeople.splice(i, 1); 
					break; 
				}
			} 
		}
		
		console.log(selPeople)

		//console.log(selected.join(""))	
	/*	
		var selectedPeople = '';
		selected.forEach(function(item){
			selectedPeople += item.name + '、'
		}) 
		// 去掉最后一个顿号 、
		selectedPeople = selectedPeople.substring(0,selectedPeople.length-1);
		selectedDiv.text(selectedPeople)
	*/	
		setBtnOk(selPeople.length)
	}
	
	// 多选中
	var btnOk = $(page).find('.ok')
	btnOk.bind('click', function () {		
		me.reply({
			"persons": selPeople
		});
	})	
	
	// ok按钮显示或不显示，看选中的记录数num
	function setBtnOk(num){
		if(num>0){
			btnOk.show()
		}else{
			btnOk.hide()
		}
	}
}); // select ends

// 
App.controller('hist', function (page,request) {
	var $list = $(page).find('.list'),
		$listItem = $(page).find('.listItem').remove()	
	
	console.log(request)	
	readData(function(data){
		populateData(data)	
		handleData( $list ) //放大图片，删除记录
	}, request );

	function readData(callback, obj){
		showPrompt('加载历史记录...');		
		$.ajax({
	    	url: gDataUrl + 'readOne2nHomework.php',
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
			//$node.find('.classes').text(item.title);
			//$node.find('.student').text(item.studentName);
			$node.find('.time').text(item.created);
			$node.find('.keypoint').text(item.keypoint);//课程内容
			//display:none
			$node.find('.id').text(item.one2nhomeworkID);	
			
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
	
	function handleData(list, items){
		list.find('.listItem').find('img').bind({
			click: function(e){
				//console.log(e.target)
				var imgs = $(this).parent().children();
				var urls = [];
				imgs.forEach(function (img) {
					urls.push(img.src)
				})
				console.log(urls);
				WeixinJSBridge.invoke('imagePreview', {  
					'current' : e.target.src,  
					'urls' : urls  
				});
			}
		})
	}	
}); // ends controller



