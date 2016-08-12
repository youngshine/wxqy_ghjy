<?php
// 读取某个一对一课程的购买学生
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

$pricelistID = $_REQUEST['pricelistID'];

$sql = " SELECT a.*,b.studentName,b.wxID,b.phone,c.schoolsubID,c.fullname    
	From `ghjy_student-study` a 
	Join `ghjy_student` b On a.studentID=b.studentID 
	Join `ghjy_school_sub` c On b.schoolsubID=c.schoolsubID 
	Join `ghjy_accnt` d On a.accntID=d.accntID 
	WHERE d.pricelistID = $pricelistID 
	Group By a.studentID";  
    
$result = mysql_query($sql) 
	or die("Invalid query: readStudent by pricelist" . mysql_error());

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
		"message" => "读取一对一课程学生成功",
		"data"	  => $query_array
	));
?>