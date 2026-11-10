const test = require('node:test');
const assert = require('node:assert/strict');
const source = require('./load-source').loadSource();
const { referenceData } = require('./load-source');
const { mould, task, developer, integrator } = require('./fixtures');

const { pageFields, submissionAnswers, formItems, fieldLabel, noteLabel, rankLabel, averagedAnswers, evaluateRules, ruleCounts } = source;
const reference = referenceData();
const contexts = {
  A: { organisationName: 'Company A', taskName: 'Mould changeover', technology: 'Our company' },
  B2: { organisationName: 'Company A', taskName: 'Mould changeover', technology: 'External supplier', rollout: 'Our company' }
};
const choice = { device: reference.devices[0].device, platform: reference.platforms[0].platform };

function questionLabels(fields) {
  return fields.filter((field) => field.fieldType !== 'html').map((field) => field.fieldLabel);
}

function fieldNamed(fields, prefix) {
  return fields.find((field) => field.fieldLabel?.startsWith(prefix));
}

// What n8n 2.2.5 returns for page 2: every answer as a string, keyed by its label.
function n8nOutput(formName, answers, configuration) {
  const output = {};
  for (const item of formItems(formName, configuration)) {
    const value = answers[item.code];
    if (item.type === 'rank') {
      for (const option of item.options) output[rankLabel(item, formName, option)] = String(value?.[option] ?? '');
      continue;
    }
    output[fieldLabel(item, formName)] = String(value ?? '');
    if (item.note) output[noteLabel(item, formName)] = '';
  }
  return { ...output, '': null, submittedAt: '2026-09-19T12:00:00.000-03:00', formMode: 'production' };
}

test('no two questions on any page share a label, in every configuration', () => {
  for (const formName of ['creation', 'adopter', 'developer', 'integrator']) {
    for (const context of Object.values(contexts)) {
      const labels = questionLabels(pageFields(formName, context, { choice, reference }));
      assert.equal(new Set(labels).size, labels.length, formName + ' has a duplicate label');
    }
  }
});

test('every form shows its item codes, in one pattern', () => {
  for (const [formName, extras] of [['adopter', {}], ['developer', { choice, reference }], ['integrator', {}]]) {
    const labels = questionLabels(pageFields(formName, contexts.B2, extras)).filter((label) => !label.startsWith('Anything else'));
    assert.ok(labels.every((label) => /^[A-Z][A-Za-z0-9_]* · /.test(label)), formName + ' has a label without its code');
  }
});

test('configuration A drops ecosystem items, but keeps ECO3', () => {
  const integratorLabels = questionLabels(pageFields('integrator', contexts.A));
  assert.ok(integratorLabels.some((label) => label.startsWith('ECO3 · ')));
  assert.ok(!integratorLabels.some((label) => label.startsWith('ECO2 · ')));
  assert.ok(!questionLabels(pageFields('developer', contexts.A, { choice, reference })).some((label) => label.startsWith('ECO1a')));
  assert.equal(questionLabels(pageFields('adopter', contexts.A)).length, 25); // 24 items, plus the free comment box
});

test('the Developer page pre-fills from our evaluation where it can, and nowhere else', () => {
  const fields = pageFields('developer', contexts.B2, { choice, reference });
  const expected = (code) => String(source.baselineScore(code, choice, reference).baselineValue);
  assert.equal(fieldNamed(fields, 'TR1 · ').defaultValue, expected('TR1'));
  assert.equal(fieldNamed(fields, 'TR3 · ').defaultValue, expected('TR3'));
  assert.equal(fieldNamed(fields, 'TR8 · ').defaultValue, undefined);
  assert.equal(fieldNamed(fields, 'TR11 · ').defaultValue, undefined);
  assert.equal(fieldNamed(fields, 'T_D1 · ').defaultValue, undefined);
});

test('a device we did not evaluate pre-fills nothing that needs it; platform-only items still pre-fill', () => {
  const platformOnly = { device: 'Not listed', platform: choice.platform };
  const fields = pageFields('developer', contexts.B2, { choice: platformOnly, reference });
  assert.equal(fieldNamed(fields, 'TR1 · ').defaultValue, undefined);
  assert.equal(fieldNamed(fields, 'TR3 · ').defaultValue, undefined);
  assert.equal(fieldNamed(fields, 'TR5 · ').defaultValue, String(source.baselineScore('TR5', platformOnly, reference).baselineValue));
});

test('a platform we did not evaluate pre-fills nothing that needs it; device-only items still pre-fill', () => {
  const deviceOnly = { device: choice.device, platform: 'Not listed' };
  const fields = pageFields('developer', contexts.B2, { choice: deviceOnly, reference });
  assert.equal(fieldNamed(fields, 'TR1 · ').defaultValue, String(source.baselineScore('TR1', deviceOnly, reference).baselineValue));
  assert.equal(fieldNamed(fields, 'TR3 · ').defaultValue, undefined);
  assert.equal(fieldNamed(fields, 'TR5 · ').defaultValue, undefined);
});

