<?php
/* 
 * 新增一对一开始上课课时 course
 */

	header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
	header('Access-Control-Allow-Origin: *'); // 跨域问题
	//header('Access-Control-Allow-Headers: X-Requested-With');

	require_once('db/database_connection.php');

    $studentstudyID = $_REQUEST['studentstudyID'];
	$now = date('ymdhis');

	$query = "INSERT INTO `ghjy_teacher_course` (studentstudyID,beginTime) 
		VALUES ($studentstudyID, '$now' ) ";
    $result = mysql_query($query) 
        or die("Invalid query: createCourse" . mysql_error());
    
	$id = mysql_insert_id(); 
		
	echo json_encode(array(
        "success" => true,
        "message" => "创建一对一成功",
		"data"    => array("courseId" => $id)
    ));
  
?>
