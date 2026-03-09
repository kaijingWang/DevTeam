// 配置常量
module.exports = {
  // LLM配置
  LLM: {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
    TIMEOUT: 60000, // 60秒
    MAX_TOKENS: 4096,
    TEMPERATURE: 0.7
  },
  
  // 记忆配置
  MEMORY: {
    MAX_MEMORIES: 1000,
    MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7天
    CLEANUP_INTERVAL: 60 * 60 * 1000 // 1小时
  },
  
  // 工作流配置
  WORKFLOW: {
    TOTAL_STEPS: 8,
    CHECKPOINT_ENABLED: true,
    AUTO_SAVE_INTERVAL: 30000 // 30秒
  },
  
  // 文件配置
  FILES: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_EXTENSIONS: ['.js', '.ts', '.jsx', '.tsx', '.json', '.md', '.css', '.html'],
    WORKSPACE_DIR: './devteam-workspace',
    SESSIONS_DIR: '.devteam/sessions',
    LOGS_DIR: '.devteam/logs'
  },
  
  // Agent配置
  AGENTS: {
    PM: { name: 'PM', role: '产品经理' },
    ARCHITECT: { name: 'Architect', role: '架构师' },
    UI_DESIGNER: { name: 'UIDesigner', role: 'UI/UX设计师' },
    API_DESIGNER: { name: 'APIDesigner', role: 'API设计师' },
    BACKEND: { name: 'Backend', role: '后端工程师' },
    FRONTEND: { name: 'Frontend', role: '前端工程师' },
    QA: { name: 'QA', role: '测试工程师' },
    GIT: { name: 'Git', role: 'DevOps工程师' }
  },
  
  // 错误消息
  ERRORS: {
    INVALID_REQUIREMENT: '需求描述无效',
    INVALID_CONFIG: '配置无效',
    API_KEY_MISSING: 'API密钥未配置',
    LLM_ERROR: 'LLM调用失败',
    FILE_ERROR: '文件操作失败',
    NETWORK_ERROR: '网络错误',
    TIMEOUT: '操作超时'
  }
};
