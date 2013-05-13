<?php
// Danmaku Manager
include 'config.php';
include 'MySQL.php';
include 'secure.php';
include 'websocket.class.php';

/*
 * 要求增加新弹幕
 *
 */
function InsertDanmaku( $params ) {
	$db = new mysql();
	// 补充数据
	$date = time();
	// 弹幕id
	$id = substr(md5( $params['user'] . $date . $params['mode'] ), 0, 8);
	// 弹幕发布者hash
	$hash = substr( $params['signature'], 0, 8 );
	// 更新最后发送弹幕时间
	$db->execute("UPDATE `user` SET `lastpost` = NOW() WHERE `user` = '" . $params['user'] . "'");
	// 把填充的数据返回给客户端
	$params['date'] = $date;
	$params['id'] = $id;
	$params['hash'] = $hash;

	// 生成字符串
	$str = http_build_query($params);
	return '[OK]' . $str;
}



/*
 * 确认请求是否有效
 *
 */
function validateRequest($params) {
	// 检查身份
	$user = check_login($params);
	if( gettype($user) === string )
		return $user;

	// 检查是否是要求发送弹幕
	if( !isset($params['mode']) )
		return 'FOR PANDARIA!!!!';

	// 检查发送间隔
	date_default_timezone_set('Asia/Shanghai');
	if( time() - strtotime($user['lastpost']) < POST_COOLDOWN ) {
		return '说话太快了！';
	}

	// 验权
	if( intval($user['privilege']) < intval($params['mode']) )
		return '权限不足';

	return true;
}

/*-------------------------------------------------------------------------------*/
class DanmakuManager extends WebSocket {
  function process($user, $req) {
  	$return = '-1';
  	// 解析参数
  	parse_str($req, $params);
  	$state = validateRequest($params);
	if( $state !== true ) {
		$return = $state;
	} else {
		$return = InsertDanmaku($params);
	}
    $this->push($return);
  }
}

$server = new DanmakuManager("localhost", 12306);