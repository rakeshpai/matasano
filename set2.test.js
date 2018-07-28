const { readFileSync } = require('fs');
const {
  pad, ecbDecrypt, ecbEncrypt, createArray, splitIntoBlocks,
  repeatingKeyXor, fromBase64
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

    const input = Buffer.from(readFileSync('./files/10.txt', 'utf8').split('\n').join(''));
    const iv = Buffer.from(createArray(16).map(x => '\x00').join(''));

    let previousCipher = iv;
    const plaintextBlocks = splitIntoBlocks(input, 16)
      .map(block => {
        const deciphered = ecbDecrypt(block, key);
        console.log(block, key);
        const plaintext = repeatingKeyXor(deciphered, previousCipher);
        previousCipher = block;
        return plaintext;
      });

    console.log(Buffer.concat(plaintextBlocks).toString('utf8'))
  });
});
