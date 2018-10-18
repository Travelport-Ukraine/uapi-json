module.exports = (obj, oldName, newName) => {
  if (oldName === newName) {
    return obj;
  }
  // Check for the old property name to avoid a ReferenceError in strict mode.
  if ({}.hasOwnProperty.call(obj, oldName)) {
    obj[newName] = obj[oldName];
    delete obj[oldName];
  }
  return obj;
};
