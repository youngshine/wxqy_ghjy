<?php
//根号教育大小班下课－发送模版消息 token 微信上墙－现场大屏幕气氛 https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wxe7253a6972bd2d4b&secret=c5c604c56402baac2c7ccd98b35ef2f2 

header("Content-type: text/html; charset=utf-8");

header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

/* 获得保存在json文件中的token
require_once "jssdk-token.php";
$corpid = "wx4f3ffca94662ce40";
$corpsecret = "9998a307f7f99e9445d84439d6182355";
$jssdk = new JSSDK($corpid, $corpsecret);
$access_token = $jssdk->getAccessToken();
*/

// 新浪云kvdb保存token
$ret = file_get_contents("http://xyzs.sinaapp.com/wx/kvdb.php");
$ret = json_decode($ret); 
$access_token = $ret->access_token;

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

//$courseID = $_REQUEST['courseID'];
$wxID = addslashes($_REQUEST['wxID']);
$studentName = addslashes($_REQUEST['studentName']);
$schoolsub = addslashes($_REQUEST['schoolsub']);
$classDate = date('Y-m-d G:i:s');
$tpl = "z2RT5dfRIkovMVIp59b6HJm_9PLaw8rHEaRHPj0JHBw";
//$wxID = 'oMEqkuMUKNmxtAxWGrjeOWPRFO20';
//$student = $_REQUEST['student'];
//$teacher = $_REQUEST['teacher'];
//$courseDate = $_REQUEST['date'];
//$created = $_REQUEST['created'];

// 教学课后评价提醒模版，评价页面在公众号wx_ghjy/course_assess.html
$data = '{
       "touser":"' . $wxID . '",
       "template_id": "' . $tpl . '",
       "url":"",            
       "data":{
               "first": {
                   "value":"'.$studentName.'学生已经下课，请注意接送。",
                   "color":"#173177"
               },
               "keyword1": {
                   "value":"'.$classDate.'",
                   "color":"#173177"
               },
               "keyword2": {
                   "value":"'.$schoolsub.'",
                   "color":"#173177"
               },
               "remark":{
                   "value": "感谢您对我们学校的支持。",
                   "color":"#173177"
               }
       }
   }';




echo httpPost($data);

?>

