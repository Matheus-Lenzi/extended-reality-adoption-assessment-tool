import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourceFiles = ['values', 'language', 'items', 'average', 'fit', 'prefill', 'rules', 'evaluation', 'pages', 'render', 'plain', 'report'];
const startLabels = {
  name: 'Your name (optional) · Ihr Name (optional)',
  device: 'Device · Gerät',
  platform: 'Software platform · Software',
  task: "The task you're considering XR for · Die Aufgabe, für die Sie XR prüfen",
  supply: 'Who supplies the XR hardware and software (e.g. headsets, glasses, apps)? · Wer liefert die XR-Hardware und -Software?'
};
const roleForms = {
  adopter: {
    title: 'Adopter',
    titleDe: 'Formular f\u00fcr Anwender',
    path: 'xr-dia-adopter',
    descriptionDe: 'Sie führen diese Aufgabe aus, oder werden sie künftig mit XR ausführen. Schritt 1 von 2. Die nächste Seite hat etwa {{count}} Fragen, nichts ist Pflicht. Lassen Sie alles frei, was nicht auf Sie zutrifft.\n\nIhr Name ist freiwillig. Lassen Sie ihn frei, um anonym zu bleiben.',
    description: 'You do this task, or will do it with XR. Step 1 of 2. The next page has about {{count}} questions and nothing is required, so leave anything that does not apply blank.\n\nYour name is optional. Leave it blank to stay anonymous, the report shows totals and averages, never your name.'
  },
  developer: {
    title: 'Developer',
    titleDe: 'Formular f\u00fcr Entwickler',
    path: 'xr-dia-developer',
    descriptionDe: 'Sie entwickeln oder liefern die XR-Hardware und -Software. Schritt 1 von 2. Die nächste Seite hat etwa {{count}} Fragen, nichts ist Pflicht.\n\nWählen Sie zuerst Gerät und Software.',
    description: 'You build or supply the XR hardware and software. Step 1 of 2. The next page has about {{count}} questions and nothing is required, so leave anything that does not apply blank.\n\nChoose the device and software first: the next page shows our own evaluation of them and pre-fills those answers.'
  },
  integrator: {
    title: 'Integrator',
    titleDe: 'Formular f\u00fcr Integrator',
    path: 'xr-dia-integrator',
    descriptionDe: 'Sie richten die Technik im Betrieb ein: Installation, Anbindung und Schulung. Schritt 1 von 2. Die nächste Seite hat etwa {{count}} Fragen, nichts ist Pflicht.',
    description: 'You set the technology up in operations: installation, integration and training. Step 1 of 2. The next page has about {{count}} questions and nothing is required, so leave anything that does not apply blank.'
  }
};

// The forms say how long page 2 is, counted from the catalogue so it cannot drift. A form description is
// static at build time, but the length is not: configuration A drops the ecosystem items. Telling a
// configuration A integrator "about 50" when the form holds 36 was found in the 21 Oct black-box test,
// so the forms quote the real range instead of one configuration's number.
function questionLength(formName, context) {
  const fields = sourceApi.pageFields(formName, { organisationName: 'x', taskName: 'x', ...context }, { choice: {}, reference: { devices: [], platforms: [] } });
  return Math.round(fields.filter((field) => field.fieldType !== 'html').length / 5) * 5;
}

function questionCount(formName) {
  const fewest = questionLength(formName, { technology: 'Our company' });
  const most = questionLength(formName, { technology: 'External supplier', rollout: 'Another company' });
  return fewest === most ? String(most) : fewest + ' to ' + most;
}

function questionCountDe(formName) {
  return questionCount(formName).replace(' to ', ' bis ');
}

function readText(path) {
  return readFileSync(join(root, path), 'utf8');
}

function csvRows(path) {
  const [header, ...lines] = readText(path).trim().split('\n');
  const columns = header.split(',');
  return lines.map((line) => Object.fromEntries(line.split(',').map((cell, index) => [columns[index], cell])));
}

function stableId(text) {
  const hash = createHash('sha1').update(text).digest('hex');
  return [hash.slice(0, 8), hash.slice(8, 12), hash.slice(12, 16), hash.slice(16, 20), hash.slice(20, 32)].join('-');
}

function tableReference(id) {
  return { __rl: true, value: id, mode: 'id' };
}

function codeBody(inputs, main) {
  return ['// inputs', inputs, '', '// source — generated from source/, do not edit here', sourceText, '', '// main flow', main].join('\n');
}

const instance = JSON.parse(readText('configuration/instance.json'));
const sourceText = sourceFiles.map((name) => readText('source/' + name + '.js')).join('\n')
  .split('https://your-n8n-host.example').join(instance.host);
