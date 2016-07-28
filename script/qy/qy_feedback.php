<?php
 
include_once "WXBizMsgCrypt.php";
 
// 
$encodingAesKey = "WdivHUMuuRKVfwfQPOjYd66CdUQSlTHiB4x457D9wtD";
$token = "luanmin";
$corpId = "wx09e87ee7559bb52f";


/*
------------使用示例一：验证回调URL---------------
*企业开启回调模式时，企业号会向验证url发送一个get请求 
假设点击验证时，企业收到类似请求：
* GET /cgi-bin/wxpush?msg_signature=5c45ff5e21c57e6ad56bac8758b79b1d9ac89fd3&timestamp=1409659589&nonce=263014780&echostr=P9nAzCzyDtyTWESHep1vC5X9xho%2FqYX3Zpb4yKa9SKld1DsH3Iyt3tP3zNdtp%2B4RPcs8TgAE7OaBO%2BFZXvnaqQ%3D%3D 
* HTTP/1.1 Host: qy.weixin.qq.com

接收到该请求时，企业应
1.解析出Get请求的参数，包括消息体签名(msg_signature)，时间戳(timestamp)，随机数字串(nonce)以及公众平台推送过来的随机加密字符串(echostr),
这一步注意作URL解码。
2.验证消息体签名的正确性 
3. 解密出echostr原文，将原文当作Get请求的response，返回给公众平台
第2，3步可以用公众平台提供的库函数VerifyURL来实现。

*/
//verifyurl
$msg_signature = urldecode($_GET['msg_signature']);
$timestamp = urldecode($_GET['timestamp']);
$nonce = urldecode($_GET['nonce']);
$echostr = urldecode($_GET['echostr']);

$wxcpt = new WXBizMsgCrypt($token, $encodingAesKey, $corpId);
 
//valid token
if(!empty($echostr)){
	$errCode = $wxcpt->VerifyURL($msg_signature, $timestamp, $nonce, $echostr, $sEchoStr);
	if ($errCode == 0) {
		print($sEchoStr);
		exit;
	} else {
		print($errCode . "\n\n");
		exit;
	}
} 
// decrypt
$postStr = $GLOBALS["HTTP_RAW_POST_DATA"];
$errCode = $wxcpt->DecryptMsg($msg_signature, $timestamp, $nonce, $postStr, $sMsg);
if ($errCode == 0) {
	$postObj = simplexml_load_string($sMsg, 'SimpleXMLElement', LIBXML_NOCDATA);
 	responseMsg($postObj);
} else {
	print($errCode . "\n\n");
}

