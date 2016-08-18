<?php
// 某个学校的家校通记录（教师，咨询）
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

$schoolID = $_REQUEST['schoolID']; // 
$userId = addslashes($_REQUEST['userId']);
$classjxtType = $_REQUEST['classjxtType'];

/* 教师userId
$sql = " SELECT a.*,b.title,c.teacherName,c.userId 
	From `ghjy_class_jxt` a 
	Join `ghjy_class` b On a.classID=b.classID 
	Join `ghjy_teacher` c On b.teacherID=c.teacherID
	Where c.userId='$teacher' ";  */
if($classjxtType=='咨询' And $userId ==''){
	$sql = " SELECT a.*,b.title,c.consultName As name    
		From `ghjy_class_jxt` a 
		Join `ghjy_class` b On a.classID=b.classID 
		Join `ghjy_consult` c On a.userID=c.userID
		Where a.classjxtType='$classjxtType' And a.schoolID=$schoolID  
		Order by a.created Desc";
}else if($classjxtType=='教师' And $userId ==''){
	$sql = " SELECT a.*,b.title,c.teacherName As name   
		From `ghjy_class_jxt` a 
		Join `ghjy_class` b On a.classID=b.classID 
		Join `ghjy_teacher` c On a.userID=c.userID
		Where a.classjxtType='$classjxtType' And a.schoolID=$schoolID   
		Order by a.created Desc";
}else{ //某个人教师或咨询师的
	$sql = " SELECT a.*,b.title     
		From `ghjy_class_jxt` a 
		Join `ghjy_class` b On a.classID=b.classID 
		Where a.userId='$userId' And a.classjxtType='$classjxtType' 
		Order by a.created Desc";
}

/* all for 校长
if($userId=='' And $classjxtType==''){
	$sql = " SELECT a.*,b.title  
		From `ghjy_class_jxt` a 
		Join `ghjy_class` b On a.classID=b.classID 
		Order by a.created Desc";
}    */
 
$result = mysql_query($sql) 
	or die("Invalid query: readClassJxtList by all" . mysql_error());

	$query_array = array();
	$i = 0;
	//Iterate all Select
	while($row = mysql_fetch_array($result))
	{
		array_push($query_array,$row);
		$i++;
	}

	echo json_encode(array(
		"success" => true,
		"message" => "企业号读取家校联络记录成功",
		"data"	  => $query_array
	));
?>