const sourceApi = new Function(sourceText + ';return { pageFields };')();
const stylesheet = readText('styles/form.css');
const tables = JSON.parse(readText('configuration/tables.json'));
const credentials = JSON.parse(readText('configuration/credentials.json'));
const pageStyles = readText('styles/page.css');
const narrativeSystem = readText('prompts/narrative.md').split('```')[1].trim();
// "Not listed" (decided 19 and 21 Sep): a device or platform our evaluation did not cover gets no pre-fill, never a wrong one.
const devices = [...new Set(csvRows('data/evaluation-devices.csv').map((row) => row.device)), 'Not listed'];
const platforms = [...new Set(csvRows('data/evaluation-platforms.csv').map((row) => row.platform)), 'Not listed'];

function workflowBuilder(workflowName) {
  const nodes = [];
  const connections = {};
  function addNode(name, type, typeVersion, parameters, extra) {
    const position = [nodes.length * 240, 0];
    const node = { id: stableId(workflowName + ':' + name), name, type, typeVersion, position, parameters, ...(extra || {}) };
    if (['n8n-nodes-base.formTrigger', 'n8n-nodes-base.form', 'n8n-nodes-base.webhook'].includes(type)) node.webhookId = stableId(workflowName + ':webhook:' + name);
    nodes.push(node);
    return name;
  }
  function linkNodes(from, to, output) {
    const outputs = connections[from] || (connections[from] = { main: [] });
    const index = output ?? 0;
    while (outputs.main.length <= index) outputs.main.push([]);
    outputs.main[index].push({ node: to, type: 'main', index: 0 });
  }
  function linkModel(from, to) {
    connections[from] = { ai_languageModel: [[{ node: to, type: 'ai_languageModel', index: 0 }]] };
  }
  function chainNodes(names) {
    names.slice(1).forEach((name, index) => linkNodes(names[index], name));
  }
  function finishWorkflow() {
    return { name: workflowName, nodes, connections, settings: { executionOrder: 'v1' } };
  }
  return { addNode, linkNodes, linkModel, chainNodes, finishWorkflow };
}

function radioField(label, options, required) {
  return { fieldLabel: label, fieldType: 'radio', fieldOptions: { values: options.map((option) => ({ option })) }, requiredField: required };
}

function lookupNode(builder, name, tableId, column, expression, extra) {
  return builder.addNode(name, 'n8n-nodes-base.dataTable', 1, {
    operation: 'get',
    dataTableId: tableReference(tableId),
    matchType: 'allConditions',
    filters: { conditions: [{ keyName: column, condition: 'eq', keyValue: expression }] },
    returnAll: true
  }, { alwaysOutputData: true, ...(extra || {}) });
}

function readAllNode(builder, name, tableId) {
  return builder.addNode(name, 'n8n-nodes-base.dataTable', 1, { operation: 'get', dataTableId: tableReference(tableId), returnAll: true }, { executeOnce: true, alwaysOutputData: true });
}

function insertNode(builder, name, tableId) {
  return builder.addNode(name, 'n8n-nodes-base.dataTable', 1, {
    dataTableId: tableReference(tableId),
    columns: { mappingMode: 'autoMapInputData', value: {}, matchingColumns: [], schema: [] },
    options: {}
  });
}

function validNode(builder, name) {
  return builder.addNode(name || 'Link valid?', 'n8n-nodes-base.if', 2.3, {
    conditions: {
      options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 3 },
      conditions: [{ id: stableId(builder.finishWorkflow().name + ':' + (name || 'valid')), leftValue: '={{ $json.valid }}', rightValue: '', operator: { type: 'boolean', operation: 'true', singleValue: true } }],
      combinator: 'and'
    },
    options: {}
  });
}

function questionsNode(builder) {
  return builder.addNode('Questions', 'n8n-nodes-base.form', 2.3, {
    defineForm: 'json',
    jsonOutput: '={{ $json.formJson }}',
    options: { formTitle: '={{ $json.pageTitle }}', buttonLabel: "={{ $json.language === 'de' ? 'Absenden' : 'Submit' }}", customCss: stylesheet }
  });
}

function endingNode(builder, name, title, message) {
  return builder.addNode(name, 'n8n-nodes-base.form', 2.3, { operation: 'completion', completionTitle: title, completionMessage: message, options: { customCss: stylesheet } });
}

