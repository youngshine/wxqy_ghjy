// 教师课程表：大小班、一对一合并，结束不包括在内
// 参照app教师课程表
App.controller('home', function (page) {
	var $list = $(page).find('.list'),
		$listItem = $(page).find('.listItem').remove()	

	var params = { 
		"teacher": gUserID // userId，不是数字primary ID
	}
	
	readData(function(data){
		populateData(data)	
		//handleData( $list )
		//records = data;
	}, params );

	function readData(callback, obj){
		showPrompt('加载中...');		
		$.ajax({
	    	url: gDataUrl + 'readKcbByTeacher.php',
			data: obj,
			dataType: "json",
			success: function(result){
				hidePrompt()
				console.log(result)
				callback(result.data)
			},
		});
	}

	function populateData(items){
		if($list.children().length != 0){
			$list.empty(); //清除旧的列表项 if any
		}
		
		var weekdays = ['周一','周二','周三','周四','周五','周六','周日']
		var arr = []
		items.forEach(function (item) {
			var timely_list = item.timely_list.split(',')
			$.each(timely_list, function(i, timely){     
				arr.push(timely + '【'+item.kcType + '】' )     
			});
			//time = timely_list.concat(item.timely_list)
		});
		console.log(arr)
		//console.log(timely_list.split(','))
		$.each(weekdays, function(i, weekday){     
			console.log(weekday)
			var grp = ''
			$.each(arr, function(i, time){     
				if(time.indexOf(weekday)>=0){
					if(time.substr(0,2) != grp){
						grp = time.substr(0,2)
						$list.append('<label style="padding:10px;color:#888;">' + grp + '</label>')
					}
					
					var $node = $listItem.clone(true);
					var time = time.substr(2)
					$node.find('.timely').text(time); 		
					$list.append($node); 
				}
				   
			}); 
		});
		/*
		items.forEach(function (item) {
			var $node = $listItem.clone(true);
			$node.find('.kcType').text(item.kcType); 
			$node.find('.timely').text(item.timely_list); 		
			$list.append($node);
		}); */
	}	
}); // ends controller


