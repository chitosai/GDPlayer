/*
 * 弹幕类 ("▔□▔)")
 * 
 */
var DANMAKU_LIST = []; // 全部弹幕队列
var RUNNING_LIST = []; // 正在屏幕上显示的弹幕队列
var DANMAKU_LAST_POS  = 0;
var DANMAKU_LAST_TIME = 0;
var DANMAKU_POOL = {'scroll': [], 'top': [], 'bottom': [], 'reverse': []}; // 弹幕池


/*
 * 创建一个弹幕实例
 *
 */
var DANMAKU = function( opt, time ) {
    // 由设置传入的参数
    this.text    = opt['text'];
    this.stime   = opt['stime'];
    this.size    = opt['size'];
    this.color   = opt['color'];
    this.mode    = opt['mode'];
    this.date    = opt['date'];
    this.hash    = opt['hash'];
    this.opacity = opt['opacityFrom'] ? opt['opacityFrom'] : GLOBAL_CONFIG.opacity;
    this.font    = opt['font'] ? opt['font'] : 'Simhei, Simsun, Heiti, "MS Mincho", "Meiryo", "Microsoft Yahei", monospace';
    this.ctime   = time;

    // 尺寸和位置会在setPosition中设置
    this.width = 0;
    this.height = 0;
    this.x = 0;
    this.y = 0;

    // 这是top/bottom弹幕消失的时候剩余弹幕重新定位用的
    this.toY = 0;
    this.ySpeed = 8;

    // 生成SVG TEXT NODE
    this.node = stage.svg
                     .text(this.text)
                     .fill(this.color)
                     .font({
                        'family'  : this.font,
                        'size'    : this.size,
                        'opacity' : this.opacity,
                     });

    // 为这条弹幕分配坐标
    this.setPosition();
    // 将弹幕放置到初始位置上
    this.node.move(this.x, this.y)
    // 加入RUNNING_LIST
    RUNNING_LIST.push(this);

    // 在弹幕列表中给这条弹幕加个激活状态
    document.querySelector('#d' + this.hash).className = 'active';
}

/*
 * 设置弹幕位置
 * 
 */
DANMAKU.prototype.setPosition = function() {
    this.height = parseInt(this.node.node.getBBox().height);
    this.width = parseInt(this.node.node.getBBox().width);
    this.speed = (stage.width + this.width) / GLOBAL_CONFIG.danmaku_life_time;
    // 根据情况来
    switch( this.mode ) {
        case 1 : // 正向滚动弹幕初始时放在屏幕右侧以外
                this.x = stage.width;
                break;
        case 4 :
        case 5 : // 顶部/底部固定弹幕居中
                this.x = (stage.width - this.width)/2;
                break;
        case 6 : // 逆向弹幕放在屏幕左侧以外
                this.x = -this.width;
                break;

    }

    // 为这条弹幕分配Y轴坐标
    switch( this.mode ) {
        case 1 : ret = this.ScrollDanmaku( DANMAKU_POOL['scroll'], 0 ); break;
        case 4 : ret = this.BottomDanmaku( DANMAKU_POOL['bottom'], 0 ); break;
        case 5 : ret = this.TopDanmaku( DANMAKU_POOL['top'], 0 ); break;
        case 6 : ret = this.ReverseDanmaku( DANMAKU_POOL['reverse'], 0 ); break;
    }
}

/*
 * 弹幕实例每帧的逻辑运算
 *
 */
DANMAKU.prototype.frame = function( time ) {
    var time_passed = time - this.ctime;
    // 检查弹幕生存时间是否结束
    // 因为弹幕并不是都会移动的，所以只有用生存时间来检测越界
    if( time_passed > GLOBAL_CONFIG.danmaku_life_time ) {
        this.remove();
    }

    // 根据弹幕类别来决定action
    switch( this.mode ) {
        case 1 : // 水平移动
                this.x = this.speed * (GLOBAL_CONFIG.danmaku_life_time - time_passed) - this.width; 
                this.node.move(this.x, this.y); 
                break;
        case 4 : // bottom弹幕有一条消失时把其余弹幕向下移动，顶到边界
                if( this.y < this.toY ) { 
                    // 向下移动
                    this.y += this.ySpeed;
                    // 检查是否越界
                    if( this.y > this.toY ) this.y = this.toY;
                    // 移动SVG TEXT NODE 
                    this.node.y( this.y );
                } 
                break;
        case 5 : // top弹幕和bottom相反
                if( this.y > this.toY ) { 
                    // 向下移动
                    this.y -= this.ySpeed;
                    // 检查是否越界
                    if( this.y < this.toY ) this.y = this.toY;
                    // 移动SVG TEXT NODE 
                    this.node.y( this.y );
                } 
                break;
        case 6 : // 逆向弹幕的水平移动方向与1相反
                this.x = this.speed * time_passed - this.width; 
                this.node.move(this.x, this.y); 
                break;
    }
}

