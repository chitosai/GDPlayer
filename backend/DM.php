<?php
// Danmaku Manager

/*
 * 要求增加新弹幕
 *
 */
function InsertDanmaku( $stime, $mode, $text, $size, $color ) {
	// 补充数据
	$date = new Date().getdate();
}

if(isset($_GET['mode'])) {
	InsertDanmaku( $_GET['stime'], $_GET['mode'], $_GET['text'], $_GET['size'], $_GET['color'] );
} else {
	echo 'FOR PANDARIA!!'
}