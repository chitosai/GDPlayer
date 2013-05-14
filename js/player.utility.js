/*
 * 扩展原生array
 * 
**/
// 从array中删除object
Array.prototype.remove = function( obj ) {
    for(var a = 0; a < this.length; a++)
        if( this[a] == obj ) {
            this.splice(a,1);
            return;
        }
};
// 二分查找，返回的是what在array中的位置{int}
Array.prototype.bsearch = function( what, how ) {
    if( this.length == 0 ) return 0;
    if( how(what,this[0]) < 0 ) return 0;
    if( how(what,this[this.length - 1]) >= 0 ) return this.length;
    var low = 0;
    var i = 0;
    var count = 0;
    var high = this.length - 1;
    while( low <= high ) {
        i = Math.floor( (high + low + 1)/2 );
        count++;
        if( how(what, this[i-1]) >= 0 && how(what, this[i]) < 0 ) {
            return i;
        } else if( how(what, this[i-1]) < 0 ) {
            high = i-1;
        } else if( how(what, this[i]) >= 0 ) {
            low = i;
        } else
            console.error('Program Error in bsearch');

        if( count > 1500 ) 
            console.error('Too many run cycles.');
    }
    return -1;
};
// 二分插入
Array.prototype.binsert = function(what,how) {
    this.splice( this.bsearch(what, how), 0, what );
};
// 清空
Array.prototype.empty = function() {
    while( this.length ) 
        this.pop();
}


/*
 * 去掉一个class
 *
 */
function removeClass( node, classname ) {
    node.className = node.className.replace( new RegExp('\\b' + classname + '\\b'), '' );
}




/*
 * 检查XML
 *
 */
var h3OK = false;
function validateXML(xmlDoc) {
    h3OK = false;
    if ( xmlDoc.getElementsByTagName("parsererror").length > 0 )
        checkXML( xmlDoc.getElementsByTagName("parsererror")[0] );
    if( h3OK ) return false;
    else return true;
}
function checkXML(node) {
    var ename = node.nodeName;
    if( ename == "h3" ) {
        if ( h3OK ) {
            return;
        }
        h3OK = true;
    }
    if( ename == '#text' ) {
        MSG( node.nodeValue );
    }
    var l = node.childNodes.length;
    for( var i = 0; i < l; i++ ) {
        // 递归遍历下去
        checkXML( node.childNodes[i] );
    }
}





/*
 * 把秒数转为时间
 * (second to time)
 */
var s2t = function(s) {
    s /= 1000;
    var hour = parseInt( s / 3600 ),
        minute = parseInt( s / 60 ),
        second = parseInt( s % 60 );
    if( hour < 10 ) hour = '0' + hour;
    if( minute < 10 ) minute = '0' + minute;
    if( second < 10 ) second = '0' + second;
    return hour + ':' + minute + ':' + second;
}





/* 
 * 把object序列化为string
 *
 */
