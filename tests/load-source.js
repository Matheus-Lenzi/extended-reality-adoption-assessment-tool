const fs = require('node:fs');
const path = require('node:path');

const files = ['values', 'language', 'items', 'average', 'fit', 'prefill', 'rules', 'evaluation', 'pages', 'render', 'plain', 'report'];
const names = ['averageAnswers', 'fitScores', 'baselineScore', 'wholeNumber', 'configurationCode', 'averagedAnswers',
  'evaluateRules', 'ruleCounts', 'items', 'rules', 'plainQuestion', 'sayText', 'pageLanguage', 'otherLanguage', 'sourceOption', 'decimalText', 'countedText', 'languageSwitch', 'formLink',
  'pageFields', 'submissionAnswers', 'formItems', 'fieldLabel', 'noteLabel', 'rankLabel',
  'teamPage', 'companyPage', 'reportPage', 'errorPage', 'deploymentSummary', 'narrativeText', 'narrativeTexts', 'summaryFingerprint', 'summaryMessage', 'plainHeadline', 'savedSummary', 'pendingGroups'];

// Evaluates the source files exactly as the build pastes them into Code nodes, so the tests prove the shipped code.
function loadSource() {
  const source = files.map((name) => fs.readFileSync(path.join(__dirname, '..', 'source', name + '.js'), 'utf8')).join('\n');
  return new Function(source + '\nreturn { ' + names.join(', ') + ' };')();
}

// The real evaluation scores are not published, so fall back to the example data. Every test that
// uses this computes its expectation from whatever is loaded, so both datasets pass.
function referenceData() {
  const folder = path.join(__dirname, '..', 'data');
  const pick = (name) => {
    const real = path.join(folder, name + '.csv');
    return csvRows(fs.existsSync(real) ? real : path.join(folder, name + '.example.csv'));
  };
  return { devices: pick('evaluation-devices'), platforms: pick('evaluation-platforms') };
}

function csvRows(file) {
  const [header, ...lines] = fs.readFileSync(file, 'utf8').trim().split('\n');
  const columns = header.split(',');
  return lines.map((line) => Object.fromEntries(line.split(',').map((cell, index) => [columns[index], cell])));
}

module.exports = { loadSource, referenceData };
