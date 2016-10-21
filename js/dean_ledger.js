// 日常收支记账
App.controller('home', function (page) {
	var $search = $(page).find('input[type=search]'),
		$list = $(page).find('.list'),
		$listItem = $(page).find('.listItem').remove()	

	var records = []; // all for search

	var params = { 
		"schoolID": gSchoolID,
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
		showPrompt('读取记账...'); console.log(obj)		
		$.ajax({
	    	url: gDataUrl + 'readLedgerByMonth.php',
			data: obj,
			dataType: "json",
			success: function(result){
				hidePrompt()
				console.log(result)
			    //populateData(result.data)
				callback(result.data)
			},
			error: function(xhr, type){
				showPrompt('读取出错');	
			}
		});
	}

	function populateData(items){
		if($list.children().length != 0){
			$list.empty(); //清除旧的列表项 if any
		}
		items.forEach(function (item) {
			var $node = $listItem.clone(true);
			$node.find('.month').text(item.ledgerDate.substr(0,7)); 
			$node.find('.amt_in').text('收入：'+item.amt_in);
			$node.find('.amt_out').text('支出：'+item.amt_out);
			$node.find('.balance').text(parseInt(item.amt_in)-parseInt(item.amt_out));
			//display:none
			//$node.find('.id').text(item.classID);			
			$list.append($node);
		});
	}
	function handleData(list){
		list.find('.listItem').on({
			click: function () {
				var selected = $(this)
				var item = {	
					"month": $(this).find('.month').text(),
					"schoolID": gSchoolID,
				}
				console.log(item); 
				App.load('byDate', item);
			},	
		})
	}


	$(page).find('.app-title').swipeDown(function(){
		search.val('');				
		readData(function(data){
			populateData(data)	
			handleData( $list )
		}, params );
	});
}); // ends controller

// 当月的日明细
App.controller('byDate', function (page,request) {
	var $list = $(page).find('.list'),
		$listItem = $(page).find('.listItem').remove()	
	
	var params = { 
		"month": request.month,
		"schoolID": request.schoolID
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
		showPrompt('读取明细账...');		
		$.ajax({
	    	url: gDataUrl + 'readLedgerByDate.php',
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
			$node.find('.date').text(item.ledgerDate); 
			$node.find('.amt_in').text('收入：'+item.amt_in);
			$node.find('.amt_out').text('支出：'+item.amt_out);
			$node.find('.balance').text(parseInt(item.amt_in)-parseInt(item.amt_out));
			//display:none
			//$node.find('.id').text(item.studentID);			
			$list.append($node);
		});
	}
	
	function handleData(list){
		list.find('.listItem').on({
			click: function () {
				var selected = $(this)
				var item = {	
					"date": $(this).find('.date').text(),
					"schoolID": gSchoolID,
				}
				console.log(item); 
				App.load('byItem', item);
			},	
		})
	}
}); // 

// 当天科目明细
App.controller('byItem', function (page,request) {
	var $list = $(page).find('.list'),
		$listItem = $(page).find('.listItem').remove()	
	
	var params = { 
		"date": request.date,
		"schoolID": request.schoolID
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
		showPrompt('读取科目明细...');		
		$.ajax({
	    	url: gDataUrl + 'readLedgerByItem.php',
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
			$node.find('.item').text(item.ledgerItem); 
			$node.find('.type').text(item.ledgerType);
			var amt = item.ledgerType=='收入' ? item.amt_in : item.amt_out
			$node.find('.amt').text(amt);
			//display:none
			//$node.find('.id').text(item.studentID);			
			$list.append($node);
		});
	}
	
	function handleData(list){

	}
}); // 

	


