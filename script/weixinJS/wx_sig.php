<?php
	//教育企业号，json文件路径
	require_once "jssdk-sig.php";

	$url = $_REQUEST['url']; // 前台传入，因ajax调用后台文件
	$corpid = "wx09e87ee7559bb52f";
	$corpsecret = "t08leZ8Ry2Yu3s5t0hU6G5npkxrkXypUCN7ew8y7h0vieePm7xbEyjGK37J1c5g6";
	
	$jssdk = new JSSDK($corpid, $corpsecret, $url);
	
	$signPackage = $jssdk->getSignPackage();
	
	echo json_encode($signPackage);
?>