// encrypt sending message
function responseMsg($postObj){
    global $wxcpt;
    global $msg_signature;
    global $timestamp;
    global $nonce;
    $fromUsername = $postObj->FromUserName;
    $toUsername = $postObj->ToUserName;   
    $RX_TYPE = trim($postObj->MsgType); // 接受的类型：事件、文本、图片
    $content = "";
    switch ($RX_TYPE)
    {
        case "event":
        	$content = $postObj->Event;
        	switch ($postObj->Event)
            {
                case "enter_agent":
                    $content = "根号加盟的问题反馈";
                    break;
                case "LOCATION":
                	$time = date('Y-m-d H:i:s',$postObj->CreateTime);
                	$content = "移动考勤\n位置：" . $postObj->Latitude . "," 
                    . $postObj->Longitude
                        ."\n时间：" . date("Y-m-d H:i");
                
                    break;
                case "location_select":
                	$content = "移动考勤\n地点：" . $postObj->SendLocationInfo->Label
                    ."\n时间：" . $postObj->CreateTime;
                    break;
                
                case "pic_weixin":
                	$content = "图片：" . $postObj->SendPicsInfo->PicList;
                    break;
                case "click":
                    $key = trim($postObj->EventKey);    
                    switch ($key)
                    {
                        case "myself":
                            //$content = "我是" . $postObj->FromUserName;
                        	$tokeninfo = getToken();
                            $token = $tokeninfo["access_token"];
                            $userId = $postObj->FromUserName;
                            $userinfo = getUserInfo($token,$userId);
                            //$user = $userinfo["name"];
                            $content = "姓名：" . $userinfo["name"] . "\n账号：". $userinfo["userid"] ;
                        	break;

                    }
                	break;            
            }
            break;
        case "text":
        	$content = "请使用下方导航菜单进行操作" ;
            break;
        default:
        //$result = $this->receiveEvent($postObj, $wxcpt);
            break;
    }
    $xml = "<xml>
        <ToUserName><![CDATA[".$fromUsername."]]></ToUserName>
        <FromUserName><![CDATA[".$toUsername."]]></FromUserName> 
        <CreateTime>".time()."</CreateTime>
        <MsgType><![CDATA[text]]></MsgType>
        <Content><![CDATA[".trim($content)."]]></Content>
        </xml>";
    $wxcpt->EncryptMsg($xml, $timestamp, $nonce, $encrypt_msg);
    echo $encrypt_msg;
    exit;
}


    // access_token 2小时过期
    function getToken(){
        $corpid = "wx55b20958c2c9e4a8";
        $corpsecret = "MSeN9fFPyEs9m1ZuPbHDOv9PTLBHJhB3o_3dYDdg-DeQxS4isQaxaCt9lVc695gg";
        $url = "https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=$corpid&corpsecret=$corpsecret";
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE); 
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE); 
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        $output = curl_exec($ch);
        curl_close($ch);
        $jsoninfo = json_decode($output, true);
        //$access_token = $jsoninfo["access_token"];
        //return $access_token;
        return $jsoninfo;
    }
	
    // 通过userId获取成员信息	
    function getUserInfo($token,$userId)
    {
		$userinfo_url = "https://qyapi.weixin.qq.com/cgi-bin/user/get?access_token=$token&userid=$userId";       
        //"https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo?access_token=$token&code=$code&agentid=001";
        $userinfo_json = https_request($userinfo_url);
        $userinfo_array = json_decode($userinfo_json, true);
        return $userinfo_array;
    }
	function https_request($url)
	{
	    $curl = curl_init();
	    curl_setopt($curl, CURLOPT_URL, $url);
	    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, FALSE);
	    curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, FALSE);
	    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
	    $data = curl_exec($curl);
	    if (curl_errno($curl)) {
			return 'ERROR '.curl_error($curl);
		}
	    curl_close($curl);
	    return $data;
	}


// $sVerifyMsgSig = HttpUtils.ParseUrl("msg_signature");
//$sVerifyMsgSig = "5c45ff5e21c57e6ad56bac8758b79b1d9ac89fd3";
// $sVerifyTimeStamp = HttpUtils.ParseUrl("timestamp");
//$sVerifyTimeStamp = "1409659589";
// $sVerifyNonce = HttpUtils.ParseUrl("nonce");
//$sVerifyNonce = "263014780";
// $sVerifyEchoStr = HttpUtils.ParseUrl("echostr");
//$sVerifyEchoStr = "P9nAzCzyDtyTWESHep1vC5X9xho/qYX3Zpb4yKa9SKld1DsH3Iyt3tP3zNdtp+4RPcs8TgAE7OaBO+FZXvnaqQ==";
/*
$sVerifyMsgSig = $_GET["msg_signature"];
$sVerifyTimeStamp = $_GET["timestamp"];
$sVerifyNonce = $_GET["nonce"];
$sVerifyEchoStr = $_GET["echostr"] ;
// 需要返回的明文
$EchoStr = "";
$wxcpt = new WXBizMsgCrypt($token, $encodingAesKey, $corpId);
$errCode = $wxcpt->VerifyURL($sVerifyMsgSig, $sVerifyTimeStamp, $sVerifyNonce, $sVerifyEchoStr, $sEchoStr);
if ($errCode == 0) {
	//
	// 验证URL成功，将sEchoStr返回
	// HttpUtils.SetResponce($sEchoStr);
    echo $sEchoStr;
} else {
	print("valid ERR: " . $errCode . "\n\n");
} */

$wechatObj = new wechatMsg();
$wechatObj->responseMsg($wxcpt);

