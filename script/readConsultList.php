<?php
/*
  * 读取学校咨询师，按分校区分组
*/
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

$schoolID = $_REQUEST['schoolID'];

$query = "SELECT a.*,b.fullname 
	From `ghjy_consult` a 
	Join `ghjy_school_sub` b On a.schoolsubID=b.schoolsubID 
	Where a.schoolID=$schoolID 
	Order By a.schoolsubID ";
    
$result = mysql_query($query) 
	or die("Invalid query: readConsultList" . mysql_error());

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
	"message" => "读取咨询师列表成功",
	"data"	  => $query_array
));
	
?>