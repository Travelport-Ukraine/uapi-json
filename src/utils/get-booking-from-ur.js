module.exports = function getBookingFromUr(ur, pnr) {
  if (!Array.isArray(ur)) {
    return ur;
  }

  return ur.find(
    (record) => record.pnr === pnr
  );
};
