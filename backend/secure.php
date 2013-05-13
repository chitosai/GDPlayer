<?php

/*
 * 检查用户身份
 * 身份无误的话返回$user数据
 * 
 */
function check_login($params) {
	if( isset($params['user']) && isset($params['signature']) ) {
		// 取用户数据
		$db = new mysql();
		$_user = $db->select(array(
			'table' => 'user',
			'condition' => "user='" . mysql_real_escape_string($params['user']) . "'"
		));
		if( !count($_user) ) {
			return '用户名不存在';
		}
		$user = $_user[0]['user'];

		// 验证身份
		if( $user['signature'] !== $params['signature'] )
			return '用户名或密码错误';

		return $user;
	} else {
		return '需要登录';
	}
}
