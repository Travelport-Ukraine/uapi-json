const itemPattern = new RegExp([
  // rfiCode, rfiSubcode
  '-([A-Z]{1})/([A-Z0-9]{3})',
  // Fee description, passenger name, amount, currency
  '\\/([^\\/]+)/NM-1(.+?)\\/\\/((?:\\d+\\.)?\\d+)\\/([A-Z]{3})',
].join(''), 'i');

const parse = (string) => {
  const [
    _,
    rfiCode,
    rfiSubcode,
    feeDescription,
    name,
    amount,
    currency,
  ] = string.match(itemPattern);

  return {
    rfiCode,
    rfiSubcode,
    feeDescription,
    name,
    amount: Number(amount),
    currency,
  };
};

export default parse;
