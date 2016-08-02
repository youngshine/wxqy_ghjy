// 管理联盟学校
App.controller('home', function (page) {
	var $list = $(page).find('.list'),
		$listItem = $(page).find('.listItem').remove()	
	
	var params = { 
		"hq": 1
	}
	//loadData(params); 
	//function loadData(obj){		
		readData(function(data){
			populateData(data)	
			handleData( $list )
			records = data; // all for search
		}, params );
	//}

	function readData(callback, obj){
		showPrompt('加载学校...');		
		$.ajax({
	    	url: gDataUrl + 'readSchoolList.php',
			//data: obj,
			dataType: "json",
			success: function(result){
				hidePrompt()
				console.log(result)
			    //populateData(result.data)
				callback(result.data)
			},
			error: function(xhr, type){
				showPrompt('读取学校出错');	
			}
		});
	}

	function populateData(items){
		if($list.children().length != 0){
			$list.empty(); //清除旧的列表项 if any
		}
		items.forEach(function (item) {
			var $node = $listItem.clone(true);
			$node.find('.title').text(item.schoolName); 
			$node.find('.addr').text(item.addr);
			//display:none
			$node.find('.id').text(item.schoolID);			
			$list.append($node);
		});
	}	

	function handleData(list){	
		list.find('.listItem').on({
			click: function (e) {
				doShow( $(this) )
			},	
		})
	}

	function doShow(selectedLi){
		var item = {	
			"schoolID": selectedLi.find('.id').text(),
		}
		console.log(item)
		// 如果下面存在删除记录，用pick，否则用load
		App.load('subschool',item) 
	}
	
	// search
	//console.log($(page).find('.app-input').text)
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
		    return ele.schoolName.indexOf(query) >= 0  ;
		});
		console.log(filter)
		populateData(filter)
	} 
}); // ends controller

App.controller('subschool', function (page,request) {
	var me = this;
	var $list = $(page).find('.list'),
		$listItem = $(page).find('.listItem').remove()	

	var params = {
		"schoolID": request.schoolID
	}	
	readData(function(data){
		populateData(data)	
		//handleData( $list )
	}, params );
	
	function readData(callback, obj){
		showPrompt('加载分校区...');		
		$.ajax({
	    	url: gDataUrl + 'readSchoolsubList.php',
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
		items.forEach(function (item) {
			var $node = $listItem.clone(true);
			$node.find('.fullname').text(item.fullname);
			$node.find('.addr').text(item.addr);
			$node.find('.phone').text(item.phone);
			$node.find('.id').text(item.schoolsubID);
			$list.append($node);
		});	
	}
}); 	


