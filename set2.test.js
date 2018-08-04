const { readFileSync, writeFileSync } = require('fs');
const {
  pad, ecbDecrypt, ecbEncrypt, cbcEncrypt, cbcDecrypt, fromBase64
} = require('./helpers');

describe('Set 2', () => {
  test('Challenge 9', () => {
    const str = 'YELLOW SUBMARINE';
    expect(pad(str, 20)).toEqual('YELLOW SUBMARINE\x04\x04\x04\x04');
  });

  test('Challenge 10', () => {
    const key = 'YELLOW SUBMARINE';
    const encrypted = ecbEncrypt(Buffer.from('yellow submarine'), key);
    const decrypted = ecbDecrypt(encrypted, key);
    expect(decrypted.toString('utf8')).toEqual('yellow submarine');

    expect(
      ecbDecrypt(
        ecbEncrypt(
          Buffer.from('aaaabbbbccccddddaaaabbbbccccdddd'),
          new Buffer('abcdabcdabcdabcd')
        ),
        new Buffer('abcdabcdabcdabcd')
      ).toString('utf8')
    ).toEqual('aaaabbbbccccddddaaaabbbbccccdddd');

    expect(
      cbcDecrypt(
        cbcEncrypt(
          Buffer.from('aaaabbbbccccddddaaaabbbbccccdddd'),
          new Buffer('abcdabcdabcdabcd')
        ),
        new Buffer('abcdabcdabcdabcd')
      ).toString('utf8')
    ).toEqual('aaaabbbbccccddddaaaabbbbccccdddd');

    const input = fromBase64(readFileSync('./files/10.txt', 'utf8'));
    const plaintextBuffer = cbcDecrypt(input, key);
    expect(plaintextBuffer).toEqual(readFileSync('./snapshots/10.txt'));
  });
});
