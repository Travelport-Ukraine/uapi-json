/*
  eslint-disable import/no-extraneous-dependencies
*/

const fs = require('fs');
const { expect } = require('chai');
const uAPI = require('../../src');
const Parser = require('../../src/Request/uapi-parser');
const errorsConfig = require('../../src/Request/errors-config');

const terminalParser = require('../../src/Services/Terminal/TerminalParser');

const TerminalError = uAPI.errors.Terminal;
const RequestError = uAPI.errors.Request;
const xmlFolder = `${__dirname}/MockResponses`;

describe('#TerminalParser', () => {
  describe('errorHandler()', () => {
    it('should throw an error in case of SOAP:Fault', () => Promise.resolve()
      .then(() => terminalParser.TERMINAL_ERROR())
      .then(() => Promise.reject(new Error('Error not thrown')))
      .catch((err) => {
        expect(err).to.be.an.instanceOf(RequestError.RequestRuntimeError.UnhandledError);
        expect(err.causedBy).to.be.an.instanceOf(TerminalError.TerminalRuntimeError);
      }));

    it('should throw correct error in case of no agreement', () => {
      const errorConfig = errorsConfig();
      const uParser = new Parser('terminal:TerminalReq', 'v47_0', {}, errorConfig);
      const xml = fs.readFileSync(`${xmlFolder}/terminalError.xml`).toString();
      return uParser.parse(xml)
        .then((json) => {
          const errData = uParser.mergeLeafRecursive(json['SOAP:Fault'][0]);
          const parsed = terminalParser.TERMINAL_ERROR.call(uParser, errData);
          return parsed;
        })
        .then(() => { throw new Error('Error not thrown'); })
        .catch((err) => {
          expect(err.data.pcc).to.be.equal('79YE');
          expect(err).to.be.an.instanceof(
            TerminalError.TerminalRuntimeError.NoAgreement
          );
        });
    });

    it('should throw correct error ', () => {
      const errorConfig = errorsConfig();
      const uParser = new Parser('terminal:TerminalReq', 'v47_0', {}, errorConfig);
      const xml = fs.readFileSync(`${xmlFolder}/terminalError-other.xml`).toString();
      return uParser.parse(xml)
        .then((json) => {
          const errData = uParser.mergeLeafRecursive(json['SOAP:Fault'][0]);
          const parsed = terminalParser.TERMINAL_ERROR.call(uParser, errData);
          return parsed;
        })
        .then(() => { throw new Error('Error not thrown'); })
        .catch((err) => {
          expect(err).to.be.an.instanceOf(RequestError.RequestRuntimeError.UnhandledError);
          expect(err.causedBy).to.be.an.instanceOf(TerminalError.TerminalRuntimeError);
        });
    });
  });
  describe('createSession()', () => {
    it('should throw an error when credentials are wrong', () => {
      const uParser = new Parser('terminal:CreateTerminalSessionRsp', 'v47_0', {});
      const xml = fs.readFileSync(`${xmlFolder}/createSessionAuthError.xml`).toString();
      return uParser.parse(xml).then(() => {
        throw new Error('Successfully parsed error result');
      }).catch((err) => {
        expect(err).to.be.an.instanceOf(RequestError.RequestRuntimeError.UnhandledError);
        expect(err.causedBy).to.be.an.instanceOf(RequestError.RequestSoapError.SoapServerError);
      });
    });
    it('should throw an error when no host token in response', () => {
      const uParser = new Parser('terminal:CreateTerminalSessionRsp', 'v47_0', {});
      const xml = fs.readFileSync(`${xmlFolder}/createSessionBranchError.xml`).toString();
      const parseFunction = terminalParser.CREATE_SESSION;
      return uParser.parse(xml).then((json) => {
        parseFunction.call(uParser, json);
        throw new Error('Successfully parsed error result');
      }).catch((err) => {
        expect(err).to.be.an.instanceof(
          TerminalError.TerminalParsingError.TerminalSessionTokenMissing
        );
      });
    });
    it('should parse token from normal response', () => {
      const uParser = new Parser('terminal:CreateTerminalSessionRsp', 'v47_0', {});
      const xml = fs.readFileSync(`${xmlFolder}/createSessionSuccess.xml`).toString();
      const parseFunction = terminalParser.CREATE_SESSION;
      return uParser.parse(xml).then((json) => {
        const token = parseFunction.call(uParser, json);
        return expect(token).to.be.ok;
      });
    });
  });
  describe('executeCommand()', () => {
    it('should throw an error when no token provided in request', () => {
      const uParser = new Parser('terminal:TerminalRsp', 'v47_0', {});
      const xml = fs.readFileSync(`${xmlFolder}/executeCommandTokenMissing.xml`).toString();
      const parseFunction = terminalParser.TERMINAL_REQUEST;
      return uParser.parse(xml).then((json) => {
        parseFunction.call(uParser, json);
        throw new Error('Successfully parsed error result');
      }).catch((err) => {
        expect(err).to.be.an.instanceof(
          TerminalError.TerminalParsingError.TerminalResponseMissing
        );
      });
    });
    it('should throw an error when invalid token provided in request', () => {
      const uParser = new Parser('terminal:TerminalRsp', 'v47_0', {});
      const xml = fs.readFileSync(`${xmlFolder}/executeCommandTokenInvalid.xml`).toString();
      const parseFunction = terminalParser.TERMINAL_REQUEST;
      return uParser.parse(xml).then((json) => {
        parseFunction.call(uParser, json);
        throw new Error('Successfully parsed error result');
      }).catch((err) => {
        expect(err).to.be.an.instanceof(
          TerminalError.TerminalParsingError.TerminalResponseMissing
        );
      });
    });
    it('should return response for a valid command request', () => {
      const uParser = new Parser('terminal:TerminalRsp', 'v47_0', {});
      const xml = fs.readFileSync(`${xmlFolder}/executeCommandPccInvalid.xml`).toString();
      const parseFunction = terminalParser.TERMINAL_REQUEST;
      return uParser.parse(xml).then((json) => {
        const response = parseFunction.call(uParser, json);
        expect(response).to.be.an('array');
        response.forEach((line) => {
          expect(line).to.be.a('string');
        });
      });
    });
  });
  describe('closeSession()', () => {
    it('should return an error when no token provided', () => {
      const uParser = new Parser('terminal:EndTerminalSessionRsp', 'v47_0', {});
      const xml = fs.readFileSync(`${xmlFolder}/closeSessionTokenMissing.xml`).toString();
      const parseFunction = terminalParser.CLOSE_SESSION;
      return uParser.parse(xml).then((json) => {
        parseFunction.call(uParser, json);
        throw new Error('Successfully parsed error result');
      }).catch((err) => {
        expect(err).to.be.an.instanceof(
          TerminalError.TerminalRuntimeError.TerminalCloseSessionFailed
        );
      });
    });
    it('should return an error when invalid token provided', () => {
      const uParser = new Parser('terminal:EndTerminalSessionRsp', 'v47_0', {});
      const xml = fs.readFileSync(`${xmlFolder}/closeSessionTokenInvalid.xml`).toString();
      const parseFunction = terminalParser.CLOSE_SESSION;
      return uParser.parse(xml).then((json) => {
        parseFunction.call(uParser, json);
        throw new Error('Successfully parsed error result');
      }).catch((err) => {
        expect(err).to.be.an.instanceof(
          TerminalError.TerminalRuntimeError.TerminalCloseSessionFailed
        );
      });
    });
    it('should return response for a valid close session request', () => {
      const uParser = new Parser('terminal:EndTerminalSessionRsp', 'v47_0', {});
      const xml = fs.readFileSync(`${xmlFolder}/closeSessionSuccess.xml`).toString();
      const parseFunction = terminalParser.CLOSE_SESSION;
      return uParser.parse(xml).then((json) => {
        const response = parseFunction.call(uParser, json);
        expect(response).to.equal(true);
      });
    });

    it('should return an error for HostAccessServiceResponse in null XML', () => {
      const uParser = new Parser('terminal:TerminalRsp', 'v47_0', {});
      const xml = fs.readFileSync(`${xmlFolder}/HostAccessServiceResponse.xml`).toString();
      const parseFunction = terminalParser.TERMINAL_REQUEST;
      return uParser.parse(xml).then((json) => {
        try {
          parseFunction.call(uParser, json);
        } catch (e) {
          expect(e.name).to.equal('TerminalParsingError.TerminalResponseMissing');
        }
      });
    });
  });
});
