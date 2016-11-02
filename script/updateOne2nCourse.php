<?php
/* 
 * 一对N上课，补点名
 */

header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

$one2ncourseID = $_REQUEST['one2ncourseID'];
$beginTime = date('Y-m-d G:i ');
$flag = 2; //补签到点名 2-迟到

$query = "UPDATE `ghjy_one2n_course` 
	SET flag = $flag,beginTime = '$beginTime'    
	WHERE one2ncourseID = $one2ncourseID ";
$result = mysql_query($query);
	
if($result){
	echo json_encode(array(
        "success" => true,
        "message" => "补签到成功"
    ));
}else{
	echo json_encode(array(
        "success" => false,
        "message" => "更新失败",
    ));
}
  
?>
