const assert = require('assert');
const errors = require('../src').errors;
const utils = require('../src/utils');

const hookStream = function(_stream, fn) {
  const oldWrite = _stream.write;
  _stream.write = fn;

  return function() {
    _stream.write = oldWrite;
  };
};

describe('#utils', () => {
  it('log() shoud write ti process.stdout', (cb) => {
    const unhook = hookStream(process.stdout, (string, end, fd) => {
      assert.equal(string, 'hello { prop: 1 }\n');
    });
    utils.log('hello', { prop: 1 });
    unhook();
    cb();
  });

  it('setLog() should overwrite default log writer', () => {
    const unhook = hookStream(process.stdout, (string, end, fd) => {
      assert.error('Should not be called');
    });

    utils.setLog((message, data) => {
      assert.equal(message, 'hello', 'Message is not hello');
      assert.equal(data, 1, 'Data is not correct');
    });

    utils.log('hello', 1);

    unhook();
  });

  it('beautifyName() should make beautiful name', () => {
    assert.equal(utils.beautifyName('HELLO WORLD'), 'Hello World');
  });

  it('firstInObj() should return undefined value', () => {
    assert.strictEqual(utils.firstInObj({}), undefined);
  });

  it('firstInObj() should return first property value', () => {
    assert.equal(utils.firstInObj({ a: 1, b: 2, c: 3 }), 1);
  });

  it('renameProperty() should mutate object to rename its prop', () => {
    const obj = { a: 123 };
    utils.renameProperty(obj, 'a', 'b');
    assert.equal(obj.a, undefined);
    assert.equal(obj.b, 123);
  });

  it('renameProperty() should check for not existed property', () => {
    const obj = { };
    utils.renameProperty(obj, 'a', 'b');
    assert.equal(obj.a, undefined);
    assert.equal(obj.b, undefined);
  });
});
