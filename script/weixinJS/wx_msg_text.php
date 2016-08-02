<?php
/*
  * 根号教育企业号发送微信通知：应用agentid=5
*/
$userId = $_REQUEST['userId'];
$type = $_REQUEST['type'];
$msg = $_REQUEST['msg'];
$link = $_REQUEST['link'];
$agentId = $_REQUEST['agentId'];

//$content = addslashes($content);
// 接收人id（数组）转换为 符合微信touser格式  a | b | c
$userId = str_replace("、", "|", $userId);

require_once "jssdk-token.php";

$corpid = "wx09e87ee7559bb52f";
$corpsecret = "t08leZ8Ry2Yu3s5t0hU6G5npkxrkXypUCN7ew8y7h0vieePm7xbEyjGK37J1c5g6";
$jssdk = new JSSDK($corpid, $corpsecret);
$access_token = $jssdk->getAccessToken();

$url = "https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=$access_token";

// 发送消息
function httpPost($url,$data){
    $ch = curl_init();
    //curl_setopt($ch, CURLOPT_URL, "https://api.weixin.qq.com/cgi-bin/menu/create?access_token=".ACCESS_TOKEN);
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

//$link = "<a href='" . $link . "'>查看</a>";
$content = $type . " \n" . $msg ; //. " \n" . $link;

$data = '{
   "touser": "' . $userId  . '",
   "toparty": "",
   "totag": "",
   "msgtype": "text",
   "agentid": "' . $agentId  . '",
   "text": {
       "content": "' . $content  . '"
   },
   "safe":"0"
}';

echo httpPost($url,$data);

?>

