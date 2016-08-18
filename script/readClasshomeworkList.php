<?php
// 某个教师的上课要点和作业，推送给家长）
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

$schoolID = $_REQUEST['schoolID']; // 
$userId = addslashes($_REQUEST['userId']);

if($userId ==''){ //全部作业，校长看
	$sql = " SELECT a.*,b.title,c.teacherName As name   
		From `ghjy_class_homework` a 
		Join `ghjy_class` b On a.classID=b.classID 
		Join `ghjy_teacher` c On a.userID=c.userID
		Where a.schoolID=$schoolID   
		Order by a.created Desc";
}else{ //某个教师的
	$sql = " SELECT a.*,b.title     
		From `ghjy_class_homework` a 
		Join `ghjy_class` b On a.classID=b.classID 
		Where a.userId='$userId' 
		Order by a.created Desc";
}
 
$result = mysql_query($sql) 
	or die("Invalid query: readClasshomeworkList by all" . mysql_error());

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
	"message" => "读取教师上课内容作业成功",
	"data"	  => $query_array
));

?>