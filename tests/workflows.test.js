const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { referenceData } = require('./load-source');

const folder = path.join(__dirname, '..', 'workflows');
// Read the labels back out of the generated workflow rather than repeating them here.
function startLabel(workflow, starts) {
  const fields = workflows[workflow].nodes.find((node) => node.type === 'n8n-nodes-base.formTrigger').parameters.formFields.values;
  return fields.map((field) => field.fieldLabel).find((label) => label.startsWith(starts));
}
// npm run build writes these. Without them the suite reports a clear reason instead of a crash.
const built = fs.existsSync(folder);
const needsBuild = built ? false : 'run `npm run build` first: these tests read the generated workflows';
const workflows = !built ? {} : Object.fromEntries(fs.readdirSync(folder).filter((file) => file.endsWith('.json'))
  .map((file) => [file.replace('.json', ''), JSON.parse(fs.readFileSync(path.join(folder, file), 'utf8'))]));
const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;

// Runs a generated Code node the way n8n does: an async body with $ and $input in scope.
function runNode(workflow, name, nodes, input) {
  const code = workflows[workflow].nodes.find((node) => node.name === name).parameters.jsCode;
  function $(nodeName) {
    const value = nodes[nodeName];
    const list = Array.isArray(value) ? value : [value];
    return { first: () => ({ json: list[0] }), all: () => list.map((json) => ({ json })) };
  }
  const $input = { first: () => ({ json: input }), all: () => [{ json: input }] };
  return new AsyncFunction('$', '$input', code)($, $input);
}

const deployment = {
  deploymentId: 'd-1', organisationSlug: 'company-a', organisationName: 'Company A', taskName: 'Injection mould changeover',
  technology: 'External supplier', rollout: 'Our company', taskDescription: 'The press is stopped and the mould is swapped.'
};

test('every generated Code node compiles', { skip: needsBuild }, () => {
  for (const [name, workflow] of Object.entries(workflows)) {
    for (const node of workflow.nodes.filter((entry) => entry.type === 'n8n-nodes-base.code')) {
      assert.doesNotThrow(() => new AsyncFunction('$', '$input', node.parameters.jsCode), name + ' / ' + node.name);
    }
  }
});

test('Adopter "Build page" turns a deployment into page 2, titled with the task', { skip: needsBuild }, async () => {
  const [result] = await runNode('adopter', 'Build page', { 'Start page': { deployment: 'd-1' }, 'Find deployment': deployment });
  assert.equal(result.json.valid, true);
  assert.equal(result.json.pageTitle, 'Injection mould changeover');
  assert.equal(result.json.configuration, 'B2');
  assert.equal(JSON.parse(result.json.formJson).filter((field) => field.fieldType !== 'html').length, 25); // 24 questions plus the free comment box
});

test('an unknown deployment link is caught before any question is shown', { skip: needsBuild }, async () => {
  const [result] = await runNode('adopter', 'Build page', { 'Start page': { deployment: 'nope' }, 'Find deployment': {} });
  assert.equal(result.json.valid, false);
});

test('Developer "Build page" pre-fills from our evaluation and shows the task description', { skip: needsBuild }, async () => {
  const reference = referenceData();
  const start = { deployment: 'd-1', [startLabel('developer', 'Device')]: reference.devices[0].device, [startLabel('developer', 'Software platform')]: reference.platforms[0].platform };
  const [result] = await runNode('developer', 'Build page', {
    'Start page': start, 'Find deployment': deployment, 'Evaluation devices': reference.devices, 'Evaluation platforms': reference.platforms
  });
  const fields = JSON.parse(result.json.formJson);
  assert.equal(fields.find((field) => field.fieldLabel?.startsWith('TR1 · ')).defaultValue, '6');
  assert.match(fields[0].html, /The press is stopped and the mould is swapped\./);
});

test('"Prepare submission" stores coded answers, the name, and the deployment', { skip: needsBuild }, async () => {
  const [page] = await runNode('adopter', 'Build page', { 'Start page': { deployment: 'd-1' }, 'Find deployment': deployment });
  const noisy = JSON.parse(page.json.formJson).find((field) => (field.fieldLabel || '').endsWith('Is this task done in a noisy environment?'));
  const [row] = await runNode('adopter', 'Prepare submission',
    { 'Start page': { deployment: 'd-1', [startLabel('adopter', 'Your name')]: ' Ana ' }, 'Build page': page.json },
    { [noisy.fieldLabel]: 'Yes', '': null, submittedAt: 'x', formMode: 'production' });
  assert.equal(row.json.deploymentId, 'd-1');
  assert.equal(row.json.respondentName, 'Ana');
  assert.equal(JSON.parse(row.json.submissionAnswers).S5, 'Yes');
});

test('every table reference is filled in before anything is deployed', { skip: !process.env.CHECK_TABLES }, () => {
  for (const workflow of Object.values(workflows)) {
    for (const node of workflow.nodes.filter((entry) => entry.type === 'n8n-nodes-base.dataTable')) assert.ok(node.parameters.dataTableId.value, workflow.name + ' / ' + node.name);
  }
});

