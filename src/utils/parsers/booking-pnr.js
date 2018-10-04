const parse = (screen) => {
  const pnrPattern = /(?:^|\n)\s*([A-Z0-9]{6})\/(?:[A-Z0-9]+\s+){3}AG\s+[0-9]+\s+[0-9]{1,2}[A-Z]{3}\s*\n/i;
  const matched = screen.match(pnrPattern);
  if (matched) {
    const [_, pnr] = matched;
    return pnr;
  }
  return null;
};

module.exports = parse;
