// 咨询师创建的班级
App.controller('home', function (page) {
	var $search = $(page).find('input[type=search]'),
		$list = $(page).find('.list'),
		$listItem = $(page).find('.listItem').remove()	

	var records = []; // all for search

	var params = { 
		"consultID": gUserID,
	}
	//loadData(params); 
	
	//function loadData(obj){		
		readData(function(data){
			populateData(data)	
			//handleData( $list )
			records = data;
		}, params );
	//}

	function readData(callback, obj){
		showPrompt('读取班级...'); console.log(obj)		
		$.ajax({
	    	url: gDataUrl + 'readClassesListByConsult.php',
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
			$node.find('.title').text(item.title); 
			$node.find('.weekday').text(item.weekday);
			$node.find('.timespan').text(item.timespan);
			//display:none
			$node.find('.id').text(item.classID);			
			$list.append($node);
		});
	}

	$search.on('click', function () {
		App.dialog({
			数学Button     : '数学',
			物理Button     : '物理',
			化学Button     : '化学',
			语文Button     : '语文',
			英语Button     : '英语',
			艺术Button     : '艺术',
			cancelButton : '取消'
		}, function (choice) {
		  if (choice) {
		    console.log(choice)
			var filter = records.filter(function(ele,pos){
			    return ele.classType == choice ;
			});
			console.log(filter)
			populateData(filter)
		  }
		});
	});	

	$(page).find('.app-title').swipeDown(function(){
		search.val('');				
		readData(function(data){
			populateData(data)	
			//handleData( $list )
		}, params );
	});
}); // ends controller

	


