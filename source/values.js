function numberValue(input) {
  if (input === null || input === undefined || input === '') return null;
  const number = typeof input === 'number' ? input : Number(String(input).trim());
  return Number.isFinite(number) ? number : null;
}

function textValue(input) {
  if (input === null || input === undefined) return '';
  return String(input).trim();
}

function escapeHtml(input) {
  return textValue(input).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}
