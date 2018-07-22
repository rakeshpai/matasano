const {
  hex, utf8toHex, toBase64, score, scores, singleByteXor,
  repeatingKeyXor, hammingDistance
} = require("./helpers");
const { readFileSync } = require('fs');

describe('Set 1', () => {
  test('Challenge 1', () => {
    expect(
      toBase64(hex(
        '49276d206b696c6c696e6720796f757220627261696e206c696b65206120706f69736f6e6f7573206d757368726f6f6d'
      ))
    ).toEqual(
      'SSdtIGtpbGxpbmcgeW91ciBicmFpbiBsaWtlIGEgcG9pc29ub3VzIG11c2hyb29t'
    );
  });

  test('Challenge 2', () => {
    const a = hex('1c0111001f010100061a024b53535009181c');
    const b = hex('686974207468652062756c6c277320657965');

    if(a.length !== b.length) throw new Error(`Same length only`);

    const result = a.map((byte, index) => byte ^ b[index]);

    expect(result).toEqual(
      hex('746865206b696420646f6e277420706c6179')
    );
  });

  test('Challenge 3', () => {
    const str = hex('1b37373331363f78151b7f2b783431333d78397828372d363c78373e783a393b3736');

    const mostLikelyMatch = scores(str)[0];

    expect(
      singleByteXor(str, mostLikelyMatch.charCode).toString()
    ).toEqual(`Cooking MC's like a pound of bacon`);
    expect(mostLikelyMatch.charCode).toEqual(88);
    expect(String.fromCharCode(mostLikelyMatch.charCode)).toEqual('X');

    // ETAOIN SHRDLU
  });

  test('Challenge 4', () => {
    const file = readFileSync('./files/4.txt').toString('utf8');

    const decrypted = file
      .split('\n')
      .map(line => ({ line, ...(scores(hex(line))[0]) }))
      .sort((a, b) => b.score - a.score)[0];

    expect(
      singleByteXor(hex(decrypted.line), decrypted.charCode)
    ).toEqual(
      utf8toHex('Now that the party is jumping\n')
    );
  });

  test('Challenge 5', () => {
    const str = 'Burning \'em, if you ain\'t quick and nimble\nI go crazy when I hear a cymbal';

    expect(
      repeatingKeyXor(utf8toHex(str), utf8toHex('ICE'))
    ).toEqual(
      hex('0b3637272a2b2e63622c2e69692a23693a2a3c6324202d623d63343c2a26226324272765272a282b2f20430a652e2c652a3124333a653e2b2027630c692b20283165286326302e27282f')
    )
  });

  test('Challenge 6', () => {
    expect(
      hammingDistance(
        utf8toHex('this is a test'),
        utf8toHex('wokka wokka!!!')
      )
    ).toEqual(37);
  });
});
