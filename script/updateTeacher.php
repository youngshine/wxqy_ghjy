

<?php
/*log
 *16-08-11 修改教师，userId,手机号不要修改
endlog */
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

$teacherID = $_REQUEST['teacherID']; // update unique
$teacherName = addslashes($_REQUEST['teacherName']); 
$gender = addslashes($_REQUEST['gender']); 
$phone = addslashes($_REQUEST['phone']); 
$subjectID = $_REQUEST['subjectID'];

$query = "UPDATE `ghjy_teacher` SET 
	teacherName = '$teacherName',gender = '$gender',
	phone = '$phone',subjectID = $subjectID
	WHERE teacherID = $teacherID ";
$result = mysql_query($query);
	
if($result){
	echo json_encode(array(
        "success" => true,
        "message" => "修改教师成功",
    ));
}else{
	echo json_encode(array(
        "success" => false,
        "message" => "修改失败",
    ));
}

?>
