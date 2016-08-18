// 教师＋咨询的家校联络记录拍照，按日期分组
App.controller('home', function (page,request) {
	var $list = $(page).find('.list'),
		$listItem = $(page).find('.listItem').remove()	

	var tabConsult = $(page).find('.consult'),
		tabTeacher = $(page).find('.teacher')
	
	tabConsult.on('click',function(e){
		$(this).css('background','#fff');
		tabTeacher.css('background','#eee')
		//$list.empty()
		//populateData(records)	
		var obj = {
			"classjxtType": '咨询',
			"userId"      : '', //空白，表示全部 userId like ''
			"schoolID"    : gSchoolID			
		}
		readData(obj)
	})
	tabTeacher.on('click',function(e){
		$(this).css('background','#fff');
		tabConsult.css('background','#eee')
		//$list.empty()
		//populateData(records)	
		//handleData($list,records);
		var obj = {
			"classjxtType": '教师',
			"userId"      : '', //空白，表示全部 userId like ''
			"schoolID"    : gSchoolID		
		}
		readData(obj)
	})
	
	function readData(obj){
		//showPrompt('加载一对一...');		
		$.ajax({
	    	url: gDataUrl + 'readClassjxtList.php',
			data: obj,
			dataType: "json",
			success: function(result){
				//hidePrompt()
				console.log(result.data)
				populateData(result.data)
			},
		});
	}	
	
	function populateData(items){
		if($list.children().length != 0){
			$list.empty(); //清除旧的列表项 if any
		}
		var grp = ''; //按日期 ？？＋班级
		items.forEach(function (item) {
			
			if(item.created.substr(2,8) != grp){
				grp = item.created.substr(2,8);
				$list.append('<label style="padding:0 10px;">'+ grp + '</label>')
			} 
			var $node = $listItem.clone(true);
			$node.find('.classes').text(item.title);
			$node.find('.name').text(item.name);
			//$node.find('.time').text(item.created.substr(2,8));
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
					
			$list.append($node);
		});
		
		$list.find('.listItem').find('img').bind({
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



