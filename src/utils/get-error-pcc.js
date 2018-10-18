module.exports = (string) => {
  if (!string) {
    return null;
  }

  const [, pcc = null] = string.match(/NO AGREEMENT EXISTS FOR AGENCY\s+-\s+([A-Z0-9]{3,4})/) || [];

  return pcc;
};
