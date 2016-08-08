<?php
/*
 * 7-27 全校学生
*/
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

$schoolID = addslashes($_REQUEST['schoolID']); //userId

$sql = "SELECT a.*,b.fullname    
	From `ghjy_student` a 
	Join `ghjy_school_sub` b On a.schoolsubID=b.schoolsubID 
	WHERE a.schoolID=$schoolID ";   
$result = mysql_query($sql) 
	or die("Invalid query: readStudentBySchool " . mysql_error());

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
	"message" => "读取全校学生成功",
	"data"	  => $query_array
));

?>