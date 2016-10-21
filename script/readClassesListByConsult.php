<?php
// 企业号userId： 读取校区咨询师创建的大小班级
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

// 咨询师userId
$consult = addslashes($_REQUEST['consultID']); //userId

// 可能还没有指定教师，所以left join teacher
$sql = " SELECT a.*,b.userId,c.teacherName,d.kmType   
	From `ghjy_class` a 
	Join `ghjy_consult` b On a.consultID=b.consultID 
	Left Join `ghjy_teacher` c On a.teacherId=c.teacherID 
	Join `ghjy_kclist` d On a.kclistID = d.kclistID 
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