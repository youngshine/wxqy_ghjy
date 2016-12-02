<?php
// 某个学校的教师不知作业（班级＋一对多）
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

$schoolID = $_REQUEST['schoolID']; // 
//$classjxtType = $_REQUEST['classjxtType'];
$userId = addslashes($_REQUEST['userId']);

// 教师userId
$sql = " SELECT a.classhomeworkID As hwID,a.created,a.photos,a.keypoint,
		b.teacherName,'大小班' As hwType    
	From `ghjy_class_homework` a 
	Join `ghjy_teacher` b On a.userId=b.userId  
	Where a.schoolID=$schoolID 
	Union All 
	SELECT c.one2nhomeworkID As hwID,c.created,c.photos,c.keypoint,
		d.teacherName,'一对N' As hwType    
	From `ghjy_one2n_homework` c 
	Join `ghjy_teacher` d On c.userId=d.userId  
	Where c.schoolID=$schoolID 
	Order By created Desc ";
 
$result = mysql_query($sql) 
	or die("Invalid query: readHomework by union" . mysql_error());

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
	"message" => "校长读取教师布置作业记录成功",
	"data"	  => $query_array
));

?>