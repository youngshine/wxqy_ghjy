// 归属我咨询师的学生，不是我的班级学生
App.controller('home', function (page) {
	var $list = $(page).find('.app-list'),
		$listItem = $(page).find('.app-list li').remove()	
	
	var params = { 
		"consultID": gUserID 
	}	
	readData(function(data){
		populateData(data)	
		handleData( $list )
		records = data;
	}, params );

	function readData(callback, obj){
		showPrompt('读取学生...'); console.log(obj)		
		$.ajax({
	    	url: gDataUrl + 'readStudentListByConsultRegister.php',
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
			$node.find('.name').text(item.studentName); 
			$node.find('.gender').text('［'+item.created.substr(5,5)+'］');
			//$node.find('.grade').text(item.grade+'］');
			$node.find('.phone').text(item.phone);
			//display:none
			$node.find('.created').text(item.created.substr(0,10));
			$node.find('.id').text(item.studentID);			
			$list.append($node);
		});
	}	
	function handleData(list){
		list.find('li').on({
			click: function () {
				var selected = $(this)
				var item = {	
					"studentID": $(this).find('.id').text(),
					"studentName": $(this).find('.name').text(),
				}
				console.log(item); 
				App.load('orders', item);
			},	
		})
	}
}); // ends controller


// 大小班学生报读的班级
App.controller('orders', function (page,request) {
	var $list = $(page).find('.list'),
		$listItem = $(page).find('.listItem').remove()	
	
	var params = { 
		"studentID": request.studentID
	}
	console.log(params)
	//loadData(params); 
	//function loadData(obj){		
		readData(function(data){
			populateData(data)	
			//handleData( $list )
			records = data;
		}, params );
	//}

	function readData(callback, obj){
		showPrompt('加载班级...');		
		$.ajax({
	    	url: gDataUrl + 'readClassesListByStudent.php',
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
			$node.find('.title').text(item.title); 
			$node.find('.weekday').text(item.weekday);
			$node.find('.timespan').text(item.timespan);
			$node.find('.teacher').text(item.teacherName);
			//display:none
			$node.find('.id').text(item.classID);			
			$list.append($node);
		});
	}
	
	var tabClass = $(page).find('.class'),
		tabOne2one = $(page).find('.one2one')
	
	tabClass.on('click',function(e){
		$(this).css('background','#fff');
		tabOne2one.css('background','#eee')
		$list.empty()
		populateData(records)	
	})
	tabOne2one.on('click',function(e){
		$(this).css('background','#fff');
		tabClass.css('background','#eee')
		$list.empty()
		//populateData(records)	
		//handleData($list,records);
		doOne2one(params)
	})
	
	function doOne2one(obj){
		//showPrompt('加载一对一...');		
		$.ajax({
	    	url: gDataUrl + 'readOne2oneListByStudent.php',
			data: obj,
			dataType: "json",
			success: function(result){
				//hidePrompt()
				console.log(result.data)
				result.data.forEach(function (item) {
					var $node = $listItem.clone(true);
					$node.find('.title').text(item.zsdName); 
					$node.find('.weekday').text(item.teach_weekday);
					$node.find('.timespan').text(item.teach_timespan);
					$node.find('.teacher').text(item.teacherName);
					//display:none
					//$node.find('.id').text(item.classID);			
					$list.append($node);
				});
			},
		});
	}
}); // 	


