const test = require('node:test');
const assert = require('node:assert/strict');
const source = require('./load-source').loadSource();
const { mould, developer, integrator } = require('./fixtures');

const { teamPage, companyPage, reportPage, errorPage, deploymentSummary, summaryMessage, narrativeText, plainHeadline } = source;
const organisation = { organisationName: 'Company A', organisationSlug: 'company-a', accessKey: 'k3y0000000000000000000ab', createdAt: '2026-09-01T10:00:00Z' };
const deployment = {
  deploymentId: 'd-1', organisationSlug: 'company-a', organisationName: 'Company A', taskName: 'Injection mould changeover',
  technology: 'External supplier', rollout: 'Our company', createdAt: '2026-09-02T10:00:00Z',
  taskDescription: 'The press is stopped, the old mould comes out and the new one goes in.'
};

function submissionRow(formName, answers, name) {
  return { deploymentId: 'd-1', formName, respondentName: name, submissionAnswers: JSON.stringify(answers) };
}

const rows = [
  ...mould.submissions.adopter.map((answers, index) => submissionRow('adopter', answers, 'Secret Adopter ' + index)),
  submissionRow('developer', developer, 'Dev Person'),
  submissionRow('integrator', { ...integrator, X2Note: 'Only at the press' }, 'Integrator Person'),
  { deploymentId: 'other', formName: 'adopter', respondentName: 'x', submissionAnswers: '{}' }
];

test('the report leads with plain English, keeps traceability, and never grades', () => {
  const html = reportPage(organisation, deployment, rows, '');
  assert.match(html, /Haptic is needed for this task, but the equipment cannot deliver it yet/);
  assert.match(html, /How well the task and the equipment fit each other\./);
  assert.match(html, /class="ref">Developers</, 'each point says which role acts');
  assert.ok(!/RB-[A-Z0-9]|TTF_TOTAL|flags fired|not evaluated/i.test(html), 'no codes or researcher jargon on a manager-facing page');
  assert.match(html, /<li class="high"/, 'blocking points are marked');
  assert.match(html, /Raised <b>\d+<\/b>/);
  assert.match(html, /Cleared <b>\d+<\/b>/);
  assert.match(html, /Skipped <b>\d+<\/b>/);
  assert.ok(!/Checked <b>|Waiting <b>/.test(html), 'the header uses only the three words the legend explains');
});

test('no name ever reaches a page — not Adopters, not anyone', () => {
  for (const html of [reportPage(organisation, deployment, rows, ''), teamPage([organisation], [deployment], rows, ''), companyPage(organisation, [deployment], rows, '')]) {
    assert.ok(!/Secret Adopter|Dev Person|Integrator Person/.test(html));
  }
});

