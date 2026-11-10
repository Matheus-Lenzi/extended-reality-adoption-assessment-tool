const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// n8n strips anything tag-like from Custom Form Styling: one "<style>" in a comment deleted the whole
// stylesheet on the live instance (21 Sep). The form CSS must never contain < or >.
test('the form stylesheet contains no less-than or greater-than sign', () => {
  const css = fs.readFileSync(path.join(__dirname, '..', 'styles', 'form.css'), 'utf8');
  assert.ok(!/[<>]/.test(css));
});

test('the AI prompt forbids the experience type, the semicolon and the em dash', () => {
  const prompt = fs.readFileSync(path.join(__dirname, '..', 'prompts', 'narrative.md'), 'utf8');
  assert.match(prompt, /Never name a type of XR experience/);
  assert.match(prompt, /Never use a semicolon and never use an em dash/);
});
