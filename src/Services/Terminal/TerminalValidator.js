const {
  TerminalValidationError,
} = require('./TerminalErrors');

function Validator(params) {
  this.params = params;
}

Validator.prototype.end = function () {
  return this.params;
};

Validator.prototype.paramsIsObject = function () {
  if (!this.params) {
    throw new TerminalValidationError.ParamsMissing(this.params);
  }
  if ((typeof this.params) !== 'object') {
    throw new TerminalValidationError.ParamsInvalidType(this.params);
  }
  return this;
};

Validator.prototype.command = function () {
  if (!this.params.command) {
    throw new TerminalValidationError.CommandMissing(this.params);
  }
  if ((typeof this.params.command) !== 'string') {
    throw new TerminalValidationError.CommandInvalid(this.params);
  }
  return this;
};

Validator.prototype.sessionToken = function () {
  if (!this.params.sessionToken) {
    throw new TerminalValidationError.SessionTokenMissing(this.params);
  }
  if ((typeof this.params.sessionToken) !== 'string') {
    throw new TerminalValidationError.SessionTokenInvalid(this.params);
  }
  return this;
};

Validator.prototype.timeout = function () {
  if (this.params.timeout !== false) {
    if ((typeof this.params.timeout) !== 'number') {
      throw new TerminalValidationError.SessionTimeoutInvalid(this.params);
    }
    if (this.params.timeout <= 0) {
      throw new TerminalValidationError.SessionTimeoutTooLow(this.params);
    }
  }
  return this;
};

module.exports = {
  CREATE_SESSION(params) {
    return new Validator(params)
      .paramsIsObject()
      .timeout()
      .end();
  },
  TERMINAL_REQUEST(params) {
    return new Validator(params)
      .paramsIsObject()
      .sessionToken()
      .command()
      .end();
  },
  CLOSE_SESSION(params) {
    return new Validator(params)
      .paramsIsObject()
      .sessionToken()
      .end();
  },
};
