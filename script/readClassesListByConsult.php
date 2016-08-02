<?php
// 企业号userId： 读取校区咨询师创建的大小班级
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

$consult = addslashes($_REQUEST['consultID']); //userId

$sql = " SELECT a.*,b.userId 
	From `ghjy_class` a 
	Join `ghjy_consult` b On a.consultID=b.consultID 
	Where b.userId = '$consult' ";
    
$result = mysql_query($sql) 
	or die("Invalid query: readClassList by consult ent" . mysql_error());

	$query_array = array();
	$i = 0;
	//Iterate all Select
	while($row = mysql_fetch_array($result))
	{
		array_push($query_array,$row);
		$i++;
	}

	echo json_encode(array(
		"success" => true,
		"message" => "企业号读取班级列表成功",
		"data"	  => $query_array
	));
?>