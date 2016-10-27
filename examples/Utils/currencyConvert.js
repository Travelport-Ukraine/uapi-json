const uAPI = require('../../index');
const config = require('../../test/testconfig');

const UtilsService = uAPI.createUtilsService(
  {
    auth: config,
    debug: 2,
    production: true,
  }
);

UtilsService.currencyConvert({
  currencies: [{ from: 'EUR', to: 'USD' }, { from: 'UAH', to: 'USD' }],
}).then(
  res => console.log(res),
  err => console.log(err)
);
