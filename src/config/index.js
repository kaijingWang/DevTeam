const Conf = require('conf').default || require('conf');
const { defaultConfig } = require('../types/config');

class ConfigManager {
  constructor() {
    this.store = new Conf({
      projectName: 'devteam-cli',
      defaults: defaultConfig
    });
  }

  get(key) {
    return this.store.get(key);
  }

  set(key, value) {
    this.store.set(key, value);
  }

  getAll() {
    return this.store.store;
  }

  setAll(config) {
    Object.entries(config).forEach(([key, value]) => {
      this.store.set(key, value);
    });
  }

  reset() {
    this.store.clear();
    this.setAll(defaultConfig);
  }

  getPath() {
    return this.store.path;
  }
}

const config = new ConfigManager();

module.exports = { config };
