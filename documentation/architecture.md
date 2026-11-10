# Architecture

The tool runs entirely inside [n8n](https://n8n.io). There is no server of our own, no database and
no build output beyond JSON.

## How the code reaches production

`source/` holds every piece of logic: the questions, the rules, the averaging, the fit score, the
German catalogue and the HTML of the forms and the report. `scripts/build.mjs` pastes
those files verbatim into the Code nodes of seven n8n workflows and writes them to `workflows/`.

The same text therefore runs in the tests and in production. The tests load `source/` with
`new Function`, exactly as n8n evaluates a Code node, so a test proves the shipped code and not a
copy of it.

```
source/ ──► scripts/build.mjs ──► workflows/*.json ──► scripts/deploy.mjs ──► n8n
   │
   └──► tests/load-source.js ──► npm test
```

## The seven workflows

| Workflow | What it serves |
| --- | --- |
| New deployment | Creates one assessment: task, who supplies, who installs, description |
| Adopter / Developer / Integrator form | Two pages each. Page 1 is static, page 2 is generated per deployment |
| Pages | The team page, the company page and the report, served as whole HTML |
| Narrative | Writes the summary, with four model tiers across two providers |
| Seed evaluation data | Loads the hardware and software evaluation once, refuses to run twice |

## Storage

Five n8n Data Tables: organisations, deployments, submissions, and the two evaluation tables. A
submission row holds one person's answers as JSON, keyed by question code. The summary is stored as
a submission row of its own and read by everyone afterwards. Pressing the button again writes a new
row, and the newest one is shown.

## Two languages

One catalogue, one set of workflows. Questions carry their German on the item itself; everything else
looks up its English source string in `source/language.js`. A form's first page is static in n8n, so
it is bilingual, and the language rides on the link as `?language=de`. Answers are always stored in English: a German respondent's `Ja` is mapped back by position in the
question's own option list, so the rules keep testing one vocabulary. Every step that reads a
submitted answer must read it in the language the form rendered, because n8n keys answers by label.

## Running the tests

`npm test` runs the suite without n8n and without the evaluation data. Tests that read the generated
workflows skip until `npm run build` has run, and the pre-fill tests compute their expectation from
whichever evaluation data is present, so they pass with the example files. `scripts/check.py` proves
every question and flag text against the research workbook and takes its path as an argument. That
workbook is not published here.
