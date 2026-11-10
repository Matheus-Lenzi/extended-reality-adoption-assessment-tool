const test = require('node:test');
const assert = require('node:assert/strict');
const { baselineScore, wholeNumber } = require('./load-source').loadSource();
const { referenceData } = require('./load-source');

const reference = referenceData();
const choice = { device: reference.devices[0].device, platform: reference.platforms[0].platform };

// Expectations are computed from whichever evaluation data is present, never from remembered numbers.
function converted(parts) {
  const average = parts.reduce((sum, part) => sum + part.fieldScore, 0) / parts.length;
  return wholeNumber((average - 1) / 4 * 10);
}

test('a pre-filled answer is its evidence converted from 1-5 onto 0-10', () => {
  for (const code of ['TR1', 'TR2', 'TR4']) {
    const baseline = baselineScore(code, choice, reference);
    assert.equal(baseline.empty, false, code + ' has evidence in the data');
    assert.equal(baseline.baselineValue, converted(baseline.baselineParts), code);
  }
});

test('the lowest possible evaluation lands on 0, not on 2 (the reason for the conversion)', () => {
  const lowest = { ...reference, devices: reference.devices.map((row) => ({ ...row, score: 1 })) };
  assert.equal(baselineScore('TR1', choice, lowest).baselineValue, 0);
  const highest = { ...reference, devices: reference.devices.map((row) => ({ ...row, score: 5 })) };
  assert.equal(baselineScore('TR1', choice, highest).baselineValue, 10);
});

test('hybrid items average device and platform scores together', () => {
  const result = baselineScore('TR3', choice, reference);
  assert.equal(result.baselineParts.length, 3, 'two device criteria and one platform characteristic');
  assert.equal(result.baselineValue, converted(result.baselineParts));
});

test('a half rounds up, including a value a float-error below it; a genuine .4999 still rounds down', () => {
  assert.equal(wholeNumber(6.5), 7);
  assert.equal(wholeNumber(6.499999999999999), 7);
  assert.equal(wholeNumber(6.4999), 6);
});

test('items our evaluation does not cover (TR8 audio, TR9 haptic) have no baseline', () => {
  assert.equal(baselineScore('TR8', choice, reference).empty, true);
  assert.equal(baselineScore('TR9', choice, reference).empty, true);
});

test('an unknown device, or a score outside 1-5, gives no baseline instead of a wrong one', () => {
  assert.equal(baselineScore('TR1', { device: 'Unknown headset' }, reference).empty, true);
  const broken = { ...reference, devices: reference.devices.map((row) => ({ ...row, score: 7 })) };
  assert.equal(baselineScore('TR1', choice, broken).empty, true);
});
