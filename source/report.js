// The report page: short, visual, plain English. Rewritten after review found the first
// rewrite too long and too wordy. One line per point, bars instead of paragraphs, no folded quotations.
// Every reader-facing string on this page goes through sayText, so German is the same page in the
// other language rather than a second set of builders.
const layerNames = [
  [1, 'Task & Technology', 'Does the task need XR, and can the equipment deliver it?'],
  [2, 'Organisation', 'Is the company set up to make it work?'],
  [3, 'People', 'What do the people who would use it think?'],
  [4, 'Partners & Market', 'What depends on other companies?']
];
const reportSections = layerNames.map(([layerNumber, title, question]) => ({ title, question, layers: [layerNumber] }));
const actionHeadings = {
  Adopter: 'Adopters',
  'Adopter → Integrator': 'Adopters with Integrator',
  Developer: 'Developers',
  'Integrator → Developer': 'Integrators with Developer',
  Integrator: 'Integrators'
};
// Colour comes from the researcher's own wording, not from a severity scale: these six say "BLOCKING",
// "hard stop", "don't deploy" or "highest-priority", plus privacy. Draft mapping, not yet confirmed.
const urgentRules = ['RB-A1', 'RB-E1', 'RB-F2', 'RB2-01', 'RB2-04', 'RB2-06', 'RB3-07'];
const actionWords = /verify|check|confirm|budget|plan|expect|consider|clarify|scope this/i;
const rankTopics = { MP1: 'which economic benefit matters most', MP2: 'which strategic benefit matters most' };
const pendingBadges = {
  waiting: 'Waiting for an answer',
  split: 'No majority answer',
  notApplicable: 'Does not apply here',
  research: 'No rule exists yet'
};

function chipHtml(label, value, tone, language) {
  return '<span class="chip' + (tone ? ' ' + tone : '') + '">' + escapeHtml(sayText(label, language)) + ' <b>' + escapeHtml(String(value)) + '</b></span>';
}

function pendingKind(result) {
  const reason = textValue(result.stateReason);
  if (reason.startsWith('Waiting on')) return 'waiting';
  if (reason.startsWith('No conclusion')) return 'split';
  if (reason.startsWith('Not applicable')) return 'notApplicable';
  return 'research';
}

// The reason is built in English by the rule engine, which the rules depend on. Translate it for the
// reader instead of changing what the engine stores.
function waitingText(reason, language) {
  const names = textValue(reason).replace(/^Waiting on /, '');
  if (names === textValue(reason)) return textValue(reason);
  const roleNames = names.split(' and ').map((name) => sayText(name, language)).join(' ' + sayText('and', language) + ' ');
  return sayText('Waiting on', language) + ' ' + roleNames;
}

function pendingGroups(results) {
  const groups = { waiting: [], split: [], notApplicable: [], research: [] };
  for (const result of results) if (result.ruleState === 'notEvaluated') groups[pendingKind(result)].push(result);
  return groups;
}



function pointLevel(result) {
  if (urgentRules.includes(result.ruleId)) return 'high';
  return actionWords.test(textValue(result.flagText)) ? 'medium' : 'low';
}

function pointLine(result, language) {
  return '<li class="' + pointLevel(result) + '"><span class="dot"></span>'
    + '<span class="what">' + escapeHtml(plainHeadline(result.ruleId, result.flagText, language)) + '</span>'
    + '<span class="ref">' + escapeHtml(sayText(actionHeadings[result.roleName] || result.roleName, language)) + '</span></li>';
}

function barRow(label, value, maximum, shown, tag, marker, language) {
  const width = Math.round((value / maximum) * 100);
  const bar = width > 0 ? '<span style="width:' + width + '%"></span>' : '';
  const line = marker ? '<i class="mark" style="left:' + Math.round((marker / maximum) * 100) + '%"></i>' : '';
  return '<tr><td>' + escapeHtml(label) + (tag ? '<span class="tag">' + escapeHtml(tag) + '</span>' : '')
    + '</td><td class="bar">' + bar + line + '</td><td class="number">' + escapeHtml(shown) + '</td></tr>';
}

