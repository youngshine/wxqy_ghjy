<?php
class JSSDK {
  private $appId;
  private $appSecret;
  private $code;

  public function __construct($appId, $appSecret, $code) {
    $this->appId = $appId;
    $this->appSecret = $appSecret;
	$this->code = $code;
  }
  
  // 网页认证oAuth2 code，返回userId
  public function getUserInfo() {	
	$accessToken = $this->getAccessToken();
	$userId = $this->getUserId();
	//$code = $this->code;
	// 应用agentid统一用0（有全部成员）？？？
	$url = "https://qyapi.weixin.qq.com/cgi-bin/user/get?access_token=$accessToken&userid=$userId"; 
	$res = json_decode($this->httpGet($url));
    //$userid = $res->UserId;	
    return $res; 
  }
  
  // 网页认证oAuth2 code，返回userId
  private function getUserId() {
	$accessToken = $this->getAccessToken();
	//$code = $this->code;
	// 应用agentid统一用0（有全部成员）？？？
	$url = "https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo?access_token=$accessToken&code=$this->code";
	$res = json_decode($this->httpGet($url));
    $userid = $res->UserId;	
    return $userid; 
  }

  // not private 	
  private function getAccessToken() {
    // access_token 应该全局存储与更新，以下代码以写入到文件中做示例
    $data = json_decode(file_get_contents("access_token.json"));
    if ($data->expire_time < time()) {
      // 如果是企业号用以下URL获取access_token
       $url = "https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=$this->appId&corpsecret=$this->appSecret";
      //$url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=$this->appId&secret=$this->appSecret";
      $res = json_decode($this->httpGet($url));
      $access_token = $res->access_token;
      if ($access_token) {
        $data->expire_time = time() + 7000;
        $data->access_token = $access_token;
        $fp = fopen("access_token.json", "w");
        fwrite($fp, json_encode($data));
        fclose($fp);
      }
    } else {
      $access_token = $data->access_token;
    }
    return $access_token;
  }

  private function httpGet($url) {
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_TIMEOUT, 500);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($curl, CURLOPT_URL, $url);

    $res = curl_exec($curl);
    curl_close($curl);

    return $res;
  }
}

?>

