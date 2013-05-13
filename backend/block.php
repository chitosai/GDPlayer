<?php
// 屏蔽用
include 'config.php';
include 'MySQL.php';
include 'secure.php';

function block_user($uid) {

}

function block_danmaku($did) {

}

// 处理请求
parse_str( $_SERVER['QUERY_STRING'], $params );
// 验权
$user = check_login($params);
if( gettype($user) === string )
	die($user);
else {
	if(isset($_GET['get-block-list'])) {
		get_block_list($user);
	} else if(isset($_GET['did'])) {
		block_danmaku($_GET['did']);
	} else if(isset($_GET['uid'])) {
		block_user($_GET['uid']);
	}
}
