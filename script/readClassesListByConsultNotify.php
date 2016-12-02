<?php
// 企业号userId： 读取校区咨询师今天上课的大小班级
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

// 咨询师userId
$consult = addslashes($_REQUEST['consultID']); //userId
//$today = date('Y-m-d');
$tomorrow = date("Y-m-d",strtotime("+1 days"));
$weekarray = array("日","一","二","三","四","五","六");
$weekday =  "周".$weekarray[date("w",strtotime($tomorrow))];

// 可能还没有指定教师，所以left join teacher
$sql = " SELECT a.*,b.userId,c.teacherName,c.userId As teacherUserId,
	d.fullname As schoolsub,'$weekday' As weekday   
	From `ghjy_class` a 
	Join `ghjy_consult` b On a.consultID=b.consultID 
	Left Join `ghjy_teacher` c On a.teacherId=c.teacherID 
	Join `ghjy_school_sub` d On a.schoolsubID=d.schoolsubID 
	Where a.timely_list Like '%$weekday%' And b.userId = '$consult' ";
    
$result = mysql_query($sql) 
	or die("Invalid query: readClassList by consult notify" . mysql_error());

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
	"message" => "企业号读取今天班级列表成功",
	"data"	  => $query_array
));

?>