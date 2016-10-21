<?php
/*
 * 日常收支记账
*/
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

$schoolID = $_REQUEST['schoolID']; //企业号自定义schoolID

$sql = " SELECT ledgerDate,sum(amt_in) AS amt_in,sum(amt_out) AS amt_out 
	From `ghjy_ledger` 
	WHERE schoolID = $schoolID 
	Group By substr(ledgerDate,0,7) 
	Order By ledgerDate ";	 
$result = mysql_query($sql) 
	or die("Invalid query: readLedgerList " . mysql_error());

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
	"message" => "读取收支月汇总列表成功",
	"data"	  => $query_array
));

?>