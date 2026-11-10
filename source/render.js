// Builds the dashboard and report pages from data-table rows. Pages are whole HTML documents served by
// a Webhook. Names are never read from submissions, so no page can show who answered what.
// Replaced by scripts/build.mjs with the host in configuration/instance.json.
const siteHost = 'https://your-n8n-host.example';
const roleColumns = [['adopter', 'Adopters', 'xr-dia-adopter'], ['developer', 'Developers', 'xr-dia-developer'], ['integrator', 'Integrators', 'xr-dia-integrator']];
const actionRoles = ['Adopter', 'Adopter → Integrator', 'Developer', 'Integrator → Developer', 'Integrator'];
const layerHeadings = [
  [1, 'Layer 1 · Task and technology', 'Adopter ↔ Developer'],
  [2, 'Layer 2 · Organisation', 'Integrator'],
  [3, 'Layer 3 · Human acceptance', 'Integrator ↔ Adopter'],
  [4, 'Layer 4 · Ecosystem', 'Across organisations']
];
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const linkIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
const pageScript = [
  "const toast = document.getElementById('toast');",
  'function showToast(message) { toast.textContent = message; toast.hidden = false; clearTimeout(showToast.timer); showToast.timer = setTimeout(() => { toast.hidden = true; }, 3200); }',
  'function summaryHtml(text) {',
  "  const section = document.createElement('section');",
  "  section.className = 'plain-summary';",
  "  const german = document.querySelector('[data-report]')?.dataset.language === 'de';",
  "  const title = german ? 'Zusammenfassung' : 'Summary';",
  "  const note = german ? 'Von einer KI aus den Punkten unten geschrieben. Lesen Sie die Liste zur Kontrolle.' : 'Written by AI from the points below. Read the list to check it.';",
  "  const again = german ? 'Neu schreiben' : 'Write it again';",
  "  section.innerHTML = '<h2></h2><p class=\"written\"></p><p class=\"note\"><span class=\"said\"></span> <button class=\"secondary\" type=\"button\" data-summary></button></p>';",
  "  section.querySelector('h2').textContent = title;",
  "  section.querySelector('.said').textContent = note;",
  "  section.querySelector('[data-summary]').textContent = again;",
  "  section.querySelector('.written').textContent = text;",
  '  return section;',
  '}',
  "document.addEventListener('click', async (event) => {",
  "  const copy = event.target.closest('[data-link]');",
  '  if (copy) {',
  "    const link = copy.getAttribute('data-link');",
  "    const copied = document.documentElement.lang === 'de' ? 'Link kopiert' : 'Link copied';",
  "    try { await navigator.clipboard.writeText(link); showToast(copied); } catch (error) { showToast(link); }",
  '    return;',
  '  }',
  "  const button = event.target.closest('[data-summary]');",
  '  if (!button) return;',
  "  const report = document.querySelector('[data-report]');",
  "  const section = button.closest('.plain-summary');",
  "  const label = button.textContent;",
  "  const writing = document.querySelector('[data-report]')?.dataset.language === 'de' ? 'Wird geschrieben\u2026' : 'Writing\u2026';",
  "  button.disabled = true; button.textContent = writing;",
  '  try {',
  "    const response = await fetch('/webhook/xr-dia-narrative', { method: 'POST', headers: { 'Content-Type': 'application/json' },",
  '      body: JSON.stringify({ organisation: report.dataset.organisation, key: report.dataset.key, deployment: report.dataset.deployment, language: report.dataset.language }) });',
  '    const body = await response.json();',
  '    if (!body.summary) throw new Error(body.reason || \'The summary could not be written.\');',
  '    section.replaceWith(summaryHtml(body.summary));',
  '  } catch (error) {',
  "    showToast(error.message || 'The summary could not be written. Try again.');",
  '    button.disabled = false; button.textContent = label;',
  '  }',
  '});'
].join('\n');

function queryText(values) {
  return Object.entries(values).map(([name, value]) => encodeURIComponent(name) + '=' + encodeURIComponent(textValue(value))).join('&');
}

function companyLink(organisation) {
  return siteHost + '/webhook/xr-dia-company?' + queryText({ organisation: organisation.organisationSlug, key: organisation.accessKey });
}

function reportLink(organisation, deployment) {
  return siteHost + '/webhook/xr-dia-report?' + queryText({ organisation: organisation.organisationSlug, key: organisation.accessKey, deployment: deployment.deploymentId });
}

function formLink(path, deployment, language) {
  const values = pageLanguage(language) === 'de'
    ? { deployment: deployment.deploymentId, language: 'de' }
    : { deployment: deployment.deploymentId };
  return siteHost + '/form/' + path + '?' + queryText(values);
}

