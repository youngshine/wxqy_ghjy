<?php
/**
 * 教师的一对一课程表，正在教学中的 pass=0： 
 * 某天某个时间段上什么课zsdName? pass !=1 结束的不算
*/

header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

//$teacherID = $_REQUEST['teacherID'];
$teacher = addslashes($_REQUEST['teacherID']); //参数userId，不是primary

$sql = "SELECT a.teach_weekday,a.teach_timespan,b.userId,b.teacherName  
	FROM `ghjy_student-study` a
	Join `ghjy_teacher` b On a.teacherID=b.teacherID 
	WHERE b.userId='$teacher' And a.pass = 0 
	Group By a.teach_weekday,a.teach_timespan ";
$result = mysql_query($sql) or 
    die("Invalid query: readStudentstudyListByTeacher" . mysql_error());

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
	"message" => "读取一对一教师课程表",
	"data"	  => $arr
));

?>