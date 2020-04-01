const unescapeHtml = require('./unescape-html');

module.exports = function (json) {
  return JSON.parse(unescapeHtml(JSON.stringify(json)));
};
