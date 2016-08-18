<?php
// 一对一上课记录
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

// 一对一上课记录
$studentstudyID = $_REQUEST['studentstudyID'];

$sql = " SELECT * From `ghjy_teacher_course` a 
	Where studentstudyID = $studentstudyID Order by created Desc";
    
$result = mysql_query($sql) 
	or die("Invalid query: readTeachCourseList" . mysql_error());

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
	"message" => "企业号读取一对一上课记录成功",
	"data"	  => $query_array
));

?>