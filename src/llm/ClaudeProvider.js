const Anthropic = require('@anthropic-ai/sdk');
const { config } = require('../config');

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
  }

  async chat(messages) {
    // 提取system消息
    const systemMessage = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');
    
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

      return response.content[0].type === 'text' ? response.content[0].text : '';
    } catch (error) {
      throw new Error(`Claude API错误: ${error.message}`);
    }
  }
}

module.exports = { ClaudeProvider };
