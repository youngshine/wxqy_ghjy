<?php
/*
  * 发送微信通知：家校通agentid=2
*/
$userId = $_REQUEST['userId'];
$type = $_REQUEST['type'];
$msg = $_REQUEST['msg'];
$link = $_REQUEST['link'];

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
$data = '{
   "touser": "' . $userId  . '",
   "toparty": "",
   "totag": "",
   "msgtype": "news",
   "agentid": "5",
   "news": {
       "articles":[
           {
               "title": "' . $type  . '",
               "description": "' . $msg  . '",
               "url": "' . $link . '",
               //"picurl": "' . $pic . '"
               //"picurl": "http://fulindoor.sinaapp.com/weixin/assets/news-title.jpg",
           }   
       ]
   }
}';

echo httpPost($url,$data);

// 企业号agentid: wf-1,jxt-2,pm-3，corpid可能不同？
//$userId = "@all"; //"@all";
//$content = $type . "\n" . $msg;
/*
$data = '{
   "touser": "' . $userId . '",
   "toparty": "",
   "totag": "",
   "msgtype": "text",
   "agentid": "2",
   "text": {
       "content": "' . $content  . '"
   },
   "safe":"0"
}';
*/

// $content是标题，news_id无法取得，暂时用公告标题做参数传回，取得内容
//$userId = 'younglin';
 
/*
$url = "<a href='https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx55b20958c2c9e4a8&redirect_uri=http://fulindoor.sinaapp.com/weixin/oAuth2-jxt.php&response_type=code&scope=snsapi_base&state=9#wechat_redirect'>查看</a>";
$content = $type . "\n" . $msg . "\n\n" . $url;

$data = '{
   "touser": "' . $userId . '",
   "toparty": "",
   "totag": "",
   "msgtype": "text",
   "agentid": "2",
   "text": {
       "content": "' . $content  . '"
   },
   "safe":"0"
}'; */

?>

