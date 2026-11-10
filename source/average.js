function averageAnswers(type, answers) {
  const given = (Array.isArray(answers) ? answers : []).filter((answer) => hasAnswer(type, answer));
  if (!given.length) return { answerState: 'noAnswer', answerValue: null, optionCounts: {}, respondentCount: 0 };
  if (type === 'scale' || type === 'number') return meanAnswer(given);
  if (type === 'yesNo' || type === 'choice') return commonAnswer(given);
  if (type === 'rank') return rankAnswer(given);
  return { answerState: 'answered', answerValue: given.map(textValue), optionCounts: {}, respondentCount: given.length };
}

function hasAnswer(type, answer) {
  if (type === 'scale') return numberValue(answer) !== null && numberValue(answer) >= 0 && numberValue(answer) <= 10;
  if (type === 'number') return numberValue(answer) !== null && numberValue(answer) >= 0;
  if (type === 'rank') return answer !== null && typeof answer === 'object' && !Array.isArray(answer);
  return textValue(answer) !== '';
}

function meanAnswer(given) {
  const numbers = given.map(numberValue);
  const total = numbers.reduce((sum, number) => sum + number, 0);
  return { answerState: 'answered', answerValue: total / numbers.length, optionCounts: {}, respondentCount: numbers.length };
}

// For Yes/No the most common answer is the mean of Yes = 1 / No = 0, which is the agreed "average".
// An exact tie has no most common answer, so it yields no conclusion rather than a rounded one.
function commonAnswer(given) {
  const counts = {};
  for (const answer of given.map(textValue)) counts[answer] = (counts[answer] || 0) + 1;
  const highest = Math.max(...Object.values(counts));
  const leaders = Object.keys(counts).filter((option) => counts[option] === highest);
  const winner = leaders.length === 1 ? leaders[0] : null;
  return { answerState: winner === null ? 'noConclusion' : 'answered', answerValue: winner, optionCounts: counts, respondentCount: given.length };
}

// A blank rank means "not expected" (the question says "leave blank if not expected"),
// so it counts as ranking below every option someone did rank.
function rankAnswer(given) {
  const options = [...new Set(given.flatMap((answer) => Object.keys(answer)))];
  const unranked = options.length + 1;
  const means = {};
  for (const option of options) {
    const ranks = given.map((answer) => numberValue(answer[option]) ?? unranked);
    means[option] = ranks.reduce((sum, rank) => sum + rank, 0) / ranks.length;
  }
  const ranked = given.some((answer) => Object.values(answer).some((rank) => numberValue(rank) !== null));
  if (!ranked) return { answerState: 'answered', answerValue: { firstOption: null, hasRanking: false, meanRanks: means }, optionCounts: {}, respondentCount: given.length };
  const lowest = Math.min(...Object.values(means));
  const leaders = options.filter((option) => means[option] === lowest);
  const first = leaders.length === 1 ? leaders[0] : null;
  return {
    answerState: first === null ? 'noConclusion' : 'answered',
    answerValue: { firstOption: first, hasRanking: true, meanRanks: means },
    optionCounts: {},
    respondentCount: given.length
  };
}
