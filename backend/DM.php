<?php
// Danmaku Manager
include 'config.php';
include 'MySQL.php';

/*
 * 要求增加新弹幕
 *
 */
function InsertDanmaku( $user, $stime, $mode, $text, $size, $color ) {
	$db = new mysql();
	// 补充数据
	$date = time();
	// 弹幕id
	$id = substr(md5( $user . $date . $mode ), 0, 8);
	// 弹幕发布者hash
	$hash = substr($_COOKIE['signature'], 0, 8);
	// 更新最后发送弹幕时间
	$db->execute("UPDATE `user` SET `lastpost` = NOW() WHERE `user` = '" . $user . "'");
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

	// 检查身份
	if( isset($_COOKIE['user']) && isset($_COOKIE['signature']) ) {
		// 取用户数据
		$db = new mysql();
		$_user = $db->select(array(
			'table' => 'user',
			'condition' => "user='" . mysql_real_escape_string($_COOKIE['user']) . "'"
		));
		if( !count($_user) ) {
			return '用户名不存在';
		}
		$user = $_user[0]['user'];

		// 验证身份
		if( $user['signature'] !== $_COOKIE['signature'] )
			return '用户名或密码错误';

		// 检查发送间隔
		date_default_timezone_set('Asia/Shanghai');
		if( time() - strtotime($user['lastpost']) < POST_COOLDOWN ) {
			return '说话太快了！';
		}

		// 验权
		if( intval($user['privilege']) < intval($_GET['mode']) )
			return '权限不足';

		return true;
	} else
		return '需要登录';
}

$login_state = validateRequest();
if( $login_state !== true ) {
	echo $login_state;
} else {
	InsertDanmaku( $_COOKIE['user'], $_GET['stime'], $_GET['mode'], $_GET['text'], $_GET['size'], $_GET['color']);
}