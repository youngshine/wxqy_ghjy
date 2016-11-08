<?php
/*
 * 一对N教师: 上课要点＋作业，推送给家长
*/
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

$studentID_list = $_REQUEST['studentID_list']; 
$keypoint = addslashes($_REQUEST['keypoint']);
$photos = addslashes($_REQUEST['photos']); 
$userId = addslashes($_REQUEST['userId']); //教师
$schoolID = $_REQUEST['schoolID'];

$sql = "INSERT INTO `ghjy_one2n_homework` 
	(studentID_list,photos,keypoint,userId,schoolID) 
	VALUES('$studentID_list','$photos','$keypoint','$userId',$schoolID)";
$result = mysql_query($sql) Or 
	die("Invalid query: createOne2Homework" . mysql_error());

if($result){
	$id = mysql_insert_id(); 	
	echo json_encode(array(
        "success" => true,
        "message" => "创建一对N上课内容及作业成功",
		"data"    => array("one2nhomeworkID" => $id)
    ));
}else{
	echo json_encode(array(
        "success" => false,
        "message" => "创建失败",
    ));
}

?>