/*
 * 弹幕越界删除
 *
 */
DANMAKU.prototype.remove = function() {
    // 移除SVG TEXT NODE
    this.node.remove();
    // 从弹幕池中移除
    this.removeFromDanmakuLayer();
    // 从正在显示队列中移除
    RUNNING_LIST.remove(this);
    // 去除弹幕列表中这条弹幕的激活状态
    document.querySelector('#d' + this.hash).className = '';
}


/////////////////////////////////////////////////////////////////////////////////
// 下面是静态方法

/*
 * 初始化弹幕池
 * 
 */
DANMAKU.init = function( danmaku_xml_url ) {
    // 清空当前弹幕池
    DANMAKU.clear();
    // 读取弹幕文件
    DANMAKU.load( danmaku_xml_url );
}

/*
 * 销毁弹幕池
 *
 */
DANMAKU.clear = function() {
    // 让整个运行列表中的实例全部执行自毁函数
    while( RUNNING_LIST.length ) {
        RUNNING_LIST[0].remove();
    }

    // 然后清除对原有列表的引用，初始化弹幕池的各种状态
    DANMAKU_LIST = [];
    RUNNING_LIST = [];
    DANMAKU_LAST_POS  = 0;
    DANMAKU_LAST_TIME = 0; // LAST_TIME也必须清0，这样才会触发DANMAKU.t2p重新查找弹幕位置
    DANMAKU_POOL = {'scroll': [], 'top': [], 'bottom': [], 'reverse': []};
}


/*
 * 读取弹幕文件
 * 
 */
