

<?php
/*log
 *16-08-11 修改一对一课程
endlog */
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Origin: *'); // 跨域问题
//header('Access-Control-Allow-Headers: X-Requested-With');

require_once('db/database_connection.php');

// classID + beginDate 唯一 , classcourseID没有用处？
$title = addslashes($_REQUEST['title']);
$unitprice = $_REQUEST['unitprice'];
$pricelistID = $_REQUEST['pricelistID'];

$sql = "UPDATE `ghjy_pricelist` 
	SET title = '$title',unitprice = $unitprice     
	WHERE pricelistID = $pricelistID ";
$result = mysql_query($sql);
	
if($result){
	echo json_encode(array(
        "success" => true,
        "message" => "修改课程成功"
    ));
}else{
	echo json_encode(array(
        "success" => false,
        "message" => "更新失败",
    ));
}

?>
