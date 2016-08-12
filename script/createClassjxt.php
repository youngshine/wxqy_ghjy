<?php
/*
 * 教师或咨询，添加家校通记录
*/
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

$classID = $_REQUEST['classID']; 
$photos = addslashes($_REQUEST['photos']); 
$userId = addslashes($_REQUEST['userId']); 
$classjxtType = $_REQUEST['classjxtType'];

$sql = "INSERT INTO `ghjy_class_jxt` (classID,photos,classjxtType,userId) 
	VALUES($classID,'$photos','$classjxtType','$userId')";
$result = mysql_query($sql) or die("Invalid query: createClassjxt by teacher or consult" . mysql_error());

if($result){
	$id = mysql_insert_id(); 	
	echo json_encode(array(
        "success" => true,
        "message" => "创建家校通记录成功",
		"data"    => array("classjxtID" => $id)
    ));
}else{
	echo json_encode(array(
        "success" => false,
        "message" => "创建失败",
    ));
}

?>
