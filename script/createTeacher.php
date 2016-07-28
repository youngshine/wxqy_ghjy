<?php
/*
 * 添加教师
*/
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

$schoolID = $_REQUEST['schoolID']; //归属学校
$username = addslashes($_REQUEST['username']); 
$subjectID = $_REQUEST['subjectID'];
//$gender = $_REQUEST['gender'];

$sql = "INSERT INTO `ghjy_teacher` (teacherName,subjectID,schoolID) 
	VALUES('$username',$subjectID,$schoolID)";
$result = mysql_query($sql) or die("Invalid query: createTeacher" . mysql_error());

if($result){
	$id = mysql_insert_id(); 	
	echo json_encode(array(
        "success" => true,
        "message" => "创建成功",
		"data"    => array("teacherID" => $id)
    ));
}else{
	echo json_encode(array(
        "success" => false,
        "message" => "创建失败",
    ));
}

?>
