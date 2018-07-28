const { readFileSync } = require('fs');
const { createDecipheriv } = require('crypto');
const {
  hex, utf8toHex, toBase64, fromBase64, scores, singleByteXor,
  splitIntoBlocks, repeatingKeyXor, hammingDistance,
  transpose, findKeySizes
} = require("./helpers");

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
    expect(
      repeatingKeyXor(
        utf8toHex('Burning \'em, if you ain\'t quick and nimble\nI go crazy when I hear a cymbal'),
        utf8toHex('ICE')
      )
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

    expect(
      transpose(
        [
          [1, 2, 3],
          [4, 5, 6]
        ]
      )
    ).toEqual(
      [
        Buffer.from([1, 4]),
        Buffer.from([2, 5]),
        Buffer.from([3, 6])
      ]
    );

    expect(
      splitIntoBlocks([1, 2, 3, 4, 5, 6, 7, 8, 9], 3)
    ).toEqual(
      [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ]
    );

    const input = fromBase64(readFileSync('./files/6.txt', 'utf8').split('\n').join(''));

    const possibleKeySize = findKeySizes(input)[0];

    const blocks = splitIntoBlocks(input, possibleKeySize);
    const transposed = transpose(blocks);

    const key = Buffer.from(transposed.map(b => scores(b)[0].charCode), 'hex');
    expect(key.toString('utf8')).toEqual('Terminator X: Bring the noise');
    // console.log(repeatingKeyXor(input, key).toString('utf8'))
  });

  test('Challenge 7', () => {
    const key = 'YELLOW SUBMARINE';
    const input = fromBase64(readFileSync('./files/7.txt', 'utf8'));

    const decipher = createDecipheriv("aes-128-ecb", key, '');

    result = decipher.update(input, 'hex', 'utf8');
    result += decipher.final('utf8');

    // console.log(result);
  });

  test('Challenge 8', () => {
    const input = readFileSync('./files/8.txt', 'utf8');
    
    const lines = input.split('\n').map(line => hex(line));

    const hasDuplicates = lines.map(line => {
      const blocks = splitIntoBlocks(line, 16);
      
      return blocks.some((block, index) => {
        return line.indexOf(block) > -1 && line.indexOf(block) !== index * 16;
      });
    });

    expect(hasDuplicates.findIndex(x => x === true)).toEqual(132);
  });
});