// Adopter, Developer, Integrator: start page → find deployment → build page 2 → questions → save → done.
function roleWorkflow(formName) {
  const form = roleForms[formName];
  const builder = workflowBuilder('XR DIA · ' + form.title + ' form');
  const startFields = [{ fieldLabel: startLabels.name, fieldType: 'text', requiredField: false }];
  if (formName === 'developer') {
    startFields.push({ fieldLabel: startLabels.device, fieldType: 'dropdown', fieldOptions: { values: devices.map((option) => ({ option })) }, requiredField: true });
    startFields.push({ fieldLabel: startLabels.platform, fieldType: 'dropdown', fieldOptions: { values: platforms.map((option) => ({ option })) }, requiredField: true });
  }
  startFields.push({ fieldLabel: 'deployment', fieldType: 'hiddenField', fieldName: 'deployment' });
  startFields.push({ fieldLabel: 'language', fieldType: 'hiddenField', fieldName: 'language' });
  const start = builder.addNode('Start page', 'n8n-nodes-base.formTrigger', 2.3, {
    formTitle: form.title + ' form · ' + form.titleDe,
    formDescription: form.description.split('{{count}}').join(questionCount(formName)) + '\n\n' + form.descriptionDe.split('{{count}}').join(questionCountDe(formName)),
    formFields: { values: startFields },
    options: { path: form.path, buttonLabel: 'Next · Weiter', customCss: stylesheet }
  });
  const find = lookupNode(builder, 'Find deployment', tables.deployments, 'deploymentId', '={{ $json.deployment }}');
  const chain = [start, find];
  if (formName === 'developer') chain.push(readAllNode(builder, 'Evaluation devices', tables.evaluationDevices), readAllNode(builder, 'Evaluation platforms', tables.evaluationPlatforms));
  const inputs = [
    "const startAnswers = $('Start page').first().json;",
    "const found = $('Find deployment').first()?.json || {};",
    formName === 'developer' ? "const deviceRows = $('Evaluation devices').all().map((item) => item.json);" : '',
    formName === 'developer' ? "const platformRows = $('Evaluation platforms').all().map((item) => item.json);" : '',
    'const startLabels = ' + JSON.stringify(startLabels) + ';'
  ].filter(Boolean).join('\n');
  const main = [
    "if (!textValue(found.deploymentId)) return [{ json: { valid: false, reason: 'No deployment matches this link' } }];",
    'const language = pageLanguage(startAnswers.language);',
    'const context = { organisationName: found.organisationName, taskName: found.taskName, taskDescription: found.taskDescription, technology: found.technology, rollout: found.rollout };',
    formName === 'developer'
      ? 'const extras = { language, choice: { device: startAnswers[startLabels.device], platform: startAnswers[startLabels.platform] }, reference: { devices: deviceRows, platforms: platformRows } };'
      : 'const extras = { language };',
    "const fields = pageFields('" + formName + "', context, extras);",
    "return [{ json: { valid: true, formJson: JSON.stringify(fields), language, pageTitle: textValue(found.taskName) || '" + form.title + " form', configuration: configurationCode(found.technology, found.rollout) } }];"
  ].join('\n');
  chain.push(builder.addNode('Build page', 'n8n-nodes-base.code', 2, { jsCode: codeBody(inputs, main) }));
  builder.chainNodes(chain);
  const valid = validNode(builder);
  builder.linkNodes('Build page', valid);
  const questions = questionsNode(builder);
  builder.linkNodes(valid, questions, 0);
  const invalid = endingNode(builder, 'Invalid link', "This link isn't valid", 'Ask whoever sent it to you for a new link.');
  builder.linkNodes(valid, invalid, 1);
  const prepareInputs = [
    "const startAnswers = $('Start page').first().json;",
    "const built = $('Build page').first().json;",
    'const page = $input.first()?.json || {};',
    'const startLabels = ' + JSON.stringify(startLabels) + ';'
  ].join('\n');
  const prepareMain = [
    "const answers = submissionAnswers('" + formName + "', page, built.configuration, built.language);",
    formName === 'developer' ? 'const choice = { device: textValue(startAnswers[startLabels.device]), platform: textValue(startAnswers[startLabels.platform]) };' : 'const choice = {};',
    "return [{ json: { deploymentId: textValue(startAnswers.deployment), formName: '" + formName + "', respondentName: textValue(startAnswers[startLabels.name]), submissionAnswers: JSON.stringify({ ...answers, ...choice }) } }];"
  ].join('\n');
  const prepare = builder.addNode('Prepare submission', 'n8n-nodes-base.code', 2, { jsCode: codeBody(prepareInputs, prepareMain) });
  const save = insertNode(builder, 'Save submission', tables.submissions);
  const done = endingNode(builder, 'Done', 'Thank you · Danke', 'Your answers have been recorded. · Ihre Antworten wurden gespeichert.');
  builder.chainNodes([questions, prepare, save, done]);
  return builder.finishWorkflow();
}

