const dimensions = [
  ['D1', 'T_D1', 'Danger'], ['D2', 'T_D2', 'Distraction'], ['I1', 'T_I1', 'Auditory'], ['I2', 'T_I2', 'Visual'],
  ['I3', 'T_I3', 'Haptic'], ['V1', 'T_V1', 'Actions'], ['V2', 'T_V2', 'Knowledge'], ['E1', 'T_E1', 'Expertise']
];

// Score_i = (R_i x T_i) / 10 (Kosoris 2025). TTF_TOTAL is equal-weighted, 1/8 each, as the workbook
// states, until a weighting is defined; no verdict, because the workbook defines no thresholds.
function fitScores(averaged) {
  const answers = averaged || {};
  const missing = dimensions.flatMap(([need, ready]) => [need, ready]).filter((code) => answers[code]?.answerState !== 'answered');
  if (missing.length) return { empty: true, reason: 'TTF_TOTAL needs every relevance and readiness answer. Missing: ' + missing.join(', ') };
  const rows = dimensions.map(([need, ready, name]) => ({
    dimensionName: name,
    relevanceScore: answers[need].answerValue,
    readinessScore: answers[ready].answerValue,
    componentScore: (answers[need].answerValue * answers[ready].answerValue) / 10
  }));
  const total = rows.reduce((sum, row) => sum + row.componentScore, 0) / rows.length;
  return { empty: false, componentRows: rows, totalScore: total };
}
