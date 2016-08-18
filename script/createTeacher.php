<?php
/*
 * 添加教师 两个步骤（还是先插入数据库）
 * 1 先处理企业号通讯录？判断不重复
 * 2 第一步成功后，插入数据库系统
*/
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

$department = 1; //企业号通讯录根部门，必须弄一个 schoolID与department的对应表
$position = '教师'; //用于企业号 职务
$tag = 3; //用于企业号标签，咨询2，教师3

$userId = addslashes($_REQUEST['userId']); //自动生成企业号唯一账号，同时插入企业号通讯录，
$teacherName = addslashes($_REQUEST['userName']); //统一，企业通讯录
$gender = addslashes($_REQUEST['gender']); 
$phone = addslashes($_REQUEST['phone']); 
$subjectID = $_REQUEST['subjectID'];
$schoolID = $_REQUEST['schoolID']; //归属学校

$sql = "INSERT INTO `ghjy_teacher` (teacherName,gender,phone,subjectID,schoolID,userId) 
	VALUES('$teacherName','$gender','$phone',$subjectID,$schoolID,'$userId')";
$result = mysql_query($sql) or die("Invalid query: createTeacher" . mysql_error());

if($result){
	$id = mysql_insert_id(); 	
	echo json_encode(array(
        "success" => true,
        "message" => "创建教师成功",
		"data"    => array("teacherID" => $id)
    ));
}else{
	echo json_encode(array(
        "success" => false,
        "message" => "创建失败", //账号、电话重复
    ));
}

?>