// One bar for the fit, with required and delivered marked as vertical lines on the same 0-10 axis.
function pairRow(label, required, delivered, shown, marker, language) {
  const width = Math.round((shown / 10) * 100);
  const line = (value, name) => '<i class="mark ' + name + '" style="left:' + Math.round((value / 10) * 100) + '%"></i>';
  return '<tr><td>' + escapeHtml(label) + '</td><td class="bar">'
    + (width > 0 ? '<span style="width:' + width + '%"></span>' : '')
    + line(marker, 'overall') + line(required, 'required') + line(delivered, 'delivered')
    + '</td><td class="number">' + escapeHtml(decimalText(shown, language)) + '</td></tr>';
}

function fitChart(answers, language) {
  const say = (text) => escapeHtml(sayText(text, language));
  const fit = fitScores(answers);
  if (fit.empty) return '<p class="note">' + say('The fit score needs answers from both Adopters and Developers.') + '</p>';
  const rows = fit.componentRows.map((row) => pairRow(sayText(row.dimensionName, language), row.relevanceScore, row.readinessScore,
    row.componentScore, fit.totalScore, language)).join('');
  const marker = '<div class="marker-label"><span style="left:' + Math.round(fit.totalScore * 10) + '%">' + decimalText(fit.totalScore, language) + ' ' + say('overall') + '</span></div>';
  return '<p class="big">' + decimalText(fit.totalScore, language) + '<span> ' + say('out of 10') + '</span></p>'
    + '<p class="note">' + say('How well the task and the equipment fit each other.') + '</p>'
    + '<div class="chart">' + marker + '<table><tbody>' + rows + '</tbody></table></div>'
    + '<p class="note chart-key"><span><span class="legend-line required"></span>' + say('required, what the task asks for') + '</span>'
    + '<span><span class="legend-line delivered"></span>' + say('delivered, what the equipment gives') + '</span>'
    + '<span><span class="legend-line overall"></span>' + say('overall, the average of the eight') + '</span>'
    + '<span>' + say('The number on the right is the fit between required and delivered.') + '</span></p>';
}

// One square per person, so a "Maybe" can never disappear and the number of answers is visible.
function squareRow(label, answers, options, language) {
  const counts = options.map(([option]) => answers?.optionCounts?.[option] || 0);
  const squares = options.map(([option, tone], index) => Array(counts[index]).fill('<span class="square ' + tone + '"></span>').join('')).join('');
  const written = options.map(([option], index) => counts[index] + ' ' + sayText(option, language)).join(' · ');
  return '<tr><td>' + escapeHtml(sayText(label, language)) + '</td><td class="squares">' + squares + '</td><td class="number">' + escapeHtml(written) + '</td></tr>';
}

function peopleChart(answers, language) {
  const say = (text) => escapeHtml(sayText(text, language));
  const total = answers.H7?.respondentCount || 0;
  if (!total) return '';
  const worry = [['Yes', 'yes'], ['Maybe', 'maybe'], ['No', 'no']];
  const concerns = [
    squareRow('Privacy', answers.H8, worry, language),
    squareRow('Fear for their job', answers.H9, worry, language),
    squareRow('Sharing devices', answers.H10, worry, language),
    squareRow('Using it feels', answers.FR4d, [['Mandatory', 'yes'], ['Unsure', 'maybe'], ['Voluntary', 'no']], language)
  ].join('');
  const readiness = [
    barRow(sayText('Openness to new tech', language), answers.FR4a?.answerValue || 0, 10, decimalText(answers.FR4a?.answerValue || 0, language) + ' / 10', undefined, undefined, language),
    barRow(sayText('Experience with new tech', language), answers.FR4b?.answerValue || 0, 10, decimalText(answers.FR4b?.answerValue || 0, language) + ' / 10', undefined, undefined, language)
  ].join('');
  return '<p class="key-title">' + say('Worries') + '</p><div class="chart"><table><tbody>' + concerns + '</tbody></table></div>'
    + '<p class="key-title">' + say('Readiness') + '</p><div class="chart"><table><tbody>' + readiness + '</tbody></table></div>'
    + '<p class="note">' + say('One square per person who answered') + ' (' + total + ').</p>';
}

