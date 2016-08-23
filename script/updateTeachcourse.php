<?php
/* 
 * 课时下课
 */

header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

$courseID = $_REQUEST['courseID'];
$hour = $_REQUEST['hour'];
$now = date('ymdhis');

$query = "UPDATE `ghjy_teacher_course` SET 
	endTime='$now',hour=$hour
 Where courseID=$courseID ";
$result = mysql_query($query) 
    or die("Invalid query: updateCourseID endtime" . mysql_error());

echo json_encode(array(
    "success" => true,
    "message" => "一对一下课了",
	"data"    => $hour
));
  
?>
