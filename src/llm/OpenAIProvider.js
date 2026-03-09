const { config } = require('../config');

class OpenAIProvider {
  constructor() {
    const llmConfig = config.get('llm');
    
    // 延迟加载OpenAI SDK
    try {
      const OpenAI = require('openai');
      this.client = new OpenAI({
        apiKey: llmConfig.apiKey
      });
    } catch (error) {
      throw new Error('OpenAI SDK未安装，请运行: npm install openai');
    }
    
    this.model = llmConfig.model || 'gpt-4-turbo-preview';
    this.maxTokens = llmConfig.maxTokens || 4096;
    this.temperature = llmConfig.temperature || 0.7;
  }

  async chat(messages) {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: messages.map(m => ({
          role: m.role === 'system' ? 'system' : m.role === 'user' ? 'user' : 'assistant',
          content: m.content
        })),
        max_tokens: this.maxTokens,
        temperature: this.temperature
      });

      return response.choices[0].message.content;
    } catch (error) {
      throw new Error(`OpenAI API错误: ${error.message}`);
    }
  }

  async chatStream(messages, onChunk) {
    try {
      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages: messages.map(m => ({
          role: m.role === 'system' ? 'system' : m.role === 'user' ? 'user' : 'assistant',
          content: m.content
        })),
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        stream: true
      });

      let fullText = '';

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullText += content;
          if (onChunk) {
            onChunk(content);
          }
        }
      }

      return fullText;
    } catch (error) {
      throw new Error(`OpenAI流式API错误: ${error.message}`);
    }
  }
}

module.exports = { OpenAIProvider };
