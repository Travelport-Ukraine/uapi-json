const zlib = require('zlib');

module.exports = string => new Promise((resolve, reject) => {
  zlib.deflate(string, (err, result) => {
    if (err) {
      reject(err);
      return;
    }
    resolve(result.toString('base64'));
  });
});