// New deployment: start page (task + who supplies) → check the company link → build page 2 → save.
function creationWorkflow() {
  const builder = workflowBuilder('XR DIA · New deployment');
  const start = builder.addNode('Start page', 'n8n-nodes-base.formTrigger', 2.3, {
    formTitle: 'New deployment · Neues Vorhaben',
    formDescription: 'A deployment is one task you are considering XR for. Step 1 of 2. The people who do the task answer the questions, you only describe it here.'
      + '\n\nEin Vorhaben ist eine Aufgabe, für die Sie XR prüfen. Schritt 1 von 2. Die Fragen beantworten die Personen, die die Aufgabe ausführen, Sie beschreiben sie hier nur.',
    formFields: { values: [
      { fieldLabel: startLabels.task, fieldType: 'text', requiredField: true },
      radioField(startLabels.supply, ['Our company', 'External supplier'], true),
      { fieldLabel: 'organisation', fieldType: 'hiddenField', fieldName: 'organisation' },
      { fieldLabel: 'key', fieldType: 'hiddenField', fieldName: 'key' },
      { fieldLabel: 'language', fieldType: 'hiddenField', fieldName: 'language' }
    ] },
    options: { path: 'xr-dia-new-deployment', buttonLabel: 'Next · Weiter', customCss: stylesheet }
  });
  const find = lookupNode(builder, 'Find organisation', tables.organisations, 'organisationSlug', '={{ $json.organisation }}');
  const inputs = [
    "const startAnswers = $('Start page').first().json;",
    "const found = $('Find organisation').first()?.json || {};",
    'const startLabels = ' + JSON.stringify(startLabels) + ';'
  ].join('\n');
  const main = [
    "if (!textValue(found.accessKey) || found.accessKey !== textValue(startAnswers.key)) return [{ json: { valid: false, reason: 'The company link is not valid' } }];",
    'const language = pageLanguage(startAnswers.language);',
    'const context = { organisationName: found.organisationName, taskName: startAnswers[startLabels.task], technology: startAnswers[startLabels.supply] };',
    "const fields = pageFields('creation', context, { language });",
    'return [{ json: { valid: true, formJson: JSON.stringify(fields), language, pageTitle: textValue(context.taskName), organisationSlug: found.organisationSlug, organisationName: found.organisationName, companyUrl: companyLink(found) + (language === \'de\' ? \'&language=de\' : \'\') } }];'
  ].join('\n');
  const build = builder.addNode('Build page', 'n8n-nodes-base.code', 2, { jsCode: codeBody(inputs, main) });
  builder.chainNodes([start, find, build]);
  const valid = validNode(builder);
  builder.linkNodes(build, valid);
  const questions = questionsNode(builder);
  builder.linkNodes(valid, questions, 0);
  const invalid = endingNode(builder, 'Invalid link', "This link isn't valid", 'Open New deployment from your company page.');
  builder.linkNodes(valid, invalid, 1);
  const identity = builder.addNode('New deployment ID', 'n8n-nodes-base.crypto', 1, { action: 'generate', dataPropertyName: 'deploymentId', encodingType: 'uuid' });
  const prepareInputs = [
    "const startAnswers = $('Start page').first().json;",
    "const built = $('Build page').first().json;",
    "const page = $('Questions').first()?.json || {};",
    'const identity = $input.first()?.json || {};',
    'const startLabels = ' + JSON.stringify(startLabels) + ';'
  ].join('\n');
  const prepareMain = [
    'const technology = textValue(startAnswers[startLabels.supply]);',
    // The German form labels its fields in German, so the answers must be read back in the same
    // language. Reading the English label stored an empty description and an empty rollout, and the
    // rollout decides the configuration gate.
    'const language = pageLanguage(startAnswers.language);',
    "const rollout = technology === 'External supplier' ? sourceOption({ options: ['Our company', 'Same supplier', 'Another company'] }, textValue(page[sayText(rolloutLabel, language)]), language) : '';",
    'const taskDescription = textValue(page[sayText(descriptionLabel, language)]);',
    'return [{ json: { deploymentId: textValue(identity.deploymentId), organisationSlug: built.organisationSlug, organisationName: built.organisationName, taskName: textValue(startAnswers[startLabels.task]), taskDescription, technology, rollout } }];'
  ].join('\n');
  const prepare = builder.addNode('Prepare deployment', 'n8n-nodes-base.code', 2, { jsCode: codeBody(prepareInputs, prepareMain) });
  const save = insertNode(builder, 'Save deployment', tables.deployments);
  // A dead end here cost the tester 30 seconds hunting for the company page again (black-box test, 20 Oct),
  // so the completion page carries the link back. Built from the slug and key the Build page already read.
  const companyLink = "={{ ($('Build page').first().json.language === 'de' ? 'Die drei Formularlinks stehen auf Ihrer Unternehmensseite.<br><br>' : 'Its three form links are on your company page.<br><br>') + '<a href=\"' + $('Build page').first().json.companyUrl + '\">' + ($('Build page').first().json.language === 'de' ? 'Zurück zur Unternehmensseite' : 'Back to your company page') + '</a>' }}";
  const done = endingNode(builder, 'Done', 'Deployment created · Vorhaben angelegt', companyLink);
  builder.chainNodes([questions, identity, prepare, save, done]);
  return builder.finishWorkflow();
}