// Our own pages are served whole, so the switch is a plain link that reloads in the other language.
// No JavaScript, which matters because n8n strips it from forms and we keep one pattern.
function languageSwitch(baseUrl, language) {
  const buttons = languages.map((code) => {
    const url = textValue(baseUrl) + '&language=' + code;
    const here = code === pageLanguage(language);
    return '<a class="lang' + (here ? ' here' : '') + '" href="' + escapeHtml(url) + '"'
      + (here ? ' aria-current="true"' : '') + '>' + escapeHtml(languageNames[code]) + '</a>';
  }).join('');
  return '<p class="langs">' + buttons + '</p>';
}

function creationLink(organisation, language) {
  const values = { organisation: organisation.organisationSlug, key: organisation.accessKey };
  return siteHost + '/form/xr-dia-new-deployment?' + queryText(pageLanguage(language) === 'de' ? { ...values, language: 'de' } : values);
}

function dateLabel(value, language) {
  const date = new Date(textValue(value));
  if (Number.isNaN(date.getTime())) return '';
  if (pageLanguage(language) === 'de') {
    const padded = (number) => String(number).padStart(2, '0');
    return padded(date.getUTCDate()) + '.' + padded(date.getUTCMonth() + 1) + '.' + date.getUTCFullYear();
  }
  return date.getUTCDate() + ' ' + monthNames[date.getUTCMonth()] + ' ' + date.getUTCFullYear();
}

function newestFirst(rows) {
  return [...(rows || [])].sort((left, right) => textValue(right.createdAt).localeCompare(textValue(left.createdAt)));
}

// The caption is the language code, so a person handing out links can see which one they are copying
// without hovering. Without a caption the button keeps the chain icon it has always had.
function copyButton(link, label, caption) {
  return '<button class="icon-button" type="button" data-link="' + escapeHtml(link) + '" aria-label="' + escapeHtml(label) + '" title="' + escapeHtml(label) + '">'
    + (caption ? escapeHtml(caption) : linkIcon) + '</button>';
}

// textValue trims, so the attributes are spaced here: '<main' + ' data-report…' once produced <maindata-report>,
// which killed the narrative button and the page's own layout (found on the live report, 25 Sep).
function pageDocument(title, body, styles, attributes, language) {
  const extra = textValue(attributes);
  return '<!doctype html><html lang="' + pageLanguage(language) + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
    + '<title>' + escapeHtml(title) + '</title>'
    + '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500&family=IBM+Plex+Sans:wght@400;500;600&display=swap">'
    + '<style>' + textValue(styles) + '</style></head><body><main' + (extra ? ' ' + extra : '') + '>' + body + '</main>'
    + '<div class="toast" id="toast" role="status" aria-live="polite" hidden></div><script>' + pageScript + '</script></body></html>';
}

function errorPage(styles) {
  return pageDocument("This link isn't valid", '<div class="head"><h1>This link isn’t valid</h1></div><p class="note">Ask whoever sent it to you for a new link.</p>', styles);
}

function roleSubmissions(rows) {
  const groups = { adopter: [], developer: [], integrator: [] };
  for (const row of rows || []) {
    if (!groups[row?.formName]) continue;
    groups[row.formName].push(jsonValue(row.submissionAnswers));
  }
  return groups;
}

function deploymentSummary(deployment, rows) {
  const own = (rows || []).filter((row) => row?.deploymentId === deployment?.deploymentId);
  const submissions = roleSubmissions(own);
  const answers = averagedAnswers(submissions);
  const setup = configurationCode(deployment?.technology, deployment?.rollout);
  const results = evaluateRules(answers, setup);
  return { roleSubmissions: submissions, answerMap: answers, setupCode: setup, ruleResults: results, resultCounts: ruleCounts(results) };
}

function deploymentRow(organisation, deployment, rows, language) {
  const summary = deploymentSummary(deployment, rows);
  const roles = roleColumns.map(([formName, heading, path]) => {
    const count = summary.roleSubmissions[formName].length;
    const role = heading.toLowerCase().replace(/s$/, '');
    const buttons = languages.map((code) => copyButton(formLink(path, deployment, code),
      sayText('Copy the link for', language) + ' ' + sayText(heading, language) + ' ' + sayText('in', language) + ' ' + languageNames[code], languageNames[code].slice(0, 2).toUpperCase())).join('');
    return '<td><span class="role"><b class="' + (count ? '' : 'zero') + '">' + count + '</b>' + buttons + '</span></td>';
  }).join('');
  const counts = summary.resultCounts;
  return '<tr><td class="task">' + escapeHtml(deployment.taskName) + '<small>' + escapeHtml(sayText('created', language)) + ' ' + dateLabel(deployment.createdAt, language) + '</small></td>' + roles
    + '<td><div class="report-cell"><a href="' + escapeHtml(reportLink(organisation, deployment)) + '&language=' + language + '">' + escapeHtml(sayText('Report', language)) + '</a>'
    + '<span>' + escapeHtml(sayText('Raised', language)) + ' <b>' + counts.firedCount + '</b> · ' + escapeHtml(sayText('Cleared', language)) + ' <b>' + counts.clearCount + '</b> · ' + escapeHtml(sayText('Skipped', language)) + ' <b>' + counts.pendingCount + '</b></span></div></td></tr>';
}

