<?php
/*
 * 读取某个一对多教师，获得其一对N课程表（预先设定的）timely_list_one2n
 */
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

$teacher = addslashes($_REQUEST['teacher']); //userId

$sql = " SELECT a.*,b.schoolName  
	From ghjy_teacher a 
	Join ghjy_school b On a.schoolID=b.schoolID 
	Where a.userId = '$teacher' ";   
$result = mysql_query($sql) 
	or die("Invalid query: readTeacher timely_one2n" . mysql_error());

$row = mysql_fetch_array($result) or die("Invalid query: row" . mysql_error());
//print_r($row);
		
echo json_encode(array(
	"success" => true,
	"message" => "读取某个教师的一对N课程成功",
	"data"	  => $row
));

?>