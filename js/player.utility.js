/*
 * 扩展原生array
 * 
**/
// 从array中删除object
Array.prototype.remove = function( obj ){
    for(var a = 0; a < this.length; a++)
        if( this[a] == obj ) {
            this.splice(a,1);
            return;
        }
};
// 二分查找，返回的是what在array中的位置{int}
Array.prototype.bsearch = function( what, how ){
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
Array.prototype.binsert = function(what,how){
    this.splice( this.bsearch(what, how), 0, what );
};


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
        console.log( node.nodeValue );
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
 * DEBUG
 * 
 */
var DEBUG = function() {
    if(GLOBAL_CONFIG.debug)
        console.log(arguments);
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

    // 生成svg
    this.svg = SVG( stage );
    this.svg.size( this.width, this.height );
}


/*
 * video管理类 (・∀・)
 * 
 */
var VIDEO = function( video, controller ) {
    var self = this;

    // 保存对DOM结构的引用
    this.video = video;
    this.controller = controller.childNodes[1];

    // 变量
    this.paused = true;
    this.len = this.video.duration;
    this.update = 0; // 检查更新，包括视频进度条和新弹幕插入
    this.frame = 0;  // 每帧的计算与显示
    self.precentage = 0; // 专门用来更新进度条的计时器
    
    // 初始化进度条总长度
    this.controller.style.animationDuration = this.len + 's';
    this.controller.style.webkitAnimationDuration = this.len + 's';
    
    /*
     * 获取播放进度
     * 
     */
    // 播放中要不断获取当前播放时间
    this.startTimer = function() {
        // 新弹幕加入弹幕池的更新间隔
        self.update = setInterval( function() {
            // 检查是否有新弹幕需要加入弹幕池的循环
            DANMAKU.update( self.video.currentTime * 1000 );
        }, GLOBAL_CONFIG.update_delay );
        // 正在显示的弹幕的每帧
        self.frame = setInterval( function() {
            // 当前弹幕池中的弹幕更新
            DANMAKU.frame( self.video.currentTime * 1000 );
        }, 1000/GLOBAL_CONFIG.fps );
    };
    // 清除timer
    this.stopTimer = function() {
        clearInterval( self.update );
        clearInterval( self.frame );
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
    this.togglePlay = function( callback ) {
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
        self.startTimer();
        // 让进度条继续前进
        self.controller.style.animationPlayState = 'running';
        self.controller.style.webkitAnimationPlayState = 'running';
    });
    // 播放完毕
    this.video.addEventListener('ended', function() {
        self.stopTimer();
    });
    // 用户暂停
    this.video.addEventListener('pause', function() {
        self.stopTimer();
        // 让进度条停下来
        self.controller.style.animationPlayState = 'paused';
        self.controller.style.webkitAnimationPlayState = 'paused';
    });
}