const { mould, developer: developerAnswers, integrator: integratorAnswers } = require('./fixtures');
const company = { organisationName: 'Company A', organisationSlug: 'company-a', accessKey: 'k3y0000000000000000000ab' };
const submissionRows = [
  ...mould.submissions.adopter.map((answers) => ({ deploymentId: 'd-1', formName: 'adopter', respondentName: 'Hidden', submissionAnswers: JSON.stringify(answers) })),
  { deploymentId: 'd-1', formName: 'developer', respondentName: '', submissionAnswers: JSON.stringify(developerAnswers) },
  { deploymentId: 'd-1', formName: 'integrator', respondentName: '', submissionAnswers: JSON.stringify(integratorAnswers) }
];

test('the team page renders every organisation, with empty tables handled', { skip: needsBuild }, async () => {
  const [result] = await runNode('pages', 'Team · render', {
    'Team · organisations': [company, {}], 'Team · deployments': [deployment], 'Team · submissions': submissionRows
  });
  assert.match(result.json.html, /Company A/);
  assert.match(result.json.html, /Injection mould changeover/);
});

test('the company page refuses a wrong key', { skip: needsBuild }, async () => {
  const nodes = { 'Company page': { query: { organisation: 'company-a', key: 'wrong' } }, 'Company · organisation': company, 'Company · deployments': [deployment], 'Company · submissions': submissionRows };
  const [refused] = await runNode('pages', 'Company · render', nodes);
  assert.match(refused.json.html, /This link isn’t valid/);
  const [allowed] = await runNode('pages', 'Company · render', { ...nodes, 'Company page': { query: { organisation: 'company-a', key: company.accessKey } } });
  assert.match(allowed.json.html, /New deployment/);
});

test('a valid key cannot open another organisation’s deployment', { skip: needsBuild }, async () => {
  const foreign = { ...deployment, organisationSlug: 'company-b' };
  const [result] = await runNode('pages', 'Report · render', {
    'Report page': { query: { organisation: 'company-a', key: company.accessKey, deployment: 'd-1' } },
    'Report · organisation': company, 'Report · deployment': foreign, 'Report · submissions': submissionRows
  });
  assert.match(result.json.html, /This link isn’t valid/);
});

test('the report page renders for a valid key', { skip: needsBuild }, async () => {
  const [result] = await runNode('pages', 'Report · render', {
    'Report page': { query: { organisation: 'company-a', key: company.accessKey, deployment: 'd-1' } },
    'Report · organisation': company, 'Report · deployment': deployment, 'Report · submissions': submissionRows
  });
  assert.match(result.json.html, /Raised <b>\d+<\/b>/);
});

test('narrative: a wrong key is refused before the model is ever called', { skip: needsBuild }, async () => {
  const [result] = await runNode('narrative', 'Narrative · prepare', {
    'Narrative request': { body: { organisation: 'company-a', key: 'wrong', deployment: 'd-1', layer: '1' } },
    'Narrative · organisation': company, 'Narrative · deployment': deployment, 'Narrative · submissions': submissionRows
  });
  assert.equal(result.json.valid, false);
});

test('summary: a valid request sends the raised points in plain words, with no names', { skip: needsBuild }, async () => {
  const [result] = await runNode('narrative', 'Narrative · prepare', {
    'Narrative request': { body: { organisation: 'company-a', key: company.accessKey, deployment: 'd-1' } },
    'Narrative · organisation': company, 'Narrative · deployment': deployment, 'Narrative · submissions': submissionRows
  });
  assert.equal(result.json.valid, true);
  assert.match(result.json.messageText, /^Points raised for this task, most urgent first within each group:/);
  assert.match(result.json.messageText, /Haptic is needed for this task/);
  assert.ok(!/Hidden|RB-/.test(result.json.messageText));
});

test('summary: every tier stores a good reply and turns garbage into a clear message', { skip: needsBuild }, async () => {
  const prepared = { 'Narrative · prepare': { deploymentId: 'd-1' } };
  for (const tier of ['A', 'B', 'C', 'D']) {
    const [good] = await runNode('narrative', 'Narrative · parse ' + tier, prepared, { text: '{"narrative":"Two of five workers fear for their jobs."}' });
    assert.equal(good.json.valid, true, tier);
    assert.equal(good.json.formName, 'summary');
    assert.equal(good.json.deploymentId, 'd-1');
    assert.equal(JSON.parse(good.json.submissionAnswers).summaryText, 'Two of five workers fear for their jobs.');
    const [bad] = await runNode('narrative', 'Narrative · parse ' + tier, prepared, { text: 'Sorry, I cannot' });
    assert.equal(bad.json.valid, false, tier);
    assert.match(bad.json.reason, /could not be written just now/);
  }
});

