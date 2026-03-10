const https = require('https');
const http = require('http');

/**
 * HTTP连接池管理器
 * 复用TCP连接，提高性能
 */
class ConnectionPool {
  constructor(options = {}) {
    this.maxSockets = options.maxSockets || 10;
    this.maxFreeSockets = options.maxFreeSockets || 5;
    this.timeout = options.timeout || 180000; // 3分钟
    this.keepAlive = options.keepAlive !== false;
    this.keepAliveMsecs = options.keepAliveMsecs || 1000;
    
    // 创建HTTP和HTTPS Agent
    this.httpAgent = new http.Agent({
      keepAlive: this.keepAlive,
      keepAliveMsecs: this.keepAliveMsecs,
      maxSockets: this.maxSockets,
      maxFreeSockets: this.maxFreeSockets,
      timeout: this.timeout
    });
    
    this.httpsAgent = new https.Agent({
      keepAlive: this.keepAlive,
      keepAliveMsecs: this.keepAliveMsecs,
      maxSockets: this.maxSockets,
      maxFreeSockets: this.maxFreeSockets,
      timeout: this.timeout
    });
    
    console.log('🔌 连接池已初始化:', {
      maxSockets: this.maxSockets,
      keepAlive: this.keepAlive,
      timeout: `${this.timeout / 1000}秒`
    });
  }

  /**
   * 获取HTTP Agent
   */
  getHttpAgent() {
    return this.httpAgent;
  }

  /**
   * 获取HTTPS Agent
   */
  getHttpsAgent() {
    return this.httpsAgent;
  }

  /**
   * 获取统计信息
   */
  getStats() {
    const httpSockets = this.httpAgent.sockets;
    const httpFreeSockets = this.httpAgent.freeSockets;
    const httpsSockets = this.httpsAgent.sockets;
    const httpsFreeSockets = this.httpsAgent.freeSockets;
    
    const countSockets = (sockets) => {
      if (!sockets) return 0;
      return Object.values(sockets).reduce((sum, arr) => sum + arr.length, 0);
    };
    
    return {
      http: {
        active: countSockets(httpSockets),
        free: countSockets(httpFreeSockets)
      },
      https: {
        active: countSockets(httpsSockets),
        free: countSockets(httpsFreeSockets)
      }
    };
  }

  /**
   * 销毁所有连接
   */
  destroy() {
    this.httpAgent.destroy();
    this.httpsAgent.destroy();
    console.log('🔌 连接池已销毁');
  }
}

// 全局单例
let globalPool = null;

/**
 * 获取全局连接池
 */
function getConnectionPool(options) {
  if (!globalPool) {
    globalPool = new ConnectionPool(options);
  }
  return globalPool;
}

/**
 * 销毁全局连接池
 */
function destroyConnectionPool() {
  if (globalPool) {
    globalPool.destroy();
    globalPool = null;
  }
}

module.exports = {
  ConnectionPool,
  getConnectionPool,
  destroyConnectionPool
};
