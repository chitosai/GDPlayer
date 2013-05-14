// 全部滤镜列表
DANMAKU.FILTERS = {};
// 生效滤镜列表
DANMAKU.filter = [];


/*
 * 绑定滤镜
 *
 */
DANMAKU.applyFilter = function() {
	var gf = document.querySelectorAll('[name="global-filter"]:checked');
	// 清掉现在的所有滤镜
	DANMAKU.filter.empty();

	for( var i = 0; i < gf.length; i++ ) {
		var filter = DANMAKU.FILTERS[gf[i].getAttribute('filter')];
		if( typeof filter == 'function' )
			DANMAKU.filter.push(filter);
	}
}


/* 下面是滤镜实现 --------------------------------------------------------------------------
 */

/*
 * 让窗口中央的弹幕不透明度降低的滤镜
 *
 */
DANMAKU.FILTERS.opacity = function( danmaku ) {
	// 对高级弹幕无效
	if( danmaku.mode > 6 ) return;

	// 备份正常的不透明度
	if( typeof danmaku._opacity == 'undefined' )
		danmaku._opacity = danmaku.opacity;

	// 在屏幕中间25%~75%的位置时生效
	if( (danmaku.x + danmaku.width)/stage.width > .35 && danmaku.x/stage.width < .75 ) {
		if( danmaku.opacity == danmaku._opacity ) {
			danmaku.opacity = danmaku._opacity * .5;
			danmaku.dom.style.opacity = danmaku.opacity;
		}
	} else {
		if( danmaku.opacity != danmaku._opacity ) {
			danmaku.opacity = danmaku._opacity;
			danmaku.dom.style.opacity = danmaku.opacity;
		}
	}
}


/*
 * 让窗口中央的弹幕加速的滤镜
 *
 */
DANMAKU.FILTERS.speed = function( danmaku ) {
	// 仅对滚动弹幕有效
	if( danmaku.mode != 1 && danmaku.mode != 6 ) return;

	// 备份正常速度
	if( typeof danmaku._speed == 'undefined' )
		danmaku._speed = danmaku.speed;

	// 在屏幕中间35%~75%的位置时生效
	if( (danmaku.x + danmaku.width)/stage.width > .35 && danmaku.x/stage.width < .75 ) {
		if( danmaku.speed == danmaku._speed ) {
			danmaku.speed = danmaku._speed * 2;
		}
	} else {
		if( danmaku.speed != danmaku._speed ) {
			danmaku.speed = danmaku._speed;
		}
	}
}