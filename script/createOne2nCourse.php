<?php
/* 
 * 新增一对N开始上课课时 course，多个学生数组
 */

header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

// 传递过来的是二维数组(全部学生)，循环
$now = date("Y-m-d G:i:s" );
$courseNo = addslashes($_REQUEST['courseNo']); //课时的唯一标志，一个课时有多条学生记录
$teacherID = $_REQUEST['teacherID']; 
$timely = addslashes($_REQUEST['timely']);
	
$arrStudent = ( $_REQUEST['arrStudent'] );  //不能addslashes，否则无法数组
$arrStudent = json_decode($arrStudent); //decode($a,true)

// 批量循环添加
if(is_array($arrStudent)){ 
	foreach($arrStudent as $rec){
		$sql = "INSERT INTO `ghjy_one2n_course`
		(courseNo,teacherID,timely,studentID,flag,beginTime,kclistID,one2nstudentID) 
		VALUES('$courseNo',$teacherID,'$timely',$rec->studentID,$rec->flag,'$now',
			$rec->kclistID,$rec->one2nstudentID)";
		$result = mysql_query($sql) 
			or die("Invalid query: createOne2nCourse" . mysql_error());
	}
}

//$id = mysql_insert_id(); 
	
echo json_encode(array(
    "success" => true,
    "message" => "创建一对N上课课时成功",
	"data"    => array("courseNo" => $courseNo)
));
  
?>
