const zlib = require('zlib');

module.exports = stringBuffer => new Promise((resolve, reject) => {
  const buf = Buffer.from(stringBuffer, 'base64');
  zlib.inflate(buf, (err, result) => {
    if (err) {
      reject(err);
      return;
    }
    resolve(result.toString());
  });
});
