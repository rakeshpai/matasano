const { readFileSync, writeFileSync } = require('fs');
const {
  pad, ecbDecrypt, ecbEncrypt, cbcEncrypt, cbcDecrypt, fromBase64,
  createArray, utf8toHex, generateRandomBytes, isEncryptedWithECB,
  findKeySizes
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

  
  test('Challenge 11', () => {
    const encryptionOracle = input => {
      const randomKey = generateRandomBytes(16);

      const inputBuffer = Buffer.concat([
        generateRandomBytes(5 + Math.ceil(Math.random() + 5)),
        new Buffer(input, 'utf8'),
        generateRandomBytes(5 + Math.ceil(Math.random() + 5)),
      ]);
      
      const algo = Math.random() < 0.5 ? 'cbc' : 'ebc';

      return {
        algo,
        encrypted: algo === 'cbc'
          ? cbcEncrypt(inputBuffer, randomKey, true, generateRandomBytes(16))
          : ecbEncrypt(inputBuffer, randomKey, true)
      }
    };

    const encrypted = encryptionOracle('aaaabbbbccccddddaaaabbbbccccddddaaaabbbbccccddddaaaabbbbccccdddd');
    expect(
      isEncryptedWithECB(encrypted.encrypted.slice(10))
    ).toEqual(encrypted.algo === 'ebc');
  });

  test('Challenge 12', () => {
    const createEncryptionOracle = () => {
      const randomKey = generateRandomBytes(16);

      return input => ({
        algo: 'ecb',
        encrypted: ecbEncrypt(Buffer.concat([
          Buffer.from(input),
          fromBase64(readFileSync('./files/12.txt'))
        ]), randomKey, true)
      })
    };

    const encryptionOracle = createEncryptionOracle();

    const encrypted = encryptionOracle('A');
    
  });
});
