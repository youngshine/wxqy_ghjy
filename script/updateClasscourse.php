

<?php
/*log
 *16-07-22 更新学生上课信息，大小班当天上课补点名
endlog */
	header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
	header('Access-Control-Allow-Origin: *'); // 跨域问题
	//header('Access-Control-Allow-Headers: X-Requested-With');

	require_once('db/database_connection.php');
	
	$classcourseID = $_REQUEST['classcourseID'];
	$beginTime = date('Y-m-d G:i:s');
	$flag = 2; //补签到点名 2-迟到

	$query = "UPDATE `ghjy_class_course` 
		SET flag = $flag,beginTime = '$beginTime'    
		WHERE classcourseID = $classcourseID ";
	$result = mysql_query($query);
		
	if($result){
		echo json_encode(array(
	        "success" => true,
	        "message" => "补签到成功"
	    ));
	}else{
		echo json_encode(array(
	        "success" => false,
	        "message" => "更新失败",
	    ));
	}

?>
