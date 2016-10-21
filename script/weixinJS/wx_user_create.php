<?php
	// 教育企业号创建通讯录成员，并且设置标签：咨询2、教师3
	header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
	header('Access-Control-Allow-Origin: *'); // 跨域问题

/*	
	require_once "jssdk-token.php";
	$corpid = "wx09e87ee7559bb52f";
	$corpsecret = "t08leZ8Ry2Yu3s5t0hU6G5npkxrkXypUCN7ew8y7h0vieePm7xbEyjGK37J1c5g6";
	$jssdk = new JSSDK($corpid, $corpsecret); 
	$access_token = $jssdk->getAccessToken();
*/
  	$ret = file_get_contents("http://xyzs.sinaapp.com/wx/kvdb_qy.php");
  	$ret = json_decode($ret); 
  	$access_token = $ret->access_token;
		
	// 从微信服务器下载多媒体文件到自己服务器，永久保存
	$url = "https://qyapi.weixin.qq.com/cgi-bin/user/create?access_token=$access_token";

	$userId = addslashes($_REQUEST['userId']);
	$name = addslashes($_REQUEST['userName']);
	$mobile = $_REQUEST['phone'];
	//$gender = $_REQUEST['gender'];
	$gender = $_REQUEST['gender']=='男' ? 1 : 2;
	$position = $_REQUEST['position'];
	//$tag = $_REQUEST['tag']; //创建时，无法标签
	$schoolID = $_REQUEST['schoolID']; //高歌schoolID与企业号部门dept匹配表
	$department = $_REQUEST['department']; //4-根号联盟，子部门就是学校
	
	$data = '{
	   "userid": "'.$userId.'",
	   "name": "'.$name.'",
	   "department": [4], 
	   "position": "'.$position.'",
	   "mobile": "'.$mobile.'",
	   "gender": "'.$gender.'",
	   "extattr": {"attrs":[{"name":"schoolID","value":"'.$schoolID.'"}]}
	}';
	
	echo httpPost($url, $data);

	//创建菜单,参数api url & menu data 方法post
	function httpPost($url,$data){
		$ch = curl_init();
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
?>