function layerCard(section, summary, language) {
  const own = summary.ruleResults.filter((result) => section.layers.includes(result.layerNumber));
  const counts = ruleCounts(own);
  const points = own.filter((result) => result.ruleState === 'fired');
  const charts = (section.layers.includes(1) ? fitChart(summary.answerMap, language) : '') + (section.layers.includes(3) ? peopleChart(summary.answerMap, language) : '');
  const ordered = ['high', 'medium', 'low'].flatMap((level) => points.filter((result) => pointLevel(result) === level));
  const list = ordered.length ? '<ul class="points">' + ordered.map((result) => pointLine(result, language)).join('') + '</ul>' : '<p class="note">' + escapeHtml(sayText('Nothing to look at here.', language)) + '</p>';
  return '<section class="layer"><div class="layer-head"><h2>' + escapeHtml(sayText(section.title, language)) + '</h2>'
    + '<span class="chips">' + chipHtml('Raised', counts.firedCount, 'alert', language) + chipHtml('Cleared', counts.clearCount, 'green', language)
    + (counts.pendingCount ? chipHtml('Skipped', counts.pendingCount, undefined, language) : '') + '</span></div>'
    + '<p class="note">' + escapeHtml(sayText(section.question, language)) + '</p>' + charts + list + '</section>';
}

function pendingSection(summary, language) {
  const groups = pendingGroups(summary.ruleResults);
  const actionable = [...groups.waiting, ...groups.split];
  const permanent = [...groups.notApplicable, ...groups.research];
  if (!actionable.length && !permanent.length) return '';
  function splitText(result) {
    return (result.splitItems || []).map((entry) => {
      const topic = rankTopics[entry.itemCode] || shortQuestion(itemByCode(entry.itemCode));
      const detail = entry.splitDetail === 'tie for first place' ? 'the answers are tied' : entry.splitDetail;
      return 'No majority answer on “' + topic + '”: ' + detail;
    }).join('. ');
  }
  function skippedLine(result) {
    const kind = pendingKind(result);
    const topic = skippedTopic(result.ruleId, language);
    const what = kind === 'research' || kind === 'notApplicable'
      ? sayText('Could not check', language) + (topic ? ': ' + topic : '')
      : (kind === 'split' ? splitText(result) : waitingText(result.stateReason, language));
    return '<li>' + escapeHtml(what) + '<span class="ref">' + escapeHtml(sayText(pendingBadges[kind], language)) + '</span></li>';
  }
  // Two checks can share one plain topic (RB4-11 and RB4-12 both read "the position to take with
  // partners"), which printed the same line twice. A reader cannot act on the difference, so show it once.
  function shownLines(results) {
    return [...new Set(results.map(skippedLine))];
  }
  function listOf(lines) {
    return '<ul class="points">' + lines.join('') + '</ul>';
  }
  const say = (text) => escapeHtml(sayText(text, language));
  const firstLines = shownLines(actionable);
  const secondLines = shownLines(permanent);
  const first = firstLines.length ? '<p class="sub">' + say('You can still close these') + ' · ' + firstLines.length + '</p>' + listOf(firstLines) : '';
  const second = secondLines.length ? '<p class="sub">' + say('Nothing is missing on your side') + ' · ' + secondLines.length + '</p>' + listOf(secondLines) : '';
  const research = '<p class="note">' + say('Some parts of the model are still being researched, so these checks have no rule yet. They are missing from the research, not from your answers.') + '</p>';
  return '<section class="layer"><details><summary>' + say('Checks that could not be run') + ' · ' + (firstLines.length + secondLines.length) + '</summary>'
    + first + second + research + '</details></section>';
}

