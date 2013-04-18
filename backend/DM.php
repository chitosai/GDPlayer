<?php
// Danmaku Manager
include 'config.php';
include 'MySQL.php';

/*
 * 要求增加新弹幕
 *
 */
function InsertDanmaku( $user, $stime, $mode, $text, $size, $color ) {
	// 补充数据
	$date = time();
	// 弹幕id
	$id = substr(md5( $user . $date . $mode ), 0, 8);
	// 弹幕发布者hash
	$hash = substr($_COOKIE['signature'], 0, 8);

	// 然后开始执行插入


	// 把填充的数据返回给客户端
	echo '[OK]' . $id . ',' . $hash . ',' . $date;
}

/*
 * 确认请求是否有效
 *
 */
function validateRequest() {
	// 检查是否是要求发送弹幕
	if( !isset($_GET['mode']) )
		return 'FOR PANDARIA!!!!';

	// 验证身份
	if( isset($_COOKIE['user']) && isset($_COOKIE['signature']) ) {
		$db = new mysql();
		$sig = $db->get('user', 'signature', 
			"user='" . mysql_real_escape_string($_COOKIE['user']) . "'");
		if( $sig === $_COOKIE['signature'] )
			return true;
		else
			return '用户名或密码错误';
	} else
		return '需要登录';
}

$login_state = validateRequest();
if( $login_state !== true ) echo $login_state;
else InsertDanmaku( $_COOKIE['user'], $_GET['stime'], $_GET['mode'], $_GET['text'], $_GET['size'], $_GET['color']);