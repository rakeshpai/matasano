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
        return splitIntoBlocks(input, keySize)
          .map((block, index, blocks) => {
            if(index > 10) return;
            return hammingDistance(block, blocks[index+1]) / keySize;
          })
          .slice(0, 10)
          .reduce(sum);
      })()
    }))
    .sort((a, b) => a.distance - b.distance)
    .map(x => x.keySize);
};

module.exports = {
  hex, utf8toHex, toBase64, fromBase64, scores, createArray,
  singleByteXor, repeatingKeyXor, hammingDistance, splitIntoBlocks,
  transpose, findKeySizes
};
