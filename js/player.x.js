// 全局参设置
var GLOBAL_CONFIG = {
    'debug'             : false, // 是否开启DEBUG模式
    'update_delay'      : 100,  // 更新弹幕池的间隔
    'fps'               : 30,   // 渲染帧数
    'font'              :
		'Simhei, Simsun, Heiti, "MS Mincho", "Meiryo", "Microsoft Yahei", monospace', // 默认字体
    'danmaku_life_time' : 5000, // 弹幕显示时间
    'opacity'           : 1,    // 全局弹幕透明度
    'y_move_duration'   : 200,  // top/bottom弹幕重新排列时移动时间
    'dm'                : 'ws://localhost:12345/', // 后台弹幕管理中心
    'ignore_dm'         : false, // 是否允许忽略弹幕管理
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

		// 弹幕发送条里的播放按钮
		document.querySelector('#toggle-button').addEventListener('click', video.togglePlay);

	    // 绑定发送新弹幕事件
	    document.querySelector('#do-send-danmaku').addEventListener('click', DANMAKU.send);
	    document.querySelector('#danmaku-text').addEventListener('keydown', function(e) {
	    	// 检查是否是回车
	    	if( e.keyCode == 13 ) DANMAKU.send();
	    	return false;
	    });
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
	// 演示状态，密码什么的就算了直接传"password"
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