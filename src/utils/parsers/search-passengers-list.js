const moment = require('moment');

const beautify = require('../beautify-name');

const parse = (screen) => {
  const listPattern = /0*([0-9]+)\s[0-9]{2}([^\s]+)\s*(X?)\s([0-9]{2}[A-Z]{3}\d*)/g;
  const emptyPattern = /\s*(NO NAMES).*/g;

  if (screen.match(emptyPattern)) {
    return [];
  }

  const list = screen.match(listPattern);

  if (list === null) {
    return null;
  }

  const parsedList = list.map((line) => {
    listPattern.lastIndex = 0;
    const parsedLine = listPattern.exec(line);
    const [_, id, name, cancelled, date] = parsedLine;
    const [lastName, firstName] = name.split('/');
    return {
      id,
      lastName: beautify(lastName),
      firstName: beautify(firstName),
      isCancelled: cancelled.length > 0,
      date: moment(date, 'DDMMM').format(),
    };
  });

  return parsedList;
};

module.exports = parse;
