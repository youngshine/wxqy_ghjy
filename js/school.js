// 管理联盟学校
App.controller('home', function (page) {
	var $list = $(page).find('.list'),
		$listItem = $(page).find('.listItem').remove()	

	var btnAddnew = $(page).find('.addnew')
	btnAddnew.on('click',function(){
		App.pick('addnew', {'userId':gUserID}, function (data) {
			if(data){ 
				console.log(data)
				$.ajax({
					url: gDataUrl + 'createSchool.php',
					data: data,
					dataType: 'json',
					success: function(result){
						console.log(result)
						// 前端添加显示记录，不刷新服务器数据库
						var $node = $listItem.clone(true);
						// 返回新插入记录id，删除用
						$node.find('.id').text(result.data.schoolID);
						$node.find('.title').text(data.schoolName); 
						$node.find('.addr').text(data.addr);
						$node.find('.phone').text(data.phone);
						//display:none			
						$list.prepend($node);
						toast('添加联盟学校成功')
					},
				});
			}
		});
	})
	
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
				showPrompt('读取联盟学校出错');	
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
		App.load('schoolsub',item) 
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
		handleData( $list )
	} 
}); // ends controller

App.controller('schoolsub', function (page,request) {
	var me = this;
	var $list = $(page).find('.list'),
		$listItem = $(page).find('.listItem').remove()	

	btnAddnew = $(page).find('.addnew')
	
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
			//$node.find('.schoolID').text(request.schoolID); //主校
			$list.append($node);
		});	
	}
	
	btnAddnew.on('click',function(){
		App.pick('addnew-schoolsub', {'schoolID':request.schoolID}, function (data) {
			if(data){ 
				console.log(data)
				// 保存新增,ajax
				$.ajax({
					url: gDataUrl + 'createSchoolsub.php',
					data: data,
					dataType: 'json',
					success: function(result){
						console.log(result)
						// 前端添加显示记录，不刷新服务器数据库
						var $node = $listItem.clone(true);
						// 返回新插入记录id，删除用
						$node.find('.id').text(result.data.schoolsubID);
						$node.find('.fullname').text(data.fullname); 
						$node.find('.addr').text(data.addr);
						$node.find('.phone').text(data.phone);
						//display:none
						//$node.find('.schoolID').text(data.schoolID);			
						$list.prepend($node);
						toast('添加分校区成功')
					},
				});
			}
		});
	})
}); 	

// 添加分校区
App.controller('addnew-schoolsub', function (page,request) {
	var me = this;

	var btnSubmit = $(page).find('.submit')
	
	// 提交保存按钮
	btnSubmit.on('click',function(e){		
	    var fullname = $(page).find('input[name=fullname]').val(),
			addr = $(page).find('input[name=addr]').val(),
			phone = $(page).find('input[name=phone]').val()
		if(fullname == ''){
			toast('请填写分校区名称');return;		
		}
		if(addr == ''){
			toast('请填写分校区地址');return;		
		}
		
		App.dialog({
			title	     : '保存？', //'删除当前公告？',
			okButton     : '确定',
			cancelButton : '取消'
		}, function (choice) {
			if(choice){		
				var obj = {
					fullname: fullname,
					addr    : addr,
					phone   : phone,
					schoolID: request.schoolID //所属的主校
				}
				me.reply(obj)
			}
		});
    });	
	
}); // addnew-schoolsub分校区

// 添加脸萌学校
App.controller('addnew', function (page,request) {
	var me = this;

	var btnSubmit = $(page).find('.submit')
	
	// 提交保存按钮
	btnSubmit.on('click',function(e){		
	    var schoolName = $(page).find('input[name=schoolName]').val(),
			addr = $(page).find('input[name=addr]').val(),
			phone = $(page).find('input[name=phone]').val()
		if(schoolName == ''){
			toast('请填写学校名称');return;		
		}
		if(addr == ''){
			toast('请填写学校地址');return;		
		}
		
		App.dialog({
			title	     : '保存？', //'删除当前公告？',
			okButton     : '确定',
			cancelButton : '取消'
		}, function (choice) {
			if(choice){		
				var obj = {
					schoolName: schoolName,
					addr    : addr,
					phone   : phone,
				}
				me.reply(obj)
			}
		});
    });	
	
}); // addnew
