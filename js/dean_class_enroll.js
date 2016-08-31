// 管理创建大小班级 by 执行校长 Xtc1234@
App.controller('home', function (page) {
	// 离开页面、隐藏删除按钮if any
	$(page).on('appForward', function () {
		$('.btnRemove').hide();
	}); 
	
	var $list = $(page).find('.list'),
		$listItem = $(page).find('.listItem').remove()	

	var records = []; // all for search
	
	var params = { 
		"schoolID": gSchoolID 
	}		
	readData(function(data){
		populateData(data)	
		handleData( $list )
		records = data;
	}, params );

	function readData(callback, obj){
		showPrompt('加载中...');		
		$.ajax({
	    	url: gDataUrl + 'readClassesListByEnroll.php',
			data: obj,
			dataType: "json",
			success: function(result){
				hidePrompt()
				console.log(result)
				callback(result.data)
			},
			error: function(xhr, type){
				showPrompt('读取班级出错');	
			}
		});
	}

	function populateData(items){
		if($list.children().length != 0){
			$list.empty(); //清除旧的列表项 if any
		}
		var grp = ''
		items.forEach(function (item) {
			if(item.fullname != grp){
				grp = item.fullname
				$list.append('<label style="padding:10px;color:#888;">' + grp + '</label>')
			}
			var $node = $listItem.clone(true);
			$node.find('.title').text(item.title); 
			$node.find('.persons').text(item.persons);
			$node.find('.enroll').text(item.enroll);
			var pct = parseInt(100*item.enroll/item.persons)+'%';
			$node.find('.pct').text(pct);
			//display:none
			//$node.find('.userId').text(item.userId);
			$node.find('.id').text(item.classID);			
			$list.append($node);
		});
	}	

	function handleData(list){	
		list.find('.listItem').on({
			// for android
			longTap: function (e) {
				$('.btnRemove').hide()
				$('.btnRemove', this).show()
			},
			swipeLeft: function (e) {
				$('.btnRemove').hide()
				$('.btnRemove', this).show()
			},
			click: function (e) {
				console.log(e.target.className)
				if(e.target.className == 'btnRemove'){
					//doRemove($(this))
				}else if(e.target.className == 'btnEdit'){
					doEdit( $(this) )	
				}else{	
					var hasBtn = false 
					var btns = $('.btnRemove');
					btns.forEach(function(btn){
						console.log($(btn).css('display'))
						if( $(btn).css('display')=='inline' ){
							$(btn).hide()
							hasBtn = true;
							return false //exit循环
						}
					})
					if(!hasBtn){
						doShow( $(this) )
						console.log('show')
					}
				}
			},	
		})
	}

}); // ends controller


