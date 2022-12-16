const { expect } = require('chai');
const { AirRuntimeError } = require('../../../src/Services/Air/AirErrors');
const convert = require('../../../src/Services/Air/transformers/decode-exchange-token');

const token = 'eJztWFtz2jgU/isezz61BHzBITDTB2HL4MUXaky6tJPpKLYAN8amtiGQTv77SsYGm0s2k213dnY2L0RHR9LRdz6d88EPFvlxB/gx3LhzFM5wdxV6AWY7X36wbrRYROHXtSR85couWjiNMoff2M4PtrCCRbQKU7bDyp8HHFtj5cyqYrwz8TdtiViB58lREGA39aPw4GzjKTm3GD/XqmcPke85aHM4s3yWcNOmp0VedtDv7PNz7YyX2OQPXrZ5wavZbh68VPvSXuLBSft80Uk4eH38g3jdPd/VCrSHse/64YwiSa5+uNgAb4n7ZChK0vcuAKDRhcGmuR6Sf8GHD+c3GUXBaofm5V308i411olSFNDleXIEXuBbxN5FCS7McGy3mkKdo+mB31f+GgU4TMsepYUkOzgppS+PcIRnC0wRqUYmOe2kiCzYPMCH3/eR9eJotSQuGYNQHPs4JqOBng3v/VAOUEIPgm4URostMauBP5un5mpxn7nygkDTY8X+zKcEA8aIDBWcpH6ICtIpvcy2RHG6irHjL+h1BI5vXfHCFc853HVHkjocR27Pvef4TgYCINEQEM5433T4E+8sUGs6wvF6h9aERrWkEaAgtyZa6PkuSiMa+BQFCS6wo7xJ5ig+emvWEsfkEuHsCJq9/RwYlDS1Cv6f1jFf4H/zNMHzU/yFv4F/s4x/gXUZ/yIn5/EXRIdrd3judfgTb+Iqnnj/W/BvXn75r372v/rB1tg8KgOn84iW4d4KxShMMfZohgkOMgrcVZAlUMsKda+ASj1B6fQ2avU2dAmJy6cBTD4NTArhkKQLk4YRO9slzssmUJzXPWU4ndKOssYKSvfk4MQrgXcEscOJHYmrC1zrPcflVCoKtTmWxfZ1/fqaGM0ovUWB73XxNIqrT7w0C6ZpltrS5HG7gqEXxQmuVj6yeEU3NS3ThmqDfEBTsejnFRmPTQV0dchk6WHGoH/m1ZYB7f8UQC+/zdcAKjbfCmhWoS8BSivWrwI0f4bdKHo4eYO5MUdq8kLBywmfNe6XaJ53v53fxZ53kA8/IYL+CxFcrPrPBS7FQyegUKowhAvMQGeGwGZ2SSUDatsNSKpbbbEuCgR3xrZgvS1Kwk2LrGDz/SoUPCBdIuP+6C6azRARkUEQPaLQpbWJuJ+bqWbNidEaB8UJr68YlQKeV7Kxre83z8cUCWPi2NoQmIph2bAuW0ajC3o90IMKdICmjwZ6nRrYPb0cvEkrG1ED3SlfxyjaSLbGpjNiDDBhwHCoT5guGEGFsUxGteHHMTQdRtUn0GZGDnDGowaZ0TUTMnIfygPNbKiWbTCWSnIzMYhzw9B0zQH2pAEduc5mpaN88njoWBKndxuCOOgx5C4MtVwLutbgpRtdNt625JA8BafID5KSRF8uA9Jb7wNSmGaUvnySynPsPmQtpdLPaOOizbuspI9XC6H316sPFfNlWlyue//T4j9Jizwgmt2tFV4oJW+sGhfTSnHhhRJITYmCxEsVkPKYToA6VnxVfr+Ryv9orHcH4HN5ebJQjx5pz8mn9yK8Vkyo0e5XgcI8xES8p9uMBpl8TeMVtSt+4lIBcpgoVmgEF6LN421eCTQiauMdUigg85kEyaT7LaYqI+9NmapXo9jxCbfoLLn1sRKiYaIkpXYn2jkei8b8YvnZWSOnTT5jqxyFaxwnJBA737lV565bIlVO1GJNi19W6NfhvLnuqxj9HkRPlFdxjEOX6sNM5OTfM7y1n0Tx1sBJgugGX9h3zNDWZM3sMfZYhyPmFuiaAhxqkIFta6SmZJd+x6jAhlkFkvvAJGVpbBL/EeNo8gA6pBi9K9p7SZYVPHqtGMu5UVF5/ShJHQIO/SGD7TcTDRR/6vopiHr83ICPvNIHRrvJP6ahwrkNz/Ra96anm4KpfOZcxdwYiv1oPsGt6diCK94+Gd9szvumPhqOuvV02AfdB8kdbSyQi5+75z8Be2W6Jg==';

describe('Air.transformers.decodeExchangeToken', () => {
  it('should not pass and add xml', () => {
    const params = { exchangeToken: token };
    return convert(params).then((res) => {
      expect(res.xml).to.be.an('object');
      expect(res.xml).to.have.all.keys([
        'air:AirExchangeBundle_XML',
        'air:AirPricingSolution_XML',
        'common_v52_0:HostToken_XML',
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
