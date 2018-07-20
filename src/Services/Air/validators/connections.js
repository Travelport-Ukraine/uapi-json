import { AirValidationError } from '../AirErrors';

const connectionsFields = [
  'preferredConnectionPoints',
  'permittedConnectionPoints',
  'prohibitedConnectionPoints',
];

function isIata(str) {
  return !!str.match(/^[A-Z]{3}$/);
}

function validateIsArray(params, prop) {
  if (params[prop]
    && (!Array.isArray(params[prop]) || params[prop].find(item => !isIata(item)))
  ) {
    throw new AirValidationError.IncorrectConnectionsFormat(params);
  }
}

export default (params) => {
  connectionsFields.forEach(cf => validateIsArray(params, cf));
};
