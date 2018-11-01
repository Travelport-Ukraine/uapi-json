const {
  AirParsingError,
} = require('../../Services/Air/AirErrors');

const itemPattern = new RegExp([
  // rfiCode, rfiSubcode
  '-([A-Z]{1})/([A-Z0-9]{3})',
  // Fee description, passenger name, amount, currency
  '\\/([^\\/]+)/NM-1(.+?)\\/([^\\/]*)\\/((?:\\d+\\.)?\\d+)\\/([A-Z]{3})',
].join(''), 'i');

const parse = (string) => {
  const match = string.match(itemPattern);

  if (match === null) {
    throw new AirParsingError.InvalidServiceSegmentFormat();
  }

  const [
    _,
    rfiCode,
    rfiSubcode,
    feeDescription,
    name,
    documentNumber,
    amount,
    currency,
  ] = match;

  return Object.assign(
    {
      rfiCode,
      rfiSubcode,
      feeDescription,
      name,
      amount: Number(amount),
      currency,
    },
    documentNumber !== ''
      ? { documentNumber: documentNumber.substr(0, 13) }
      : null
  );
};

module.exports = parse;
