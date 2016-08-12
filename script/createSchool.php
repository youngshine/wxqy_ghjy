<?php
/*
 * 总部添加联盟学校
*/
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

$schoolName = addslashes($_REQUEST['schoolName']); 
$addr = addslashes($_REQUEST['addr']);
$phone = addslashes($_REQUEST['phone']);

$sql = "INSERT INTO `ghjy_school` (schoolName,addr,phone) 
	VALUES('$schoolName','$addr','$phone')";
$result = mysql_query($sql) or die("Invalid query: createSchool" . mysql_error());

if($result){
	$id = mysql_insert_id(); 	
	echo json_encode(array(
        "success" => true,
        "message" => "添加联盟学校成功",
		"data"    => array("schoolID" => $id)
    ));
}else{
	echo json_encode(array(
        "success" => false,
        "message" => "添加联盟学校失败",
    ));
}

?>
