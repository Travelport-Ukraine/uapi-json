/**
 * Applies function one by one
 * @param functions Array<Function> multiple functions as params
 */
module.exports = (...functions) => (params) => {
  functions.forEach(func => func(params));
  return params;
};
