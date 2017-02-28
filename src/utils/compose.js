/**
 * Simple compose function that takes two function with one params and
 * returns composition
 */
export default (f, g) => params => g(f(params));
