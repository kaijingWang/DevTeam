const fs = require('fs-extra');
const path = require('path');

class WorkflowStateManager {
  constructor(sessionId, requirement) {
    this.sessionId = sessionId;
    this.statePath = `.devteam/sessions/${sessionId}/state.json`;
    this.state = this.loadOrCreate(requirement);
  }

  updateStatus(status) {
    this.state.status = status;
    
    if (status === 'paused') {
      this.state.pauseTime = Date.now();
    } else if (status === 'running' && this.state.pauseTime) {
      this.state.resumeTime = Date.now();
    }
    
    this.save();
  }

  nextStep(agent) {
    this.state.currentStep++;
    this.state.currentAgent = agent;
    this.save();
  }

  saveOutput(step, agent, output) {
    this.state.outputs[step] = {
      agent,
      output,
      timestamp: Date.now()
    };
    this.save();
  }

  createCheckpoint(agent, state) {
    const checkpoint = {
      id: `cp_${Date.now()}`,
      step: this.state.currentStep,
      agent,
      timestamp: Date.now(),
      state
    };
    
    this.state.checkpoints.push(checkpoint);
    this.save();
    
    return checkpoint.id;
  }

  restoreCheckpoint(checkpointId) {
    const checkpoint = this.state.checkpoints.find(cp => cp.id === checkpointId);
    
    if (checkpoint) {
      this.state.currentStep = checkpoint.step;
      this.state.currentAgent = checkpoint.agent;
      this.save();
    }
    
    return checkpoint || null;
  }

  getState() {
    return { ...this.state };
  }

  canResume() {
    return this.state.status === 'paused' && this.state.currentStep > 0;
  }

  loadOrCreate(requirement) {
    try {
      if (fs.existsSync(this.statePath)) {
        return fs.readJSONSync(this.statePath);
      }
    } catch (error) {
      // 创建新状态
    }
    
    return {
      sessionId: this.sessionId,
      status: 'running',
      currentStep: 0,
      totalSteps: 8,
      currentAgent: '',
      requirement,
      startTime: Date.now(),
      outputs: {},
      checkpoints: []
    };
  }

  save() {
    fs.ensureDirSync(path.dirname(this.statePath));
    fs.writeJSONSync(this.statePath, this.state, { spaces: 2 });
  }
}

module.exports = { WorkflowStateManager };
