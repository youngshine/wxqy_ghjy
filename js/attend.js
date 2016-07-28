// 签到
App.controller('home', function (page) {
	// 离开页面、隐藏删除按钮if any
	$(page).on('appForward', function () {
		$('.removeItem').hide();
	});
	$(page).on('appReady', function () {
		map = new qq.maps.Map(document.getElementById("mymap"), {
	        // 地图的中心地理坐标。
	        center: new qq.maps.LatLng(34.12344,114.1234),
			disableDefaultUI: true,    //禁止所有控件
			zoom: 2
	    });
	});

	var map,marker=null,
		btnCheckIn = $(page).find('.checkIn'),
        btnCheckOut = $(page).find('.checkOut'),
		btnShowCheck = $(page).find('.showCheck'),	
        btnPoi = $(page).find('.poi'),
		btnPosition = $(page).find('.currentPosition')
	
	btnShowCheck.on('click',function(){
		App.load('detail')
	})
	
    btnPosition.on('singleTap',function(){
		showPrompt('获取当前位置...');
		wx.getLocation({
 		    // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
 			type: 'gcj02', //'wgs84', 
 		    success: function (res) {
				//var latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
 				//var longitude = res.longitude ; // 经度，浮点数，范围为180 ~ -180。
 				//var speed = res.speed; // 速度，以米/每秒计
 				//var accuracy = res.accuracy; // 位置精度
				hidePrompt();
				if(marker) marker.setMap(null);
			    var point = new qq.maps.LatLng(res.latitude,res.longitude)
				map.panTo(point);
				map.zoomTo(16);
				marker = new qq.maps.Marker({
				    position: point,
				    map: map
				});
                
 		    },
 	        cancel: function (res) {
 				alert('拒绝授权地理位置');
 	        },
 	        fail: function (res) {
				showPrompt('微信版本太低');
				setTimeout(function () { hidePrompt() }, 3000);
 	        }
 		});
 	})
	
    btnPoi.on('click',function(){
 		showPrompt('打开地图...');
		wx.getLocation({
 		    // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
 			type: 'gcj02', //'wgs84', 
 		    success: function (res) {
 				hidePrompt()
				
				var latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
 				var longitude = res.longitude ; // 经度，浮点数，范围为180 ~ -180。
 				var speed = res.speed; // 速度，以米/每秒计
 				var accuracy = res.accuracy; // 位置精度

                 // 显示地图位置
                 wx.openLocation({
                     latitude: res.latitude, // 纬度，浮点数，范围为90 ~ -90
                     longitude: res.longitude, // 经度，浮点数，范围为180 ~ -180。
                     name: '', // 位置名
                     address: '', // 地址详情说明
                     scale: 15, // 地图缩放级别,整形值,范围从1~28。默认为最大
                     infoUrl: '' // 在查看位置界面底部显示的超链接,可点击跳转
                 });
                
 		    },
 	        cancel: function (res) {
 				alert('拒绝授权地理位置');
 	        },
 	        fail: function (res) {
				showPrompt('稍候再试');
				setTimeout(function () { hidePrompt() }, 3000);
 	        }
 		});
 	})
	
	btnCheckIn.on('click',function(){
		if($(this).text() != '签到')
			return false
		var d = new Date();
		var now = '当前时间：'+ 
			d.getDate()+'日'+ d.getHours()+'点'+d.getMinutes()+'分';
		
		App.dialog({
			title	     : '上班签到？', //'删除当前公告？',
			text		 : now, //(new Date()).toLocaleString(),
			okButton     : '确定',
			cancelButton : '取消'
		}, function (choice) {
			if(choice){
				var flag = 1; // 1-上班签到
				checkInOut(flag); 
			}
		});	
	})	
	btnCheckOut.on('click',function(){
		if($(this).text() != '签退')
			return false
		var d = new Date();
		var now = '当前时间：'+ 
			d.getDate()+'日'+ d.getHours()+'点'+d.getMinutes()+'分';
		
		App.dialog({
			title	     : '下班签退？', //'删除当前公告？',
			text		 : now, //(new Date()).toLocaleString(),
			okButton     : '确定',
			cancelButton : '取消'
		}, function (choice) {
			if(choice){
				var flag = 0; // 0-下班签退
				checkInOut(flag); 
			}
		});	
	})	
	// 上下班 打卡
	function checkInOut(flag){
		wx.getLocation({
		    // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
			type: 'gcj02', //'wgs84', 
		    success: function (res) {
				var latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
				var longitude = res.longitude ; // 经度，浮点数，范围为180 ~ -180。
				var speed = res.speed; // 速度，以米/每秒计
				var accuracy = res.accuracy; // 位置精度

				var obj = {
					"userId": myUserId,
					"userName": myName,
					"lat": res.latitude,
					"lng": res.longitude,
					"flag": flag // 签到 1，签退 0
				}
                //createData(obj);
			 	createData(function(retVal){
			 		if(retVal.success){
			 			flag == 1 ? btnCheckIn.text('签到成功') : btnCheckOut.text('签退成功')
						App.load('detail'); // 打开记录
			 		}
			 	}, obj );
		    },
	        cancel: function (res) {
				showPrompt('拒绝授权地理位置');
				setTimeout(function () { hidePrompt() }, 3000);
	        },
 	        fail: function (res) {
				showPrompt('微信版本太低');
				setTimeout(function () { hidePrompt() }, 3000);
 	        }
		});
	}
	// 插入数据库
    function createData(callback,obj){	
 		showPrompt('正在签到...')
		$.ajax({
 			url: dataUrl + 'createAttend.php',
 			dataType: "json",
 			data: obj,
 			success: function(result){
 				hidePrompt();
				callback({success:true})
 			},
 		});
    }
	

	$(page).find('.openEnterpriseChat').on('click',function(){
		wx.openEnterpriseChat({
		    userIds: 'wangzhiyang;wangweiyun;zhenglinqiang',    // 必填，参与会话的成员列表。格式为userid1;userid2;...，用分号隔开，最大限制为1000个。userid单个时为单聊，多个时为群聊。
		    groupName: 'openEnterpriseChat讨论组',  // 必填，会话名称。单聊时该参数传入空字符串""即可。
		    success: function(res) {
		        // 回调
				alert('enterprise')
		    },
		    fail: function(res) {
		        if(res.errMsg.indexOf('function not exist') > 0){
		            alert('版本过低请升级')
		        }
		    }
		});
	})
 }); // home ends
 
 
 App.controller('detail', function (page) {
 	$(page).swipeRight(function(){
 		App.back()
 	})
	
 	var $loading  = $(page).find('.loading'),
 		$list     = $(page).find('.app-list'),
 		$listItem = $(page).find('.app-list li').remove(),
 		i = 1 // 用于scroll-list	
 	$loading.remove();
 	$listItem.remove();

 	var records = []; //模块全局变量：全部记录，过滤用
	
 	var params = { "userId": myUserId }
 	readData(function(data){
 		records = data;
 		populateData(data)	
 		handleData( $list, data )
 	}, params );
	
 	function readData(callback,obj){
 		showPrompt('读取考勤...');
 		$.ajax({
 		    url: dataUrl + 'readAttendList.php',
 			dataType: "json",
 			data: obj,
 			success: function(result){
 				hidePrompt()
 				callback(result)
 			},
			error: function(result){
				console.log(result)
				showPrompt('出错')
			}
 		});
 	}
 	function populateData(items){
 		var grp = ''; //年级分组
 		App.infiniteScroll($list, { loading: $loading }, function (callback) {			
 			if (i > items.length) {
 				return null;
 			}; 
 			setTimeout(function () {
 				var list = [];
 				for (var j=0; j<12; j++) {					
 					if(items.length < (i+j) ) {
 						break; // 到记录尾
 					}	
 					if(items[i+j-1].created.substr(0,10) != grp){
 						grp = items[i+j-1].created.substr(0,10)
 						var label = '<label>' + grp + '</label>'
 						list.push(label);
 					}	
					
 					var $node = $listItem.clone();						
 					$node.find('.created').text(items[i+j-1].created.substr(11,5));	
 					var flag = items[i+j-1].flag == 1 ? '上班签到' : '下班签退';
 					$node.find('.flag').text(flag);
 					//getAddress(latlng:LatLng)
 					var lat = items[i+j-1].lat,
 						lng = items[i+j-1].lng
 					$node.find('.lat').text(lat);
 					$node.find('.lng').text(lng);
					
 					$node.find('.id').text(items[i+j-1].attend_id);
 					list.push($node);
 				}
 				i += 12;
 				callback(list);
 			}, 1200);
 		});		
 	}
 	function handleData(list,items){
 		list.bind({
 			click: function(e){
 				var el = e.target;
 				if(el.nodeName != 'LI'){
 					el = el.parentNode
 				}
 				var listItem = $(el);
 				console.log(listItem)
 				openMap( listItem )
 			}
 		})		
 	}

 	function openMap(listItem){		
 		var lat = listItem.find('.lat').text(),
 			lng = listItem.find('.lng').text()

		geocoder = new qq.maps.Geocoder({
			complete : function(result){
				 //return result.detail.address
				//result.detail.location
				//var glAddr = result.detail.address
				//showPrompt(glAddr)
				//setTimeout(function () { hidePrompt() }, 1500);
			
		 		// 显示地图位置
		 		wx.openLocation({
		             latitude: parseFloat(lat), // 纬度，浮点数，范围为90 ~ -90
		             longitude: parseFloat(lng), // 经度，浮点数，范围为180 ~ -180。
		             name: result.detail.address, // 位置名
		             address: result.detail.address, // 地址详情说明
		             scale: 15, // 地图缩放级别,整形值,范围从1~28。默认为最大
		             infoUrl: '' // 在查看位置界面底部显示的超链接,可点击跳转
		         });
			}
		});
		geocoder.getAddress( new qq.maps.LatLng(lat, lng) );
 	}

	
 }); 


