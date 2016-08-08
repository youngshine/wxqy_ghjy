<?php
// 企业号userId： 读取校长的大小班级
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

$schoolID = $_REQUEST['schoolID']; 

// 可能还没有指定教师，所以left join teacher
$sql = " SELECT a.*,b.teacherName,b.userId 
	From `ghjy_class` a 
	Left Join `ghjy_teacher` b On a.teacherID=b.teacherID 
	Where a.schoolID=$schoolID ";
    
$result = mysql_query($sql) 
	or die("Invalid query: readClassList by all" . mysql_error());

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