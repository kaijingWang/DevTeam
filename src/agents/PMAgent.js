const { Agent } = require('./base/Agent');

class PMAgent extends Agent {
  constructor() {
    super('PM', '产品经理');
  }

  getSystemPrompt() {
    return `你是一个资深产品经理，擅长：
1. 理解用户需求，挖掘真实痛点
2. 编写清晰的PRD文档
3. 拆解功能模块，定义优先级
4. 提出合理的澄清问题

输出格式要求：
- 使用Markdown格式
- 结构清晰，层次分明
- 包含用户故事和验收标准
- 明确功能优先级（P0/P1/P2）

你的目标是将模糊的需求转化为清晰的产品文档。`;
  }

  async execute(input) {
    const { requirement } = input;
    
    console.log('  分析需求...');
    
    const prompt = `请分析以下需求并生成PRD文档：

需求：${requirement}

PRD文档应包含：

# 产品需求文档 (PRD)

## 1. 项目概述
- 项目名称
- 目标用户
- 核心价值
- 项目背景

## 2. 功能需求

### 2.1 核心功能
详细描述每个核心功能，包括：
- 功能描述
- 用户故事
- 验收标准
- 优先级（P0/P1/P2）

### 2.2 辅助功能
（如果有）

## 3. 非功能需求
- 性能要求
- 安全要求
- 可用性要求
- 兼容性要求

## 4. 用户流程
描述主要用户流程

## 5. 里程碑规划
- 阶段1：...
- 阶段2：...

请生成完整的PRD文档。`;

    const prd = await this.chat(prompt);
    
    // 保存PRD
    await this.saveOutput('docs/PRD.md', prd);
    
    return {
      prd,
      summary: this.extractSummary(prd)
    };
  }

  extractSummary(prd) {
    const lines = prd.split('\n');
    const summary = [];
    
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      if (lines[i].trim()) {
        summary.push(lines[i]);
      }
    }
    
    return summary.join('\n');
  }
}

module.exports = { PMAgent };
