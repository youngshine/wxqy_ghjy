<?php
// 读取校区某个大小版任课教师的班级列表
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

$classID = $_REQUEST['classID'];

$sql = " SELECT a.*,b.studentName,b.wxID   
	From `ghjy_class_student` a 
	Join `ghjy_student` b On a.studentID=b.studentID 
	WHERE a.classID = $classID ";  
    
$result = mysql_query($sql) 
	or die("Invalid query: readStudent by class" . mysql_error());

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
		"message" => "读取班级学生成功",
		"data"	  => $query_array
	));
?>