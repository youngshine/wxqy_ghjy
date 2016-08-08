<?php
/*
  * 来自公众号绑定学生，未分配咨询师 consultID=0 本校区schoolID
*/
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

$schoolID = $_REQUEST['schoolID'];
$consultID = 0;

$query = "SELECT a.*,b.schoolsubID,b.fullname  
	From `ghjy_student` a
	Join `ghjy_school_sub` b On a.schoolsubID=b.schoolsubID 
	Where a.consultID=0 And a.schoolID = $schoolID
	Order By a.created Desc ";
    
    $result = mysql_query($query) 
		or die("Invalid query: readStudentListByRegister" . mysql_error());

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
		"message" => "读取未归属咨询师0的学生成功",
		"data"	  => $query_array
	));
	
?>