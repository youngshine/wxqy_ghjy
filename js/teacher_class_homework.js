// 教师的班级上课要点和作业，推送给家长
App.controller('home', function (page,request) {
	var classes = '', 
		classID = 0, //班级
		keypoint = '', //班级上课内容
		localPhotos = [], // 选择或拍照的图片，未上传
		remotePhotos = [], // 上传服务器多图
		fileNames = []; //数据库图片文件名

	var $classes = $(page).find('.classes'),
		btnSubmit = $(page).find('.submit'),
		$list = $(page).find('.photos-wrapper'),
		$listItem = $(page).find('.photos-wrapper .imgContainer').remove()
	
	var btnHist = $(page).find('.hist')
	// 该教师的上传历史记录		
	var params = {
		"userId"      : gUserID,
		"schoolID"      : gSchoolID,
		//"classjxtType": '教师'
	}	
	btnHist.on('click',function(e){
		App.load('hist',params)
	})	
	
	// 当前教师的上课班级	企业号微信teacher是userId，不是teacherID
	$classes.parent().on('click',function(e){
		App.pick('select-classes', {teacher:gUserID}, function (data) {
			if(data){ 
				console.log(data)
				classes = data.title;
				classID = data.classID;
				$classes.text(classes);
			}
		});	
	})	
	
	// 添加，预览或删除，$转换为jquery对象方便操作
	$list.on('click',function(e){
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
	})
	function addImg(){			
		console.log('add multi img')
		wx.chooseImage({
            count: 3, // 默认9
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
		
	// 提交保存按钮
	btnSubmit.on('click',function(e){				
		if(classID == 0){
			toast('请选择班级'); return;		
		}
		keypoint = $(page).find('textarea').val().trim()
		console.log(keypoint)
		var imgs = $list.find('.imgUpload');
		if(imgs.length == 0 && keypoint==''){
		//if(localPhotos.length == 0 ){
			toast('内容、照片不能全空'); return;		
		}
		
		App.dialog({
			title	     : '提交、推送？？', //'删除当前公告？',
			okButton     : '确定',
			cancelButton : '取消'
		}, function (choice) {
			if(choice){
				if(imgs.length > 0){
					//localPhotos = []
					imgs.each(function(index){
						//localPhotos.push(imgs[index].src) //mediaId
						localPhotos.push(imgs[index].id)
					})
					showPrompt('正在上传...');
					syncUpload(localPhotos); // 递归调用，不是循环
				}else{
					var obj = {
						"classID": classID,
						"className": classes,
						"photos": '', //没有作业照片
						"keypoint": keypoint,
						"userId": gUserID, //没有取得数据库ID
						//"classjxtType": '教师',
						"schoolID": gSchoolID
					}
					createData(obj)
				}			
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
					syncUpload(localIds); //递归
				}else{
					syncDownload(remotePhotos)				
				}
			}
		});
	};
	// 2. 下载刚才上传的到自己服务器，长久保存
	var syncDownload = function(serverIds){
		var serverId = serverIds.pop(); //递归，逐步减少
		var fileName = 'script/img/classjxt/' + 
			new Date().getTime() + '_' + Math.floor(Math.random()*100) + '.jpg';
		fileNames.push(fileName); // photo多图的文件名
		var obj = {
			"mediaId": serverId,
			"fileName": fileName
		}
		$.ajax({
			url: 'script/weixinJS/wx_imgDown.php',
			data: obj, //必须符合json标准，才能执行success
			dataType: "json",//jsonp: 'callback',
			success: function(result){
				if(serverIds.length > 0){
					syncDownload(serverIds); //递归recursive
				}else{
					// 3、保存数据库记录
					var obj = {
						"classID": classID,
						"photos": fileNames.join(','), // 数组转字符串
						//"mediaIds": '' // remotePhotos.join(',') 
						// 微信服务器保存3天的图片
						"keypoint": keypoint,
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
			url: gDataUrl + 'createClasshomework.php',
			dataType: "json",
			data: obj, //jsonp: 'callback',
			success: function(result){
				hidePrompt();
				toast('上传上课作业成功')
				
				//App.load('hist',params); 
				App.load('home'); // 清空
				
				// 微信模版通知家长,classID班级循环
				$.ajax({
					url: gDataUrl + 'readStudentListByClass.php',
					dataType: "json",
					data: obj, //classID,
					success: function(result){
						console.log(result)
						result.data.forEach(function(person){
							// 来上课的，一个个发模版消息，通知家长
							wxTpl(person,obj.keypoint,obj.photos,obj.className) 
						})
					}
				})
			},
		});
	} 
	
	// 发送模版消息: 企业号－>服务号
	function wxTpl(person,keypoint,photos,className){
		console.log(person);
		
		var msg = '今天上课主要内容：' + keypoint ;
		/*
		var photos = photos.split(',');
		$.each(photos, function(i,photo){      
			console.log(photo)
			msg += '<img src='+photo+' style="width:100px;height:100px;padding:2px;" />'
		});	 */
		
		var obj = {
			wxID       : person.wxID, // 发消息学生家长
			studentName: person.studentName,
			schoolsub  : person.fullname, //分校区，发消息抬头
			classDate  : new Date(), // 用于判断今天补点名、不重复点名
			className  : className,
			msg        : msg
		}
		console.log(obj)
		$.ajax({
		    url: gDataUrl + 'weixinJS_gongzhonghao/wx_msg_tpl_class_homework.php',
		    data: obj,
		    success: function(response){
		        var text = response.responseText;
		        // process server response here
				console.log(response)//JSON.parse
		    }
		});
	}
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
			$node.find('.weekday').text(item.weekday); 
			$node.find('.timespan').text(item.timespan); 
			$node.find('.schoolsub').text(item.fullname); 
			$node.find('.id').text(item.classID);
			$list.append($node);	
		});
		
		$list.find('.listItem').on('click', function (e){
			//if(e.target.className == 'group') return false // 点击分组标签
			//this.style.color = 'blue';
			$(this).css('color','blue')
			var obj = {
				"classID": $(this).find('.id').text(),
				"title"	: $(this).find('.title').text()
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
		showPrompt('加载上课作业记录...');		
		$.ajax({
	    	url: gDataUrl + 'readClasshomeworkList.php',
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
			$node.find('.time').text(item.created.substr(2,8));
			$node.find('.keypoint').text(item.keypoint);//课程内容
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

	function handleData(list, items){
		list.find('.listItem').find('.removeItem').bind({
			click: function(e){
				//console.log($(this).siblings(".examId").text())
				//toDelete( $(this).siblings(".examId").text(), items )
				var selected = $(this).parent().parent()
				console.log(selected.find('.examId').text())
				App.dialog({
					title	     : '删除记录？', //'删除当前公告？',
					okButton     : '确定',
					cancelButton : '取消'
				}, function (choice) {
					if(choice){
						deleteData( selected.find('.id').text(), selected )
					}
				});
			}
		})
			
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
	
	// 删除
	function deleteData(ID, selected){
		showPrompt('正在删除...'); console.log(ID)
		$.ajax({
			url: dataUrl + 'deleteClasshomework.php',
			data: {"classhomeworkID":ID},
			dataType: "json", // 返回的也是 json
			success: function(result){
				if(result.success){
					hidePrompt();
					//显示服务端出错信息,有跟贴子表记录，不能删除
					selected.remove()
				}else{
					toast(result.message,3000)
				}						
			},
		});
	}	
}); // ends controller