// Loads the evaluation tables once. Refuses to run twice, so a second call never duplicates rows.
function seedWorkflow() {
  const builder = workflowBuilder('XR DIA · Seed evaluation data');
  const hook = builder.addNode('Seed request', 'n8n-nodes-base.webhook', 2.1, { httpMethod: 'GET', path: 'xr-dia-seed-evaluation', responseMode: 'responseNode', options: {} });
  const existing = readAllNode(builder, 'Existing devices', tables.evaluationDevices);
  const plan = builder.addNode('Already seeded?', 'n8n-nodes-base.code', 2, { jsCode: codeBody(
    "const rows = $input.all().map((item) => item.json).filter((row) => textValue(row.device) !== '');",
    'return [{ json: { valid: rows.length === 0, existingCount: rows.length } }];') });
  builder.chainNodes([hook, existing, plan]);
  const valid = validNode(builder);
  builder.linkNodes(plan, valid);
  const skip = builder.addNode('Report already seeded', 'n8n-nodes-base.respondToWebhook', 1.1, { respondWith: 'json', responseBody: '={{ { seeded: false, reason: "Evaluation tables already hold data", existingCount: $json.existingCount } }}', options: {} });
  builder.linkNodes(valid, skip, 1);
  const deviceRows = csvRows('data/evaluation-devices.csv').map((row) => ({ ...row, score: Number(row.score) }));
  const platformRows = csvRows('data/evaluation-platforms.csv').map((row) => ({ ...row, thesisTable: Number(row.thesisTable), score: Number(row.score) }));
  const deviceNode = builder.addNode('Device rows', 'n8n-nodes-base.code', 2, { jsCode: 'return ' + JSON.stringify(deviceRows) + '.map((row) => ({ json: row }));' });
  const insertDevices = insertNode(builder, 'Insert devices', tables.evaluationDevices);
  const platformNode = builder.addNode('Platform rows', 'n8n-nodes-base.code', 2, { jsCode: 'return ' + JSON.stringify(platformRows) + '.map((row) => ({ json: row }));' });
  const insertPlatforms = insertNode(builder, 'Insert platforms', tables.evaluationPlatforms);
  const report = builder.addNode('Report seeded', 'n8n-nodes-base.respondToWebhook', 1.1, { respondWith: 'json', responseBody: '={{ { seeded: true, devices: ' + deviceRows.length + ', platforms: ' + platformRows.length + ' } }}', options: {} }, { executeOnce: true });
  builder.linkNodes(valid, deviceNode, 0);
  builder.chainNodes([deviceNode, insertDevices, platformNode, insertPlatforms, report]);
  return builder.finishWorkflow();
}

function htmlResponse(builder, name) {
  return builder.addNode(name, 'n8n-nodes-base.respondToWebhook', 1.1, {
    respondWith: 'text',
    responseBody: '={{ $json.html }}',
    options: { responseHeaders: { entries: [{ name: 'Content-Type', value: 'text/html; charset=utf-8' }] } }
  });
}

function pageHook(builder, name, method, path, guarded) {
  const parameters = { httpMethod: method, path, responseMode: 'responseNode', options: {} };
  if (!guarded) return builder.addNode(name, 'n8n-nodes-base.webhook', 2.1, parameters);
  return builder.addNode(name, 'n8n-nodes-base.webhook', 2.1, { ...parameters, authentication: 'basicAuth' },
    { credentials: { httpBasicAuth: { id: credentials.teamLogin.id, name: credentials.teamLogin.name } } });
}

// Rows from a Data Table node with alwaysOutputData: an empty table yields one empty item, dropped here.
const rowsHelper = "function tableRows(nodeName, column) { return $(nodeName).all().map((item) => item.json).filter((row) => textValue(row[column]) !== ''); }";

