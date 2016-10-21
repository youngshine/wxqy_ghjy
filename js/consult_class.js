// 咨询师的班级，无权创建
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
			handleData( $list )
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
				showPrompt('读取班级出错');	
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
			$node.find('.timely_list').text(item.timely_list);
			$node.find('.teacher').text(item.teacherName);
			//display:none
			$node.find('.id').text(item.classID);			
			$list.append($node);
		});
	}
	function handleData(list){
		list.find('.listItem').on({
			click: function () {
				var selected = $(this)
				var item = {	
					"classID": $(this).find('.id').text()
				}
				console.log(item); 
				App.load('attendee', item);
			},	
		})
	}

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
			    return ele.kmType == choice ;
			});
			console.log(filter)
			populateData(filter)
			handleData( $list )
		  }
		});
	});	

	$(page).find('.app-title').swipeDown(function(){
		search.val('');				
		readData(function(data){
			populateData(data)	
			handleData( $list )
		}, params );
	});
}); // ends controller

// 班级的学生，不一定都是归属自己的
App.controller('attendee', function (page,request) {
	var $list = $(page).find('.list'),
		$listItem = $(page).find('.listItem').remove()	
	
	var params = { 
		"classID": request.classID
	}
	console.log(params)
	//loadData(params); 
	//function loadData(obj){		
		readData(function(data){
			populateData(data)	
			handleData( $list )
			//records = data;
		}, params );
	//}

	function readData(callback, obj){
		showPrompt('加载班级学生...');		
		$.ajax({
	    	url: gDataUrl + 'readStudentListByClass.php',
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
			$node.find('.title').text(item.studentName); 
			$node.find('.gender').text(item.gender);
			$node.find('.grade').text(item.grade);
			//display:none
			$node.find('.id').text(item.studentID);			
			$list.append($node);
		});
	}
	
	function handleData(list){
		
	}
}); // 

	


