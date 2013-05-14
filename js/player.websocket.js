function socket() {
  this.socket = null;

  try {
    this.socket = new WebSocket(GLOBAL_CONFIG.dm);
    MSG('初始化WebSocket');

    /////////
    this.socket.onopen    = function(msg) { 
      MSG("已连接上弹幕服务器"); 
    };

    ////////
    this.socket.onmessage = function(resp) { 
      var response = resp.data;
      DEBUG('收到回复：' + response);

      // 返回值不以[OK]开头，说明有问题
      if( response.indexOf('[OK]') !== 0 ) {
          MSG('弹幕发送失败 : ' + response);
          return false;
      }

      // 没有问题就把弹幕插进队列
      // 还原出object
      response = response.substr(4);
      var danmaku = unserialize(response);
      if( !danmaku ) {
        MSG('返回值无法解析');
        return false;
      }

      // 一些应该是数字的数据
      danmaku.color = parseInt(danmaku.color);
      danmaku.date = parseInt(danmaku.date);
      danmaku.mode = parseInt(danmaku.mode);
      danmaku.size = parseInt(danmaku.size);
      danmaku.stime = parseInt(danmaku.stime);

      // 判断是否是本人发的
      if( danmaku['user'] == getCookie('user') ) {
        danmaku.isNew = true;
        // 清空输入框
        document.querySelector('#danmaku-text').value = '';
        // 提示成功
        MSG('弹幕发送成功');
      }

      // 手动检查，如果播放进度已经超过该弹幕的出现时间点，但该弹幕还在生命周期内那就手动把它显示出来
      if( danmaku.stime < TIME && ( danmaku.stime + GLOBAL_CONFIG.danmaku_life_time ) > TIME ) {
        // 立即把弹幕插入弹幕池
        new DANMAKU( danmaku, TIME );
        // 延迟插入弹幕列表，防止弹幕出现两次
        setTimeout( function() {
          DANMAKU.insert(danmaku);
        }, GLOBAL_CONFIG.danmaku_life_time);
      } else {
        // 如果现在不在显示周期内，那就无所谓了
        DANMAKU.insert(danmaku);
      }
    };

    ////////
    this.socket.onclose = function(msg) { 
      // 把全局设置改为允许忽略弹幕服务器
      GLOBAL_CONFIG.ignore_dm = true;
      // 显示出离线提示
      document.querySelector('#offline').style.display = 'block';
      MSG("无法连接弹幕服务器，进入离线模式"); 
    };

  } catch(ex) { 
    MSG(ex); 
  }
}

socket.prototype.send = function(msg) {
    if( !msg ) return; 

    try { 
      this.socket.send(msg); 
      DEBUG('发送：' + msg); 
    } catch(ex) { 
      DEBUG(ex); 
    }
  }

socket.prototype.quit = function() {
  this.socket.close();
  this.socket = null;
}