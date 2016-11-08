<?php
/*
 * oop方式 class , + ajax json跨域（不用jsonp)
 * 读取某个教师teacher某个上课时间timely的一对N学生及其课程, 点名rollcall
 */

header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

$teacher = $_REQUEST['teacher'];
$timely = ''; //$_REQUEST['timely'];
// 不定参数，用数组？？
//$accntID = $_REQUEST['accntID'];

$one2nstudent = new One2nStudent($teacher,$timely);
$data = $one2nstudent->getList();

echo json_encode(array(
	"success" => true,
	"message" => "读取一对N学生列表成功",
	"data"	  => $data
));


class One2nStudent {
  private $timely;
  private $teacher;
  
  //private $query_result; //查询结果集

  public function __construct($teacher,$timely) {
	  $this->teacher = $teacher;
	  $this->timely = $timely;
  }
	
  public function getList() {	  
	  // require_once('db_cfg.php');  
	  //var_dump($this->accntID); 
	  $query = "SELECT a.*,b.studentName,b.wxID,b.gender,b.schoolsubID,
	  	c.userId,c.teacherName,d.fullname AS schoolsub     
		  From `ghjy_one2n_student` a 
	  	  Join `ghjy_student` b On a.studentID=b.studentID 
		  Join `ghjy_teacher` c On a.teacherID=c.teacherID  
		  Join `ghjy_school_sub` d On b.schoolsubID=d.schoolsubID   
		  Where c.userId='$this->teacher' ";  
	  $result = mysql_query($query);

	  mysql_close($conn); 
	  //$this->query_result = mysql_fetch_array($result); //单个记录
	  
		$query_array = array();
		$i = 0;
		//Iterate all Select
		while($row = mysql_fetch_array($result))
		{
			array_push($query_array,$row);
			$i++;
		}
		
		//$this->query_result = $query_array;  
	  return $query_array;
  }
}
	
?>