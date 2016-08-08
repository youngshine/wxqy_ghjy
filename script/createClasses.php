<?php
/*
 * 校长新增班级
*/
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

$title = addslashes($_REQUEST['title']); 
$hour = $_REQUEST['hour']; 
$amount = $_REQUEST['amount']; 
$classType = $_REQUEST['classType']; 
$weekday = $_REQUEST['weekday'];
$timespan = $_REQUEST['timespan'];
$teacherID = $_REQUEST['teacherID'];
$schoolID = $_REQUEST['schoolID']; // 学校
//$beginDate = $arr->beginDate;

$query = "INSERT INTO `ghjy_class` 
	(title,hour,amount,weekday,timespan,classType,schoolID) 
	VALUES('$title',$hour,$amount,'$weekday','$timespan',
		'$classType',$schoolID)";
$result = mysql_query($query) 
	or die("Invalid query: create classes" . mysql_error());
	
if($result){
	$id = mysql_insert_id(); 	
	echo json_encode(array(
        "success" => true,
        "message" => "创建班级成功",
		"data"    => array("classID" => $id)
    ));
}else{
	echo json_encode(array(
        "success" => false,
        "message" => "创建班级失败",
    ));
}

?>