test('the summary falls back across three models and two providers, in order', { skip: needsBuild }, () => {
  const nodes = workflows.narrative.nodes;
  const models = nodes.filter((node) => node.name.startsWith('Narrative · model '))
    .map((node) => node.parameters.modelName || node.parameters.model);
  assert.deepEqual(models, ['models/gemini-2.5-flash', 'models/gemini-flash-latest', 'google/gemma-4-31b-it:free', 'minimax/minimax-m3.1-flash:free']);
  assert.equal(new Set(models.map((name) => name.split('/')[0])).size, 3, 'the tiers span more than one model family');
  assert.ok(models[0] !== 'models/gemini-flash-latest', 'the first tier is pinned, not an alias that moves to the busiest model');
  for (const tier of ['A', 'B', 'C', 'D']) {
    const chain = nodes.find((node) => node.name === 'Narrative · write ' + tier);
    assert.equal(chain.onError, 'continueRegularOutput', tier + ' must not break the page');
    assert.ok(chain.retryOnFail, tier + ' retries a transient failure');
  }
});

test('"Prepare deployment" writes the description and the configuration answers, and no task answers', { skip: needsBuild }, async () => {
  const organisation = { organisationSlug: 'company-a', organisationName: 'Company A' };
  const start = { [startLabel('creation', "The task you're considering")]: ' Mould changeover ', [startLabel('creation', 'Who supplies')]: 'External supplier' };
  const questions = {
    'Who sets it up in your operations (installation, integration, training)?': 'Another company',
    'What happens in this task? (a few sentences, so everyone answering knows which task this is)': ' The press is stopped. '
  };
  const [result] = await runNode('creation', 'Prepare deployment',
    { 'Start page': start, 'Build page': organisation, Questions: questions }, { deploymentId: 'uuid-1' });
  assert.deepEqual(result.json, {
    deploymentId: 'uuid-1', organisationSlug: 'company-a', organisationName: 'Company A',
    taskName: 'Mould changeover', taskDescription: 'The press is stopped.',
    technology: 'External supplier', rollout: 'Another company'
  });
});

test('"Build page" for the creation form asks only the set-up question and the description', { skip: needsBuild }, async () => {
  const organisation = { organisationSlug: 'company-a', organisationName: 'Company A', accessKey: 'k3y0000000000000000000ab' };
  const [result] = await runNode('creation', 'Build page',
    { 'Start page': { organisation: 'company-a', key: 'k3y0000000000000000000ab', [startLabel('creation', "The task you're considering")]: 'Mould changeover', [startLabel('creation', 'Who supplies')]: 'External supplier' },
      'Find organisation': organisation }, {});
  assert.equal(result.json.valid, true);
  const fields = JSON.parse(result.json.formJson).filter((field) => field.fieldType !== 'html');
  assert.deepEqual(fields.map((field) => field.fieldType), ['radio', 'textarea']);
});

test('each form quotes a length that is true in every configuration', { skip: needsBuild }, () => {
  const descriptions = Object.fromEntries(['adopter', 'developer', 'integrator']
    .map((name) => [name, workflows[name].nodes.find((node) => node.parameters?.formDescription).parameters.formDescription]));
  assert.match(descriptions.adopter, /about 25 questions/, 'the Adopter form is the same length in every configuration');
  assert.match(descriptions.developer, /about 20 to 25 questions/);
  assert.match(descriptions.integrator, /about 35 to 50 questions/, 'configuration A drops the ecosystem items');
  for (const text of Object.values(descriptions)) assert.ok(!/\{\{count\}\}/.test(text), 'the placeholder was filled in');
});

test('a German New deployment form stores the same values as the English one', { skip: needsBuild }, async () => {
  const organisation = { organisationSlug: 'company-a', organisationName: 'Company A' };
  const taskLabel = startLabel('creation', "The task you're considering");
  const supplyLabel = startLabel('creation', 'Who supplies');
  const runs = {
    en: { start: { [taskLabel]: 'Mould changeover', [supplyLabel]: 'External supplier' },
      questions: { 'Who sets it up in your operations (installation, integration, training)?': 'Another company',
        'What happens in this task? (a few sentences, so everyone answering knows which task this is)': 'The press is stopped.' } },
    de: { start: { [taskLabel]: 'Mould changeover', [supplyLabel]: 'External supplier', language: 'de' },
      questions: { 'Wer richtet sie in Ihrem Betrieb ein (Installation, Anbindung, Schulung)?': 'Ein anderes Unternehmen',
        'Worum geht es bei dieser Aufgabe? (ein paar Sätze, damit alle Befragten wissen, um welche Aufgabe es geht)': 'The press is stopped.' } }
  };
  for (const [language, run] of Object.entries(runs)) {
    const [result] = await runNode('creation', 'Prepare deployment',
      { 'Start page': run.start, 'Build page': organisation, Questions: run.questions }, { deploymentId: 'uuid-1' });
    assert.equal(result.json.taskDescription, 'The press is stopped.', language + ' keeps the description');
    assert.equal(result.json.rollout, 'Another company', language + ' stores the English rollout value');
  }
});
