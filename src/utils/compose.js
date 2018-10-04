/**
 * Simple compose function that takes two function with one params and
 * returns composition
 */
module.exports = (f, g) => params => g(f(params));
