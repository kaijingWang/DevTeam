import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config';

export class ClaudeProvider {
  private client: Anthropic;

  constructor() {
    const llmConfig = config.get('llm');
    
    this.client = new Anthropic({
      apiKey: llmConfig.apiKey,
      baseURL: llmConfig.apiUrl
    });
  }

  async chat(messages: Array<{ role: string; content: string }>): Promise<string> {
    const llmConfig = config.get('llm');
    
    // 提取system消息
    const systemMessage = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');
    
    const response = await this.client.messages.create({
      model: llmConfig.model,
      max_tokens: llmConfig.maxTokens,
      temperature: llmConfig.temperature,
      system: systemMessage?.content,
      messages: userMessages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }))
    });

    return response.content[0].type === 'text' ? response.content[0].text : '';
  }

  async chatStream(
    messages: Array<{ role: string; content: string }>,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const llmConfig = config.get('llm');
    
    const systemMessage = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');
    
    const stream = await this.client.messages.create({
      model: llmConfig.model,
      max_tokens: llmConfig.maxTokens,
      temperature: llmConfig.temperature,
      system: systemMessage?.content,
      messages: userMessages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      })),
      stream: true
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        onChunk(chunk.delta.text);
      }
    }
  }
}
