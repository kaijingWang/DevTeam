const { config } = require('../config');

class LLMRouter {
  constructor() {
    this.providers = new Map();
    this.registerDefaultProviders();
  }

  registerDefaultProviders() {
    // Claude (已支持)
    this.registerProvider('claude', () => {
      const { ClaudeProvider } = require('./ClaudeProvider');
      return new ClaudeProvider();
    });

    // OpenAI
    this.registerProvider('openai', () => {
      const { OpenAIProvider } = require('./OpenAIProvider');
      return new OpenAIProvider();
    });

    // Gemini
    this.registerProvider('gemini', () => {
      const { GeminiProvider } = require('./GeminiProvider');
      return new GeminiProvider();
    });

    // Ollama (本地)
    this.registerProvider('ollama', () => {
      const { OllamaProvider } = require('./OllamaProvider');
      return new OllamaProvider();
    });
  }

  registerProvider(name, factory) {
    this.providers.set(name, factory);
  }

  getProvider(name = null) {
    const providerName = name || config.get('llm').provider || 'claude';
    
    const factory = this.providers.get(providerName);
    
    if (!factory) {
      throw new Error(`未知的LLM提供商: ${providerName}`);
    }

    return factory();
  }

  listProviders() {
    return Array.from(this.providers.keys());
  }
}

// 全局路由器实例
const router = new LLMRouter();

module.exports = { LLMRouter, router };