DANMAKU.load = function( url, callback ) {
    // 准备ajax
    var xmlhttp = null;
    if (window.XMLHttpRequest){
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    
    xmlhttp.onreadystatechange = function() {
        if ( xmlhttp.readyState == 4 ) {
            // 正常返回数据
            if( xmlhttp.status == 200 ) {
                // 处理返回值
                var xmldoc = null;
                if( navigator.appName == 'Microsoft Internet Explorer' ){
                    xmldoc = new ActiveXObject( "Microsoft.XMLDOM" );
                    xmldoc.async = false;
                    xmldoc.loadXML( xmlhttp.responseText );
                } else {
                    xmldoc = xmlhttp.responseXML;
                }

                // 检查xml是否为空
                if( !xmldoc || !validateXML(xmldoc) ) {
                    console.log( '弹幕文件无效' );
                    return;
                }

                // 把返回值传给DANMAKU.parse解析成object
                DANMAKU_LIST = DANMAKU.parse(xmldoc);
                // 弹幕队列按时间排序
                DANMAKU_LIST.sort(function(a,b){
                    // 优先根据弹幕显示时间排序
                    if(a.stime > b.stime) return 2;
                    else if(a.stime < b.stime) return -2;
                    // 弹幕时间相同则根据发布时间排序
                    else {
                        if(a.date > b.date) return 1;
                        else if(a.date < b.date) return -1;
                        else return 0;
                    }
                });
            } else {
                // ajax出错的情况
                // 看起来404之类的错误捕捉不到，那就拉倒吧
            }

            // 获取完成后把弹幕显示到弹幕列表中
            DANMAKU.list();
        }
    }

    // 发起ajax
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

/*
 * 将文本数据解析成object
 * 
 */
DANMAKU.parse = function( xmlDoc ) {
    // 将十进制颜色数值填充到6位
    function fillRGB(string){
        while(string.length < 6){
            string = "0" + string;
        }
        return string;
    }
    // 每条弹幕在xml文件中是一个d节点
    var elems = xmlDoc.getElementsByTagName('d');
    var tlist = [];
    // 遍历弹幕列表
    for(var i = 0; i < elems.length; i++ ){
        if( elems[i].getAttribute('p') != null ) {
            // 每个节点的innerHTML是弹幕文本
            var text = elems[i].childNodes[0].nodeValue;
            // p属性上的是弹幕参数，以,分隔
            var opt = elems[i].getAttribute('p').split(',');
            var obj = {};
            obj.stime = Math.round( parseFloat(opt[0]*1000) );
            obj.size = parseInt(opt[2]);
            obj.color = "#" + fillRGB( parseInt(opt[3]).toString(16) );
            obj.mode = parseInt(opt[1]);
            obj.date = parseInt(opt[4]);
            obj.pool = parseInt(opt[5]);
            obj.hash = opt[6];
            obj.border = false;

            // mode=7是特殊弹幕，其他弹幕的格式是统一的
            if( obj.mode < 7 ) {
                // \n前面是一个全角空格，不然完全空白的行无法显示出来
                obj.text = text.replace(/(\/n|\\n|\n|\r\n)/g, "　\n");
            } else {
                if( obj.mode == 7 ) {
                    try {
                        // bili的高级弹幕里会带tab，要把这个去掉不然没法解析
                        text = text.replace(/\t/g, "\\t");
                        var adv = JSON.parse(text);
                        obj.shadow = true;
                        obj.x = adv[0];
                        obj.y = adv[1];
                        obj.text = adv[4].replace(/(\/n|\\n|\n|\r\n)/g, "　\n");
                        obj.rZ = 0;
                        obj.rY = 0;
                        if( adv.length >= 7 ) {
                            obj.rZ = adv[5];
                            obj.rY = adv[6];
                        }
                        obj.movable = false;
                        if( adv.length >= 11 ) {
                            obj.movable = true;
                            obj.toX = adv[7];
                            obj.toY = adv[8];
                            obj.moveDuration = 500;
                            obj.moveDelay = 0;
                            if( adv[9] != '' )
                                obj.moveDuration = adv[9];
                            if( adv[10] != '' )
                                obj.moveDelay = adv[10];
                            if( adv.length > 11 ) {
                                obj.shadow = adv[11] == 'false' ? false : true;
                                if( adv[12] != null )
                                    obj.font = adv[12];
                            }
                        }
                        obj.duration = 2500;
                        if( adv[3] < 12 ) {
                            obj.duration = adv[3] * 1000;
                        }
                        obj.opacityFrom = 1;
                        obj.opacityTo = 1;
                        var tmp = adv[2].split('-');
                        if( tmp != null && tmp.length > 1 ) {
                            obj.alphaFrom = parseFloat(tmp[0]);
                            obj.alphaTo = parseFloat(tmp[1]);
                        }
                    } catch(e) {
                        // 唔……解析不出来
                        console.log('无法解析高级弹幕的JSON:', e, e.message);
                        console.log(text);
                    }
                }
            }
            tlist.push(obj);
        }
    }
    return tlist;
}

/*
 * 将当前弹幕显示到弹幕列表
 *
 */
DANMAKU.list = function() {
    // 把全局变量引用到本地
    var danmaku_list = DANMAKU_LIST,
        danmaku_list_dom = document.querySelector('#danmaku-list'),
        len = danmaku_list.length,
        ul = document.createElement('ul');

    // 清空老的弹幕列表
    while( danmaku_list_dom.firstChild )
        danmaku_list_dom.removeChild( danmaku_list_dom.firstChild );

    // 写入新的
    for( var i = 0; i < len; i++ ) {
        // span里显示弹幕时间
        var li = document.createElement('li'),
            span = document.createElement('span'),
            text = document.createTextNode(danmaku_list[i]['text']);
        
        span.innerHTML = s2t(danmaku_list[i]['stime']);

        li.setAttribute('id', 'd' + danmaku_list[i]['hash']);
        li.appendChild(span);
        li.appendChild(text);
        ul.appendChild(li);
    }

    // 把dl加入到页面里
    danmaku_list_dom.appendChild(ul);
}


/*
 * 二分查找某个时间点在弹幕列表中位置
 * (time to position)
 * 
 */
DANMAKU.t2p = function( time ) {
    return DANMAKU_LIST.bsearch( time, function(a,b) {
        if(a < b.stime) return -1
        else if(a > b.stime) return 1;
        else return 0;
    });
}

/*
 * 检验弹幕是否正确
 * 
 */
DANMAKU.validate = function( danmaku ) {
    return true;
}

/*
 * 将弹幕插入队列
 * 
 */
DANMAKU.insert = function ( danmaku ) {

}

/*
 * 检查是否有弹幕需要加入弹幕池
 * 
 */
DANMAKU.update = function( time ) {
    // 用本地变量引用全局变量
    var len = DANMAKU_LIST.length,
        pos = DANMAKU_LAST_POS,
        lt  = DANMAKU_LAST_TIME;

    // 人工控制播放进度（点击进度条）时重新计算DANMAKU_LAST_POS
    if( pos >= len || Math.abs(lt - time) >= 2000 ) {
        pos = DANMAKU.t2p(time);
        lt = time;
        if( pos >= len )
            return;
    } else lt = time;

    // 从DANMAKU_LAST_POS开始向后遍历弹幕列表
    // 显示时间到的就生成实例
    for( ; pos < len; pos++ ) {
        if( DANMAKU_LIST[pos]['stime'] <= time ) {
            new DANMAKU( DANMAKU_LIST[pos], time );
        }
        else break;
    }
    
    // 把本地变量的值写回全局变量
    DANMAKU_LAST_POS  = pos;
    DANMAKU_LAST_TIME = lt
}

/*
 * 每帧的运算和显示
 * 
 */
DANMAKU.frame = function( time ) {
    // 遍历弹幕池
    // 执行效率好像有点低，必须动态获取RUNNING_LIST的长度..
    for( var i = 0; i < RUNNING_LIST.length; i++ ) {
            // 调用每个弹幕实例的运算函数，自己去计算下一帧的状态
            RUNNING_LIST[i].frame( time );
    }
}