const Anthropic = require('@anthropic-ai/sdk');
const { config } = require('../config');
const { retry, timeout } = require('../utils/retry');

class ClaudeProvider {
  constructor() {
    const llmConfig = config.get('llm');
    
    this.client = new Anthropic({
      apiKey: llmConfig.apiKey,
      baseURL: llmConfig.apiUrl
    });
    
    this.model = llmConfig.model;
    this.maxTokens = llmConfig.maxTokens;
    this.temperature = llmConfig.temperature;
    this.timeout = 60000; // 60秒超时
  }

  async chat(messages) {
    // 提取system消息
    const systemMessage = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');
    
    // 使用重试和超时
    return await retry(
      async () => {
        return await timeout(
          this._callAPI(systemMessage, userMessages),
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
            '503'  // Service unavailable
          ];
          
          return retryableErrors.some(err => 
            error.message.includes(err)
          );
        }
      }
    );
  }

  async _callAPI(systemMessage, userMessages) {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        system: systemMessage?.content,
        messages: userMessages.map(m => ({
          role: m.role,
          content: m.content
        }))
      });

      if (!response || !response.content || !response.content[0]) {
        throw new Error('Claude API返回空响应');
      }

      return response.content[0].type === 'text' ? response.content[0].text : '';
      
    } catch (error) {
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

  async chatStream(messages, onChunk) {
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

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          onChunk(chunk.delta.text);
        }
      }
    } catch (error) {
      throw new Error(`Claude流式API错误: ${error.message}`);
    }
  }
}

module.exports = { ClaudeProvider };
