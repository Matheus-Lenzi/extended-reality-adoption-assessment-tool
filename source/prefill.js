// Which evaluation criteria ground each Evidence Pool item, per the workbook's L1.2 Source column.
// TR8 (audio) and TR9 (haptic) are absent: the evaluation covers neither.
const evidenceMapping = [
  ['TR1', 'device', 'Weight'], ['TR1', 'device', 'Headstrap'], ['TR1', 'device', 'Adjustable Diopter'], ['TR1', 'device', 'Ocularity'],
  ['TR2', 'device', 'Visible FoV'], ['TR2', 'device', 'Rendered FoV'], ['TR2', 'device', 'Binocular Overlap'],
  ['TR3', 'device', 'Resolution'], ['TR3', 'device', 'Average Pixel Density'], ['TR3', 'platform', 'Performance Efficiency'],
  ['TR4', 'device', 'Battery Life'], ['TR4', 'device', 'Charge Time'],
  ['TR5', 'platform', 'Compatibility'], ['TR6', 'platform', 'Functional Suitability'], ['TR7', 'platform', 'Maintainability'],
  ['TR10', 'device', 'Tracking Type'], ['TR10', 'platform', 'Functional Suitability'],
  ['TR11', 'platform', 'Security']
].map(([evidenceItem, source, criterionName]) => ({ evidenceItem, source, criterionName }));

// The average of the mapped 1-5 evaluation scores, mapped onto the 0-10 scale and rounded.
// The conversion is set by the research: the lowest 1-5 score must land on 0, not on 2.
function baselineScore(code, choice, reference) {
  const fields = evidenceMapping.filter((row) => row.evidenceItem === code);
  if (!fields.length) return { empty: true, reason: 'This item wasn\'t evaluated in the study this tool draws on, so there is nothing to pre-fill.' };
  const parts = [];
  for (const field of fields) {
    const score = referenceScore(field, choice || {}, reference);
    if (score === null) return { empty: true, reason: 'The chosen ' + field.source + " wasn't evaluated for " + field.criterionName + ', so there is nothing to pre-fill.' };
    parts.push({ sourceKind: field.source, fieldName: field.criterionName, fieldScore: score });
  }
  const average = parts.reduce((sum, part) => sum + part.fieldScore, 0) / parts.length;
  return { empty: false, baselineParts: parts, averageScore: average, baselineValue: wholeNumber((average - 1) / 4 * 10) };
}

function referenceScore(field, choice, reference) {
  const lookup = {
    device: { rows: reference.devices, name: choice.device, column: 'criterion' },
    platform: { rows: reference.platforms, name: choice.platform, column: 'characteristic' }
  }[field.source];
  if (!lookup) return null;
  const row = (lookup.rows || []).find((entry) => entry[field.source] === lookup.name && entry[lookup.column] === field.criterionName);
  const score = numberValue(row?.score);
  return score !== null && score >= 1 && score <= 5 ? score : null;
}

// Half rounds up (6.5 -> 7). Snapping to 6 decimals first stops a float like 6.4999999999 losing its half.
function wholeNumber(number) {
  return Math.round(Number(number.toFixed(6)));
}
