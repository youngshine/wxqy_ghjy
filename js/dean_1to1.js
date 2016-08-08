// 管理一对一课程（套餐课时） by 执行校长
App.controller('home', function (page) {
	// 离开页面、隐藏删除按钮if any
	$(page).on('appForward', function () {
		$('.btnRemove').hide();
	}); 
	
	var $list = $(page).find('.list'),
		$listItem = $(page).find('.listItem').remove()	

	var btnAddnew = $(page).find('.addnew')
	
	btnAddnew.on('click',function(){
		//App.load('addnew',{schoolID: gSchoolID})
		App.pick('addnew', {'schoolID':gSchoolID}, function (data) {
			if(data){ 
				console.log(data)
				// 保存新增,ajax
				$.ajax({
					url: gDataUrl + 'createPricelist.php',
					data: data,
					dataType: 'json',
					success: function(result){
						console.log(result)
						// 前端添加显示记录，不刷新服务器数据库
						var $node = $listItem.clone(true);
						// 返回新插入记录id，删除用
						$node.find('.id').text(result.data.pricelistID);
						$node.find('.title').text(data.title); 
						$node.find('.unitprice').text(data.unitprice);
						//$node.find('.hour').text(data.hour+'小时');
						//display:none
						//$node.find('.userId').text(data.userId);
						$node.find('.schoolID').text(data.schoolID);			
						$list.prepend($node);
						
						handleData($list); //新插入的才能操作
						toast('创建班级成功')
					},
				});
			}
		});
	})

	var records = []; // all for search
	var params = { 
		"schoolID": gSchoolID 
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
		showPrompt('加载中...');		
		$.ajax({
	    	url: gDataUrl + 'readPricelistList.php',
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
			var $node = $listItem.clone(true);
			$node.find('.title').text(item.title); 
			//$node.find('.hour').text(item.hour);
			$node.find('.unitprice').text(item.unitprice);
			//display:none
			$node.find('.schoolID').text(item.schoolID);
			//$node.find('.created').text(item.created.substr(0,10));
			//$node.find('.userId').text(item.userId);
			$node.find('.id').text(item.pricelistID);			
			$list.append($node);
		});
	}	

	function handleData(list){	
		list.find('.listItem').on({
			// for android
			longTap: function (e) {
				$('.btnRemove').hide()
				$('.btnRemove', this).show()
			},
			swipeLeft: function (e) {
				$('.btnRemove').hide()
				$('.btnRemove', this).show()
			},
			click: function (e) {
				console.log(e.target.className)
				if(e.target.className == 'btnRemove'){
					//doRemove($(this))
				}else{	
					var hasBtn = false 
					var btns = $('.btnRemove');
					btns.forEach(function(btn){
						console.log($(btn).css('display'))
						if( $(btn).css('display')=='inline' ){
							$(btn).hide()
							hasBtn = true;
							return false //exit循环
						}
					})
					if(!hasBtn){
						doShow( $(this) )
						console.log('show')
					}
				}
			},	
		})
	}

	function doRemove(listItem){
		//listItem.remove()		
		App.dialog({
		  title	       : '删除当前记录？', //'删除当前公告？',
		  okButton     : '确定',
		  cancelButton : '取消'
		}, function (choice) {
			if(choice){
				var id = listItem.find('.id').text();
				console.log(id)
				deleteData(id,listItem);
			}
		});
		
		function deleteData(ID,selected){
			showPrompt('正在删除...');
			$.ajax({
				url: gDataUrl + 'deletePricelist.php',
				data: {teacherID:ID},
				dataType: "json", // 返回的也是 json
				success: function(result){
					if(result.success){
						hidePrompt();
						//显示服务端出错信息,有跟贴子表记录，不能删除
						selected.remove()
					}else{
						toast(result.message)
					}						
				},
			});
		}	
	}	

	function doShow(selectedLi){
		var item = {	
			"pricelistID": selectedLi.find('.id').text(),
		}
		console.log(item)
		//App.load('student',item)
	}
}); // ends controller


// 选择分配归属咨询师
App.controller('addnew', function (page,request) {
	var me = this; console.log(request)

	var btnSubmit = $(page).find('.submit')
	
	// 提交保存按钮
	btnSubmit.on('click',function(e){		
	    var title = $(page).find('input[name=title]').val()			
		if(title == ''){
			toast('请输入名称');return;		
		}
		var unitprice = $(page).find("input[name=unitprice]").val(); //text()
		if(isNaN(unitprice) || unitprice == 0){
			toast('请输入课时单价');return;		
		}

		App.dialog({
			title	     : '保存？', //'删除当前公告？',
			okButton     : '确定',
			cancelButton : '取消'
		}, function (choice) {
			if(choice){		
				var obj = {
					title: title,
					unitprice: unitprice,
					schoolID: request.schoolID
				}
				me.reply(obj)
			}
		});
    });	
	
}); // addnew	

