const test = require('node:test');
const assert = require('node:assert/strict');
const { fitScores, averagedAnswers } = require('./load-source').loadSource();
const { mould } = require('./fixtures');

test('Score_i = R x T / 10 and TTF_TOTAL is their equal-weighted mean', () => {
  const fit = fitScores(averagedAnswers(mould.submissions));
  assert.equal(fit.empty, false);
  assert.equal(fit.componentRows.find((row) => row.dimensionName === 'Haptic').componentScore, 1.4);
  assert.ok(Math.abs(fit.totalScore - 30.3 / 8) < 1e-9);
});

test('a missing readiness answer gives no total, and says what is missing', () => {
  const fit = fitScores(averagedAnswers({ ...mould.submissions, developer: [] }));
  assert.equal(fit.empty, true);
  assert.match(fit.reason, /T_D1/);
});
