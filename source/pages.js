// Builds page 2 of every form as n8n JSON fields, and maps the submitted answers back to item codes.
// n8n 2.2.5 keys submitted answers by label (JSON fields reject fieldName), so fieldLabel must be the
// single source of labels for both directions. HTML blocks lose every attribute, so style by element.
// Codes on every form, one pattern (12 Oct): n8n form labels are plain text, so they cannot be made smaller.
const codedForms = new Set(['adopter', 'developer', 'integrator']);
const rolloutLabel = 'Who sets it up in your operations (installation, integration, training)?';
const commentLabel = 'Anything else you want to tell us about this task? (optional)';
const descriptionLabel = 'What happens in this task? (a few sentences, so everyone answering knows which task this is)';
const evidenceOnlyItems = ['TR4'];
const scaleOptions = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const sectionNotes = {
  Danger: 'Rate how relevant, 0–10.',
  Immersion: 'Rate how relevant, 0–10.',
  Verification: 'Rate how relevant, 0–10.',
  Expertise: 'Rate how relevant, 0–10.',
  'Your concerns': 'Your own direct experience/concerns, not a prediction about others.',
  'Evidence pool': 'Where we evaluated the hardware and/or software, the evaluation is shown and the answer is pre-filled from it. Change it if your judgment differs.',
  'Technology readiness per task dimension': 'Your holistic 0–10 judgement, informed by the evidence pool above, not computed from it.',
  'Expected resistance': 'Your prediction of how the workforce will react, not a survey of them.',
  'Ecosystem strategy': 'Two of these come in a leader version and a follower version. Answer the one that matches your position, and leave the other blank.'
};

function formItems(formName, configuration) {
  const internal = configuration === 'A';
  return items.filter((item) => item.form === formName && !(internal && item.external));
}

function fieldLabel(item, formName, suffix, language) {
  const code = codedForms.has(formName) ? (item.label || item.code) + ' · ' : '';
  return code + (suffix ?? plainQuestion(item, language));
}

function noteLabel(item, formName, language) {
  return fieldLabel(item, formName, sayText(item.note, language) + sayText(' (optional)', language), language);
}

function rankLabel(item, formName, option, language) {
  return (codedForms.has(formName) ? (item.label || item.code) + ' · ' : '') + sayText(option, language);
}

function htmlField(html) {
  return { fieldType: 'html', html };
}

function choiceField(label, options, required, preset) {
  const field = { fieldLabel: label, fieldType: 'radio', fieldOptions: { values: options.map((option) => ({ option })) }, requiredField: required };
  return preset === undefined ? field : { ...field, defaultValue: preset };
}

// Every form says who is asking and where the answers go (12 Oct). A German respondent could not read
// any of it, including the sentence about what happens to his answers (German run, 22 Oct).
function askingHtml(context) {
  const language = context?.language;
  const say = (text) => escapeHtml(sayText(text, language));
  if (context?.creating) return '<p>' + say('You are setting up one task for your team to assess. The people who do the task, build the technology and install it each answer their own form.') + '</p>';
  const asking = escapeHtml(textValue(context?.organisationName)) + ' ' + say('is checking whether XR suits one deployment.');
  if (context?.answering === 'adopter') {
    return '<p>' + asking + ' ' + say('XR means smart glasses or a headset that can show instructions and pictures while you work.') + '</p>'
      + '<p>' + say('Your answers go into a report their team reads. Numbers are shown only as totals, never on their own and never with your name.')
      + ' ' + say('Anything you type in a text box is shown in full, without your name.') + '</p>';
  }
  return '<p>' + asking + ' ' + say('Your answers go into a report their team reads.') + '</p>';
}

function contextHtml(context) {
  const rows = [['Company', context.organisationName], ['Task', context.taskName], ['What happens', context.taskDescription], ['Set-up', setupText(context.technology, context.rollout, context.language)],
    ['Device', context.device], ['Software', context.platform]].map(([name, value]) => [sayText(name, context.language), value]);
  const body = rows.filter(([, value]) => textValue(value) !== '').map(([name, value]) => '<tr><td>' + name + '</td><td>' + escapeHtml(value) + '</td></tr>').join('');
  return '<table><tbody>' + body + '</tbody></table>';
}

function setupText(technology, rollout, language) {
  if (technology === 'Our company') return sayText('Our company supplies the XR technology', language);
  if (technology !== 'External supplier') return '';
  const setup = { 'Our company': 'Our company sets it up.', 'Same supplier': 'The same supplier sets it up.', 'Another company': 'Another company sets it up.' }[rollout];
  return sayText('An external supplier provides the XR technology.', language) + (setup ? ' ' + sayText(setup, language) : '');
}


function evidenceHtml(code, choice, reference) {
  if (code === 'TR8' || code === 'TR9') return '<p><em>' + (code === 'TR8' ? 'Audio' : 'Touch feedback') + " wasn't evaluated in the study this tool draws on, so there is nothing to pre-fill. Use your own judgement.</em></p>";
  const baseline = baselineScore(code, choice, reference);
  if (baseline.empty) return '<p><em>' + escapeHtml(baseline.reason) + ' Use your own judgement.</em></p>';
  const rows = baseline.baselineParts.map((part) => '<tr><td>' + escapeHtml(part.fieldName) + '</td><td>' + part.fieldScore + '</td></tr>').join('');
  const conversion = 'Average ' + baseline.averageScore.toFixed(2) + ' of 5. On a 0–10 scale that is '
    + baseline.baselineValue + ', using (average - 1) ÷ 4 × 10.';
  const summary = code === 'TR11'
    ? 'Reference only. This is a Yes/No item, so nothing is pre-filled.'
    : conversion + (evidenceOnlyItems.includes(code)
      ? ' This compares devices with each other. It does not know your task, so we have not filled this one in. Please answer it yourself.'
      : '');
  return '<table><thead><tr><th>Our Evaluation (2026)</th><th>1–5</th></tr></thead><tbody>' + rows + '</tbody></table><p><em>' + summary + '</em></p>';
}

