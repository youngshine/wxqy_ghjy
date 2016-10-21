<?php
/*
 * 当天的科目明细
*/
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

$schoolID = $_REQUEST['schoolID']; //企业号自定义schoolID
$date = $_REQUEST['date'];

// a.payment Like '%$payment%' 
$sql = " SELECT * From `ghjy_ledger` 
	WHERE schoolID = $schoolID And ledgerDate = '$date' ";	 
$result = mysql_query($sql) 
	or die("Invalid query: readLedger By Item " . mysql_error());

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
	"message" => "读取日常收支明细成功",
	"data"	  => $query_array
));
	
?>