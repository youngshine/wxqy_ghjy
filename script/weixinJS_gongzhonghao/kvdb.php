<?php

$kv = new SaeKV();

/*
$arr = array(
    "access_token" => $access_token,
    "expire_time" => 1473144021
);
$ret = $kv->set('access_token', $arr); */


// 初始化SaeKV对象，已经初始化则返回false
$ret = $kv->init("lwoykyn5j3"); //访问授权应用的数据
//var_dump($ret);

// 不存在则返回false
$ret = $kv->get('access_token');
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
    $ret = $kv->set('access_token', $arr);
    // 重新获取更新后的
    $ret = $kv->get('access_token');
};
 

/*
// 增加key-value
$arr = array(
    "access_token" => '1nyWsYxMpmBKLBM2o37o6o_OAAY9A0Wm5JzVMFAz9SdzqPKdqv1NHohfQtyUjsjLp1TY2Z3byJY5drQGvYFx_qTm8nDNyZxmqZQgeuFIN6ACDiabvz55rait2ut0XbRGZPSfADAOEH',
    "expire_time" => 1471169445,
);
$ret = $kv->add('access_token', $arr);
var_dump($ret);

*/

echo json_encode(array(
	"success" => true,
	"access_token" => $ret['access_token'],
	"expire_time"  => $ret['expire_time']
));

function getAccessToken(){
	$appId = "wx4f3ffca94662ce40";
    $appSecret = "9998a307f7f99e9445d84439d6182355";
    $url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=".$appId."&secret=".$appSecret;
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