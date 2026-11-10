const test = require('node:test');
const assert = require('node:assert/strict');
const { averageAnswers } = require('./load-source').loadSource();

test('a 0-10 rating averages to its mean', () => {
  assert.equal(averageAnswers('scale', [4, 7, 7]).answerValue, 6);
});

test('blank, invalid and out-of-range ratings are ignored, not counted as zero', () => {
  const result = averageAnswers('scale', [5, '', 50, null, 'x', -1]);
  assert.equal(result.answerValue, 5);
  assert.equal(result.respondentCount, 1);
});

test('Yes/No averages to the majority, keeping the counts', () => {
  const result = averageAnswers('yesNo', ['Yes', 'Yes', 'No', 'Yes', 'No']);
  assert.equal(result.answerValue, 'Yes');
  assert.deepEqual({ ...result.optionCounts }, { Yes: 3, No: 2 });
});

test('an exact tie yields no conclusion, never a rounded answer', () => {
  const result = averageAnswers('yesNo', ['Yes', 'No', 'No', 'Yes']);
  assert.equal(result.answerState, 'noConclusion');
  assert.equal(result.answerValue, null);
  assert.deepEqual({ ...result.optionCounts }, { Yes: 2, No: 2 });
});

test('a three-way item averages to its most common answer', () => {
  assert.equal(averageAnswers('choice', ['Yes', "I don't know", "I don't know"]).answerValue, "I don't know");
});

test('no answers at all is "no answer", distinct from a tie', () => {
  assert.equal(averageAnswers('yesNo', []).answerState, 'noAnswer');
  assert.equal(averageAnswers('scale', undefined).answerState, 'noAnswer');
});

test('ranks average per option, lowest mean wins', () => {
  const result = averageAnswers('rank', [{ Cost: 1, Time: 2 }, { Cost: 1, Time: '' }]);
  assert.equal(result.answerValue.firstOption, 'Cost');
});

test('a blank rank counts below every ranked option, so one voter cannot decide alone', () => {
  const result = averageAnswers('rank', [{ Cost: 1, Time: '' }, { Cost: '', Time: 1 }]);
  assert.equal(result.answerState, 'noConclusion');
  assert.equal(result.answerValue.hasRanking, true);
});

test('nobody ranking anything means no benefit expected, not a tie', () => {
  const result = averageAnswers('rank', [{ Cost: '', Time: '' }]);
  assert.equal(result.answerState, 'answered');
  assert.equal(result.answerValue.hasRanking, false);
  assert.equal(result.answerValue.firstOption, null);
});
