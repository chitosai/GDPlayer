/*
 * 这些方法负责为将要加入弹幕池的弹幕分配坐标
 *
 */

/*
 * 滚动弹幕
 *
 */
DANMAKU.prototype.ScrollDanmaku = function( pool, layer_index ) {
    // 如果还没有创建过这层，则创建
    if( pool.length <= layer_index ) {
        pool.push([]);
    }
    // 获取准备插入的层
    var layer = pool[layer_index];
    // 如果这个层现在还没有弹幕，直接插入
    // 如果有弹幕，则永远从y=0的位置开始检测，确保屏幕空间利用率最大
    // 或者当弹幕高度大于舞台高度的时候，直接丢在y=0的位置
    if( layer.length == 0 || this.ScrollDanmakuVCheck(0, layer) || this.height > stage.height ) {
        this.pushIntoDanmakuLayer( layer );
        this.y = 0;
        this.bottom = this.height;
        this.layer_index = layer_index;
        return;
    } 
    // y=0的位置插不进，就一条条遍历弹幕，尝试插到现有弹幕中间
    for( var i = 0; i < layer.length; i++ ) {
        var y = layer[i].bottom + 1;
        // 如果已经越界了就不要继续试了
        if( y + this.height > stage.height ) {
            break;
        }
        // 普通的情况
        if( this.ScrollDanmakuVCheck(y, layer) ) {
            this.pushIntoDanmakuLayer( layer );
            this.y = y;
            this.bottom = y + this.height;
            this.layer_index = layer_index;
            return;
        }
    }
    // 如果在这层没有找到合适的位置，就继续递归尝试插入更上层
    return this.ScrollDanmaku( pool, layer_index + 1 );
}
/*
 * 滚动弹幕的碰撞检测
 *
 */
DANMAKU.prototype.ScrollDanmakuVCheck = function( y, layer ) {
    var bottom = y + this.height;
    var right = this.x + this.width;
    for( var i = 0; i < layer.length; i++ ) {
        var target = layer[i];
        // 在y轴上没有交界，那肯定是没有碰撞了
        if( target.y > bottom || target.bottom < y )
            continue;
        // 在y轴上有交界，这时要判断x轴是否可能有碰撞
        // 如果x轴一开始就相交了，那肯定没戏了
        if( (target.x + target.width) > this.x ) 
            return false;
        // 如果x轴一开始没相交，那么要计算后发弹幕是否会因为速度快而追上先发弹幕
        // 这里计算的是：如果 {先发弹幕完全离开舞台} 晚于 {后发弹幕的左侧抵达舞台左边界}
        if( getEndTime(target) > getLeftTime(this) )
            return false;
    }
    return true;
}



/*
 * 底部弹幕
 *
 */
DANMAKU.prototype.BottomDanmaku = function( pool, layer_index ) {
    // 如果还没有创建过这层，则创建
    if( pool.length <= layer_index ) {
        pool.push([]);
    }
    // 获取准备插入的层
    var layer = pool[layer_index];
    // 如果这个层现在还没有弹幕，直接插入
    // 底部弹幕，从底边开始插入
    var startY = stage.height - this.height;
    if( layer.length == 0 || this.height > stage.height ) {
        layer.push(this);
        this.y = startY;
        this.toY = this.y;
        this.bottom = stage.height;
        this.layer_index = layer_index;
        return;
    } 
    // 底边插不进，就取最后插入的弹幕，尝试插到其上方
    var target = layer[layer.length-1];
    // 如果最后一条弹幕的上方足够放下当前弹幕就插进去
    if( target.y - this.height > 0 ) {
        layer.push(this);
        this.y = target.y - this.height - 1;
        this.toY = this.y;
        this.bottom = target.y;
        this.layer_index = layer_index;
        return;
    }
    // 如果在这层没有找到合适的位置，就继续递归尝试插入更上层
    return this.BottomDanmaku( pool, layer_index + 1 );
}


/*
 * 顶部弹幕
 *
 */
DANMAKU.prototype.TopDanmaku = function( pool, layer_index ) {
    // 如果还没有创建过这层，则创建
    if( pool.length <= layer_index ) {
        pool.push([]);
    }
    // 获取准备插入的层
    var layer = pool[layer_index];
    // 如果这个层现在还没有弹幕，直接插入
    // 顶部弹幕，从y=0开始插入
    if( layer.length == 0 || this.height > stage.height ) {
        layer.push(this);
        this.y = 0;
        this.toY = 0;
        this.bottom = this.height;
        this.layer_index = layer_index;
        return;
    } 
    // 底边插不进，就取最后插入的弹幕，尝试插到其上方
    var target = layer[layer.length-1];
    // 如果最后一条弹幕的上方足够放下当前弹幕就插进去
    if( target.y + this.height < stage.height ) {
        layer.push(this);
        this.y = target.y + target.height + 1;
        this.toY = this.y;
        this.bottom = this.y + this.height;
        this.layer_index = layer_index;
        return;
    }
    // 如果在这层没有找到合适的位置，就继续递归尝试插入更上层
    return this.TopDanmaku( pool, layer_index + 1 );
}

/*
 * 逆向弹幕
 *
 */
DANMAKU.prototype.ReverseDanmaku = function() {
	
}



//////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 下面是所有类型的弹幕都可能用到的方法

/*
 * 将一条弹幕二分插入弹幕层
 *
 */
DANMAKU.prototype.pushIntoDanmakuLayer = function( array ) {
    array.binsert( this, function(a,b) {
        if( a.bottom < b.bottom ) {
            return -1;
        } else if ( a.bottom == b.bottom ) {
            return 0;
        } else {
            return 1;
        }
    });
}

/*
 * 将一条已经离开屏幕的弹幕从弹幕池中移走
 *
 */
DANMAKU.prototype.removeFromDanmakuLayer = function() {
    switch( this.mode ) {
        case 1 : DANMAKU_POOL['scroll'][this.layer_index].shift(); break;
        case 4 : 
            // 底部和顶部弹幕这个就复杂啦。准备在老弹幕消失后把新弹幕填充上去
            var layer = DANMAKU_POOL['bottom'][this.layer_index];
            for( var i = 1; i < layer.length; i++ ) {
                layer[i].toY += this.height;
            }
            // 把消失的弹幕从弹幕层中移走
            layer.shift();
            break;
    }
}

/*
 * 用于判断一条弹幕完全离开屏幕的时间
 *
 */
getEndTime = function( danmaku ) {
    return danmaku.stime + GLOBAL_CONFIG.danmaku_life_time;
}

/*
 * 用于判断一条弹幕的左侧抵达屏幕左边界的时间
 *
 */
getLeftTime = function( danmaku ) {
    return danmaku.stime + stage.width / danmaku.speed;
}