// --- lin
class wechatMsg
{
    public function responseMsg($wxcpt)
    {
        //获取POST数据
        //$sReqMsgSig = HttpUtils.ParseUrl("msg_signature");
        //$sReqTimeStamp = HttpUtils.ParseUrl("timestamp");
        //$sReqNonce = HttpUtils.ParseUrl("nonce");
        $sReqMsgSig = "477715d11cdb4164915debcba66cb864d751f3e6";//$_GET["msg_signature"]; 
        $sReqTimeStamp = "1409659813";//$_GET["timestamp"]; //"1409659813";
        $sReqNonce = "1372623149";//$_GET["nonce"]; //"1372623149";
        /*$sReqData = "<xml>
            <ToUserName><![CDATA[wx55b20958c2c9e4a8]]></ToUserName>
            <AgentID><![CDATA[1]]></AgentID>
            <Encrypt><![CDATA[RypEvHKD8QQKFhvQ6QleEB4J58tiPdvo+rtK1I9qca6aM/wvqnLSV5zEPeusUiX5L5X/0lWfrf0QADHHhGd3QczcdCUpj911L3vg3W/sYYvuJTs3TUUkSUXxaccAS0qhxchrRYt66wiSpGLYL42aM6A8dTT+6k4aSknmPj48kzJs8qLjvd4Xgpue06DOdnLxAUHzM6+kDZ+HMZfJYuR+LtwGc2hgf5gsijff0ekUNXZiqATP7PF5mZxZ3Izoun1s4zG4LUMnvw2r+KqCKIw+3IQH03v+BCA9nMELNqbSf6tiWSrXJB3LAVGUcallcrw8V2t9EL4EhzJWrQUax5wLVMNS0+rUPA3k22Ncx4XXZS9o0MBH27Bo6BpNelZpS+/uh9KsNlY6bHCmJU9p8g7m3fVKn28H3KDYA5Pl/T8Z1ptDAVe0lXdQ2YoyyH2uyPIGHBZZIs2pDBS8R07+qN+E7Q==]]>
            </Encrypt>
            </xml>";  */
        // post请求的密文数据
        //$sReqData = HttpUtils.PostData();
        //$sReqData = file_get_contents('php://input');
        $sReqData = $GLOBALS["HTTP_RAW_POST_DATA"];
        //$postStr = $GLOBALS["HTTP_RAW_POST_DATA"];
        //$sReqData = simplexml_load_string($postStr, 'SimpleXMLElement', LIBXML_NOCDATA);
		$sReqMsgSig = $_GET["msg_signature"]; 
        $sReqTimeStamp = "1409659813";
        $sReqNonce = $_GET["nonce"]; //"1372623149";
        
        $sMsg = "";  // 解析之后的明文
        $errCode = $wxcpt->DecryptMsg($sReqMsgSig, $sReqTimeStamp, $sReqNonce, $sReqData, $sMsg);
		if ($errCode == 0) {
			// 解密成功，sMsg即为xml格式的明文
			// TODO: 对明文的处理
			// For example:
            echo "decrypt success" . $sMsg;
		} else {
			print("decrypt receive ERR: " . $errCode . "\n\n end");
			//exit(-1);
		}
		//用SimpleXML解析POST过来的XML数据
        //$postObj = simplexml_load_string($sMsg, 'SimpleXMLElement', LIBXML_NOCDATA);
        //$RX_TYPE = trim($postObj->MsgType);
        $xml = new DOMDocument();
        $xml->loadXML($sReqData);
        $RX_TYPE = $xml->getElementsByTagName('Encrypt')->item(0)->nodeValue;
        $result = $this->testmsg($errCode, $wxcpt);
        return;
        
        //echo "type: " .$RX_TYPE . " /type end \n\n";
        switch ($RX_TYPE)
        {
            case "event":
            	$result = $this->receiveEvent($postObj, $wxcpt);
                break;
            case "text":
                $result = $this->receiveText($postObj, $wxcpt);
                break;
            default:
            	$result = $this->receiveEvent($postObj, $wxcpt);
                break;
        }
        $this->logger("T ".$result);
        echo $result;
    }

    private function receiveEvent($object, $wxcpt)
    {
        $content = "";
        switch ($object->Event)
        {
            case "subscribe":
            	$content = "欢迎关注企业号！\n\n点击下列导航菜单进行相应操作";
                break;
            case "unsubscribe":
            	$content = "Bye 欢迎再来（已经从数据库Member表移除）";
                break;
            case "CLICK":
                switch ($object->EventKey)
                {
                    case "askoff":
                        $content = "正在操作请假";
                        break;
                }
                break;
            default:
            	$content = "default：" . $object->FromUserName;    
                break; 
        }
        $result = $this->transmitText($object, $content, $wxcpt);
        return $result;
    }