test('the creation page asks no task questions: who sets it up, for an external supplier, and the description', () => {
  const external = pageFields('creation', contexts.B2).filter((field) => field.fieldType !== 'html');
  assert.deepEqual(external.map((field) => field.fieldType), ['radio', 'textarea']);
  assert.ok(external.every((field) => field.requiredField === true));
  const internal = pageFields('creation', contexts.A).filter((field) => field.fieldType !== 'html');
  assert.deepEqual(internal.map((field) => field.fieldType), ['textarea']);
});

test('nothing on the three role forms is required', () => {
  for (const [formName, extras] of [['adopter', {}], ['developer', { choice, reference }], ['integrator', {}]]) {
    const fields = pageFields(formName, contexts.B2, extras).filter((field) => field.fieldType !== 'html');
    assert.ok(fields.every((field) => field.requiredField === false), formName + ' still forces an answer');
  }
});

test('typed text is escaped in the context box', () => {
  const html = pageFields('adopter', { ...contexts.B2, taskName: '<script>alert(1)</script>' })[0].html;
  assert.ok(html.includes('&lt;script&gt;') && !html.includes('<script>'));
});

test('round trip: n8n label-keyed output maps back to codes, and still scores 20 / 28 / 5', () => {
  const adopters = mould.submissions.adopter.map((answers) => submissionAnswers('adopter', n8nOutput('adopter', answers, 'B2'), 'B2'));
  const roundTrip = {
    adopter: adopters,
    developer: [submissionAnswers('developer', n8nOutput('developer', developer, 'B2'), 'B2')],
    integrator: [submissionAnswers('integrator', n8nOutput('integrator', integrator, 'B2'), 'B2')]
  };
  assert.equal(adopters[0].S5, String(task.S5));
  assert.deepEqual({ ...roundTrip.integrator[0].MP1 }, { 'Cost savings': '1', 'Time savings': '2', 'Quality improvement or error reduction': '3' });
  const counts = ruleCounts(evaluateRules(averagedAnswers(roundTrip), 'B2'));
  assert.deepEqual([counts.firedCount, counts.clearCount, counts.pendingCount], [20, 28, 5]);
});

test('the set-up line never claims something the form did not ask', () => {
  const internal = pageFields('creation', contexts.A)[0].html;
  assert.match(internal, /Our company supplies the XR technology/);
  assert.ok(!/sets it up/.test(internal), 'who sets it up is not asked in configuration A, so it is not asserted');
  const external = pageFields('creation', contexts.B2)[0].html;
  assert.match(external, /An external supplier provides the XR technology\. Our company sets it up\./);
});

test('a German form round-trips to the same English answers as the English form', () => {
  const answers = mould.submissions.adopter[0];
  const german = {};
  for (const item of formItems('adopter', 'B2')) {
    const label = fieldLabel(item, 'adopter', undefined, 'de');
    const value = answers[item.code];
    german[label] = item.type === 'yesNo' || item.type === 'choice'
      ? source.sayText(String(value ?? ''), 'de')
      : String(value ?? '');
  }
  const mapped = submissionAnswers('adopter', german, 'B2', 'de');
  for (const item of formItems('adopter', 'B2')) {
    assert.equal(mapped[item.code], String(answers[item.code] ?? ''), item.code + ' must survive the German round trip');
  }
  assert.equal(mapped.S5, 'Yes', 'a German "Ja" is stored as the English Yes the rules test for');
});

test('every Adopter question has German, and it is not just the English copied', () => {
  const adopter = source.items.filter((item) => item.form === 'adopter');
  for (const item of adopter) {
    assert.ok(source.plainQuestion(item, 'de').length > 10, item.code + ' has no German');
    assert.notEqual(source.plainQuestion(item, 'de'), source.plainQuestion(item, 'en'), item.code + ' German equals English');
  }
});

test('nothing a German respondent reads on a form is left in English', () => {
  const german = { organisationName: 'Acme', taskName: 'Werkzeugwechsel', technology: 'External supplier', rollout: 'Our company' };
  for (const [formName, extras] of [['adopter', {}], ['developer', { choice, reference }], ['integrator', {}], ['creation', {}]]) {
    const fields = pageFields(formName, german, { ...extras, language: 'de' });
    const text = fields.map((field) => (field.html || '') + ' ' + (field.fieldLabel || '')
      + ' ' + (field.fieldOptions?.values || []).map((value) => value.option).join(' ')).join(' ')
      .replace(/<[^>]*>/g, ' ');
    for (const leftover of ['your answers', 'is checking whether', 'Also consider', 'Weigh down', 'Adjust down',
      'Rate how relevant', 'expert judgement', 'Anything else you want']) {
      assert.ok(!new RegExp(leftover, 'i').test(text), formName + ' still shows English: ' + leftover);
    }
  }
});
