// 咨询家校联络记录拍照

// 家校通记录拍照上传
App.controller('home', function (page,request) {
	var classes = '', 
		classID = 0, //班级
		localPhotos = [], // 选择或拍照的图片，未上传
		remotePhotos = [], // 上传服务器多图
		fileNames = []; //数据库图片文件名

	var $classes = $(page).find('.classes'),
		btnSubmit = $(page).find('.submit'),
		$list = $(page).find('.photos-wrapper'),
		$listItem = $(page).find('.photos-wrapper .imgContainer').remove()
		
	var btnHist = $(page).find('.hist')
	// 该咨询的上传历史记录	
	var params = {
		"userId"      : gUserID,
		"classjxtType": '咨询'
	}	
	btnHist.on('click',function(e){
		App.load('hist',params)
	})	
	
	// 当前教师的上课班级	企业号微信teacher是userId，不是teacherID
	$classes.parent().on('click',function(e){
		App.pick('select-classes', {"schoolID":gSchoolID}, function (data) {
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
		/*
		var $node = $listItem.clone(true);
		$node.find('.imgUpload').attr('src','assets/img/nopic.jpg')
		$list.prepend($node);
		
		localPhotos.push('assets/img/nopic.jpg')
		console.log(localPhotos)
		return  */
		
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
		var imgs = $list.find('.imgUpload');
		if(imgs.length == 0){
		//if(localPhotos.length == 0 ){
			toast('请添加照片'); return;		
		}
		localPhotos = []
		imgs.each(function(index){
			//localPhotos.push(imgs[index].src) //mediaId
			localPhotos.push(imgs[index].id)
		})
		
		App.dialog({
			title	     : '上传家校记录？', //'删除当前公告？',
			okButton     : '确定',
			cancelButton : '取消'
		}, function (choice) {
			if(choice){
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
					syncUpload(localIds); //递归
				}else{
					syncDownload(remotePhotos)				
					/*
					// 3、保存数据库记录
					var obj = {
						"userId": myUserId,
						"photos": '', //fileNames.join(',') // 数组转字符串
						"mediaIds": remotePhotos.join(',') // 微信服务器保存3天的图片
					}
					createData(obj) */
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
						"userId": gUserID, //没有取得数据库ID
						"classjxtType": '咨询',
					}
					createData(obj)
				}
			},
		});
	};
	
	function createData(obj){		   
		//showPrompt('正在保存');
		$.ajax({
			url: gDataUrl + 'createClassjxt.php',
			dataType: "json",
			data: obj, //jsonp: 'callback',
			success: function(result){
				hidePrompt();
				toast('上传家校记录成功')
				
				App.load('hist',params); 
				
				// 企业号通知校长, 不知道校长userID，使用固定校长标签＝4
				//doWxMsgText()
			},
			error: function(result){
				showPrompt('出错');
			}
		});
	} 
	
	// 微信文本通知咨询师有新的学生，全局函数公用
	function doWxMsgText(){		
		var objMsg = {
			//userId : userId, // all = '@all
			tagID: 4, //校长标签4
			type : "家校通记录",
			msg : '有教师上传家校联系记录，请查看',
			agentId : 9, // 9=咨询模块，0系统小助手
			link : 'news-notify-zepto.php?id=' + result.data.news_id // 刚新增的公文id
		}
		console.log(objMsg)
		wxMsgText(objMsg)
	}
}); // photo upload & save ends

// 选择教师的班级
App.controller('select-classes', function (page,request) {
	var me = this; 
	var $list = $(page).find('.list'),
		$listItem = $(page).find('.listItem').remove();

	var records = []; // all for search filter
	
	var params = {
		"schoolID": request.schoolID, //企业号自定义
		"consult" : gUserID
	}	
	readMemberList(params); 
	console.log(params)
	function readMemberList(obj){	
		showPrompt('加载班级...');	
		$.ajax({
			url: gDataUrl + 'readClassesListBySchoolsub.php', //all
			data: obj,
			dataType: "json",
			success: function(result){
				populateData(result.data); 
				console.log(result.data)
				records = result.data // all for search
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
	

	var $search = $(page).find('input[type=search]')
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
			    return ele.classType == choice ;
			});
			console.log(filter)
			$list.empty();
			populateData(filter)
			handleData( $list )
		  }
		});
	});	
});

// 
App.controller('hist', function (page,request) {
	var $list = $(page).find('.list'),
		$listItem = $(page).find('.listItem').remove()	
/*	
	var params = { 
		"userId": request.userId //gUserID - userId
	}	*/
		
	readData(function(data){
		populateData(data)	
		handleData( $list )
		//records = data;
	}, request );

	function readData(callback, obj){
		showPrompt('加载家校记录...');		
		$.ajax({
	    	url: gDataUrl + 'readClassjxtList.php',
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
					title	     : '删除家校记录？', //'删除当前公告？',
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
			url: dataUrl + 'deleteClassjxt.php',
			data: {"classjxtID":ID},
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


