// 全局参设置
var GLOBAL_CONFIG = {
    'debug'             : true, // 是否开启DEBUG模式
    'update_delay'      : 100,  // 更新弹幕池的间隔
    'fps'               : 30,   // 渲染帧数
    'font'              :
		'Simhei, Simsun, Heiti, "MS Mincho", "Meiryo", "Microsoft Yahei", monospace', // 默认字体
    'danmaku_life_time' : 5000, // 弹幕显示时间
    'opacity'           : 1,    // 全局弹幕透明度
    'y_move_duration'   : 200,  // top/bottom弹幕重新排列时移动时间
    'url_dm'            : 'backend/DM.php', // 后台弹幕管理中心
    'secret_key'        : '!@#$%^&*()', // 验证用户身份用的key
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

	// 预读弹幕
	var dsl = document.querySelector('#danmaku-source-list');
	DANMAKU.init( dsl.options[dsl.selectedIndex].value );
	// 绑定更换弹幕事件
	dsl.addEventListener('change', function() {
		// 保证清理RUNNING_LIST的时候彻底，还是先把视频暂停掉吧...
		video.pause();
		// 重新加载弹幕
		DANMAKU.load( dsl.options[dsl.selectedIndex].value );
	});

	// 初始化用户权限
	var ul = document.querySelector('#user-list');
	login(ul.options[ul.selectedIndex].value, 'password');
	// 绑定更换用户身份事件
	ul.addEventListener('change', function() {
		login(ul.options[ul.selectedIndex].value, 'password');
	});
}

// 
window.addEventListener('DOMContentLoaded', init);



////////////////////////////////////////////////////////////////////////////////////////

/*
 * 模拟登录
 *
 */
var login = function( user, password ) {
	var ctime = new Date().getTime();
    setCookie('user', user);
    setCookie('ltime', ctime);
    setCookie('signature', signature(user, password, ctime));
}

/*
 * 生成签名
 *
 */
var signature = function( user, password, ltime ) {
	return CryptoJS.HmacSHA3( user + '^^^' + ltime + '^^^' + password, GLOBAL_CONFIG.secret_key ).toString();
}