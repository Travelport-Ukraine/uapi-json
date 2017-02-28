/**
 * Apply all transformers to params
 * @param transformers Array<Function>
 */
export default (...transformers) => (params) => {
  const cloned = JSON.parse(JSON.stringify(params));
  return transformers.reduce((acc, x) => x(acc), cloned);
};
