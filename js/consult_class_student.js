// 班级学生
App.controller('home', function (page) {
	var $list = $(page).find('.app-list'),
		$listItem = $(page).find('.app-list li').remove()	
	
	var records = [] // all for search
	
	var params = { 
		"consultID": gUserID 
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
		showPrompt('读取学生...'); console.log(obj)		
		$.ajax({
	    	url: gDataUrl + 'readStudentListByConsultClass.php',
			data: obj,
			dataType: "json",
			success: function(result){
				hidePrompt()
				console.log(result)
			    //populateData(result.data)
				callback(result.data)
			},
			error: function(xhr, type){
				showPrompt('读取学生出错');	
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
			$node.find('.gender').text('［'+item.gender+'•');
			$node.find('.grade').text(item.grade+'］');
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
				App.load('classes', item);
			},	
		})
	}
	
	// search
    // Get HTML elements
    var form = page.querySelector('form');
    var input = page.querySelector('form .app-input');
    // Updates the search parameter in web storage when a new character is added
    // to the search input
    input.addEventListener('keyup', function () {
		console.log(input.value)
		//localStorage[INPUT_KEY] = input.value;
    });
    // Updates the search parameter in web storage when the value of the search
    // input is changed
    input.addEventListener('change', function () {
		console.log(input.value)
		//localStorage[INPUT_KEY] = input.value;
    });
    // Performs search when the search input is submitted
    form.addEventListener('submit', function (e) {
		e.preventDefault();
		doSearch(input.value);
    });

    function doSearch (query) {
        // Clean up spaces from the search query
        query = query.trim();
  	    // Unfocus search input
  	    input.blur();
  	    form.blur();

		var filter = records.filter(function(ele,pos){
		    return (ele.studentName+ele.phone).indexOf(query) >= 0  ;
		});
		console.log(filter)
		populateData(filter)
		handleData( $list )
	} 

}); // ends controller


// 大小班学生报读的班级
App.controller('classes', function (page,request) {
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
			handleData( $list )
			//records = data;
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
			//display:none
			$node.find('.id').text(item.classID);			
			$list.append($node);
		});
	}
	
	function handleData(list){
		
	}
}); // 	