var serialize = function(obj) {
    var str = '';
    for( key in obj ) {
        str += encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]) + '&';
    }
    return str;
}
// 相反
var unserialize = function(str) {
    var array = str.split('&');
    if( array.length < 2 ) return false;

    var obj = {};
    for( var i = 0; i < array.length; i++ ) {
        var pair = array[i].split('=');
        if( pair.length < 2 ) continue;

        obj[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
    }
    return obj;
}





/*
 * cookie
 *
 */
var getCookie = function(c_name) {
    if( document.cookie.length > 0 ) {
        var c_start = document.cookie.indexOf( c_name + "=" );
        if ( c_start != -1 ) { 
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf( ";" , c_start );
            if ( c_end == -1 ) c_end = document.cookie.length;
            return unescape(document.cookie.substring(c_start,c_end));
        }
    }
    return ""
}
function setCookie(c_name, value, expiredays) {
    var exdate = new Date();
    exdate.setDate( exdate.getDate() + expiredays )
    document.cookie = c_name + "=" + escape(value) 
        + ( (expiredays == null) ? "" : ";expires=" + exdate.toGMTString() );
}




/*
 * 把10进制颜色代码转换为16进制颜色代码
 * （DEC TO HEX）
 */
function d2h(DEC) {
    var HEX = parseInt(DEC).toString(16);
    while( HEX.length < 6 ) {
        HEX = '0' + HEX;
    }
    return '#' + HEX;
}
// 这个相反
function h2d(HEX) {
    return HEX.toString(10);
}






/*
 * 显示给用户的消息
 * 
 */
var MSG = function() {
    console.log(arguments);
    
    msg = document.querySelector('#message');
    msg.innerHTML = arguments[0];
    msg.className = 'active';
    if( typeof msg_count != 'undefined' && msg_count != 0 ) clearTimeout(msg_count);
    msg_count = setTimeout(function(){
        msg.className = '';
        msg_count = 0;
    }, 3000);
}





/*
 * 调试用的消息
 * 
 */
function DEBUG(msg) {
    if( arguments.length == 1 ) {
        if( typeof msg == 'string' || typeof msg == 'number' ) {
            // 判断是否是文本或数字，是的话加上时间戳
            var date = new Date(),
                time = '[' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + ']';
            console.log( time + msg );
        } else 
            // 其他不要乱来
            console.log(msg);
    } else {
        // 多个参数就全部输出吧
        console.log(arguments);
        return;
    }

    
}





/*
 * 初始化弹幕舞台
 * 
 */
var STAGE = function(stage, video) {
    // 根据video的尺寸设定舞台大小
    this.top    = video.top,
    this.left   = video.left,
    this.width  = video.width,
    this.height = video.height;

    // 让弹幕舞台覆盖于video上方
    stage.style.position = 'absolute';
    stage.style.zIndex = 99999;
    stage.style.top = this.top + 'px';
    stage.style.left = this.left + 'px';
    stage.style.width = this.width + 'px';
    stage.style.height = this.height + 'px';

    // 保留对stage的引用
    this.dom = stage;
}


/*
 * video管理类 (・∀・)
 * 
 */
var TIME = 0; // 当前播放时间
var isPlaying = false;
var VIDEO = function( video, controller ) {
    var self = this;

    // 保存对DOM结构的引用
    this.video = video;
    this.controller = controller;
    this.timeline = controller.childNodes[1];
    this.playButton = document.querySelector('#play-button');
    this.toggleButton = document.querySelector('#toggle-button');

    // 变量
    this.paused = true;
    this.len = this.video.duration;
    this.update = 0; // 检查更新，包括视频进度条和新弹幕插入
    this.frame = 0;  // 每帧的计算与显示
    self.timer = 0; // 专门用来更新播放进度



    /*
     * 初始化事件绑定！ ***************************************************************
     *
     */ 

    // 弹幕发送条里的播放按钮
    this.toggleButton.addEventListener('click', function() { self.togglePlay(); });

    // 绑定发送新弹幕事件
    document.querySelector('#do-send-danmaku').addEventListener('click', DANMAKU.send);
    document.querySelector('#danmaku-text').addEventListener('keydown', function(e) {
        // 检查是否是回车
        if( e.keyCode == 13 ) DANMAKU.send();
        return false;
    });

    // 绑定点击弹幕舞台切换播放状态
    document.querySelector('#stage').addEventListener( 'click', function(e) {
        // 首先，如果右键菜单处于展开状态，那么先收起菜单
        if( cm.style.display == 'block' ) {
            removeClass( document.querySelector('.danmaku.hover'), 'hover');
            cm.style.display = 'none';
        }
        // 判断点击来自哪里
        // 如果直接点击stage或播放按钮可以切换播放状态
        else if( e.target.id == 'stage' || e.target.id == 'play-button' ) 
            self.togglePlay();
        // 如果点击在文字上可能是想复制之类的，不过只在暂停状态下有效
        // 正常播放时点击文字也是暂停效果
        else if(  e.target.nodeName == 'DIV' ) {
            if( isPlaying ) 
                self.togglePlay();
            else 
                return false;
        } 
        // 不应该还有其他元素... 
        else 
            MSG(e.target.nodeName);
    });

    // 更换loading图标为播放图标
    document.querySelector('#loading').style.display = 'none';
    document.querySelector('#play-button').className = 'initial';
    // 为了不出现播放按钮从左下角移动进来的动画，等300ms后再加transition
    setTimeout(function(){
        document.querySelector('#play-button').style.transition = 'all .3s ease';
    }, 300);

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

    // 增加弹幕内容过滤器
    document.querySelector('#apply-filter').addEventListener('click', DANMAKU.addContentFilter);

    // 全局滤镜
    var gf = document.querySelectorAll('[name="global-filter"]');
    for( var i = 0; i < gf.length; i++ ) {
        gf[i].addEventListener('change', DANMAKU.applyFilter);
    }

    /* ******************************************************************************
     */

    
    /*
     * 获取播放进度
     * 
     */
    // 播放中要不断获取当前播放时间
    this.startTimer = function() {
        // 新弹幕加入弹幕池的更新间隔
        self.update = setInterval( function() {
            // 检查是否有新弹幕需要加入弹幕池的循环
            DANMAKU.update();
        }, GLOBAL_CONFIG.update_delay );
        // 正在显示的弹幕的每帧
        self.frame = setInterval( function() {
            // 当前弹幕池中的弹幕更新
            DANMAKU.frame();
        }, 1000/GLOBAL_CONFIG.fps );
        // 更新当前播放时间专用
        self.timer = setInterval( function() {
            TIME = self.video.currentTime * 1000;
            // 更新播放进度条
            self.timeline.style.width = self.video.currentTime * 100 / self.len  + '%';
            // 在进度条上显示当前播放时间点
            self.controller.setAttribute('title', s2t(TIME));
        }, 10);
    };
    // 清除timer
    this.stopTimer = function() {
        clearInterval( self.update );
        clearInterval( self.frame );
        clearInterval( self.timer );
    };

    /*
     * 与播放控制相关的方法
     * 
     */
    // 暂停视屏播放
    this.pause = function() {
        self.video.pause();
    };
    // 播放
    this.play = function() {
        self.video.play();
    };
    // 变更播放状态
    this.togglePlay = function() {
        if( !self.video.paused ) {
            self.pause();
        } else {
            self.play();
        }
    };

    /*
     * 获取video元素本身的数据
     * 
     */
    this.width  = this.video.offsetWidth;
    this.height = this.video.offsetHeight;
    this.top    = this.video.offsetTop;
    this.left   = this.video.offsetLeft;

    /*
     * video播放状态绑定事件
     * 
     */
    // 播放
    this.video.addEventListener('play', function() {
        // 全局播放状态标志
        isPlaying = true;
        
        self.startTimer();
        // 隐藏播放按钮
        self.playButton.className = '';
        // 下方的播放按钮切换为暂停图标
        self.toggleButton.innerHTML = '■';
        // 取消弹幕的悬浮高亮状态
        DANMAKU.hoverHighLight(false);
    });
    // 播放完毕
    this.video.addEventListener('ended', function() {
        // 全局播放状态标志
        isPlaying = false;
        
        self.stopTimer();
        // 显示播放按钮
        self.playButton.className = 'paused';
        // 下方的播放按钮切换为播放图标
        self.toggleButton.innerHTML = '▶';
    });
    // 用户暂停
    this.video.addEventListener('pause', function() {
        // 全局播放状态标志
        isPlaying = false;

        self.stopTimer();
        // 显示播放按钮
        self.playButton.className = 'paused';
        // 下方的播放按钮切换为播放图标
        self.toggleButton.innerHTML = '▶';
        // 给所有弹幕增加debug，允许高亮
        DANMAKU.hoverHighLight(true);
    });
}