test('the individual questions appear only as totals', () => {
  const html = reportPage(organisation, deployment, rows, '');
  assert.match(html, /One square per person who answered/);
  assert.match(html, /0 Yes · 1 Maybe · 4 No|1 Maybe/, 'a Maybe is never hidden');
  assert.match(html, /key-title">Worries</);
  assert.match(html, /key-title">Readiness</);
  const copy = html.replace(/<head>[\s\S]*?<\/head>|<style>[\s\S]*?<\/style>|<script>[\s\S]*?<\/script>|&[a-z]+;|&#\d+;|style="[^"]*"/g, '');
  assert.ok(!/;/.test(copy), 'no semicolons in the page copy');
  assert.ok(!/\u2014/.test(copy), 'no em dashes in the page copy (en dashes in 0\u201310 are fine)');
});

test('checks that could not run say whether the reader can act', () => {
  const html = reportPage(organisation, deployment, rows, '');
  assert.match(html, /Nothing is missing on your side/);
  assert.match(html, /No rule exists yet/);
  assert.match(html, /Could not check/);
  assert.ok(!/some of the report real worries/.test(html), 'a check that never ran is never printed as a statement');
  assert.match(html, /You can still close these|Checks that could not be run/);
  assert.match(html, /<b>Blockers<\/b> fix this first/, 'every word is explained before it is used');
  assert.match(html, /<b>Raised<\/b> found something/);
});

test('the summary button waits for all three roles, and shows a stored summary when there is one', () => {
  const partial = rows.filter((row) => row.formName !== 'developer');
  assert.match(reportPage(organisation, deployment, partial, ''), /Waiting for: Developers/);
  assert.match(reportPage(organisation, deployment, rows, ''), /Summarise in plain English/);
  const stored = [...rows, { deploymentId: 'd-1', formName: 'summary', respondentName: '', createdAt: '2026-10-12T10:00:00Z', submissionAnswers: JSON.stringify({ summaryText: 'Two of five workers fear for their jobs.' }) }];
  const html = reportPage(organisation, deployment, stored, '');
  assert.match(html, /Two of five workers fear for their jobs\./);
  assert.match(html, /Write it again/);
});

test('the task description is shown under the task name', () => {
  assert.match(reportPage(organisation, deployment, rows, ''), /The press is stopped, the old mould comes out/);
});

test('free-text notes are shown, without names', () => {
  const html = reportPage(organisation, deployment, rows, '');
  assert.match(html, /Only at the press/);
});

test('typed text is escaped everywhere', () => {
  const hostile = { ...organisation, organisationName: '<script>alert(1)</script>' };
  const task = { ...deployment, taskName: '<img src=x onerror=alert(1)>' };
  for (const html of [teamPage([hostile], [task], rows, ''), reportPage(hostile, task, rows, '')]) {
    assert.ok(!html.includes('<script>alert(1)') && !html.includes('<img src=x'));
  }
});

test('dashboard rows count answers per role and carry the right links', () => {
  const html = companyPage(organisation, [deployment], rows, '');
  assert.match(html, /xr-dia-adopter\?deployment=d-1/);
  assert.match(html, /xr-dia-new-deployment\?organisation=company-a&amp;key=k3y0000000000000000000ab/);
  assert.match(html, /<b class="">5<\/b>/);
  assert.equal(deploymentSummary(deployment, rows).roleSubmissions.adopter.length, 5);
});

test('the summary request carries only raised points, in plain words, with no names or codes', () => {
  const message = summaryMessage(deploymentSummary(deployment, rows));
  assert.equal(message.empty, false);
  assert.match(message.messageText, /Haptic is needed for this task/);
  assert.ok(!/Secret|Person/.test(message.messageText));
  assert.ok(!/RB-|TR\d/.test(message.messageText), 'no check or item codes reach the model');
  assert.equal(summaryMessage(deploymentSummary({ ...deployment, deploymentId: 'none' }, rows)).empty, true);
});

test('an invalid link gets a plain error page', () => {
  assert.match(errorPage(''), /This link isn’t valid/);
});

test('the narrative is read from plain JSON, fenced JSON, or JSON inside a sentence — and nothing else', () => {
  assert.equal(narrativeText('{"narrative":"Plain."}'), 'Plain.');
  assert.equal(narrativeText('```json\n{"narrative":"Fenced."}\n```'), 'Fenced.');
  assert.equal(narrativeText('Here it is: {"narrative":"Wrapped."} Done.'), 'Wrapped.');
  assert.equal(narrativeText('Sorry, I cannot help.'), '');
  assert.equal(narrativeText(undefined), '');
});

test('the page opens a real <main>, and the report carries the data the narrative button reads', () => {
  const report = reportPage(organisation, deployment, rows, '');
  assert.match(report, /<main data-report data-organisation="company-a" data-key="[^"]+" data-deployment="d-1" data-language="en">/);
  assert.match(teamPage([organisation], [deployment], rows, ''), /<main>/);
  for (const html of [report, teamPage([organisation], [deployment], rows, ''), companyPage(organisation, [deployment], rows, '')]) {
    assert.ok(!/<main[a-zA-Z-]/.test(html), 'attributes must not fuse onto the tag name');
  }
});

test('no type of XR experience is named anywhere a person or the model reads', () => {
  const { rules, items } = source;
  const shown = rules.map((rule) => plainHeadline(rule.id, rule.text));
  for (const text of shown) assert.ok(!/\b(AR|MR|VR)\b/.test(text), 'a headline names an experience type: ' + text);
  const html = reportPage(organisation, deployment, rows, '');
  const copy = html.replace(/<head>[\s\S]*?<\/head>|<style>[\s\S]*?<\/style>|<script>[\s\S]*?<\/script>/g, '');
  assert.ok(!/\b(AR|MR|VR)\b/.test(copy), 'the report names an experience type');
  assert.ok(!/\b(AR|MR|VR)\b/.test(summaryMessage(deploymentSummary(deployment, rows)).messageText), 'the model is told one');
  assert.ok(items.every((item) => !/\bthesis\b/i.test(item.displayText || '')), 'a question names its evidence source');
});

test('the questions a respondent reads carry no lead-in naming another code', () => {
  const { items, plainQuestion } = source;
  for (const item of items) {
    assert.ok(!/^Given /i.test(plainQuestion(item)), item.code + ' still opens with a lead-in');
    assert.ok(!/^If you answered yes to /i.test(plainQuestion(item)), item.code + ' still opens with a lead-in');
  }
});

test('the model is sent the written comments, not only the checks that fired', () => {
  const message = summaryMessage(deploymentSummary(deployment, rows)).messageText;
  assert.match(message, /What people wrote in their own words/);
  assert.match(message, /Only at the press/, 'a free-text comment reaches the model');
  assert.ok(!/Secret Adopter|Dev Person|Integrator Person/.test(message), 'still no names');
});

test('inside each layer the model is given the most urgent points first', () => {
  const summary = deploymentSummary(deployment, rows);
  const message = summaryMessage(summary).messageText;
  const firstLayerOne = message.split('\n').filter((line) => line.startsWith('- (Task & Technology'));
  const fired = summary.ruleResults.filter((result) => result.ruleState === 'fired' && result.layerNumber === 1);
  const urgent = fired.filter((result) => ['RB-A1', 'RB-E1', 'RB-F2'].includes(result.ruleId)).length;
  assert.ok(urgent > 0, 'the fixture must raise at least one blocker to make this meaningful');
  const topLines = firstLayerOne.slice(0, urgent).join(' ');
  assert.match(topLines, /Haptic is needed|written down nowhere|low-fidelity version/);
});

test('privacy with a device that really tracks is a blocker, not a note', () => {
  const html = reportPage(organisation, deployment, rows, '');
  const privacy = html.match(/<li class="(high|medium|low)">[^<]*<span class="dot"><\/span><span class="what">[^<]*privacy worries, and the device really can track[^<]*/);
  assert.ok(privacy, 'the privacy point is on the page');
  assert.equal(privacy[1], 'high');
});

test('what a respondent writes in their own words reaches the report and the model', () => {
  const spoken = [...rows, { deploymentId: 'd-1', formName: 'adopter', respondentName: 'x',
    submissionAnswers: JSON.stringify({ ...mould.submissions.adopter[0], ownWords: 'The crane is the dangerous part, not the paperwork.' }) }];
  const html = reportPage(organisation, deployment, spoken, '');
  assert.match(html, /The crane is the dangerous part/, 'it is printed in the report');
  assert.match(summaryMessage(deploymentSummary(deployment, spoken)).messageText, /The crane is the dangerous part/, 'the model is told');
  assert.ok(!/respondentName|"x"/.test(html), 'still no names');
});

test('both pages carry an English and a German switch, and the report tells the summary which to write', () => {
  for (const language of ['en', 'de']) {
    const report = reportPage(organisation, deployment, rows, '', { language });
    assert.match(report, /class="lang here"[^>]*>English|class="lang"[^>]*>English/, 'English switch is present');
    assert.match(report, /language=de/, 'the German link is offered');
    assert.match(report, new RegExp('data-language="' + language + '"'), 'the page states its own language');
    const company = companyPage(organisation, [deployment], rows, '', { language });
    assert.match(company, /language=de/);
    assert.match(company, />EN</, 'the per-role copy buttons are labelled');
    assert.match(company, />DE</);
  }
});

test('a semicolon or em dash from the model never reaches the reader', () => {
  assert.equal(narrativeText('{"narrative":"Gloves are a problem; consider voice."}'), 'Gloves are a problem. Consider voice.');
  assert.ok(!/;/.test(narrativeText('{"narrative":"A; B; C"}')));
  assert.ok(!/—/.test(narrativeText('{"narrative":"A — B"}')));
});

test('the German report is German throughout, with German number and date conventions', () => {
  const html = reportPage(organisation, deployment, rows, '', { language: 'de' });
  const copy = html.replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>|<head>[\s\S]*?<\/head>/g, '').replace(/<[^>]*>/g, ' ');
  for (const leftover of ['Checks that could not be run', 'You can still close these', 'Nothing is missing on your side',
    'still being researched', 'Waiting on', 'Raised', 'Cleared', 'Skipped', 'Legend', 'Summary', 'found something', 'could not run']) {
    assert.ok(!new RegExp('\\b' + leftover + '\\b').test(copy), 'still English on the German report: ' + leftover);
  }
  assert.match(copy, /\d+,\d/, 'decimals use a comma');
  assert.ok(!/\d+\.\d\s*(von 10|insgesamt)/.test(copy), 'no decimal points left in the German chart');
});

test('a count of one takes the singular verb in German', () => {
  const { countedText } = source;
  assert.equal(countedText('N von M hat|haben Angst', 1), 'N von M hat Angst');
  assert.equal(countedText('N von M hat|haben Angst', 3), 'N von M haben Angst');
  assert.match(plainHeadline('RB3-06', '1 of 5 adopters', 'de'), /1 von 5 Anwendern hat Angst/);
  assert.match(plainHeadline('RB3-06', '3 of 5 adopters', 'de'), /3 von 5 Anwendern haben Angst/);
});

test('one call writes both languages, and they go stale together', () => {
  const { narrativeTexts, summaryFingerprint } = source;
  const reply = '{"narrative":"Capture the knowledge first.","narrativeDe":"Halten Sie das Wissen zuerst fest."}';
  const both = narrativeTexts(reply);
  assert.equal(both.en, 'Capture the knowledge first.');
  assert.equal(both.de, 'Halten Sie das Wissen zuerst fest.');

  const summary = deploymentSummary(deployment, rows);
  const fingerprint = summaryFingerprint(summaryMessage(summary).messageText);
  const stored = (print) => [...rows, { deploymentId: 'd-1', formName: 'summary', respondentName: '', createdAt: '2026-10-22T10:00:00Z',
    submissionAnswers: JSON.stringify({ summaryText: both.en, summaryTextDe: both.de, fingerprint: print }) }];

  for (const language of ['en', 'de']) {
    const fresh = source.savedSummary(stored(fingerprint), 'd-1', language, fingerprint);
    assert.equal(fresh.outdated, false, language + ' is current');
    const stale = source.savedSummary(stored('something-else'), 'd-1', language, fingerprint);
    assert.equal(stale.outdated, true, language + ' goes stale with the other');
  }
  assert.equal(source.savedSummary(stored(fingerprint), 'd-1', 'de', fingerprint).summaryText, both.de);
  assert.equal(source.savedSummary(stored(fingerprint), 'd-1', 'en', fingerprint).summaryText, both.en);
});

test('a summary written before fingerprints existed is treated as out of date, not as current', () => {
  const old = [...rows, { deploymentId: 'd-1', formName: 'summary', respondentName: '', createdAt: '2026-10-21T10:00:00Z',
    submissionAnswers: JSON.stringify({ summaryText: 'Written last week.' }) }];
  const print = source.summaryFingerprint(summaryMessage(deploymentSummary(deployment, rows)).messageText);
  assert.equal(source.savedSummary(old, 'd-1', 'en', print).outdated, true);
});

test('the skipped heading counts the lines it actually shows', () => {
  const html = reportPage(organisation, deployment, rows, '');
  const block = html.split('<details>')[1] || '';
  const heading = Number((block.match(/could not be run · (\d+)/) || [, '0'])[1]);
  const shown = (block.match(/<li>/g) || []).length;
  assert.equal(heading, shown, 'the number in the heading must match the lines listed');
});

test('the skipped count in the header, the badges and the panel all agree', () => {
  const html = reportPage(organisation, deployment, rows, '');
  const header = Number((html.match(/Skipped <b>(\d+)<\/b>/) || [, '0'])[1]);
  const block = html.split('<details>')[1] || '';
  const panel = Number((block.match(/could not be run · (\d+)/) || [, '0'])[1]);
  const lines = (block.match(/<li>/g) || []).length;
  assert.equal(panel, lines, 'the panel heading matches the lines listed');
  assert.equal(header, panel, 'the header matches the panel');
});

test('a stored summary can always be written again, and says who should act', () => {
  const stored = [...rows, { deploymentId: 'd-1', formName: 'summary', respondentName: '', createdAt: '2026-10-22T10:00:00Z',
    submissionAnswers: JSON.stringify({ summaryText: 'Something.', fingerprint: 'x' }) }];
  const html = reportPage(organisation, deployment, stored, '');
  assert.match(html, /data-summary/, 'the rewrite button survives a reload');
  assert.match(html, /who should act on it/, 'the role tag is explained in the legend');
});
