

<?php
/*log
 *16-08-11 修改班级
endlog */
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

$classID = $_REQUEST['classID']; // update unique
$title = addslashes($_REQUEST['title']); 
$classType = addslashes($_REQUEST['classType']); 
$beginDate = addslashes($_REQUEST['beginDate']); 
$persons = addslashes($_REQUEST['persons']); 
$weekday = addslashes($_REQUEST['weekday']); 
$timespan = addslashes($_REQUEST['timespan']); 
$hour = $_REQUEST['hour'];
$amount = $_REQUEST['amount'];
$teacherID = $_REQUEST['teacherID'];
$schoolsubID = $_REQUEST['schoolsubID'];

$query = "UPDATE `ghjy_class` SET 
	title = '$title',classType = '$classType',persons = '$persons',
    weekday = '$weekday',timespan = '$timespan',
	hour = $hour,amount = $amount,
	teacherID = $teacherID,schoolsubID = $schoolsubID
	WHERE classID = $classID ";
$result = mysql_query($query);
	
if($result){
	echo json_encode(array(
        "success" => true,
        "message" => "修改班级成功",
    ));
}else{
	echo json_encode(array(
        "success" => false,
        "message" => "修改失败",
    ));
}

?>
