export default (string) => {
  if (!string) {
    return null;
  }

  const [, pcc = null] = string.match(/NO AGREEMENT EXISTS FOR AGENCY(?:\s+)-(?:\s+)([A-Z0-9]+)/) || [];

  return pcc;
};
