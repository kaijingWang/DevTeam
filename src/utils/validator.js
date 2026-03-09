class Validator {
  static validateRequirement(requirement) {
    if (!requirement || typeof requirement !== 'string') {
      throw new Error('需求必须是非空字符串');
    }
    
    const trimmed = requirement.trim();
    if (trimmed.length < 5) {
      throw new Error('需求描述太短（至少5个字符）');
    }
    
    if (trimmed.length > 2000) {
      throw new Error('需求描述太长（最多2000个字符）');
    }
    
    return trimmed;
  }
  
  static validateConfig(config) {
    if (!config) {
      throw new Error('配置不能为空');
    }
    
    if (!config.llm) {
      throw new Error('缺少LLM配置');
    }
    
    if (!config.llm.apiKey || config.llm.apiKey === 'test-key') {
      throw new Error('请配置有效的API密钥');
    }
    
    if (!config.llm.model) {
      throw new Error('请配置LLM模型');
    }
    
    return true;
  }
  
  static validateInput(input, schema) {
    for (const [key, rules] of Object.entries(schema)) {
      const value = input[key];
      
      if (rules.required && !value) {
        throw new Error(`${key} 是必需的`);
      }
      
      if (rules.type && typeof value !== rules.type) {
        throw new Error(`${key} 类型错误，期望 ${rules.type}`);
      }
      
      if (rules.min && value.length < rules.min) {
        throw new Error(`${key} 长度不能小于 ${rules.min}`);
      }
      
      if (rules.max && value.length > rules.max) {
        throw new Error(`${key} 长度不能大于 ${rules.max}`);
      }
    }
    
    return true;
  }
}

module.exports = { Validator };
