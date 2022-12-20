const xml2js = require('xml2js');
const { AirRuntimeError } = require('../AirErrors');
const { inflate } = require('../../../utils');

module.exports = async function decodeExchangeToken(params) {
  try {
    const inflatedTokenString = await inflate(params.exchangeToken);
    const token = JSON.parse(inflatedTokenString);
    const resultXml = Object.entries(token).reduce(
      (acc, [root, value]) => {
        const builder = new xml2js.Builder({
          headless: true,
          rootName: root,
        });

        const buildObject = {
          [root]: value,
        };

        const intResult = builder.buildObject(buildObject);
        // remove root object tags at first and last line
        const lines = intResult.split('\n').slice(1, -1).join('\n');

        return { ...acc, [`${root}_XML`]: lines };
      },
      {}
    );

    return { ...params, xml: resultXml };
  } catch (err) {
    throw new AirRuntimeError.ExchangeTokenIncorrect(params, err);
  }
};
