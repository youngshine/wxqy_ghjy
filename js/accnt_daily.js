// 缴费流水，每日汇总
App.controller('home', function (page) {
	var $list = $(page).find('.list'),
		$listItem = $(page).find('.listItem').remove()	

	var params = { 
		"schoolID": gSchoolID 
	}
	
	readData(function(data){
		populateData(data)	
		//handleData( $list )
		//records = data;
	}, params );

	function readData(callback, obj){
		showPrompt('加载中...');		
		$.ajax({
	    	url: gDataUrl + 'readAccntListByDaily.php',
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

		items.forEach(function (item) {
			console.log(item)
			var $node = $listItem.clone(true);
			$node.find('.accntDate').text(item.accntDate); 
			$node.find('.accntType').text(item.accntType); 
			$node.find('.amount').text(item.total_amount); 
			$node.find('.amount_done').text(item.total_done);		
			$list.append($node);
		});
	}	
}); // ends controller


