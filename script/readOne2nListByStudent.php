<?php
// 读取某个学生报读的一对一内容（课程，不是知识点）
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

$studentID = $_REQUEST['studentID'];

// 可能还没有排课一对一教师，left join teacher
$sql = " SELECT a.*,b.title As kcTitle,c.teacherName    
	FROM `ghjy_one2n_student` a 
	JOIN `ghjy_kclist` b on a.kclistID=b.kclistID 
	LEFT JOIN `ghjy_teacher` c ON a.teacherID=c.teacherID 
	WHERE a.studentID = $studentID ";   
$result = mysql_query($sql) 
	or die("Invalid query: readOne2nByStudent " . mysql_error());

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
	"message" => "读取学生一对N课程成功",
	"data"	  => $query_array
));

?>