// Team page, create organisation, company page and report. The team page sits behind Basic auth;
// company and report pages check the organisation's private key instead.
function pagesWorkflow() {
  const builder = workflowBuilder('XR DIA · Pages');
  const styles = 'const pageStyles = ' + JSON.stringify(pageStyles) + ';';

  const team = pageHook(builder, 'Team page', 'GET', 'xr-dia', true);
  const teamOrganisations = readAllNode(builder, 'Team · organisations', tables.organisations);
  const teamDeployments = readAllNode(builder, 'Team · deployments', tables.deployments);
  const teamSubmissions = readAllNode(builder, 'Team · submissions', tables.submissions);
  const teamRender = builder.addNode('Team · render', 'n8n-nodes-base.code', 2, { jsCode: codeBody([rowsHelper, styles].join('\n'),
    "return [{ json: { html: teamPage(tableRows('Team · organisations', 'organisationSlug'), tableRows('Team · deployments', 'deploymentId'), tableRows('Team · submissions', 'deploymentId'), pageStyles) } }];") });
  builder.chainNodes([team, teamOrganisations, teamDeployments, teamSubmissions, teamRender, htmlResponse(builder, 'Team · send')]);

  const create = pageHook(builder, 'Create organisation', 'POST', 'xr-dia', true);
  const key = builder.addNode('Create · access key', 'n8n-nodes-base.crypto', 1, { action: 'generate', dataPropertyName: 'accessKey', encodingType: 'hex', stringLength: 24 });
  const existing = readAllNode(builder, 'Create · existing', tables.organisations);
  const prepare = builder.addNode('Create · prepare', 'n8n-nodes-base.code', 2, { jsCode: codeBody(
    [rowsHelper, "const request = $('Create organisation').first().json;", "const generated = $('Create · access key').first().json;"].join('\n'),
    [
      "const name = textValue(request.body?.organisationName).slice(0, 120);",
      "if (!name) return [{ json: { valid: false } }];",
      "const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'organisation';",
      "const taken = new Set(tableRows('Create · existing', 'organisationSlug').map((row) => row.organisationSlug));",
      "let suffix = 1;",
      "while (taken.has(suffix === 1 ? base : base + '-' + suffix)) suffix++;",
      "return [{ json: { valid: true, organisationName: name, organisationSlug: suffix === 1 ? base : base + '-' + suffix, accessKey: generated.accessKey } }];"
    ].join('\n')) });
  builder.chainNodes([create, key, existing, prepare]);
  const valid = validNode(builder);
  builder.linkNodes(prepare, valid);
  const shape = builder.addNode('Create · row', 'n8n-nodes-base.code', 2, { jsCode: codeBody('const row = $input.first().json;',
    'return [{ json: { organisationName: row.organisationName, organisationSlug: row.organisationSlug, accessKey: row.accessKey } }];') });
  const insert = insertNode(builder, 'Create · save', tables.organisations);
  const back = builder.addNode('Create · back to team page', 'n8n-nodes-base.respondToWebhook', 1.1, { respondWith: 'redirect', redirectURL: '/webhook/xr-dia', options: {} });
  const backInvalid = builder.addNode('Create · back without saving', 'n8n-nodes-base.respondToWebhook', 1.1, { respondWith: 'redirect', redirectURL: '/webhook/xr-dia', options: {} });
  builder.linkNodes(valid, shape, 0);
  builder.chainNodes([shape, insert, back]);
  builder.linkNodes(valid, backInvalid, 1);

  const company = pageHook(builder, 'Company page', 'GET', 'xr-dia-company', false);
  const companyFind = lookupNode(builder, 'Company · organisation', tables.organisations, 'organisationSlug', '={{ $json.query.organisation }}');
  const companyDeployments = lookupNode(builder, 'Company · deployments', tables.deployments, 'organisationSlug', "={{ $('Company page').first().json.query.organisation }}", { executeOnce: true });
  const companySubmissions = readAllNode(builder, 'Company · submissions', tables.submissions);
  const companyRender = builder.addNode('Company · render', 'n8n-nodes-base.code', 2, { jsCode: codeBody(
    [rowsHelper, styles, "const query = $('Company page').first().json.query || {};"].join('\n'),
    [
      "const organisation = tableRows('Company · organisation', 'organisationSlug')[0];",
      "if (!organisation || !textValue(query.key) || organisation.accessKey !== textValue(query.key)) return [{ json: { html: errorPage(pageStyles) } }];",
      "const language = pageLanguage($('Company page').first().json.query.language);",
      "return [{ json: { html: companyPage(organisation, tableRows('Company · deployments', 'deploymentId'), tableRows('Company · submissions', 'deploymentId'), pageStyles, { language }) } }];"
    ].join('\n')) });
  builder.chainNodes([company, companyFind, companyDeployments, companySubmissions, companyRender, htmlResponse(builder, 'Company · send')]);

  const report = pageHook(builder, 'Report page', 'GET', 'xr-dia-report', false);
  const reportOrganisation = lookupNode(builder, 'Report · organisation', tables.organisations, 'organisationSlug', '={{ $json.query.organisation }}');
  const reportDeployment = lookupNode(builder, 'Report · deployment', tables.deployments, 'deploymentId', "={{ $('Report page').first().json.query.deployment }}", { executeOnce: true });
  const reportSubmissions = lookupNode(builder, 'Report · submissions', tables.submissions, 'deploymentId', "={{ $('Report page').first().json.query.deployment }}", { executeOnce: true });
  const reportRender = builder.addNode('Report · render', 'n8n-nodes-base.code', 2, { jsCode: codeBody(
    [rowsHelper, styles, "const query = $('Report page').first().json.query || {};"].join('\n'),
    [
      "const organisation = tableRows('Report · organisation', 'organisationSlug')[0];",
      "const deployment = tableRows('Report · deployment', 'deploymentId')[0];",
      "const allowed = organisation && deployment && textValue(query.key) && organisation.accessKey === textValue(query.key) && deployment.organisationSlug === organisation.organisationSlug;",
      "if (!allowed) return [{ json: { html: errorPage(pageStyles) } }];",
      "const language = pageLanguage($('Report page').first().json.query.language);",
      "return [{ json: { html: reportPage(organisation, deployment, tableRows('Report · submissions', 'deploymentId'), pageStyles, { language }) } }];"
    ].join('\n')) });
  builder.chainNodes([report, reportOrganisation, reportDeployment, reportSubmissions, reportRender, htmlResponse(builder, 'Report · send')]);
  return builder.finishWorkflow();
}

