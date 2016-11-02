<?php
// 读取教师的某个上课时间的一对N课时，group by teacher+timely
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

$teacherID = $_REQUEST['teacherID'];
$timely = $_REQUEST['timely'];

$sql = " SELECT a.courseNo,a.timely,a.teacherID,a.hour,a.beginTime,a.endTime,a.flag,
	DATE_FORMAT(a.beginTime,'%Y-%m-%d') As courseDate,b.title AS kcTitle  
	From `ghjy_one2n_course` a 
	Join `ghjy_kclist` b On a.kclistID=b.kclistID  
	Where a.teacherID = $teacherID And a.timely = '$timely'  
	Group By a.courseNo 
	Order By a.courseNo Desc";
    
$result = mysql_query($sql) 
	or die("Invalid query: readOne2nCourse" . mysql_error());

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
	"message" => "读取一对N上课课时成功",
	"data"	  => $query_array
));

?>