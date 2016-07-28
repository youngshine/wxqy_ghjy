<?php
// 教育企业号
	require_once "jssdk-token.php";

	//$fileName = '../../assets/img/baoxiao/' . $fileName;
	$fileName = '../../' . $fileName; // 相对路径，公用

	$corpid = "wx09e87ee7559bb52f";
	$corpsecret = "t08leZ8Ry2Yu3s5t0hU6G5npkxrkXypUCN7ew8y7h0vieePm7xbEyjGK37J1c5g6";

	$jssdk = new JSSDK($corpid, $corpsecret); 
	$access_token = $jssdk->getAccessToken();

	$agentId = 1; // 贴图区：上传永久图片mediaId
	$type = "image";
	$url = "https://qyapi.weixin.qq.com/cgi-bin/material/add_material?agentid=$agentId&type=$type&access_token=$access_token";

	$filepath = dirname(__FILE__) . "/test.jpg";
	$filedata = array("media" => "@" . $filepath);

	$result = https_request($url, $filedata);
	var_dump($result);

	// 通用函数，读取数据 和 保存数据 $data
	function https_request($url,$data){
	    $curl = curl_init();
	    curl_setopt($curl, CURLOPT_URL, $url);
	    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, FALSE);
	    curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, FALSE);
	    if (!empty($data)){
	        curl_setopt($curl, CURLOPT_POST, 1);
	        curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
	    }
	    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
	    $output = curl_exec($curl);
	    curl_close($curl);
	    return $output;
	}

?>