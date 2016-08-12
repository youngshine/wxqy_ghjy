<?php
// 学校的缴费流水
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

// 学校
$schoolID = $_REQUEST['schoolID'];

$sql = " SELECT a.*,b.studentName   
	From `ghjy_accnt` a 
	Join `ghjy_student` b On a.studentID=b.studentID 
	Where b.schoolID=$schoolID 
	Order by a.created Desc";
    
$result = mysql_query($sql) 
	or die("Invalid query: readAccntList" . mysql_error());

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
		"message" => "企业号读取缴费流水列表成功",
		"data"	  => $query_array
	));
?>