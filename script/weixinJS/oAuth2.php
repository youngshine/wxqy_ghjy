<?php 
// 502 bad gateway nginx 1.10
if(isset($_SESSION['user'])){ 
	print_r($_SESSION['user']);
	exit;
}

$url = 'http://www.xzpt.org/wxqy/ghjy/script/weixinJS/'; //redirect
$menuitem = $_GET["menuitem"];
switch($menuitem){
	case "school": //总校长
		$url = $url . "oAuth2-school.php";
		break;
	case "dean_student":
		$url = $url . "oAuth2-dean_student.php";
		break;
	case "dean_student_register":
		$url = $url . "oAuth2-dean_student_register.php";
		break;
	case "dean_consult":
		$url = $url . "oAuth2-dean_consult.php";
		break;
	case "dean_teacher":
		$url = $url . "oAuth2-dean_teacher.php";
		break;
	case "dean_class_enroll": //满班率
		$url = $url . "oAuth2-dean_class_enroll.php";
		break;	
	case "dean_1to1":
		$url = $url . "oAuth2-dean_1to1.php";
		break;
	case "dean_kclist_class":
		$url = $url . "oAuth2-dean_kclist_class.php";
		break;
	case "dean_kclist_1to1":
		$url = $url . "oAuth2-dean_kclist_1to1.php";
		break;
	case "dean_class_jxt":
		$url = $url . "oAuth2-dean_class_jxt.php";
		break;					
	case "teacher_class":
		$url = $url . "oAuth2-teacher_class.php";
		break;
	case "teacher_class_homework": //大小通的家校通
		$url = $url . "oAuth2-teacher_class_homework.php";
		break;
	case "teacher_class_kcb":
		$url = $url . "oAuth2-teacher_class_kcb.php";
		break;
	case "teacher_class_jxt": //大小通的家校通
		$url = $url . "oAuth2-teacher_class_jxt.php";
		break;
	case "teacher_1to1":
		$url = $url . "oAuth2-teacher_1to1.php";
		break;
	case "teacher_1to1_kcb":
		$url = $url . "oAuth2-teacher_1to1_kcb.php";
		break;
	case "consult_class":
		$url = $url . "oAuth2-consult_class.php";
		break;
	case "consult_student":
		$url = $url . "oAuth2-consult_student.php";
		break;	
	case "consult_student_register": //来自微信的
		$url = $url . "oAuth2-consult_student_register.php";
		break;	
	case "consult_class_student_absent":
		$url = $url . "oAuth2-consult_class_student_absent.php";
		break;
	case "consult_1to1_student":
		$url = $url . "oAuth2-consult_1to1_student.php";
		break;	
	case "consult_class_jxt":
		$url = $url . "oAuth2-consult_class_jxt.php";
		break;	
	case "accnt_daily":
		$url = $url . "oAuth2-accnt_daily.php";
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