const xml2js = require('xml2js');
const { AirRuntimeError } = require('../AirErrors');
const { inflate } = require('../../../utils');

module.exports = params => inflate(params.exchangeToken)
  .then(JSON.parse)
  .then((token) => {
    const resultXml = {};
    Object.keys(token).forEach((root) => {
      const builder = new xml2js.Builder({
        headless: true,
        rootName: root,
      });

      const buildObject = {
        [root]: token[root],
      };

      const intResult = builder.buildObject(buildObject);
      // remove root object tags at first and last line
      const lines = intResult.split('\n');
      lines.splice(0, 1);
      lines.splice(-1, 1);

      // return
      resultXml[root + '_XML'] = lines.join('\n');
    });
    params.xml = resultXml;
    return params;
  })
  .catch(e => Promise.reject(
    new AirRuntimeError.ExchangeTokenIncorrect(params, e)
  ));
