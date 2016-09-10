<?php
/**
 * 教师的课程表：某天某个时间段上什么课zsdName? pass !=1 结束的不算
 * 大小班class和一对一student-study合并 16-8-31
*/

header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

$teacher = $_REQUEST['teacher']; //userId

$sql = "SELECT a.teacherID,a.timely_list,'一对一' As kcType 
	FROM `ghjy_student-study` a 
	Join `ghjy_teacher` b On a.teacherID=b.teacherID 
	WHERE b.userId = '$teacher' And a.pass = 0 
	Union All 
	SELECT c.teacherID,c.timely_list,'大小班' As kcType 
	FROM `ghjy_class` c 
	Join `ghjy_teacher` d On c.teacherID=d.teacherID 
	WHERE d.userId = '$teacher' And c.current = 1 ";	
	
$result = mysql_query($sql) or 
    die("Invalid query: readKcbByTeacher" . mysql_error());

$arr = array();
$i = 0;
//Iterate all Select
while($row = mysql_fetch_array($result))
{
	array_push($arr,$row);
	$i++;
}

//echo json_encode($arr);
echo json_encode(array(
	"success" => true,
	"message" => "读取排课表",
	"data"	  => $arr
));

?>