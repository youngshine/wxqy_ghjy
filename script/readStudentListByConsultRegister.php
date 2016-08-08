<?php
/*
 * 7-27 我的来自微信学生，可能报读大小班，也可能报读一对一
*/
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

$consult = addslashes($_REQUEST['consultID']); //userId
$today = date("Y-m-d"); // 最近一个月

$sql = "SELECT a.*,b.consultName   
	From `ghjy_student` a 
	Join `ghjy_consult` b On a.consultID=b.consultID 
	WHERE b.userId = '$consult' And a.wxID != '' 
	Order By a.created Desc ";   
$result = mysql_query($sql) 
	or die("Invalid query: readStudentByConsultRegister " . mysql_error());

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
	"message" => "读取归属我的学生成功",
	"data"	  => $query_array
));

?>