function deploymentTable(bodyRows, language) {
  const headings = ['Task', ...roleColumns.map(([, heading]) => heading), 'Report'].map((heading) => '<th scope="col">' + escapeHtml(sayText(heading, language)) + '</th>').join('');
  return '<div class="table-wrap dash"><table><thead><tr>' + headings + '</tr></thead><tbody>' + bodyRows + '</tbody></table></div>';
}

function teamPage(organisations, deployments, rows, styles) {
  const groups = newestFirst(organisations).map((organisation) => {
    const own = newestFirst(deployments).filter((deployment) => deployment.organisationSlug === organisation.organisationSlug);
    const link = companyLink(organisation);
    const heading = '<tr class="group"><td colspan="5"><div class="group-line"><strong>' + escapeHtml(organisation.organisationName) + '</strong>'
      + '<span class="count">' + own.length + (own.length === 1 ? ' deployment' : ' deployments') + '</span>'
      + '<span class="copybox"><code>private company link</code>' + copyButton(link, 'Copy ' + textValue(organisation.organisationName) + '’s private link') + '</span></div></td></tr>';
    const body = own.length
      ? own.map((deployment) => deploymentRow(organisation, deployment, rows)).join('')
      : '<tr class="empty"><td colspan="5">No deployments yet. They are created from the company’s private page.</td></tr>';
    return heading + body;
  }).join('');
  const empty = '<tr class="empty"><td colspan="5">No organisations yet.</td></tr>';
  const body = '<div class="head"><h1>Deployments</h1><p>All organisations · newest first</p></div>'
    + '<div class="panel"><form class="create" method="post"><label><span class="label">New organisation</span>'
    + '<input type="text" name="organisationName" placeholder="Company name" required autocomplete="off"></label>'
    + '<button class="primary" type="submit">Create organisation</button></form>'
    + deploymentTable(groups || empty) + '</div>';
  return pageDocument('XR DIA · Deployments', body, styles);
}

function companyPage(organisation, deployments, rows, styles, options) {
  const language = pageLanguage(options?.language);
  const say = (text) => escapeHtml(sayText(text, language));
  const own = newestFirst(deployments).filter((deployment) => deployment.organisationSlug === organisation.organisationSlug);
  const body = own.length
    ? own.map((deployment) => deploymentRow(organisation, deployment, rows, language)).join('')
    : '<tr class="empty"><td colspan="5">' + say('No deployments yet. Start one with New deployment.') + '</td></tr>';
  const page = '<div class="head"><h1>' + escapeHtml(organisation.organisationName) + '</h1>'
    + languageSwitch(companyLink(organisation), language)
    + '<p>' + say('Your deployments · newest first') + '</p></div>'
    + '<div class="panel"><div><a class="primary" href="' + escapeHtml(creationLink(organisation, language)) + '">' + say('New deployment') + '</a></div>'
    + '<p class="note">' + say('Each deployment has three links, one each for Adopters, Developers and Integrators. Copy one and send it to the people who should answer. Several people can answer each.')
    + ' ' + say('Each role has an EN and a DE link. Send the one in the language that person reads.') + '</p>'
    + deploymentTable(body, language) + '</div>';
  return pageDocument('XR DIA · ' + textValue(organisation.organisationName), page, styles, undefined, language);
}

// Models sometimes wrap their JSON in a code fence or add a sentence around it: take the outermost object.
// One call writes the English summary and translates its own text, so the two can never state different
// facts (German review, 22 Oct: separately generated summaries dropped every role attribution).
function narrativeTexts(raw) {
  const text = textValue(raw);
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) return { en: '', de: '' };
  const parsed = jsonValue(text.slice(start, end + 1));
  return { en: cleanNarrative(parsed.narrative), de: cleanNarrative(parsed.narrativeDe) };
}

function narrativeText(raw) {
  return narrativeTexts(raw).en;
}

function cleanNarrative(raw) {
  const text = textValue(raw);
  // The prompt forbids a semicolon and an em dash, and a model still produced both (German run,
  // 22 Oct). A rule the reader must not see broken is enforced here, not left to the model.
  return text
    .replace(/\s*;\s*(.)/g, (whole, next) => '. ' + next.toUpperCase())
    .replace(/\s*\u2014\s*/g, ', ')
    .replace(/\.\s*\./g, '.');
}
