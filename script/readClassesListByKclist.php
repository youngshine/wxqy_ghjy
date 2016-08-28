<?php
// 某个课程的分班
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

$kclistID = $_REQUEST['kclistID']; 

$sql = " SELECT a.*,b.fullname  
	From `ghjy_class` a 
	Join `ghjy_school_sub` b On b.schoolsubID=a.schoolsubID 
	Where a.kclistID = $kclistID 
	Order by a.created Desc ";
    
$result = mysql_query($sql) 
	or die("Invalid query: readClassList by kclistID" . mysql_error());

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
	"message" => "读取课程分班class成功",
	"data"	  => $query_array
));

?>