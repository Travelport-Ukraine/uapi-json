const Utils = {
  price(string) {
    if (string === undefined || string === null) {
      return null;
    }
    return {
      currency: string.slice(0, 3),
      value: 1.0 * string.slice(3, string.length),
    };
  },
  beautifyName(string) {
    return string.split(' ').map((name) => name[0] + name.slice(1).toLowerCase()).join(' ');
  },

  firstInObj(obj) {
    return obj && obj[Object.keys(obj)[0]];
  },

  renameProperty(obj, oldName, newName) {
    if (oldName === newName) {
      return obj;
    }
    // Check for the old property name to avoid a ReferenceError in strict mode.
    if ({}.hasOwnProperty.call(obj, oldName)) {
      obj[newName] = obj[oldName];
      delete obj[oldName];
    }
    return obj;
  },
};
module.exports = Utils;
