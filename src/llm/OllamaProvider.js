const { config } = require('../config');

class OllamaProvider {
  constructor() {
    const llmConfig = config.get('llm');
    
    this.baseURL = llmConfig.apiUrl || 'http://localhost:11434';
    this.model = llmConfig.model || 'llama2';
    this.maxTokens = llmConfig.maxTokens || 4096;
    this.temperature = llmConfig.temperature || 0.7;
  }

  async chat(messages) {
    try {
      const response = await fetch(`${this.baseURL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          stream: false,
          options: {
            temperature: this.temperature,
            num_predict: this.maxTokens
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.message.content;
    } catch (error) {
      throw new Error(`Ollama API错误: ${error.message}`);
    }
  }

  async chatStream(messages, onChunk) {
    try {
      const response = await fetch(`${this.baseURL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          stream: true,
          options: {
            temperature: this.temperature,
            num_predict: this.maxTokens
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.message?.content) {
              const content = data.message.content;
              fullText += content;
              if (onChunk) {
                onChunk(content);
              }
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }

      return fullText;
    } catch (error) {
      throw new Error(`Ollama流式API错误: ${error.message}`);
    }
  }
}

module.exports = { OllamaProvider };
