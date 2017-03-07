import zlib from 'zlib';

export default string => new Promise((resolve, reject) => {
  zlib.deflate(string, (err, result) => {
    if (err) {
      reject(err);
      return;
    }
    resolve(result.toString('base64'));
  });
});
