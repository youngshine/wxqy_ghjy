<?php
/*
 * 7-27 咨询师的当天缺课学生
*/
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

$consultID = addslashes($_REQUEST['consultID']);
$today = date('Y-m-d');

$sql = "SELECT a.*,b.studentName,b.gender,b.phone,b.grade,c.title    
	From `ghjy_class_course` a 
	Join `ghjy_student` b On a.studentID=b.studentID 
	Join `ghjy_class` c On a.classID=c.classID 
	WHERE a.flag=0 And b.consultID >= 0 And 
	DATE_FORMAT(beginTime,'%Y-%m-%d')='$today' ";   
$result = mysql_query($sql) 
	or die("Invalid query: readStudentByConsultClassAbsent " . mysql_error());

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
	"message" => "读取今天缺课学生成功",
	"data"	  => $query_array
));

?>