const test = require('node:test');
const assert = require('node:assert/strict');
const source = require('./load-source').loadSource();
const { mould, integrator } = require('./fixtures');

const { averagedAnswers, evaluateRules, ruleCounts, disagreementFlags, configurationCode, items, rules } = source;

function deploymentResults(deployment, configuration) {
  return evaluateRules(averagedAnswers(deployment.submissions), configuration ?? 'B2');
}

function findResult(results, id) {
  return results.find((entry) => entry.ruleId === id);
}

test('the catalogue: 53 rules split 18/10/13/12, and every rule input is a real item', () => {
  assert.equal(rules.length, 53);
  assert.deepEqual([1, 2, 3, 4].map((layer) => rules.filter((rule) => rule.layer === layer).length), [18, 10, 13, 12]);
  const codes = new Set(items.map((item) => item.code));
  for (const rule of rules) {
    for (const code of [...(rule.inputs || []), ...(rule.counted || [])]) assert.ok(codes.has(code), rule.id + ' uses unknown ' + code);
    assert.ok(rule.blocked || typeof rule.test === 'function', rule.id + ' has no test');
  }
});

test('averaging reproduces the prototype exactly: 20 fired, 28 clear, 5 not evaluated', () => {
  const results = deploymentResults(mould);
  assert.deepEqual({ ...ruleCounts(results) }, { firedCount: 20, clearCount: 28, evaluatedCount: 48, pendingCount: 5, totalCount: 53 });
  assert.deepEqual(results.filter((entry) => entry.ruleState === 'notEvaluated').map((entry) => entry.ruleId),
    ['RB-D1', 'RB3-11', 'RB3-12', 'RB4-11', 'RB4-12']);
});

test('flag texts name the blocked dimension and fill in "N of M"', () => {
  const results = deploymentResults(mould);
  assert.match(findResult(results, 'RB-A1').flagText, /^Haptic is needed/);
  assert.match(findResult(results, 'RB3-07').flagText, /reported by 2 of 5 adopters/);
  assert.match(findResult(results, 'RB3-10').flagText, /^3 of 5 surveyed adopters/);
});

test('a tie among respondents reports what was evaluated, and no conclusion', () => {
  const split = { ...mould.submissions, integrator: [integrator, { ...integrator, FR3: 'No' }] };
  const blocking = findResult(deploymentResults({ submissions: split }), 'RB2-06');
  assert.equal(blocking.ruleState, 'notEvaluated');
  assert.equal(blocking.stateReason, 'No conclusion. Respondents split: FR3 1 Yes, 1 No');
});

test('configuration A marks ecosystem rules not applicable, but still tests ECO3 (RB4-05)', () => {
  const results = deploymentResults(mould, 'A');
  assert.match(findResult(results, 'RB4-08').stateReason, /^Not applicable/);
  assert.equal(findResult(results, 'RB4-05').ruleState, 'clear');
});

test('a missing role is named as the thing being waited on', () => {
  const results = deploymentResults({ submissions: { ...mould.submissions, developer: [] } });
  assert.equal(findResult(results, 'RB-B1').stateReason, 'Waiting on Developer');
});

test('nothing submitted: 0 evaluated, 53 not evaluated', () => {
  assert.equal(ruleCounts(deploymentResults({ submissions: {} })).evaluatedCount, 0);
});

test('the deployment row never changes which rules fire: only answers do', () => {
  const flipped = { ...mould, deployment: { ...mould.deployment, taskDescription: 'anything at all' } };
  assert.deepEqual(deploymentResults(flipped), deploymentResults(mould));
});

test('task context is answered by the Integrator, not the Adopter', () => {
  const codes = items.filter((item) => ['X1', 'X5', 'X9', 'ECO7c'].includes(item.code)).map((item) => item.form);
  assert.deepEqual(codes, ['integrator', 'integrator', 'integrator', 'integrator']);
});

test('the two creation questions map to the configuration codes, and nothing else does', () => {
  assert.equal(configurationCode('Our company'), 'A');
  assert.equal(configurationCode('External supplier', 'Same supplier'), 'B1');
  assert.equal(configurationCode('External supplier', 'Our company'), 'B2');
  assert.equal(configurationCode('External supplier', 'Another company'), 'C');
  assert.equal(configurationCode('External supplier'), null);
});
