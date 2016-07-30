<?php 
// 通过扩展属性，获得学校id
require_once "jssdk-userinfo.php";

$code = $_GET["code"];
$corpid = "wx09e87ee7559bb52f";
$corpsecret = "t08leZ8Ry2Yu3s5t0hU6G5npkxrkXypUCN7ew8y7h0vieePm7xbEyjGK37J1c5g6";

$jssdk = new JSSDK($corpid, $corpsecret, $code);

$userInfo = $jssdk->getUserInfo();
$userId = $userInfo->userid;
$userName = $userInfo->name;
//$userRole = $userInfo->position; //extattr->attrs["role"];
// 如何获得企业号扩展字段？
$schoolID = $userInfo->extattr->attrs[0]->value; //name:schoolID

//echo json_encode($userInfo->extattr->attrs[0]->value);
//die();

$url = "../../consult_class_student_absent.html?userId=". $userId . 
	"&userName=" . $userName . 
	"&schoolID=" . $schoolID;
header("Location:".$url);

?>
