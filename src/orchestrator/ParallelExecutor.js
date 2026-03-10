/**
 * Agent依赖图和并行执行管理器
 */
class ParallelExecutor {
  constructor() {
    // 定义Agent依赖关系
    this.dependencies = {
      pm: [],                           // PM不依赖任何人
      architect: ['pm'],                // 架构师依赖PM
      ui: ['pm'],                       // UI设计师依赖PM
      api: ['architect'],               // API设计师依赖架构师
      backend: ['architect', 'api'],    // 后端依赖架构师和API设计师
      frontend: ['ui', 'api'],          // 前端依赖UI设计师和API设计师
      qa: ['backend', 'frontend'],      // QA依赖后端和前端
      git: ['qa']                       // Git依赖QA
    };
    
    // Agent执行状态
    this.status = {};
    this.results = {};
    this.errors = {};
  }

  /**
   * 获取可以并行执行的Agent组
   */
  getExecutionGroups() {
    const groups = [];
    const processed = new Set();
    const allAgents = Object.keys(this.dependencies);
    
    while (processed.size < allAgents.length) {
      const currentGroup = [];
      
      // 找出所有依赖已满足的Agent
      for (const agent of allAgents) {
        if (processed.has(agent)) continue;
        
        const deps = this.dependencies[agent];
        const depsReady = deps.every(dep => processed.has(dep));
        
        if (depsReady) {
          currentGroup.push(agent);
        }
      }
      
      if (currentGroup.length === 0) {
        throw new Error('检测到循环依赖或无法解析的依赖关系');
      }
      
      groups.push(currentGroup);
      currentGroup.forEach(agent => processed.add(agent));
    }
    
    return groups;
  }

  /**
   * 并行执行一组Agent
   */
  async executeGroup(agents, agentInstances, getInputForAgent) {
    console.log(`\n🔄 并行执行: ${agents.join(', ')}\n`);
    
    const promises = agents.map(async (agentKey) => {
      try {
        this.status[agentKey] = 'running';
        
        const agent = agentInstances[agentKey];
        const input = getInputForAgent(agentKey, this.results);
        
        console.log(`  ▶️  ${agentKey} 开始执行...`);
        
        const result = await agent.execute(input);
        
        this.status[agentKey] = 'completed';
        this.results[agentKey] = result;
        
        console.log(`  ✅ ${agentKey} 完成`);
        
        return { agentKey, result, success: true };
      } catch (error) {
        this.status[agentKey] = 'failed';
        this.errors[agentKey] = error;
        
        console.error(`  ❌ ${agentKey} 失败: ${error.message}`);
        
        return { agentKey, error, success: false };
      }
    });
    
    const results = await Promise.all(promises);
    
    // 检查是否有失败
    const failures = results.filter(r => !r.success);
    if (failures.length > 0) {
      throw new Error(`以下Agent执行失败: ${failures.map(f => f.agentKey).join(', ')}`);
    }
    
    return results;
  }

  /**
   * 获取执行统计
   */
  getStats() {
    const total = Object.keys(this.dependencies).length;
    const completed = Object.values(this.status).filter(s => s === 'completed').length;
    const failed = Object.values(this.status).filter(s => s === 'failed').length;
    const running = Object.values(this.status).filter(s => s === 'running').length;
    
    return { total, completed, failed, running };
  }

  /**
   * 重置状态
   */
  reset() {
    this.status = {};
    this.results = {};
    this.errors = {};
  }
}

module.exports = { ParallelExecutor };
