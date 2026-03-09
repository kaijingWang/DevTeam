const { ClaudeProvider } = require('../../llm/ClaudeProvider');
const { config } = require('../../config');
const fs = require('fs-extra');
const path = require('path');

class Agent {
  constructor(name, role) {
    this.name = name;
    this.role = role;
    this.llm = new ClaudeProvider();
    this.workspace = config.get('workspace').root;
  }

  async execute(input) {
    throw new Error('execute() must be implemented by subclass');
  }

  async chat(prompt, systemPrompt) {
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

    return await this.llm.chat(messages);
  }

  getSystemPrompt() {
    return `你是一个${this.role}，专业、高效、注重细节。`;
  }

  async saveOutput(filename, content) {
    const filepath = path.join(this.workspace, filename);
    await fs.ensureDir(path.dirname(filepath));
    await fs.writeFile(filepath, content, 'utf-8');
    return filepath;
  }

  async readOutput(filename) {
    const filepath = path.join(this.workspace, filename);
    if (await fs.pathExists(filepath)) {
      return await fs.readFile(filepath, 'utf-8');
    }
    return null;
  }
}

module.exports = { Agent };
