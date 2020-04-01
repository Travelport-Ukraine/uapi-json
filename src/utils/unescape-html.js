module.exports = function (encodedString) {
  const translateRe = /&(nbsp|amp|quot|lt|gt);/g;
  const translate = {
    nbsp: ' ',
    amp: '&',
    quot: '"',
    lt: '<',
    gt: '>'
  };
  return encodedString.replace(translateRe, (match, entity) => {
    return translate[entity];
  });
};
