<?php
/* 
 * 一对N下课，自定义课时hour, 所有学生统一填写下课时间endTime
 */
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

$now = date('Y-m-d G:i:s');
$hour = $_REQUEST['hour'];
$courseNo = addslashes( $_REQUEST['courseNo'] ); //unique

$sql = "UPDATE `ghjy_one2n_course` 
	SET hour = $hour, endTime = '$now'    
	WHERE courseNo = '$courseNo' ";
$result = mysql_query($sql);
	
if($result){
	echo json_encode(array(
        "success" => true,
        "message" => "一对多下课成功"
    ));
}else{
	echo json_encode(array(
        "success" => false,
        "message" => "下课失败",
		"data"    => $beginDate
    ));
}

?>
