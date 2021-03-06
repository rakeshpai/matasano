const { createDecipheriv, createCipheriv } = require('crypto');

const hex = thing => Buffer.from(thing, 'hex');
const utf8toHex = str => Buffer.from(str, 'utf8');
const toBase64 = hex => Buffer.from(hex).toString('base64');
const fromBase64 = str => Buffer.from(str, 'base64');

const createArray = size => [ ...Array(size).keys() ];
const sum = (a, b) => a + b;

const score = str => {
  const letters = 'abcdefghijklmnopqrstuvxyz';
  const alphabet = [
    ...letters.split(''),
    ...letters.toUpperCase().split(''),
    ' '
  ];

  return str
    .toString('utf8')
    .split('')
    .map(char => alphabet.includes(char) ? 1 : 0)
    .reduce(sum);
}

const singleByteXor = (h, byte) => h.map(b => b ^ byte);

const scores = str => createArray(128)
  .map(charCode => ({
    charCode,
    score: score(singleByteXor(str, charCode))
  }))
  .sort((a, b) => b.score - a.score);

const repeatingKeyXor = (h, k) => h.map((b, index) => b ^ (k[index % k.length]));

const onesCount = c => {
  let count = 0;
  while(c > 0) {
    count += c & 1;
    c >>= 1
  }
  return count;
};

const hammingDistance = (a, b) => repeatingKeyXor(a, b)
  .map(onesCount)
  .reduce(sum);

const splitIntoBlocks = (input, size) => createArray(Math.ceil(input.length / size))
  .map(blockIndex => input.slice(blockIndex * size, (blockIndex + 1) * size))

const transpose = blocks => createArray(blocks[0].length)
  .map(i => Buffer.from(blocks.map(b => b[i])));

const findKeySizes = input => {
  const keySizes = createArray(40).filter(x => x > 1);

  return keySizes
    .map(keySize => ({
      keySize,
      distance: (() => {
        const numTrials = 10;
        return splitIntoBlocks(input, keySize)
          .map((block, index, blocks) => {
            if(index > numTrials) return;
            return hammingDistance(block, blocks[index+1]) / keySize;
          })
          .slice(0, numTrials)
          .reduce(sum);
      })()
    }))
    .sort((a, b) => a.distance - b.distance)
    .map(x => x.keySize);
};

const pad = (str, length) => {
  return str + (createArray(length - str.length).map(x => '\x04').join(''));
};

const generateRandomBytes = numBytes => Buffer.from(
  createArray(numBytes).map(() => Math.ceil(Math.random() * 128))
);

const isEncryptedWithECB = buffer => splitIntoBlocks(buffer, 16)
  .some((block, index) => buffer.indexOf(block) !== index * 16);

const ecbEncrypt = (block, key, autoPadding = false) => {
  const cipher = createCipheriv('aes-128-ecb', key, '');
  cipher.setAutoPadding(autoPadding);

  return Buffer.concat([
    cipher.update(block),
    cipher.final()
  ]);
};

const ecbDecrypt = (input, key, autoPadding = false) => {
  const decipher = createDecipheriv("aes-128-ecb", key, '');
  decipher.setAutoPadding(autoPadding);

  return Buffer.concat([
    decipher.update(input),
    decipher.final()
  ]);
};

const zeroIV = keyLength => Buffer.from(createArray(keyLength)
  .map(x => String.fromCharCode(0))
  .join(''));

const cbcEncrypt = (input, key, autoPadding = false, iv = zeroIV(key.length)) => splitIntoBlocks(input, key.length)
  .reduce(({ buffer, previousCipher }, block) => {
    const encrypted = ecbEncrypt(repeatingKeyXor(block, previousCipher), key, autoPadding);
    return {
      buffer: Buffer.concat([
        buffer,
        encrypted
      ]),
      previousCipher: encrypted
    };
  }, {
    buffer: Buffer.from([]),
    previousCipher: iv
  })
  .buffer

const cbcDecrypt = (input, key, iv = zeroIV(key.length)) => splitIntoBlocks(input, key.length)
  .reduce(({ buffer, previousCipher }, block) => ({
    buffer: Buffer.concat([
      buffer,
      repeatingKeyXor(ecbDecrypt(block, key), previousCipher)
    ]),
    previousCipher: block
  }), {
    buffer: Buffer.from([]),
    previousCipher: iv
  })
  .buffer

module.exports = {
  hex, utf8toHex, toBase64, fromBase64, scores, createArray,
  singleByteXor, repeatingKeyXor, hammingDistance, splitIntoBlocks,
  transpose, findKeySizes, pad, ecbDecrypt, ecbEncrypt,
  cbcEncrypt, cbcDecrypt, isEncryptedWithECB, generateRandomBytes
};
