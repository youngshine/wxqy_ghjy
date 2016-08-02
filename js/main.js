(function (App) { 
	//全局变量：当前人员，来自微信网页oAuth验证
	//myUserId = location.search.substr(1); 
	//dataUrl = 'http://younglin.sinaapp.com/script/';
	gDataUrl = 'http://www.xzpt.org/wxqy/ghjy/script/';
	
	var div = '<div class="prompt-wrapper" style="display:none;">';
		div += '<div id="m"></div>';
		div += '<div id="lo"><div id="lo-msg">wait...</div></div>';
		div += '</div>';
	$('body').prepend(div)
		
	// msg box ，长宽无法在css设置
	$("#lo")
		.css("top",($(document).height()-50)/2)
		.css("left",($(document).width()-150)/2);
	$("#m")
		.width($(document).width())
		.height($(document).height())
			
	// 全局变量及函数：提示窗口	prompt box
	showPrompt = function(msg){
		$('.prompt-wrapper').find('#lo-msg').text(msg)
		$('.prompt-wrapper').show()
	}	
	hidePrompt = function(){
		$('.prompt-wrapper').hide()
	} // prompt box -- ends
	toast = function(msg){
		$('.prompt-wrapper').find('#lo-msg').text(msg)
		$('.prompt-wrapper').show()
		setTimeout(function() { 
			$('.prompt-wrapper').hide() 
		}, 3000);
	}
	
	// 微信图文news通知人员
	wxMsgNews = function(userId,type,msg,link,agentid){
		$.ajax({
			url: 'script/weixinJS/wx_msgByNews.php',
			data: {userId:userId, type:type, msg:msg, link:link,agentid:agentid},
			//dataType: "jsonp",
			success: function(result){},
		});
	} 
	// 发送企业号文字消息 ajax
	wxMsgText = function(obj){
		$.ajax({
			url: 'script/weixinJS/wx_msg_text.php',
			data: obj,
			dataType: "json",
			success: function(result){},
		});
	}
	// js-sdk签名
	wxSig = function(){
		$.ajax({
            //url: 'script/weixinJS/wx_sig.php?url=' + location.href.split('#')[0] ,
            url: 'script/weixinJS/wx_sig.php',
            data: "url=" + encodeURIComponent(location.href.split('#')[0]), 
			dataType: "json",
			success: function(result){
				var signPackage = result
				wx.config({
					debug: false,
                    appId: signPackage.appId,
                    timestamp: signPackage.timestamp,
                    nonceStr: signPackage.nonceStr,
                    signature: signPackage.signature,
					jsApiList: [
					  'getLocation','openLocation',
                      'chooseImage','previewImage','uploadImage','downloadImage',
					  'hideOptionMenu','openEnterpriseChat','openEnterpriseContact'
					]
				});
				console.log(signPackage)
			    wx.ready(function () {
					// 在这里调用 API，默认的
					wx.hideOptionMenu()
					//wx.getLocation()
			    });
			}
		});
	}
})(App);
