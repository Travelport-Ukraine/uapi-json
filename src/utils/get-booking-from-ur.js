module.exports = function getBookingFromUr(ur, pnr) {
  return ur.find(
    record => record.pnr === pnr
  );
};
