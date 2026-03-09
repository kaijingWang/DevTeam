// 默认配置
const defaultConfig = {
  version: '1.0.0',
  llm: {
    provider: 'claude',
    apiKey: '',
    apiUrl: 'https://api.anthropic.com',
    model: 'claude-3-5-sonnet-20241022',
    maxTokens: 4096,
    temperature: 0.7,
    streaming: true
  },
  workspace: {
    root: './devteam-workspace',
    docsDir: 'docs',
    srcDir: 'src',
    testsDir: 'tests'
  },
  agents: {
    pm: { enabled: true },
    architect: { enabled: true },
    ui: { enabled: true },
    api: { enabled: true },
    backend: { enabled: true, language: 'typescript' },
    frontend: { enabled: true, framework: 'react' },
    qa: { enabled: true },
    git: { enabled: true }
  },
  git: {
    autoCommit: true,
    autoPush: false,
    commitPrefix: 'feat'
  }
};

module.exports = { defaultConfig };
