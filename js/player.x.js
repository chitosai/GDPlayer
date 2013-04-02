// 全局参设置
var GLOBAL_CONFIG = {
    'debug'             : true, // 是否开启DEBUG模式
    'update_delay'      : 100,  // 更新弹幕池的间隔
    'fps'               : 30,   // 渲染帧数
    'danmaku_life_time' : 5000, // 弹幕显示时间
    'opacity'           : 1,    // 全局弹幕透明度
};

function init() {
	// 等待video加载完毕，开始初始化弹幕池
	document.querySelector('video').addEventListener('canplay', function(){
		// 初始化video控制器
		video = new VIDEO( this, document.querySelector('#controller') );
		// 初始化弹幕池
		stage = new STAGE( document.querySelector('#stage'), video );

	    // 绑定点击弹幕舞台切换播放状态
	    document.querySelector('#stage').addEventListener( 'click', function(e) {
	        // 判断点击来自哪里
	        // 如果直接点击svg或播放按钮可以切换播放状态
	        if( e.target.nodeName == 'svg' || e.target.id == 'play-button' ) 
	            video.togglePlay();
	        // 如果点击在文字上可能是想复制之类的
	        else if( e.target.nodeName == 'text' || e.target.nodeName == 'tspan' ) 
	            return false;
	        // 不应该还有其他元素... 
	        else 
	            DEBUG(e.target.nodeName);
	    });
	});

	// 预读弹幕
	var dsl = document.querySelector('#danmaku-source-list');
	DANMAKU.init( dsl.options[dsl.selectedIndex].value );
	// 以及绑定更换弹幕事件
	dsl.addEventListener('change', function() {
		// 保证清理RUNNING_LIST的时候彻底，还是先把视频暂停掉吧...
		video.pause();
		// 重新加载弹幕
		DANMAKU.init( dsl.options[dsl.selectedIndex].value );
	});
}

// 
window.addEventListener('DOMContentLoaded', init);