module.exports = (ccData = {}, ccAuthData = {}) => {
  const type = ccData.Type;
  const number = ccData.Number;
  const approvalCode = ccAuthData.AuthCode && ccAuthData.AuthResultCode === 'approved'
    ? `-${ccAuthData.AuthCode}`
    : '';

  return type && number
    ? `${type}${number}${approvalCode}`
    : 'CC';
};