function savedSummary(rows, deploymentId, language, fingerprint) {
  const own = (rows || []).filter((row) => row?.deploymentId === deploymentId);
  const latest = newestFirst(own.filter((row) => row.formName === 'summary'))[0];
  if (!latest) return null;
  const stored = jsonValue(latest.submissionAnswers);
  const summaryText = pageLanguage(language) === 'de'
    ? textValue(stored.summaryTextDe) || textValue(stored.summaryText)
    : textValue(stored.summaryText);
  if (!summaryText) return null;
  // No fingerprint means a summary written before this change: treat it as outdated rather than
  // claim it still matches the answers.
  const outdated = textValue(stored.fingerprint) !== textValue(fingerprint);
  const germanMissing = pageLanguage(language) === 'de' && !textValue(stored.summaryTextDe);
  return { summaryText, outdated: outdated || germanMissing };
}

// Written once and stored, so later readers never wait on the model, and the page works without it.
function summaryBlock(summary, saved, language) {
  const missing = [['adopter', 'Adopters'], ['developer', 'Developers'], ['integrator', 'Integrators']]
    .filter(([formName]) => !summary.roleSubmissions[formName].length).map(([, name]) => name);
  if (saved) {
    const stale = saved.outdated
      ? '<p class="note">' + escapeHtml(sayText('New answers have arrived since this summary was written.', language)) + '</p>'
      : '';
    return '<section class="plain-summary"><p class="key-title">' + escapeHtml(sayText('Summary', language)) + '</p>' + stale + '<p class="written">' + escapeHtml(saved.summaryText) + '</p>'
      + '<p class="note">' + escapeHtml(sayText('Written by AI from the points below.', language))
      + ' ' + escapeHtml(sayText('Read the list to check it.', language))
      + ' <button class="secondary" type="button" data-summary>' + escapeHtml(sayText('Write it again', language)) + '</button></p></section>';
  }
  if (missing.length) {
    return '<section class="plain-summary"><p class="note">A plain-English summary can be written once all three forms have an answer. Waiting for: '
      + escapeHtml(missing.join(', ')) + '.</p><button class="primary" type="button" disabled>Summarise in plain English</button></section>';
  }
  return '<section class="plain-summary"><button class="primary" type="button" data-summary>' + escapeHtml(sayText('Summarise in plain English', language)) + '</button>'
    + '<p class="note">' + escapeHtml(sayText('Written once and kept, so everyone sees the same summary.', language)) + '</p></section>';
}

function writtenComments(summary, language) {
  const written = [];
  for (const formName of ['adopter', 'developer', 'integrator']) {
    for (const answers of summary.roleSubmissions[formName] || []) {
      const text = textValue(answers.ownWords);
      if (text) written.push({ question: sayText('In their own words', language), text, roleName: sayText(roles[formName], language) });
    }
  }
  for (const item of items) {
    if (!item.note && item.type !== 'text') continue;
    const key = item.type === 'text' ? item.code : item.code + 'Note';
    for (const answers of summary.roleSubmissions[item.form] || []) {
      const text = textValue(answers[key]);
      if (text) written.push({ question: shortQuestion(item, language), text, roleName: sayText(roles[item.form], language) });
    }
  }
  return written;
}

function commentSection(summary, language) {
  const comments = writtenComments(summary, language).map((entry) => '<li>“' + escapeHtml(entry.question) + '”: ' + escapeHtml(entry.text)
    + '<span class="ref">' + escapeHtml(entry.roleName) + '</span></li>');
  if (!comments.length) return '';
  return '<section class="layer"><div class="layer-head"><h2>' + escapeHtml(sayText('Comments', language)) + '</h2>'
    + '<span class="chips">' + chipHtml('Comments', comments.length, undefined, language) + '</span></div>'
    + '<p class="note">' + escapeHtml(sayText('What people wrote in their own words.', language)) + '</p>'
    + '<ul class="points">' + comments.join('') + '</ul></section>';
}