    private function testmsg($object, $wxcpt)
    {
        $content = "类型：" . $object;
        $result = $this->transmitText($object, $content, $wxcpt);
        return $result;
    }
    
    private function receiveText($object, $wxcpt)
    {
        //$keyword = trim($object->Content);
        //$entity = str_replace("天气","",$keyword);
        //$content = "企业号功能！\n\n点击下面导航菜单";
        //$result = $this->transmitText($object, $content, $wxcpt);
        //return $result;
        $content = array();
        $a = array(
            "Title"=>"工作任务项目管理",  
            "Description"=>"", 
            "PicUrl"=>"http://1.younglin.sinaapp.com/assets/title.jpg", 
            "Url" =>"http://1.younglin.sinaapp.com/pm/index.html?$object->FromUserName" //带入当前用户
        ); 
        $b = array(
            "Title"=>"团队协作工具：把办公室装进口袋",  
            "Description"=>"", 
            "PicUrl"=>"http://1.younglin.sinaapp.com/assets/qrcode.jpg", 
            "Url" =>"http://1.younglin.sinaapp.com/pm/index.html?$object->FromUserName"
        );
        $content = array($a,$b);
        $result = $this->transmitNews($object, $content, $wxcpt);
        return $result;
    }

    private function transmitText($object, $content, $wxcpt)
    {
        $textTpl = "<xml>
			<ToUserName><![CDATA[%s]]></ToUserName>
			<FromUserName><![CDATA[%s]]></FromUserName>
			<CreateTime>%s</CreateTime>
			<MsgType><![CDATA[text]]></MsgType>
			<Content><![CDATA[%s]]></Content>
			</xml>";
        $sRespData = sprintf($textTpl, $object->FromUserName, $object->ToUserName, time(), $content);
		// 加密，才能发送
		$sEncryptMsg = ""; //xml格式的密文
		$errCode = $wxcpt->EncryptMsg($sRespData, $sReqTimeStamp, $sReqNonce, $sEncryptMsg);
		if ($errCode == 0) {
			// TODO:
			// 加密成功，企业需要将加密之后的sEncryptMsg返回
			// HttpUtils.SetResponce($sEncryptMsg);  //回复加密之后的密文
            echo "encrypt success \n\n" . $sEncryptMsg;
		} else {
			print("encrypt send ERR: " . $errCode . "\n\n");
			// exit(-1);
		}
        return $sEncryptMsg;
    }

    private function transmitNews($object, $newsArray, $wxcpt)
    {
        if(!is_array($newsArray)){
            return;
        }
        $itemTpl = "<item>
        <Title><![CDATA[%s]]></Title>
        <Description><![CDATA[%s]]></Description>
        <PicUrl><![CDATA[%s]]></PicUrl>
        <Url><![CDATA[%s]]></Url>
    	</item>
        ";
        
        $item_str = "";
        foreach ($newsArray as $item){
            $item_str .= sprintf($itemTpl, $item['Title'], $item['Description'], $item['PicUrl'], $item['Url']);
        }
        $newsTpl = "<xml>
			<ToUserName><![CDATA[%s]]></ToUserName>
			<FromUserName><![CDATA[%s]]></FromUserName>
			<CreateTime>%s</CreateTime>
			<MsgType><![CDATA[news]]></MsgType>
			<Content><![CDATA[]]></Content>
			<ArticleCount>%s</ArticleCount>
			<Articles>$item_str</Articles>
			</xml>";

        $sRespData = sprintf($newsTpl, $object->FromUserName, $object->ToUserName, time(), count($newsArray));
        
        // 加密，才能发送
		$sEncryptMsg = ""; //xml格式的密文
		$errCode = $wxcpt->EncryptMsg($sRespData, $sReqTimeStamp, $sReqNonce, $sEncryptMsg);
		if ($errCode == 0) {
			// TODO:
			// 加密成功，企业需要将加密之后的sEncryptMsg返回
			// HttpUtils.SetResponce($sEncryptMsg);  //回复加密之后的密文
            echo "encrypt success";
		} else {
			print("encrypt send ERR: " . $errCode . "\n\n");
			// exit(-1);
		}
        return $sEncryptMsg;
    }

    private function logger($log_content)
    {
      
    }
  
 
}

 
?>