<?php
/*
 * 教师: 上课要点＋作业，推送给家长
*/
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

$classID = $_REQUEST['classID']; 
$keypoint = addslashes($_REQUEST['keypoint']);
$photos = addslashes($_REQUEST['photos']); 
$userId = addslashes($_REQUEST['userId']); 
$schoolID = $_REQUEST['schoolID'];

$sql = "INSERT INTO `ghjy_class_homework` (classID,photos,keypoint,userId,schoolID) 
	VALUES($classID,'$photos','$keypoint','$userId',$schoolID)";
$result = mysql_query($sql) or die("Invalid query: createClasshomework" . mysql_error());

if($result){
	$id = mysql_insert_id(); 	
	echo json_encode(array(
        "success" => true,
        "message" => "创建上课内容及作业成功",
		"data"    => array("classhomeworkID" => $id)
    ));
}else{
	echo json_encode(array(
        "success" => false,
        "message" => "创建失败",
    ));
}

?>
