<?php
// 根号教育企业号，从微信服务器下载图片保存在本地或腾讯云存储cos

$mediaId = $_REQUEST['mediaId'];
$fileName = $_REQUEST['fileName'];
//$fileName = '../../assets/img/baoxiao/' . $fileName;
$fileName = '../../' . $fileName; // 相对路径，公用

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
//var_dump($result);
$fileContent = $result['body'];


// 1）采用文件流保存到自己服务器
file_put_contents( $fileName, $fileContent );
//echo $fileName; // 前段才能取得返回值json_decode

// 2）保存在腾讯云存储cos.php



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

?>