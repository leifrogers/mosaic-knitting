const test = require('node:test');
const assert = require('node:assert');
const { isValidHexColor } = require('./utils.js');

test('isValidHexColor validation tests', async (t) => {

    await t.test('Valid 6-character hex colors', () => {
        assert.strictEqual(isValidHexColor('#000000'), true);
        assert.strictEqual(isValidHexColor('#ffffff'), true);
        assert.strictEqual(isValidHexColor('#FFFFFF'), true);
        assert.strictEqual(isValidHexColor('#1a2B3c'), true);
        assert.strictEqual(isValidHexColor('#123456'), true);
    });

    await t.test('Valid 3-character hex colors', () => {
        assert.strictEqual(isValidHexColor('#000'), true);
        assert.strictEqual(isValidHexColor('#fff'), true);
        assert.strictEqual(isValidHexColor('#FFF'), true);
        assert.strictEqual(isValidHexColor('#1aB'), true);
        assert.strictEqual(isValidHexColor('#123'), true);
    });

    await t.test('Invalid hex colors - missing hash', () => {
        assert.strictEqual(isValidHexColor('000000'), false);
        assert.strictEqual(isValidHexColor('ffffff'), false);
        assert.strictEqual(isValidHexColor('000'), false);
        assert.strictEqual(isValidHexColor('fff'), false);
    });

    await t.test('Invalid hex colors - incorrect length', () => {
        assert.strictEqual(isValidHexColor('#0'), false);
        assert.strictEqual(isValidHexColor('#00'), false);
        assert.strictEqual(isValidHexColor('#0000'), false);
        assert.strictEqual(isValidHexColor('#00000'), false);
        assert.strictEqual(isValidHexColor('#0000000'), false);
    });

    await t.test('Invalid hex colors - invalid characters', () => {
        assert.strictEqual(isValidHexColor('#gggggg'), false);
        assert.strictEqual(isValidHexColor('#12345g'), false);
        assert.strictEqual(isValidHexColor('#ggg'), false);
        assert.strictEqual(isValidHexColor('#12g'), false);
        assert.strictEqual(isValidHexColor('#12345678'), false);
        assert.strictEqual(isValidHexColor('#!@#$'), false);
    });

    await t.test('Invalid hex colors - edge cases', () => {
        assert.strictEqual(isValidHexColor(''), false);
        assert.strictEqual(isValidHexColor('#'), false);
        assert.strictEqual(isValidHexColor(' #ffffff'), false); // Leading space
        assert.strictEqual(isValidHexColor('#ffffff '), false); // Trailing space
    });
});
