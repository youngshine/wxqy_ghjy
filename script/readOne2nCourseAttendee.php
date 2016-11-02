<?php
// 读取一对N上课课时courseNo的学生考勤明细 
// DATA_FORMAT(datetime,format) to 日期
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

// 课时，按照日期分组。一个班级一天不会上2次？？
//$beginDate = $_REQUEST['beginDate'];
//$teacherID = $_REQUEST['teacherID'];
// $timely
$courseNo = $_REQUEST['courseNo'];

$sql = " SELECT a.*,b.studentName,b.wxID,b.phone,
	c.schoolsubID,c.fullname As schoolsub      
	From `ghjy_one2n_course` a 
	Join `ghjy_student` b On a.studentID=b.studentID 
	Join `ghjy_school_sub` c On b.schoolsubID=c.schoolsubID 
	Where a.courseNo = '$courseNo' ";
$result = mysql_query($sql) 
	or die("Invalid query: readOne2nCourseAttendee" . mysql_error());

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
	"message" => "读取一对N出勤学生成功",
	"data"	  => $query_array
));

?>