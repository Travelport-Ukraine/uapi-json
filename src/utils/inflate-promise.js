import zlib from 'zlib';

export default stringBuffer => new Promise((resolve, reject) => {
  const buf = new Buffer(stringBuffer, 'base64');
  zlib.inflate(buf, (err, result) => {
    if (err) {
      reject(err);
      return;
    }
    resolve(result.toString());
  });
});
