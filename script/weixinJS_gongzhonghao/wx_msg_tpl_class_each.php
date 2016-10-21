<?php
// 根号教育班级上课－发送模版消息 token 微信上墙－现场大屏幕气氛 
// 推送给某个学生的精彩照片集合
header("Content-type: text/html; charset=utf-8");

header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

/*
require_once "jssdk-token.php";
$corpid = "wx4f3ffca94662ce40";
$corpsecret = "9998a307f7f99e9445d84439d6182355";
$jssdk = new JSSDK($corpid, $corpsecret);
$access_token = $jssdk->getAccessToken();
*/

// 新浪云kvdb保存token
$ret = file_get_contents("http://xyzs.sinaapp.com/wx/kvdb.php");
$ret = json_decode($ret); 
$access_token = $ret->access_token; // kvdb ends

define("ACCESS_TOKEN",$access_token );

//发送模版消息，参数wxid..
function httpPost($data,$access_token){
	$ch = curl_init();
	$url = "https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=" . ACCESS_TOKEN;
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

// 当前这次推送id
$ID = $_REQUEST['classeachID']; // unique
$wxID = addslashes($_REQUEST['wxID']);
$studentName = addslashes($_REQUEST['studentName']);
$schoolsub = addslashes($_REQUEST['schoolsub']);
$msg = addslashes($_REQUEST['msg']);
$classDate = date('Y-m-d');
$className = addslashes($_REQUEST['className']);
//$wxID = 'oMEqkuMUKNmxtAxWGrjeOWPRFO20';
//$student = $_REQUEST['student'];
//$teacher = $_REQUEST['teacher'];
//$courseDate = $_REQUEST['date'];
//$created = $_REQUEST['created'];

$url = 'http://www.xzpt.org/wx_ghjy/classeseach_tplmsg.php?ID='.$ID;

// 教学课后评价提醒模版，评价页面在公众号wx_ghjy/course_assess.html
$data = '{
       "touser":"' . $wxID . '",
       "template_id":"BHzWvJk_qMlkmYJ9tiXp5xkKhfjLdsg4Gk0KN5ZWSgY",
       "url":"' . $url . '",           
       "data":{
               "first": {
                   "value":"你好，家长，请查阅［'.$studentName.'］今日在校情况。",
                   "color":"#173177"
               },
               "keyword1": {
                   "value":"'.$className.'",
                   "color":"#173177"
               },
               "keyword2": {
                   "value":"'.$classDate.'",
                   "color":"#173177"
               },
               "remark":{
                   "value": "'.$msg.'\n点击详情查看照片集。\n［'.$schoolsub.'］",
                   "color":"#173177"
               }
       }
   }';




echo httpPost($data);

?>
