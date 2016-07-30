<?php
/*
 * 7-27 班级学生记录
*/
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

$consultID = addslashes($_REQUEST['consultID']);

$sql = "SELECT a.studentID,b.studentName,b.gender,b.phone,b.grade   
	From `ghjy_class_student` a 
	Join `ghjy_student` b On a.studentID=b.studentID 
	WHERE b.consultID >= 0 
	Group By a.studentID ";   
$result = mysql_query($sql) 
	or die("Invalid query: readClassAttendeeList " . mysql_error());

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