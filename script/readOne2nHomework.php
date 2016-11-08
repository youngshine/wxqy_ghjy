<?php
// 某个教师的一对N上课要点和作业推送的历史记录
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

$schoolID = $_REQUEST['schoolID']; // 
$userId = addslashes($_REQUEST['userId']);

if($userId ==''){ //全部作业，校长看
	$sql = " SELECT a.*,b.teacherName As name   
		From `ghjy_one2n_homework` a 
		Join `ghjy_teacher` b On a.userID=b.userID
		Where a.schoolID=$schoolID   
		Order by a.created Desc";
}else{ //某个教师的
	$sql = " SELECT a.*     
		From `ghjy_one2n_homework` a 
		Where a.userId='$userId' 
		Order by a.created Desc";
}
 
$result = mysql_query($sql) 
	or die("Invalid query: readOne2nHomework" . mysql_error());

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
	"message" => "读取教师一对N上课内容作业推送历史记录成功",
	"data"	  => $query_array
));

?>