function presetValue(item, choice, reference) {
  if (item.type !== 'scale' || !/^TR\d+$/.test(item.code)) return undefined;
  if (evidenceOnlyItems.includes(item.code)) return undefined;
  const baseline = baselineScore(item.code, choice, reference);
  return baseline.empty ? undefined : String(baseline.baselineValue);
}

function itemFields(item, formName, extras) {
  const language = extras?.language;
  const required = false;
  const fields = [];
  if (formName === 'developer' && /^TR\d+$/.test(item.code)) fields.push(htmlField(evidenceHtml(item.code, extras.choice, extras.reference)));
  if (item.hint) fields.push(htmlField('<p><em>' + escapeHtml(sayText(item.hint, language)) + '</em></p>'));
  if (item.type === 'scale') fields.push(choiceField(fieldLabel(item, formName, undefined, language), scaleOptions, required, formName === 'developer' ? presetValue(item, extras.choice, extras.reference) : undefined));
  if (item.type === 'yesNo' || item.type === 'choice') fields.push(choiceField(fieldLabel(item, formName, undefined, language), item.options.map((option) => sayText(option, language)), required));
  if (item.type === 'number') fields.push({ fieldLabel: fieldLabel(item, formName, undefined, language), fieldType: 'number', requiredField: required });
  if (item.type === 'text') fields.push({ fieldLabel: fieldLabel(item, formName, undefined, language), fieldType: 'text', placeholder: item.placeholder || '', requiredField: required });
  if (item.type === 'rank') {
    fields.push(htmlField('<p><strong>' + escapeHtml(fieldLabel(item, formName, undefined, language)) + '</strong></p>'));
    const ranks = scaleOptions.slice(1, item.options.length + 1).map((rank) => ({ option: rank }));
    for (const option of item.options) fields.push({ fieldLabel: rankLabel(item, formName, option, language), fieldType: 'dropdown', fieldOptions: { values: ranks }, requiredField: false });
  }
  if (item.note) fields.push({ fieldLabel: noteLabel(item, formName, language), fieldType: 'text', requiredField: false });
  return fields;
}

// Page 2 of a form. context carries organisationName, taskName, taskDescription, technology and rollout;
// choice + reference feed the Developer's pre-fill.
function pageFields(formName, context, extras) {
  const options = extras || {};
  const configuration = configurationCode(context?.technology, context?.rollout);
  const language = pageLanguage(options.language);
  const chosen = formName === 'developer' ? { device: options.choice?.device, platform: options.choice?.platform } : {};
  const shown = { ...context, ...chosen, creating: formName === 'creation', answering: formName, language };
  const fields = [htmlField(askingHtml(shown) + contextHtml(shown))];
  if (formName === 'creation') {
    if (context?.technology === 'External supplier') {
      fields.push(htmlField('<h3>' + escapeHtml(sayText('Who does what', language)) + '</h3>'));
      fields.push(choiceField(sayText(rolloutLabel, language), ['Our company', 'Same supplier', 'Another company'].map((option) => sayText(option, language)), true));
    }
    fields.push(htmlField('<h3>' + escapeHtml(sayText('The task', language)) + '</h3>'));
    fields.push({ fieldLabel: sayText(descriptionLabel, language), fieldType: 'textarea', requiredField: true });
    return fields;
  }
  const sections = [...new Set(formItems(formName, configuration).map((item) => item.section))];
  for (const section of sections) {
    fields.push(htmlField('<h3>' + escapeHtml(sayText(section, language)) + '</h3>' + (sectionNotes[section] ? '<p><em>' + escapeHtml(sayText(sectionNotes[section], language)) + '</em></p>' : '')));
    for (const item of formItems(formName, configuration).filter((entry) => entry.section === section)) fields.push(...itemFields(item, formName, { ...options, language }));
  }
  fields.push(htmlField('<h3>' + escapeHtml(sayText('In your own words', language)) + '</h3><p><em>'
    + escapeHtml(sayText('Anything the questions above did not let you say. This is shown in the report exactly as you write it, without your name.', language)) + '</em></p>'));
  fields.push({ fieldLabel: sayText(commentLabel, language), fieldType: 'textarea', requiredField: false });
  return fields;
}

// The submitted answers of page 2, keyed by item code. Notes go under <code>Note; ranks become
// { option: rank }. Unanswered optional fields are stored as '' so nothing downstream sees undefined.
function submissionAnswers(formName, output, configuration, language) {
  const answers = output && typeof output === 'object' ? output : {};
  const result = {};
  for (const item of formItems(formName, configuration)) {
    if (item.type === 'rank') {
      result[item.code] = Object.fromEntries(item.options.map((option) => [option, textValue(answers[rankLabel(item, formName, option, language)])]));
      continue;
    }
    const given = textValue(answers[fieldLabel(item, formName, undefined, language)]);
    result[item.code] = item.type === 'yesNo' || item.type === 'choice' ? sourceOption(item, given, language) : given;
    if (item.note) result[item.code + 'Note'] = textValue(answers[noteLabel(item, formName, language)]);
  }
  result.ownWords = textValue(answers[sayText(commentLabel, language)]);
  return result;
}

function jsonValue(input) {
  if (input && typeof input === 'object') return input;
  try {
    const parsed = JSON.parse(textValue(input) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    return {};
  }
}
