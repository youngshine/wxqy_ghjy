<?php 
// 502 bad gateway nginx 1.10
if(isset($_SESSION['user'])){ 
	print_r($_SESSION['user']);
	exit;
}

$url = 'http://www.xzpt.org/wxqy/ghjy/script/weixinJS/'; //redirect
$menuitem = $_GET["menuitem"];
switch($menuitem){
	case "school":
		$url = $url . "oAuth2-school.php";
		break;
	case "student":
		$url = $url . "oAuth2-student.php";
		break;
	case "teacher":
		$url = $url . "oAuth2-teacher.php";
		break;
	case "consult":
		$url = $url . "oAuth2-consult.php";
		break;
	case "teacher_class":
		$url = $url . "oAuth2-teacher_class.php";
		break;
	case "consult_class":
		$url = $url . "oAuth2-consult_class.php";
		break;
	case "consult_class_student":
		$url = $url . "oAuth2-consult_class_student.php";
		break;	
	case "consult_class_student_absent":
		$url = $url . "oAuth2-consult_class_student_absent.php";
		break;
	case "consult_1to1_student":
		$url = $url . "oAuth2-consult_1to1_student.php";
		break;		
}

$APPID = 'wx09e87ee7559bb52f';
//$REDIRECT_URI = 'http://www.yiqizo.com/weixin/sjfx/script/weixinJS/callback.php';
$REDIRECT_URI = $url; // 获取用户授权的网页
$scope = 'snsapi_base'; // silent
$state = '9';
//$scope='snsapi_userinfo';//需要授权
$url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' . $APPID . '&redirect_uri=' . urlencode($REDIRECT_URI) . '&response_type=code&scope=' . $scope . '&state=' . $state . '#wechat_redirect';

header("Location:".$url);

?>