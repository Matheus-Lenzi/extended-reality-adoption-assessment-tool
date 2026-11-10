const roles = { adopter: 'Adopter', developer: 'Developer', integrator: 'Integrator' };

function configurationCode(technology, rollout) {
  if (technology === 'Our company') return 'A';
  if (technology !== 'External supplier') return null;
  return { 'Our company': 'B2', 'Same supplier': 'B1', 'Another company': 'C' }[rollout] ?? null;
}

// The averaged answer of the role that owns a question is what the rules test.
function averagedAnswers(submissions) {
  const averaged = {};
  for (const item of items) {
    const answers = (submissions?.[item.form] || []).map((submission) => submission?.[item.code]);
    averaged[item.code] = { ...averageAnswers(item.type, answers), roleName: roles[item.form] };
  }
  return averaged;
}

function evaluateRules(averaged, configuration) {
  return rules.map((rule) => ruleResult(rule, averaged || {}, configuration));
}

// Order matters: a rule that does not apply is never reported as waiting, and a rule the workbook
// leaves undefined is never reported as waiting either.
function ruleResult(rule, averaged, configuration) {
  const base = { ruleId: rule.id, layerNumber: rule.layer, roleName: rule.role };
  if (rule.external && configuration === 'A') return { ...base, ruleState: 'notEvaluated', stateReason: 'Not applicable. One organisation holds all three roles' };
  if (rule.blocked) return { ...base, ruleState: 'notEvaluated', stateReason: rule.blocked };
  const waiting = waitingRoles(rule, averaged);
  if (waiting.length) return { ...base, ruleState: 'notEvaluated', stateReason: 'Waiting on ' + waiting.join(' and ') };
  const split = splitAnswers(rule, averaged);
  if (split.length) {
    return { ...base, ruleState: 'notEvaluated', stateReason: 'No conclusion. Respondents split: ' + split.join(', '),
      splitItems: (rule.inputs || []).filter((code) => averaged[code]?.answerState === 'noConclusion')
        .map((code) => ({ itemCode: code, splitDetail: splitText(averaged[code]) })) };
  }
  function answerValue(code) {
    return averaged[code]?.answerValue ?? null;
  }
  function optionCount(code, option) {
    return averaged[code]?.optionCounts?.[option] ?? 0;
  }
  const outcome = rule.test(answerValue, optionCount);
  if (outcome === undefined) return { ...base, ruleState: 'notEvaluated', stateReason: rule.undecided };
  if (!outcome) return { ...base, ruleState: 'clear' };
  return { ...base, ruleState: 'fired', flagText: flagText(rule, averaged) };
}

function waitingRoles(rule, averaged) {
  const codes = [...(rule.inputs || []), ...(rule.counted || [])];
  const missing = codes.filter((code) => (averaged[code]?.answerState ?? 'noAnswer') === 'noAnswer');
  return [...new Set(missing.map((code) => averaged[code]?.roleName ?? code))];
}

function splitAnswers(rule, averaged) {
  return (rule.inputs || [])
    .filter((code) => averaged[code]?.answerState === 'noConclusion')
    .map((code) => code + ' ' + splitText(averaged[code]));
}

function splitText(answer) {
  const ranks = answer.answerValue?.meanRanks;
  if (ranks) return 'tie for first place';
  return Object.entries(answer.optionCounts).map(([option, count]) => count + ' ' + option).join(', ');
}

function flagText(rule, averaged) {
  const tally = rule.tally ? averaged[rule.tally[0]] : null;
  const text = tally ? rule.text.replace('N of M', (tally.optionCounts[rule.tally[1]] ?? 0) + ' of ' + tally.respondentCount) : rule.text;
  if (rule.id !== 'RB-A1') return text;
  const blockers = dimensions
    .filter(([need, ready]) => averaged[need].answerValue >= 7 && averaged[ready].answerValue <= 3)
    .map(([, , name]) => name);
  return text.replace('[Dimension]', blockers.join(' and '));
}

function ruleCounts(results) {
  const list = Array.isArray(results) ? results : [];
  const fired = list.filter((result) => result.ruleState === 'fired').length;
  const clear = list.filter((result) => result.ruleState === 'clear').length;
  return { firedCount: fired, clearCount: clear, evaluatedCount: fired + clear, pendingCount: list.length - fired - clear, totalCount: list.length };
}

// Questions are long; a reader needs the gist, not the whole item.
function shortQuestion(item, language) {
  const question = plainQuestion(item, language)
    .replace(/\s*\(.*$/, '').replace(/\s*--.*$/, '').replace(/\?$/, '').trim();
  if (question.length <= 72) return question;
  const cut = question.slice(0, 72);
  return cut.slice(0, cut.lastIndexOf(' ')) + '…';
}

function itemByCode(code) {
  return items.find((entry) => entry.code === code) || null;
}
