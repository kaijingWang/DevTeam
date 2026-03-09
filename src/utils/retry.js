function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retry(fn, options = {}) {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = 2,
    onRetry = null,
    shouldRetry = (error) => true
  } = options;
  
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // 检查是否应该重试
      if (!shouldRetry(error)) {
        throw error;
      }
      
      // 最后一次尝试失败
      if (i === maxRetries - 1) {
        throw error;
      }
      
      // 回调通知
      if (onRetry) {
        onRetry(i + 1, maxRetries, error);
      }
      
      // 指数退避
      const waitTime = delay * Math.pow(backoff, i);
      await sleep(waitTime);
    }
  }
  
  throw lastError;
}

async function timeout(promise, ms, message = '操作超时') {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(message)), ms)
    )
  ]);
}

module.exports = { retry, timeout, sleep };
