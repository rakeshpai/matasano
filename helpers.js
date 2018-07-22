const hex = thing => Buffer.from(thing, 'hex');
const utf8toHex = str => Buffer.from(str, 'utf8');
const toBase64 = hex => Buffer.from(hex).toString('base64');

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
    .reduce((a, b) => a + b, 0);
}

const singleByteXor = (h, byte) => h.map(b => b ^ byte);

const scores = str => [...Array(128).keys()]
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
}

const hammingDistance = (a, b) => repeatingKeyXor(a, b)
  .map(onesCount)
  .reduce((a, b) => a + b);

module.exports = {
  hex, utf8toHex, toBase64, score, scores, singleByteXor,
  repeatingKeyXor, hammingDistance
};
