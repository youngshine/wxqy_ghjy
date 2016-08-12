// 缴费流水
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
	    	url: gDataUrl + 'readAccntList.php',
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
		var grp = ''
		items.forEach(function (item) {
			if(item.accntDate != grp){
				grp = item.accntDate
				$list.append('<label style="padding:10px;color:#888;font-size:0.8em;">' + 
					grp + '</label>')
			}
			var $node = $listItem.clone(true);
			$node.find('.accntType').text(item.accntType); 
			$node.find('.amount').text(item.amount);
			$node.find('.student').text(item.studentName); 
			$node.find('.time').text(item.accntDate);
			$node.find('.id').text(item.accntID);			
			$list.append($node);
		});
	}	
}); // ends controller


