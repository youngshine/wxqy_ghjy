<?php
/*
 * 大小班上课课时添加：点名
*/
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

// 传递过来的是二维数组(全部学生)，循环
$beginTime = date("Y-m-d G:i" );
$classID = $_REQUEST['classID']; 
$arrStudent = $_REQUEST['arrStudent']; 
$arrStudent = json_decode($arrStudent); //decode($a,true)

// 同个班级classID一天不能点名2次
$sql = "SELECT 1 FROM `ghjy_class_course` 
	Where classID=$classID And 
	DATE_FORMAT(beginTime,'%Y-%m-%d') = '".date('Y-m-d')."'";
$result = mysql_query($sql);
if(mysql_num_rows($result) > 0){
	echo json_encode(array(
	    "success" => false,
	    "message" => "今天重复点名上课",
	));
	exit();
}

// 批量循环添加
if(is_array($arrStudent)){ 
	foreach($arrStudent as $rec){
		$sql = "INSERT INTO `ghjy_class_course`
		(classID,studentID,flag,beginTime) 
		VALUES($rec->classID,$rec->studentID,$rec->flag,
		'".addslashes($beginTime)."')";
		$result = mysql_query($sql) 
			or die("Invalid query: createClasscourse" . mysql_error());
		//if(!$result) ErrorOutput();
	}
}
/*
for($i=0;$i<count($arrStudent);$i++) {
	$classID = $arrStudent[i]=>classID;
	$studentID = $arrStudent[i]=>studentID;
	$flag = $arrStudent[i]=>flag;
	$sql = "INSERT INTO `ghjy_class_course` 
		(classID,studentID,beginTime,flag) 
		VALUES($classID,$studentID,$flag)";		
	$result = mysql_query($sql) 
		or die("Invalid query: createClasscourse" . mysql_error());
} */

//$id = mysql_insert_id(); 	
echo json_encode(array(
    "success" => true,
    "message" => "上课点名成功",
	//"data"    => array("consultID" => $id)
));

?>
