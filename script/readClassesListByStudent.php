<?php
// 读取某个学生报读的班级
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

$studentID = $_REQUEST['studentID'];

$sql = " SELECT a.*,b.studentID,c.teacherName  
	From `ghjy_class` a 
	join `ghjy_class_student` b On a.classID=b.classID  
	Join `ghjy_teacher` c On a.teacherID=c.teacherID 
	Where b.studentID = $studentID ";
    
$result = mysql_query($sql) 
	or die("Invalid query: readClassList by Student" . mysql_error());

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
		"message" => "读取学生报读班级成功",
		"data"	  => $query_array
	));
?>