<?php
/*
  * 某个教师的一对一课程
*/
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

$teacher = addslashes($_REQUEST['teacher']); //userId

$sql = " SELECT a.*,b.zsdName,c.teacherName,d.studentName,d.wxID      
	FROM `ghjy_student-study` a 
	JOIN `ghjy_zsd` b on (a.zsdID=b.zsdID and a.subjectID=b.subjectID) 
	JOIN `ghjy_teacher` c on a.teacherID=c.teacherID  
	JOIN `ghjy_student` d on a.studentID=d.studentID  
	WHERE c.userId = '$teacher' ";   
$result = mysql_query($sql) 
	or die("Invalid query: readStudyList by teacher" . mysql_error());

$arr = array();
$i = 0;
//Iterate all Select
while($row = mysql_fetch_array($result))
{
	array_push($arr,$row);
	$i++;
}

echo json_encode(array(
	"success" => true,
	"message" => "读取教师的一对一课程成功",
	"data"	  => $arr
));
?>