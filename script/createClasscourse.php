<?php
/*
 * 大小班上课课时添加：点名
*/
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

// 传递过来的是二维数组(全部学生)，循环
$arrStudent = $_REQUEST['arrStudent']; 
$beginTime = $_REQUEST['beginTime'];
echo is_array($arrStudent);
exit();

if(is_array($arrStudent)){ //批量添加
	foreach($arrStudent as $rec){
		$sql = "INSERT INTO `ghjy_class_course`
		(classID,studentID,flag,beginTime) 
		VALUES($rec->classID,$rec->studentID,$rec->flag,
		'".addslashes($rec->beginTime)."')";
		$result = mysql_query($sql) or die("Invalid query: createClasscourse" . mysql_error());
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
    "message" => "今天点名成功",
	//"data"    => array("consultID" => $id)
));

?>
