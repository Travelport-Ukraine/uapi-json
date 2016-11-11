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
    it('should throw error when credentials are wrong', () => {
      const uParser = new ParserUapi('terminal:CreateTerminalSessionRsp', 'v36_0', {});
      const xml = fs.readFileSync(`${xmlFolder}/createSessionAuthError.xml`).toString();
      return uParser.parse(xml).then(() => {
        throw new Error('Successfully parsed error result');
      }).catch((err) => {
        expect(err).to.be.an.instanceof(uAPI.errors.Request.RequestSoapError.SoapParsingError);
      });
    });
    it('should throw error when no host token in response', () => {
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
});
