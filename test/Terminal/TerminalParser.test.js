/*
  eslint-disable import/no-extraneous-dependencies
*/

import fs from 'fs';
import { expect } from 'chai';
import uAPI from '../../src';
import ParserUapi from '../../src/Request/uapi-parser';
import terminalParser from '../../src/Services/Terminal/TerminalParser';

const xmlFolder = `${__dirname}/MockResponses`;

describe('#terminalParser', () => {
  describe('createSession()', () => {
    it('should throw an error when credentials are wrong', () => {
      const uParser = new ParserUapi('terminal:CreateTerminalSessionRsp', 'v36_0', {});
      const xml = fs.readFileSync(`${xmlFolder}/createSessionAuthError.xml`).toString();
      return uParser.parse(xml).then(() => {
        throw new Error('Successfully parsed error result');
      }).catch((err) => {
        expect(err).to.be.an.instanceof(uAPI.errors.Request.RequestSoapError.SoapParsingError);
      });
    });
    it('should throw an error when no host token in response', () => {
      const uParser = new ParserUapi('terminal:CreateTerminalSessionRsp', 'v36_0', {});
      const xml = fs.readFileSync(`${xmlFolder}/createSessionBranchError.xml`).toString();
      const parseFunction = terminalParser.CREATE_SESSION;
      return uParser.parse(xml).then((json) => {
        parseFunction.call(uParser, json);
        throw new Error('Successfully parsed error result');
      }).catch((err) => {
        expect(err).to.be.an.instanceof(
          uAPI.errors.Terminal.TerminalParsingError.TerminalSessionTokenMissing
        );
      });
    });
    it('should parse token from normal response', () => {
      const uParser = new ParserUapi('terminal:CreateTerminalSessionRsp', 'v36_0', {});
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
      const uParser = new ParserUapi('terminal:TerminalRsp', 'v36_0', {});
      const xml = fs.readFileSync(`${xmlFolder}/executeCommandTokenMissing.xml`).toString();
      const parseFunction = terminalParser.TERMINAL_REQUEST;
      return uParser.parse(xml).then((json) => {
        parseFunction.call(uParser, json);
        throw new Error('Successfully parsed error result');
      }).catch((err) => {
        expect(err).to.be.an.instanceof(
          uAPI.errors.Terminal.TerminalParsingError.TerminalResponseMissing
        );
      });
    });
    it('should throw an error when invalid token provided in request', () => {
      const uParser = new ParserUapi('terminal:TerminalRsp', 'v36_0', {});
      const xml = fs.readFileSync(`${xmlFolder}/executeCommandTokenInvalid.xml`).toString();
      const parseFunction = terminalParser.TERMINAL_REQUEST;
      return uParser.parse(xml).then((json) => {
        parseFunction.call(uParser, json);
        throw new Error('Successfully parsed error result');
      }).catch((err) => {
        expect(err).to.be.an.instanceof(
          uAPI.errors.Terminal.TerminalParsingError.TerminalResponseMissing
        );
      });
    });
    it('should return response for a valid command request', () => {
      const uParser = new ParserUapi('terminal:TerminalRsp', 'v36_0', {});
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
      const uParser = new ParserUapi('terminal:EndTerminalSessionRsp', 'v36_0', {});
      const xml = fs.readFileSync(`${xmlFolder}/closeSessionTokenMissing.xml`).toString();
      const parseFunction = terminalParser.CLOSE_SESSION;
      return uParser.parse(xml).then((json) => {
        parseFunction.call(uParser, json);
        throw new Error('Successfully parsed error result');
      }).catch((err) => {
        expect(err).to.be.an.instanceof(
          uAPI.errors.Terminal.TerminalRuntimeError.TerminalCloseSessionFailed
        );
      });
    });
    it('should return an error when invalid token provided', () => {
      const uParser = new ParserUapi('terminal:EndTerminalSessionRsp', 'v36_0', {});
      const xml = fs.readFileSync(`${xmlFolder}/closeSessionTokenInvalid.xml`).toString();
      const parseFunction = terminalParser.CLOSE_SESSION;
      return uParser.parse(xml).then((json) => {
        parseFunction.call(uParser, json);
        throw new Error('Successfully parsed error result');
      }).catch((err) => {
        expect(err).to.be.an.instanceof(
          uAPI.errors.Terminal.TerminalRuntimeError.TerminalCloseSessionFailed
        );
      });
    });
    it('should return response for a valid close session request', () => {
      const uParser = new ParserUapi('terminal:EndTerminalSessionRsp', 'v36_0', {});
      const xml = fs.readFileSync(`${xmlFolder}/closeSessionSuccess.xml`).toString();
      const parseFunction = terminalParser.CLOSE_SESSION;
      return uParser.parse(xml).then((json) => {
        const response = parseFunction.call(uParser, json);
        expect(response).to.equal(true);
      });
    });
  });
});
