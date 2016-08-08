<?php
/*
 * 校长新增一对一课程（单价）
*/
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

$title = addslashes($_REQUEST['title']); 
$unitprice = $_REQUEST['unitprice']; 
$schoolID = $_REQUEST['schoolID']; // 学校

$query = "INSERT INTO `ghjy_pricelist` (title,unitprice,schoolID) 
	VALUES('$title',$unitprice,$schoolID)";
$result = mysql_query($query) 
	or die("Invalid query: create pricelist 1to1" . mysql_error());
	
if($result){
	$id = mysql_insert_id(); 	
	echo json_encode(array(
        "success" => true,
        "message" => "创建一对一课程成功",
		"data"    => array("pricelistID" => $id)
    ));
}else{
	echo json_encode(array(
        "success" => false,
        "message" => "创建失败",
    ));
}

?>
