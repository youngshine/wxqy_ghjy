<?php

// qy获取企业号的access_token，区别公众号

$kv = new SaeKV();

// 初始化SaeKV对象，已经初始化则返回false
//$ret = $kv->init("lwoykyn5j3"); //访问授权应用的数据
//var_dump($ret);

$arr = array(
    "access_token" => 'virginized',
    "expire_time" => 0
);
$ret = $kv->set('access_token_qy', $arr); 

// 不存在则返回false
$ret = $kv->get('access_token_qy');
//var_dump($ret);

// access_token过期，重新获取并保存 expire_time + 7200
if ($ret['expire_time'] < time() ){
    $access_token = getAccessToken();
    // 更新key-value
    $arr = array(
        "access_token" => $access_token,
        "expire_time" => time() + 7200
    );
    // 更新
    $ret = $kv->set('access_token_qy', $arr);
    // 获取更新后的
    $ret = $kv->get('access_token_qy');
};
 

echo json_encode(array(
    //"success" => true,
	"access_token" => $ret['access_token'],
	"expire_time"  => $ret['expire_time']
));


// 函数function，//企业号，不是公众服务号
function getAccessToken(){
    $appId = "wx09e87ee7559bb52f"; 
    $appSecret = "t08leZ8Ry2Yu3s5t0hU6G5npkxrkXypUCN7ew8y7h0vieePm7xbEyjGK37J1c5g6";
    $url = "https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=".$appId."&corpsecret=".$appSecret;
    $res = json_decode(httpGet($url));
    $access_token = $res->access_token;
    return $access_token;
}

function httpGet($url) {
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

?>