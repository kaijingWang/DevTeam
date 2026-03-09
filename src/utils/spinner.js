const ora = require('ora');

const spinner = (text) => {
  return ora({
    text,
    spinner: 'dots',
    color: 'cyan'
  });
};

module.exports = { spinner };
