<?php
// 学校的缴费流水，每日汇总 group
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

// 学校
$schoolID = $_REQUEST['schoolID'];
/*
$sql = " SELECT accntDate,sum(amount) AS total_amount,
	(SELECT sum(af.amount) From `ghjy_accnt_fee` af 
		WHERE af.accntID=a.accntID ) AS total_done      
	From `ghjy_accnt` a  
	Where schoolID=$schoolID And accntType != '退费退班' 
	Group By accntDate 
	Order by accntDate Desc";
*/
$sql = " SELECT accntType,accntDate,sum(amount) AS total_amount,
	(SELECT sum(af.amount) From `ghjy_accnt_fee` af 
		WHERE af.accntID=a.accntID ) AS total_done      
	From `ghjy_accnt` a  
	Where schoolID=$schoolID 
	Group By accntDate,accntType 
	Order by accntDate Desc,accntType";
	    
$result = mysql_query($sql) 
	or die("Invalid query: readAccntList group by daily" . mysql_error());

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
		"message" => "企业号读取缴费流水列表成功",
		"data"	  => $query_array
	));
?>