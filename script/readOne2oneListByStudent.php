<?php
// 读取某个学生报读的一对一内容（知识点）
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

$studentID = $_REQUEST['studentID'];

// 可能还没有排课一对一教师，left join teacher
$sql = " SELECT a.*,
	b.zsdName,c.subjectName,c.subjectID,d.gradeName,e.teacherName    
	FROM `ghjy_student-study` a 
	JOIN `ghjy_zsd` b on (a.zsdID=b.zsdID and a.subjectID=b.subjectID) 
	JOIN `ghjy_subject` c on b.subjectID=c.subjectID 
	JOIN `ghjy_grade` d on b.gradeID=d.gradeID 
	LEFT JOIN `ghjy_teacher` e ON a.teacherID=e.teacherID 
	WHERE a.studentID = $studentID ";   
$result = mysql_query($sql) 
	or die("Invalid query: readStudyList " . mysql_error());

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
	"message" => "读取学生一对一课程内容成功",
	"data"	  => $query_array
));

?>