<?php
/*
 * 添加某个加盟学校的分校区（至少一个）
*/
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

$schoolID = $_REQUEST['schoolID']; //归属学校
$fullname = addslashes($_REQUEST['fullname']); 
$addr = addslashes($_REQUEST['addr']);
$phone = addslashes($_REQUEST['phone']);

$sql = "INSERT INTO `ghjy_school_sub` (fullname,addr,phone,schoolID) 
	VALUES('$fullname','$addr','$phone',$schoolID)";
$result = mysql_query($sql) or die("Invalid query: createSchoolsub" . mysql_error());

if($result){
	$id = mysql_insert_id(); 	
	echo json_encode(array(
        "success" => true,
        "message" => "添加分校区成功",
		"data"    => array("schoolsubID" => $id)
    ));
}else{
	echo json_encode(array(
        "success" => false,
        "message" => "添加分校区失败",
    ));
}

?>
