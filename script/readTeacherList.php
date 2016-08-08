<?php
/*
  * 读取本校的教师
*/
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

$schoolID = addslashes($_REQUEST['schoolID']);

$query = "SELECT a.*,b.subjectName  
	From `ghjy_teacher` a 
	Join `ghjy_subject` b On a.subjectID=b.subjectID
	Where a.schoolID=$schoolID 
	Order By a.created ";
    
$result = mysql_query($query) 
	or die("Invalid query: readTeacherList" . mysql_error());

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
	"message" => "读取教师列表成功",
	"data"	  => $query_array
));
	
?>