// One layer's narrative, on demand. Only fired flags reach the LLM; the key is checked first.
// Free OpenRouter models only (decided 21 Sep): the free tier is exhausted.
function narrativeWorkflow() {
  const builder = workflowBuilder('XR DIA · Narrative');
  const hook = builder.addNode('Narrative request', 'n8n-nodes-base.webhook', 2.1, { httpMethod: 'POST', path: 'xr-dia-narrative', responseMode: 'responseNode', options: {} });
  const organisation = lookupNode(builder, 'Narrative · organisation', tables.organisations, 'organisationSlug', '={{ $json.body.organisation }}');
  const deployment = lookupNode(builder, 'Narrative · deployment', tables.deployments, 'deploymentId', "={{ $('Narrative request').first().json.body.deployment }}", { executeOnce: true });
  const submissions = lookupNode(builder, 'Narrative · submissions', tables.submissions, 'deploymentId', "={{ $('Narrative request').first().json.body.deployment }}", { executeOnce: true });
  const prepare = builder.addNode('Narrative · prepare', 'n8n-nodes-base.code', 2, { jsCode: codeBody(
    [rowsHelper, "const body = $('Narrative request').first().json.body || {};"].join('\n'),
    [
      "const found = tableRows('Narrative · organisation', 'organisationSlug')[0];",
      "const target = tableRows('Narrative · deployment', 'deploymentId')[0];",
      "const allowed = found && target && textValue(body.key) && found.accessKey === textValue(body.key) && target.organisationSlug === found.organisationSlug;",
      "if (!allowed) return [{ json: { valid: false, reason: 'This link is not valid.' } }];",
      "const language = pageLanguage(body.language);",
      "const message = summaryMessage(deploymentSummary(target, tableRows('Narrative · submissions', 'deploymentId')));",
      "if (message.empty) return [{ json: { valid: false, reason: message.reason } }];",
      "return [{ json: { valid: true, messageText: message.messageText, language, fingerprint: summaryFingerprint(message.messageText), deploymentId: target.deploymentId } }];"
    ].join('\n')) });
  builder.chainNodes([hook, organisation, deployment, submissions, prepare]);
  const valid = validNode(builder);
  builder.linkNodes(prepare, valid);
  // Free models fail in bursts. On 21 Oct Gemini returned 503 "high demand" and the free OpenRouter
  // model errored at the same moment, so the summary was unavailable for an afternoon. The answer is a
  // chain of tiers across two providers, tried in order until one writes something.
  //
  // Tier 1 is pinned to a stable Gemini version on purpose. "models/gemini-flash-latest" is an alias that
  // now resolves to the newest Flash, and the newest model is the one that runs out of free capacity:
  // every one of those 503s was on it, as the provider's usage dashboard showed. Tier 2 keeps the alias so
  // the chain still works if the pinned version is retired.
  const narrativeTiers = [
    { key: 'A', kind: 'gemini', model: 'models/gemini-2.5-flash' },
    { key: 'B', kind: 'gemini', model: 'models/gemini-flash-latest' },
    { key: 'C', kind: 'openRouter', model: 'google/gemma-4-31b-it:free' },
    { key: 'D', kind: 'openRouter', model: 'minimax/minimax-m3.1-flash:free' }
  ];
  const parseBody = [
    'const both = narrativeTexts(output.text);',
    "if (!both.en) return [{ json: { valid: false, reason: 'The summary could not be written just now. Try again in a minute.' } }];",
    "const summaryText = prepared.language === 'de' && both.de ? both.de : both.en;",
    "return [{ json: { valid: true, summaryText, deploymentId: prepared.deploymentId, formName: 'summary', respondentName: '', submissionAnswers: JSON.stringify({ summaryText: both.en, summaryTextDe: both.de, fingerprint: prepared.fingerprint, writtenAt: new Date().toISOString() }) } }];"
  ].join('\n');
  const keep = builder.addNode('Narrative · keep', 'n8n-nodes-base.code', 2, { jsCode: codeBody('const row = $input.first().json;',
    'return [{ json: { deploymentId: row.deploymentId, formName: row.formName, respondentName: row.respondentName, submissionAnswers: row.submissionAnswers } }];') });
  const save = insertNode(builder, 'Narrative · save', tables.submissions);
  const send = builder.addNode('Narrative · send', 'n8n-nodes-base.respondToWebhook', 1.1, { respondWith: 'json',
    responseBody: "={{ { summary: $('Narrative \u00b7 prepare').first().json.language === 'de' ? (JSON.parse($('Narrative \u00b7 keep').first().json.submissionAnswers).summaryTextDe || JSON.parse($('Narrative \u00b7 keep').first().json.submissionAnswers).summaryText) : JSON.parse($('Narrative \u00b7 keep').first().json.submissionAnswers).summaryText } }}", options: {} });
  const refuse = builder.addNode('Narrative · refuse', 'n8n-nodes-base.respondToWebhook', 1.1, { respondWith: 'json', responseBody: '={{ { summary: "", reason: $json.reason } }}', options: {} });
  let previous = valid;
  let previousOutput = 0;
  for (const tier of narrativeTiers) {
    const chain = builder.addNode('Narrative · write ' + tier.key, '@n8n/n8n-nodes-langchain.chainLlm', 1.7, {
      promptType: 'define', text: "={{ $('Narrative · prepare').first().json.messageText }}", messages: { messageValues: [{ message: narrativeSystem }] }, batching: {}
    }, { onError: 'continueRegularOutput', retryOnFail: true, maxTries: 2, waitBetweenTries: 2000 });
    const model = tier.kind === 'gemini'
      ? builder.addNode('Narrative · model ' + tier.key, '@n8n/n8n-nodes-langchain.lmChatGoogleGemini', 1,
        { modelName: tier.model, options: { temperature: 0.2 } },
        { credentials: { googlePalmApi: { id: credentials.gemini.id, name: credentials.gemini.name } } })
      : builder.addNode('Narrative · model ' + tier.key, '@n8n/n8n-nodes-langchain.lmChatOpenRouter', 1,
        { model: tier.model, options: { temperature: 0.2, timeout: 45000, maxRetries: 1 } },
        { credentials: { openRouterApi: { id: credentials.openRouter.id, name: credentials.openRouter.name } } });
    builder.linkModel(model, chain);
    const parse = builder.addNode('Narrative · parse ' + tier.key, 'n8n-nodes-base.code', 2, { jsCode: codeBody(
      ["const output = $input.first()?.json || {};", "const prepared = $('Narrative · prepare').first().json;"].join('\n'), parseBody) });
    const written = validNode(builder, 'Written ' + tier.key + '?');
    builder.linkNodes(previous, chain, previousOutput);
    builder.chainNodes([chain, parse]);
    builder.linkNodes(parse, written);
    builder.linkNodes(written, keep, 0);
    previous = written;
    previousOutput = 1;
  }
  builder.chainNodes([keep, save, send]);
  builder.linkNodes(previous, refuse, previousOutput);
  builder.linkNodes(valid, refuse, 1);
  return builder.finishWorkflow();
}

const missing = Object.entries(tables).filter(([, id]) => !id).map(([name]) => name);
if (missing.length) {
  console.log('configuration/tables.json is missing table IDs for: ' + missing.join(', ') + ' — building with empty IDs; do not deploy these files.');
}
const workflows = {
  adopter: roleWorkflow('adopter'), developer: roleWorkflow('developer'), integrator: roleWorkflow('integrator'),
  creation: creationWorkflow(), seed: seedWorkflow(), pages: pagesWorkflow(), narrative: narrativeWorkflow()
};
for (const [name, workflow] of Object.entries(workflows)) {
  mkdirSync(join(root, 'workflows'), { recursive: true });
  writeFileSync(join(root, 'workflows', name + '.json'), JSON.stringify(workflow, null, 2) + '\n');
  console.log(('workflows/' + name + '.json').padEnd(26), workflow.nodes.length + ' nodes');
}
