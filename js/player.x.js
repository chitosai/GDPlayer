// 全局参设置
var GLOBAL_CONFIG = {
    'debug'             : false, // 是否开启DEBUG模式
    'hide_danmaku'      : false, // 是否开启隐藏弹幕模式
    'update_delay'      : 100,  // 更新弹幕池的间隔
    'fps'               : 30,   // 渲染帧数
    'font'              :
		'Simhei, Simsun, Heiti, "MS Mincho", "Meiryo", "Microsoft Yahei", monospace', // 默认字体
    'danmaku_life_time' : 5000, // 弹幕显示时间
    'opacity'           : 1,    // 全局弹幕透明度
    'y_move_duration'   : 200,  // top/bottom弹幕重新排列时移动时间
    'dm'                : 'ws://localhost:12306/', // 后台弹幕管理中心
    'ignore_dm'         : false, // 是否允许忽略弹幕管理
    'block_danmaku'     : 'backend/block.php?did=', // 屏蔽弹幕
    'block_user'        : 'backend/block.php?uid=', // 屏蔽用户
};

function init() {
	// 等待video加载完毕，开始初始化弹幕池
	document.querySelector('video').addEventListener('canplay', function() {
		// 初始化video控制器
		video = new VIDEO( this, document.querySelector('#controller') );
		// 暂时关掉声音
		video.video.volume = 0;
		// 初始化弹幕池
		stage = new STAGE( document.querySelector('#stage'), video );
	});

	// 初始化用户权限
	var ul = document.querySelector('#user-list');
	// 演示状态，密码什么的就算了直接传"password"
	login(ul.options[ul.selectedIndex].value, 'password');
	// 绑定更换用户身份事件
	ul.addEventListener('change', function() {
		login(ul.options[ul.selectedIndex].value, 'password');
	});

	// 右键菜单
	cm = document.querySelector('#contextmenu');
}

// 
window.addEventListener('DOMContentLoaded', init);



////////////////////////////////////////////////////////////////////////////////////////

/*
 * 模拟登录
 *
 */
var login = function( user, password ) {
    setCookie('user', user);
    setCookie('signature', signature(user, password));
}

/*
 * 生成签名
 *
 */
var signature = function( user, password ) {
	return CryptoJS.SHA256( user + '^^^' + password ).toString();
}