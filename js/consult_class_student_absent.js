// 一对一学生
App.controller('home', function (page) {
	var $list = $(page).find('.list'),
		$listItem = $(page).find('.listItem').remove()	

	var params = { 
		"consultID": gUserID,
		"flag"     : 0 //未上课
	}
	//loadData(params); 
	
	//function loadData(obj){		
		readData(function(data){
			populateData(data)	
			//handleData( $list )
			//records = data;
		}, params );
	//}

	function readData(callback, obj){
		showPrompt('读取缺课学生...'); console.log(obj)		
		$.ajax({
	    	url: gDataUrl + 'readStudentListByConsultClassAbsent.php',
			data: obj,
			dataType: "json",
			success: function(result){
				hidePrompt()
				console.log(result)
			    //populateData(result.data)
				callback(result.data)
			},
			error: function(xhr, type){
				showPrompt('读取缺课学生出错');	
			}
		});
	}

	function populateData(items){
		if($list.children().length != 0){
			$list.empty(); //清除旧的列表项 if any
		}
		items.forEach(function (item) {
			var $node = $listItem.clone(true);
			$node.find('.name').text(item.studentName); 
			$node.find('.phone').text(item.phone);
			$node.find('.gender').text(item.gender+'•'+item.grade);
			$node.find('.class_title').text(item.title);
			//display:none
			//$node.find('.created').text(item.created.substr(0,10));
			$node.find('.id').text(item.studentID);			
			$list.append($node);
		});
	}

	$(page).find('.app-title').swipeDown(function(){
		//search.val('');	
		//$list.empty();			
		readData(function(data){
			populateData(data)	
			//handleData( $list )
			//records = data;
		}, params );
	});
}); // ends controller

	


