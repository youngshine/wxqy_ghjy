<?php
// 读取大小班上课课时列表（group by beginDate(time))
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

$classID = $_REQUEST['classID'];

$sql = " SELECT classID,beginTime,endTime,flag,
	DATE_FORMAT(beginTime,'%Y-%m-%d') As courseDate 
	From `ghjy_class_course` 
	Where classID = $classID 
	Group By DATE_FORMAT(beginTime,'%Y-%m-%d') ";
    
$result = mysql_query($sql) 
	or die("Invalid query: readClasscourse" . mysql_error());

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
		"message" => "读取班级上课课时成功",
		"data"	  => $query_array
	));
?>