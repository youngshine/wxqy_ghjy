

<?php
/*log
 *16-07-22 更新学生资料，来自公众号学生分配给咨询师
endlog */
	header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
	header('Access-Control-Allow-Origin: *'); // 跨域问题
	//header('Access-Control-Allow-Headers: X-Requested-With');

	require_once('db/database_connection.php');
	
	$studentID = $_REQUEST['studentID'];
	$consultID = $_REQUEST['consultID']; //归属咨询师

	$query = "UPDATE `ghjy_student` SET consultID=$consultID  
		WHERE studentID = $studentID ";
	$result = mysql_query($query);
		
	if($result){
		echo json_encode(array(
	        "success" => true,
	        "message" => "修改成功"
	    ));
	}else{
		echo json_encode(array(
	        "success" => false,
	        "message" => "修改失败",
	    ));
	}

?>
