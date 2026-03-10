const Anthropic = require('@anthropic-ai/sdk');
const { config } = require('../config');
const { retry, timeout } = require('../utils/retry');
const { LLMCache } = require('./LLMCache');
const { getConnectionPool } = require('./ConnectionPool');

class ClaudeProvider {
  constructor() {
    const llmConfig = config.get('llm');
    
    // 初始化缓存
    this.cache = new LLMCache();
    
    // 初始化连接池
    this.connectionPool = getConnectionPool({
      maxSockets: 10,
      keepAlive: true,
      timeout: 180000
    });
    
    // 使用自定义fetch来添加正确的headers和连接池
    this.client = new Anthropic({
      apiKey: llmConfig.apiKey,
      baseURL: llmConfig.apiUrl,
      defaultHeaders: {
        'anthropic-version': '2023-06-01',
        'x-api-key': llmConfig.apiKey
      },
      // 使用连接池的httpAgent
      httpAgent: llmConfig.apiUrl.startsWith('https') 
        ? this.connectionPool.getHttpsAgent() 
        : this.connectionPool.getHttpAgent()
    });
    
    this.model = llmConfig.model;
    this.maxTokens = llmConfig.maxTokens;
    this.temperature = llmConfig.temperature;
    this.timeout = 180000; // 180秒超时（3分钟）
    this.streaming = llmConfig.streaming !== false; // 默认启用流式
    this.enableCache = llmConfig.enableCache !== false; // 默认启用缓存
  }

  async chat(messages, options = {}) {
    // 提取system消息
    const systemMessage = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');
    
    // 检查缓存
    if (this.enableCache && !options.skipCache) {
      const cacheKey = this.cache.generateKey(this.model, messages, {
        temperature: this.temperature,
        maxTokens: this.maxTokens
      });
      
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }
      
      // 使用重试和超时
      const result = await retry(
        async () => {
          return await timeout(
            this._callAPI(systemMessage, userMessages, options),
            this.timeout,
            'Claude API调用超时'
          );
        },
        {
          maxRetries: 3,
          delay: 1000,
          shouldRetry: (error) => {
            // 重试网络错误和超时
            const retryableErrors = [
              'timeout',
              'ECONNRESET',
              'ETIMEDOUT',
              'ENOTFOUND',
              '429', // Rate limit
              '500', // Server error
              '502', // Bad gateway
              '503', // Service unavailable
              '504'  // Gateway timeout
            ];
            
            return retryableErrors.some(err => 
              error.message.includes(err)
            );
          }
        }
      );
      
      // 缓存结果
      this.cache.set(cacheKey, result);
      return result;
    }
    
    // 不使用缓存
    return await retry(
      async () => {
        return await timeout(
          this._callAPI(systemMessage, userMessages, options),
          this.timeout,
          'Claude API调用超时'
        );
      },
      {
        maxRetries: 3,
        delay: 1000,
        shouldRetry: (error) => {
          const retryableErrors = [
            'timeout',
            'ECONNRESET',
            'ETIMEDOUT',
            'ENOTFOUND',
            '429',
            '500',
            '502',
            '503',
            '504'
          ];
          
          return retryableErrors.some(err => 
            error.message.includes(err)
          );
        }
      }
    );
  }

  async chatStream(messages, onChunk, options = {}) {
    const systemMessage = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');
    
    try {
      const stream = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        system: systemMessage?.content,
        messages: userMessages.map(m => ({
          role: m.role,
          content: m.content
        })),
        stream: true
      });

      let fullText = '';
      
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          const text = chunk.delta.text;
          fullText += text;
          if (onChunk) {
            onChunk(text);
          }
        }
      }
      
      return fullText;
    } catch (error) {
      throw new Error(`Claude流式API错误: ${error.message}`);
    }
  }

  async _callAPI(systemMessage, userMessages, options = {}) {
    try {
      // 构建请求参数
      const requestParams = {
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        messages: userMessages.map(m => ({
          role: m.role,
          content: m.content
        }))
      };
      
      // 只在有system消息时添加
      if (systemMessage && systemMessage.content) {
        requestParams.system = systemMessage.content;
      }
      
      console.log('调用Claude API:', {
        model: this.model,
        maxTokens: this.maxTokens,
        messagesCount: userMessages.length,
        hasSystem: !!systemMessage
      });
      
      const response = await this.client.messages.create(requestParams);

      if (!response || !response.content || !response.content[0]) {
        throw new Error('Claude API返回空响应');
      }

      const result = response.content[0].type === 'text' ? response.content[0].text : '';
      console.log('API响应成功，长度:', result.length);
      return result;
      
    } catch (error) {
      console.error('Claude API错误:', error);
      
      // 统一错误处理
      if (error.status === 401) {
        throw new Error('API密钥无效');
      } else if (error.status === 429) {
        throw new Error('API调用频率超限，请稍后重试');
      } else if (error.status >= 500) {
        throw new Error(`Claude服务器错误: ${error.status}`);
      } else {
        throw new Error(`Claude API错误: ${error.message}`);
      }
    }
  }
  
  /**
   * 获取缓存统计
   */
  getCacheStats() {
    return this.cache.getStats();
  }
  
  /**
   * 清空缓存
   */
  clearCache() {
    this.cache.clear();
  }
  
  /**
   * 获取连接池统计
   */
  getConnectionStats() {
    return this.connectionPool.getStats();
  }
}

module.exports = { ClaudeProvider };
