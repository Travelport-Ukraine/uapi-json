module.exports = (string) => {
  if (Object.prototype.toString.apply(string) !== '[object String]') {
    return null;
  }
  return string.split(' ').map(name => (
    name[0].toUpperCase() + name.slice(1).toLowerCase()
  )).join(' ');
};