function reportPage(organisation, deployment, rows, styles, options) {
  const language = pageLanguage(options?.language);
  const say = (text) => escapeHtml(sayText(text, language));
  const summary = deploymentSummary(deployment, rows);
  const counts = summary.resultCounts;
  const people = chipHtml('Adopters', summary.roleSubmissions.adopter.length, undefined, language)
    + chipHtml('Developers', summary.roleSubmissions.developer.length, undefined, language)
    + chipHtml('Integrators', summary.roleSubmissions.integrator.length, undefined, language);
  const checks = chipHtml('Raised', counts.firedCount, 'alert', language) + chipHtml('Cleared', counts.clearCount, 'green', language)
    + chipHtml('Skipped', counts.pendingCount, undefined, language);
  const setup = escapeHtml(setupText(deployment.technology, deployment.rollout, language)).split('. ').filter(Boolean).map((line) => line.replace(/\.$/, '') + '.').join('<br>');
  const description = textValue(deployment.taskDescription);
  const body = '<div class="head"><h1>' + escapeHtml(deployment.taskName) + '</h1>'
    + languageSwitch(reportLink(organisation, deployment), language)
    + (description ? '<p class="note">' + escapeHtml(description) + '</p>' : '')
    + '<p><strong>' + escapeHtml(organisation.organisationName) + '</strong><br>' + setup + '</p></div>'
    + '<div class="chip-line"><span class="chip-label">' + say('Answers') + '</span><span class="chips">' + people + '</span></div>'
    + '<div class="chip-line"><span class="chip-label">' + say('Results') + '</span><span class="chips">' + checks + '</span></div>'
    + '<div class="key"><p class="key-title">' + say('Legend') + '</p>'
    + '<p><span class="dot high"></span><b>' + say('Blockers') + '</b> ' + say('fix this first')
    + '<span class="dot medium"></span><b>' + say('Warnings') + '</b> ' + say('check this soon')
    + '<span class="dot"></span><b>' + say('Notes') + '</b> ' + say('read this next') + '</p>'
    + '<p><span class="box alert"></span><b>' + say('Raised') + '</b> ' + say('found something')
    + '<span class="box green"></span><b>' + say('Cleared') + '</b> ' + say('found nothing')
    + '<span class="box"></span><b>' + say('Skipped') + '</b> ' + say('could not run') + '</p>'
    + '<p>' + say('The name on the right of each line is who should act on it.') + '</p></div>'
    + summaryBlock(summary, savedSummary(rows, deployment.deploymentId, language, summaryFingerprint(summaryMessage(summary).messageText)), language)
    + reportSections.map((section) => layerCard(section, summary, language)).join('')
    + commentSection(summary, language) + pendingSection(summary, language);
  const attributes = 'data-report data-organisation="' + escapeHtml(organisation.organisationSlug) + '" data-key="' + escapeHtml(organisation.accessKey)
    + '" data-deployment="' + escapeHtml(deployment.deploymentId) + '" data-language="' + escapeHtml(language) + '"';
  return pageDocument(sayText('XR report', language) + ' · ' + textValue(deployment.taskName), body, styles, attributes, language);
}

// Only the raised points and what people wrote reach the model: never a scored answer, never a name.
function summaryFingerprint(messageText) {
  const text = textValue(messageText);
  let hash = 5381;
  for (let index = 0; index < text.length; index++) hash = ((hash * 33) ^ text.charCodeAt(index)) >>> 0;
  return hash.toString(36);
}

function summaryMessage(summary, language) {
  const points = summary.ruleResults.filter((result) => result.ruleState === 'fired');
  if (!points.length) return { empty: true, reason: 'No points were raised, so there is nothing to summarise.' };
  const ordered = layerNames.flatMap(([layerNumber, title]) => ['high', 'medium', 'low']
    .flatMap((level) => points.filter((result) => result.layerNumber === layerNumber && pointLevel(result) === level))
    .map((result) => '- (' + sayText(title, language) + ', ' + sayText('acts', language) + ': '
      + sayText(actionHeadings[result.roleName] || result.roleName, language) + ') '
      + plainHeadline(result.ruleId, result.flagText, language)));
  const written = writtenComments(summary, language).map((entry) => '- (' + entry.roleName + ') “' + entry.question + '”: ' + entry.text);
  const parts = [sayText('Points raised for this task, most urgent first within each group:', language) + '\n' + ordered.join('\n')];
  if (written.length) parts.push(sayText('What people wrote in their own words. Treat these as facts too:', language) + '\n' + written.join('\n'));
  return { empty: false, messageText: parts.join('\n\n') };
}
