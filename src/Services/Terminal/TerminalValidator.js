function Validator(params) {
  this.params = params;
}

Validator.prototype.end = function () {
  return this.params;
};

module.exports = {
  CREATE_SESSION(params) {
    return new Validator(params)
      .end();
  },
  TERMINAL_REQUEST(params) {
    return new Validator(params)
      .end();
  },
  CLOSE_SESSION(params) {
    return new Validator(params)
      .end();
  },
};
