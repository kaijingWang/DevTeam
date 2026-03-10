const { Agent } = require('./base/Agent');

class PMAgent extends Agent {
  constructor() {
    super('PM', '产品经理');
  }

  getSystemPrompt() {
    return `你是一个资深产品经理，拥有10年以上互联网产品经验。

核心能力：
1. 深入理解用户需求，挖掘真实痛点
2. 编写清晰、可执行的PRD文档
3. 定义合理的功能优先级和迭代计划
4. 提供数据驱动的产品决策

PRD文档标准：
- 使用Markdown格式
- 结构清晰，层次分明
- 每个功能包含：功能描述、用户故事、验收标准、优先级
- 包含非功能需求（性能、安全、可用性）
- 包含用户流程图
- 包含里程碑规划

输出要求：
- 功能描述要具体，不要模糊
- 验收标准要可量化、可测试
- 优先级要合理（P0核心功能、P1重要功能、P2优化功能）
- 用户故事要符合"作为...我希望...这样..."格式
- 非功能需求要有具体指标

你的目标是输出一份开发团队可以直接执行的PRD文档。`;
  }

  async execute(input) {
    const { requirement } = input;
    
    console.log('  分析需求...');
    
    const prompt = `请分析以下需求并生成专业的PRD文档：

需求：${requirement}

请按照以下结构生成PRD文档：

# 产品需求文档 (PRD)

## 1. 项目概述
- **项目名称**：[给项目起一个合适的名字]
- **目标用户**：[详细描述目标用户画像]
- **核心价值**：[一句话说明产品核心价值]
- **项目背景**：[说明为什么要做这个产品]

## 2. 功能需求

### 2.1 核心功能（P0）

#### 功能1：[功能名称]

**功能描述**：
[详细描述功能是什么，解决什么问题]

**用户故事**：
- 作为[用户角色]，我希望[功能]，这样我就能[价值]
- 作为[用户角色]，我希望[功能]，这样我就能[价值]

**验收标准**：
- [ ] [可测试的标准1]
- [ ] [可测试的标准2]
- [ ] [可测试的标准3]
- [ ] 性能要求：[具体指标]

**优先级**：P0

---

[为每个核心功能重复上述结构]

### 2.2 重要功能（P1）

[同样的结构]

### 2.3 优化功能（P2）

[同样的结构]

## 3. 非功能需求

### 3.1 性能要求
- 页面加载时间：< [具体数字]
- 接口响应时间：< [具体数字]
- 并发用户数：≥ [具体数字]

### 3.2 安全要求
- [具体的安全要求]

### 3.3 可用性要求
- [具体的可用性要求]

### 3.4 兼容性要求
- [具体的兼容性要求]

## 4. 用户流程

### 主流程：[流程名称]
\`\`\`
步骤1 → 步骤2 → 步骤3 → ...
\`\`\`

[详细描述每个步骤]

## 5. 数据模型

### 核心数据对象
\`\`\`typescript
interface [对象名] {
  [字段]: [类型];  // [说明]
}
\`\`\`

## 6. 里程碑规划

### MVP版本（第1周）
**目标**：[目标描述]

**功能范围**：
- [ ] [功能1]
- [ ] [功能2]

**交付物**：[交付物描述]

### V1.0版本（第2-3周）
[同样的结构]

### V1.1版本（第4周）
[同样的结构]

## 7. 成功指标

- **用户指标**：[具体指标]
- **业务指标**：[具体指标]
- **技术指标**：[具体指标]

## 8. 风险与依赖

### 风险
- [风险1]：[应对方案]
- [风险2]：[应对方案]

### 依赖
- [依赖1]
- [依赖2]

---

**文档版本**：v1.0  
**创建日期**：${new Date().toISOString().split('T')[0]}  
**负责人**：产品团队

请生成完整、专业、可执行的PRD文档。`;

    // 使用流式输出
    let prd = '';
    await this.chat(prompt, null, {
      stream: true,
      onChunk: (chunk) => {
        process.stdout.write(chunk);
        prd += chunk;
      }
    });
    
    console.log('\n');
    
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
    
    // 提取项目概述部分
    let inOverview = false;
    for (const line of lines) {
      if (line.includes('## 1. 项目概述')) {
        inOverview = true;
        continue;
      }
      if (inOverview && line.startsWith('## 2.')) {
        break;
      }
      if (inOverview && line.trim()) {
        summary.push(line);
      }
    }
    
    return summary.slice(0, 10).join('\n');
  }
}

module.exports = { PMAgent };
