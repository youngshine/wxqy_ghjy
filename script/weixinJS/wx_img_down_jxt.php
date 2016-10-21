<?php
// 根号教育企业号，从微信服务器下载图片保存在本地或腾讯云存储cos
// 家校联络

$mediaId = $_REQUEST['mediaId'];
//$fileName = $_REQUEST['fileName'];
//$fileName = '../../assets/img/baoxiao/' . $fileName;
//$fileName = '../../' . $fileName; // 相对路径，公用

/*
require_once "jssdk-token.php";
$corpid = "wx09e87ee7559bb52f"; //企业号
$corpsecret = "t08leZ8Ry2Yu3s5t0hU6G5npkxrkXypUCN7ew8y7h0vieePm7xbEyjGK37J1c5g6";
$jssdk = new JSSDK($corpid, $corpsecret); 
$access_token = $jssdk->getAccessToken();
*/

// 新浪云kvdb高速缓存access_token
$ret = file_get_contents("http://xyzs.sinaapp.com/wx/kvdb_qy.php");
$ret = json_decode($ret); 
$access_token = $ret->access_token;

// 从微信服务器下载多媒体文件到自己服务器，永久保存
$url = "https://qyapi.weixin.qq.com/cgi-bin/media/get?access_token=$access_token&media_id=$mediaId";
$result = downImgFromWx($url);
$fileContent = $result['body'];


// 1）采用文件流保存到自己服务器
//file_put_contents( $fileName, $fileContent );
//echo $fileName; // 前段才能取得返回值json_decode

// 2）保存在腾讯云存储cos.php
echo put2storage($fileContent);


// 从微信服务器下载图片
function downImgFromWx($url)
{
	$ch = curl_init($url);
	curl_setopt($ch, CURLOPT_HEADER, 0);
	curl_setopt($ch, CURLOPT_NOBODY, 0);	//只取body头
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
	curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	$package = curl_exec($ch);
	$httpinfo = curl_getinfo($ch);
	curl_close($ch);
	$imageAll = array_merge(array('header'=>$httpinfo),array('body'=>$package));
	return $imageAll;
}

// 图片保存到云存储cos
function put2storage($fileContent){
	// 配置项 start
	$appid = '10060757'; //腾讯云存储，cos
	$bucket_name = 'wxqy4ghjy'; //教师pad上传学习笔记
	$dir_name = 'jxt';
	$secretID = 'AKIDFSOllkXzLQBQASDQU6h6w3ktA4Rxl99D';
	$secretKey = 'heUXG8vvkmpIr5vskbAYC6qp2fCBuOVW';
	// 配置项 end
	// 需要存储的资源url, 这里用百度logo来做演示
	//$pic_url = $fileName;
	//$pic_url = 'http://www.baidu.com/img/logo.gif';
	// 获取文件名
	//$filename = end(explode('/', $pic_url));
	$filename = date('ymdhis')."_".rand(100,999) . ".jpg";
	// 构造上传url
	$upload_url = "web.file.myqcloud.com/files/v1/$appid/$bucket_name/$dir_name/$filename";
	// 设置过期时间
	$exp = time() + 3600;
	// 构造鉴权key
	$sign = "a=$appid&b=$bucket_name&k=$secretID&e=$exp&t=" . time() . '&r=' . rand() . "&f=/$appid/$bucket_name/$dir_name/$filename";
	$sign = base64_encode(hash_hmac('SHA1', $sign, $secretKey, true) . $sign);
	// 构造post数据
	$post_data = array(
	    'op' => 'upload',
		'filecontent' => $fileContent // 微信服务器下载图片内容
	    //'filecontent' => file_get_contents($pic_url),  // baidu logo
	);
	
	//var_dump( $post_data );
	
	// 设置post的headers, 加入鉴权key
	$header = array(
	    'Content-Type: multipart/form-data',
	    'Authorization: ' . $sign,
	);
	
	$ch = curl_init($upload_url);
	curl_setopt($ch, CURLOPT_POST, 1);
	curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
	$res = curl_exec($ch);
	curl_close($ch);
	$res = json_decode($res, true);
	if (isset($res['data']['access_url'])) {
	    // 成功, 输出文件url
	    //echo $res['data']['access_url'];
		//return $res['data']['access_url'];
		//echo json_encode($res); exit();

		$fullName = $res['data']['access_url'];
	
		// 返回当前插入记录
		return json_encode(array(
			"photofile" => $fullName,//$newName,
		));	
	} else {
	    // 失败
	    //echo $res;
		//return $res;
		//echo json_encode($res); exit();	
		json_encode(array(
			"photofile" => 'none',//$newName,
		));	
	}
}

?>