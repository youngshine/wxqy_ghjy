<?php
	// 教育企业号通讯录成员设置标签：咨询2、教师3
	header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
	header('Access-Control-Allow-Origin: *'); // 跨域问题
	
	require_once "jssdk-token.php";
	$corpid = "wx09e87ee7559bb52f";
	$corpsecret = "t08leZ8Ry2Yu3s5t0hU6G5npkxrkXypUCN7ew8y7h0vieePm7xbEyjGK37J1c5g6";
	$jssdk = new JSSDK($corpid, $corpsecret); 
	$access_token = $jssdk->getAccessToken();
	
	// 从微信服务器下载多媒体文件到自己服务器，永久保存
	$url = "https://qyapi.weixin.qq.com/cgi-bin/tag/addtagusers?access_token=$access_token";
	$userId = addslashes($_REQUEST['userId']);
	$tagId = $_REQUEST['position']=='咨询' ? 2 : 3;
	
	$data = '{
	   "tagid": "'.$tagId.'",
	   "userlist": ["'.$userId.'"],
	}';
	
	echo httpPost($url, $data);

	//创建菜单,参数api url & menu data 方法post
	function httpPost($url,$data){
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
		curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (compatible; MSIE 5.01; Windows NT 5.0)');
		curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
		curl_setopt($ch, CURLOPT_AUTOREFERER, 1);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		$tmpInfo = curl_exec($ch);
		if (curl_errno($ch)) {
		  return curl_error($ch);
		}

		curl_close($ch);
		return $tmpInfo;
	}
?>

