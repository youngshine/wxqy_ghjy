

<?php
/*log
 *16-07-22 下课，endtime，所有学生统一填写下课时间
endlog */
	header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
	header('Access-Control-Allow-Origin: *'); // 跨域问题
	//header('Access-Control-Allow-Headers: X-Requested-With');

	require_once('db/database_connection.php');
	
	// classID + beginDate 唯一 , classcourseID没有用处？
	//$classcourseID = $_REQUEST['classcourseID'];
	$endTime = date('Y-m-d G:i:s');
	$beginDate = $_REQUEST['beginDate'];
	$classID = $_REQUEST['classID'];

	$sql = "UPDATE `ghjy_class_course` 
		SET endTime = '$endTime'    
		WHERE classID=$classID And 
		DATE_FORMAT(beginTime,'%Y-%m-%d') = '$beginDate' ";
	$result = mysql_query($sql);
		
	if($result){
		echo json_encode(array(
	        "success" => true,
	        "message" => "下课成功"
	    ));
	}else{
		echo json_encode(array(
	        "success" => false,
	        "message" => "更新失败",
			"data"    => $beginDate
	    ));
	}

?>
