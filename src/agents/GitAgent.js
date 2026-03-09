const { Agent } = require('./base/Agent');
const simpleGit = require('simple-git');
const path = require('path');

class GitAgent extends Agent {
  constructor() {
    super('Git', 'DevOps工程师');
    this.git = null;
  }

  getSystemPrompt() {
    return `你是一个DevOps工程师，擅长：
1. Git版本管理
2. 提交信息规范
3. 分支管理策略

你的目标是管理好代码版本。`;
  }

  async execute(input) {
    const { requirement } = input;
    
    console.log('  初始化Git仓库...');
    
    const workspaceRoot = this.workspace;
    this.git = simpleGit(workspaceRoot);
    
    try {
      // 检查是否已经是Git仓库
      const isRepo = await this.git.checkIsRepo();
      
      if (!isRepo) {
        // 初始化Git仓库
        await this.git.init();
        console.log('  ✓ Git仓库已初始化');
      }
      
      // 添加.gitignore
      await this.createGitignore();
      
      // 添加所有文件
      await this.git.add('.');
      
      // 生成提交信息
      const commitMessage = this.generateCommitMessage(requirement);
      
      // 提交
      await this.git.commit(commitMessage);
      console.log(`  ✓ 代码已提交: ${commitMessage}`);
      
      return {
        summary: 'Git仓库已初始化并提交代码',
        commitMessage
      };
      
    } catch (error) {
      console.log(`  ⚠️  Git操作失败: ${error.message}`);
      return {
        summary: 'Git操作跳过',
        error: error.message
      };
    }
  }

  async createGitignore() {
    const gitignoreContent = `node_modules/
dist/
build/
.env
.env.local
*.log
.DS_Store
coverage/
.vscode/
.idea/
`;
    
    await this.saveOutput('.gitignore', gitignoreContent);
  }

  generateCommitMessage(requirement) {
    // 简化需求描述作为提交信息
    const shortDesc = requirement.length > 50 
      ? requirement.substring(0, 47) + '...'
      : requirement;
    
    return `feat: ${shortDesc}`;
  }
}

module.exports = { GitAgent };
