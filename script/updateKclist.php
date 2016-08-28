<?php
/*log
 *16-08-11 修改大小班课程
endlog */
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

$kclistID = $_REQUEST['kclistID']; // update unique
//$kcType = addslashes($_REQUEST['kcType']);  
$title = addslashes($_REQUEST['title']); 
$kmType = addslashes($_REQUEST['kmType']); 
$unitprice = $_REQUEST['unitprice']; //大小班0，一对一才有
$hour = $_REQUEST['hour'];
$amount = $_REQUEST['amount'];
$note = addslashes($_REQUEST['note']); 
//$schoolID = $_REQUEST['schoolID'];

$query = "UPDATE `ghjy_kclist` SET 
	title = '$title',kmType = '$kmType',unitprice = $unitprice,
	hour = $hour,amount = $amount,note = '$note'
	WHERE kclistID = $kclistID ";
$result = mysql_query($query) or die("Invalid query: updatekclist" . mysql_error());
	
if($result){
	echo json_encode(array(
        "success" => true,
        "message" => "修改课程成功",
    ));
}else{
	echo json_encode(array(
        "success" => false,
        "message" => "修改课程失败",
    ));
}

?>
