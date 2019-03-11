const { expect } = require('chai');
const { AirRuntimeError } = require('../../../src/Services/Air/AirErrors');
const convert = require('../../../src/Services/Air/transformers/decode-exchange-token');

const token = 'eJztWFtz2jgU/isezz61BHyBEJjpg/AFvPhCjUiXdjIdxxbgxljUNgTSyX9fychgbtlMtt3Z2dm8EB0dSUff+XTOBz94L0zaIEy0tT/z4inqLOMgQnz7yw/ex/M5jr+u6s2vQtnFiCc4d/iNb//gCyuY42Wc8W1e+dwX+Aqv5FYdoa1JvGk1iBUEgYKjCPlZiOO9s4sm5Nxi/Fw5PHvghQH01vszy2dJNy16Gg7yg37nn58rZ7zkurj3cu0LXvVWfe+lu5f2kvdOxueLTtLe6+MfxOvu+a5SoD1IQj+MpxRJcvX9xfpoQ9zHA7nR+N4BANQ6WrSurwbkX/Dhw/lNhjhabtG8vItZ3qXCQ5x5EV3OkiOJktgk9o6XosKsjdxmXaoKND3a92W48iIUZ2WP0kKSHZSW0sciHKLpHFFEDiNrwFZaRBatH7SH33eRdRO8XBCXnEFekoQoIaO+mQ/vw1iJvJQepPk4xvMNMetROJ1l9nJ+n7uKkkTT4yThNKQEA9aQDFWUZmHsFaRTu7lt4SXZMkEwnNPrSILYvBKlK1GAwnW70WgLArm98F4Q2zkIgERDQDjjfdMWT7zzQJ3JECWrLVpjGtWCRuBFzJoacRD6XoZp4BMvSlGBHeVNOvOSo7fmLFBCLhFPj6DZ2c+BQUlTOcD/0yoRC/xvnsZodoq/9Dfwr5fxL7Au41/k5Dz+kgyFVlsUXoc/8Sau8on3vwX/+uWX/+pn/6sfbIVnUVkom2FahrtLL/HiDKGAZpjgoHiRv4zyBBp5oe4WUOknKJ3eRj+8DV1C4gppAONPfZtCOCDpQqRhJHCzQKxsAhW+7ilrkwntKCuketmOHIJ8JYlQktuC3G4IVUlovhcERqWiUNsjRW5dV6+vidHG2a0XhUEHTXBy+MRLs2CS5aktTR63Ky0OcJKiw8pHFi/pprZju5peIx+arTr084qMR7YKOqbG5enhRqB35tWWAe39FEAvv83XACrX3wpoXqEvAUor1q8ClD3DDsYPJ2+QGRlS4xcKHiN83rhfojnrflu/iz1vLx9+QgS9FyK4WPWfC1yKh05AoVThCBe4vskNgMttk0oG1LYdkFQ3W3JVlgjunOto1ZbckG6aZAXP9jug4B7pEhl3R3e86dQjIjKK8KMX+7Q2EfdzM4dZg4m3QlFxwusrxkEBZ5Vs5Jq7zdmYImGNoWsMgK1ajqtVFceqdUC3C7qaqkFgmMO+WaUGfkcviNbZwUbUQHdi6zjVGCrOyIZDzgJjDgwG5pjrgKGmco7N6a72caTZkNPNseZyQwjgaFgjM6Zha5zS05S+Ydd0x7U4Rye5GVvEuWYZpgGBO65pUKnyeekonzwaQKchmJ2aJPe7HLkLRy3XkmnUxMaNqVhvW7JPnooyL4zSkkRfLCLSW+8jUpimlL5imikz5D/kLeWgn9HGRZt3WUkfr5bi4K9X7yvmy7S4XPf+p8V/khYsIJrdjRNfKCVvrBoX00pxEaUSSPUGBUlsHIDEYjoB6ljxHfL7jVT+R2O92wPP5OXJQhM/0p7DpncivFJM6Hj7q0BhHiAi3rNNToNcvmbJktrVMPWpANlPFCsMggvR5smGVQKDiNpki5QXkflcguTS/RZRlcF6U67qdZzAkHCLzpJbHyshGqaXZtQO8dbxWDSyi7Gz80ZOm3zOVgXHK5SkJBCX7dysCtdNmSonanEmxS8r9Oswa667Kka/B9ETlWWSoNin+jAXOex7RrAKU5xsLJSmHt3gC/+OG7iGYthdzh2Z2pC7BaahAkgNCnBdg9SU/NLvOB24Wl6BlB6wSVka2cR/yEFD6WuQFKN3RXsvybKCR68VY4wbByqvh9MMEnDoDxl8r54aoPjTV08R7oozS3sU1R6wWnXxMYtVwa8FdtC8twPTlmz1s+Cr9tpS3Uf7SdvY0JV8+fbJ+uYKwTf90YL6JjC1Hug8NPzh2gFM/Nw9/wlqs7o6';

describe('Air.transformers.decodeExchangeToken', () => {
  it('should not pass and add xml', () => {
    const params = { exchangeToken: token };
    return convert(params).then(() => {
      expect(params.xml).to.be.an('object');
      expect(params.xml).to.have.all.keys([
        'air:AirExchangeBundle_XML',
        'air:AirPricingSolution_XML',
        'common_v47_0:HostToken_XML',
      ]);
    });
  });

  it('should throw correct error', () => {
    const params = { exchangeToken: 123 };
    return convert(params).then(() => {
      throw new Error('Cant be success');
    }).catch((e) => {
      expect(e).to.be.instanceof(AirRuntimeError.ExchangeTokenIncorrect);
    });
  });
});
