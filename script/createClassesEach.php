<?php
/*
 * 每个学生的精彩瞬间
*/
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

$classID = $_REQUEST['classID']; 
$studentID = $_REQUEST['studentID']; 
$note = addslashes($_REQUEST['note']);
$photos = addslashes($_REQUEST['photos']); 
$userId = addslashes($_REQUEST['userId']); 
$schoolID = $_REQUEST['schoolID'];

$sql = "INSERT INTO `ghjy_class_each` 
	(classID,studentID,photos,note,userId,schoolID) 
	VALUES($classID,$studentID,'$photos','$note','$userId',$schoolID)";
$result = mysql_query($sql) or die("Invalid query: createClassEach" . mysql_error());

if($result){
	$id = mysql_insert_id(); 	
	echo json_encode(array(
        "success" => true,
        "message" => "创建学生个人精彩瞬间成功",
		"data"    => array("classeachID" => $id)
    ));
}else{
	echo json_encode(array(
        "success" => false,
        "message" => "创建失败",
    ));
}

?>
