const crypto = require('crypto');

function getHashSubstr(line, size = 10) {
  return crypto.createHash('sha1').update(line).digest('hex').substr(0, size);
}

module.exports = getHashSubstr;
