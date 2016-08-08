<?php
/*
  * 读取某个学校的分校区 至少都有一个if any
*/
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

$schoolID = $_REQUEST['schoolID'];

$query = "SELECT * From `ghjy_school_sub` Where schoolID=$schoolID ";
    
$result = mysql_query($query) 
	or die("Invalid query: readSchoolsubList" . mysql_error());

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
	"message" => "读取分校区成功",
	"data"	  => $query_array
));
	
?>