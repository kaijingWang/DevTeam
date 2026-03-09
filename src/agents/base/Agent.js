const { ClaudeProvider } = require('../../llm/ClaudeProvider');
const { config } = require('../../config');
const { Validator } = require('../../utils/validator');
const { retry } = require('../../utils/retry');
const { CodeParser } = require('../../utils/codeParser');
const { CONSTANTS } = require('../../config/constants');
const fs = require('fs-extra');
const path = require('path');

class Agent {
  constructor(name, role) {
    this.name = name;
    this.role = role;
    this.llm = new ClaudeProvider();
    this.workspace = config.get('workspace').root;
    this.isIncremental = false;
    this.projectContext = null;
  }

  setIncrementalMode(projectContext) {
    this.isIncremental = true;
    this.projectContext = projectContext;
  }

  async execute(input) {
    // 子类必须实现
    throw new Error('execute() must be implemented by subclass');
  }

  async chat(prompt, systemPrompt, options = {}) {
    const messages = [
      {
        role: 'system',
        content: systemPrompt || this.getSystemPrompt()
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    // 如果启用流式输出
    if (options.stream && options.onChunk) {
      return await this.llm.chatStream(messages, options.onChunk);
    }

    // 使用重试机制
    return await retry(
      async () => {
        return await this.llm.chat(messages);
      },
      {
        maxRetries: 3,
        delay: 1000,
        onRetry: (attempt, maxRetries, error) => {
          console.log(`  重试 ${attempt}/${maxRetries}: ${error.message}`);
        },
        shouldRetry: (error) => {
          // 只重试网络错误和超时
          return error.message.includes('API') || 
                 error.message.includes('timeout') ||
                 error.message.includes('ECONNRESET');
        }
      }
    );
  }

  getSystemPrompt() {
    return `你是一个${this.role}，专业、高效、注重细节。`;
  }

  async saveOutput(filename, content) {
    try {
      // 验证文件名
      if (!filename || typeof filename !== 'string') {
        throw new Error('文件名无效');
      }
      
      // 验证内容
      if (content === null || content === undefined) {
        throw new Error('文件内容不能为空');
      }
      
      const filepath = path.join(this.workspace, filename);
      await fs.ensureDir(path.dirname(filepath));
      await fs.writeFile(filepath, content, 'utf-8');
      
      return filepath;
    } catch (error) {
      throw new Error(`保存文件失败: ${error.message}`);
    }
  }

  async readOutput(filename) {
    try {
      const filepath = path.join(this.workspace, filename);
      
      if (await fs.pathExists(filepath)) {
        return await fs.readFile(filepath, 'utf-8');
      }
      
      return null;
    } catch (error) {
      throw new Error(`读取文件失败: ${error.message}`);
    }
  }

  parseCodeBlocks(text) {
    return CodeParser.parseCodeBlocks(text);
  }

  extractSummary(text, maxLines = 10) {
    return CodeParser.extractSummary(text, maxLines);
  }
}

module.exports = { Agent };
