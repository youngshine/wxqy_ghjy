// 教师布置的作业（班级＋一对多），按日期分组
App.controller('home', function (page,request) {
	var $list = $(page).find('.list'),
		$listItem = $(page).find('.listItem').remove()	

	var records = []; // 全局

	var params = {
		"schoolID": gSchoolID			
	}
	readData(params)
	
	function readData(obj){
		//showPrompt('加载一对一...');		
		$.ajax({
	    	url: gDataUrl + 'readHomeworkList.php',
			data: obj,
			dataType: "json",
			success: function(result){
				//hidePrompt()
				console.log(result.data)
				populateData(result.data)
				records = result.data;
			},
		});
	}	
	
	function populateData(items){
		if($list.children().length != 0){
			$list.empty(); //清除旧的列表项 if any
		}
		
		//var grp = ''; //按日期 ？？＋班级
		items.forEach(function (item) {			
			var $node = $listItem.clone(true);
			$node.find('.type').text(item.hwType); //大小班，一对多
			$node.find('.name').text(item.teacherName);
			$node.find('.time').text(item.created.substr(2,8));
			//display:none
			$node.find('.id').text(item.classjxtID);	
			
			var $photos = $node.find('.photos')
			// 图片列表：尚未下载到自己服务器的 mediaIds
			var photos = item.photos.split(',');
			/*
			if(photos==''){
				photos = item.mediaIds.split(','); 
			} */
			$.each(photos, function(i,photo){      
				console.log(photo)
				var $img = '<img src='+photo+' style="width:100px;height:100px;padding:2px;" />'
				$photos.append($img)
			});	
					
			$list.append($node);
		});
		
		$list.find('.listItem').find('img').bind({
			click: function(e){
				//console.log(e.target)
				var imgs = $(this).parent().children();
				var urls = [];
				imgs.forEach(function (img) {
					urls.push(img.src)
				})
				console.log(urls);
				WeixinJSBridge.invoke('imagePreview', {  
					'current' : e.target.src,  
					'urls' : urls  
				});
			}
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
		    return (ele.teacherName).indexOf(query) >= 0  ;
		});
		console.log(filter)
		populateData(filter)
		//handleData( $list )
	} 
}); // ends controller



