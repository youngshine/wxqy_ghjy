<?php
/*
 * 7-27 咨询师的当天缺课学生
*/
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

// 咨询师所属分校区的班级缺课学生，所有咨询consultID>0都能看到今天缺课
$consult = addslashes($_REQUEST['consult']); //userId
$today = date('Y-m-d');

// 1.先从系统取得当前咨询师的分校区schoolsubID（企业号只记录学校schoolID）
//$schoolID = $_REQUEST['schoolID']; 
$sql = "SELECT schoolsubID From `ghjy_consult` Where userId='$consult'";
$result = mysql_query($sql);
$row = mysql_fetch_array($result);

$schoolsubID = $row['schoolsubID'];

// 2.只读取该分校区的班级迟到学生
$sql = "SELECT a.*,b.studentName,b.gender,b.phone,b.grade,c.title    
	From `ghjy_class_course` a 
	Join `ghjy_student` b On a.studentID=b.studentID 
	Join `ghjy_class` c On a.classID=c.classID 
	WHERE a.flag=0 And a.schoolsubID=$schoolsubID And 
	DATE_FORMAT(a.beginTime,'%Y-%m-%d')='$today' 
	Order By a.classID ";   
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