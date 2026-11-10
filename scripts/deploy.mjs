import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { apiRequest, webhookRequest } from './api.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const everything = ['seed', 'creation', 'adopter', 'developer', 'integrator', 'pages', 'narrative'];
const requested = process.argv.slice(2);
const order = requested.length ? everything.filter((name) => requested.includes(name)) : everything;
const credentials = JSON.parse(readFileSync(join(root, 'configuration/credentials.json'), 'utf8'));

function readWorkflow(name) {
  return JSON.parse(readFileSync(join(root, 'workflows', name + '.json'), 'utf8'));
}

function emptyTables(workflow) {
  return workflow.nodes.filter((node) => node.type === 'n8n-nodes-base.dataTable' && !node.parameters.dataTableId?.value).map((node) => node.name);
}

async function existingWorkflows() {
  const found = new Map();
  let cursor = '';
  for (let page = 0; page < 20; page++) {
    const listed = await apiRequest('GET', '/workflows?limit=250' + (cursor ? '&cursor=' + encodeURIComponent(cursor) : ''));
    if (listed.empty) return { empty: true, reason: listed.reason };
    for (const workflow of listed.payload.data) found.set(workflow.name, workflow.id);
    cursor = listed.payload.nextCursor || '';
    if (!cursor) break;
  }
  return { empty: false, workflows: found };
}

// Create or update by name, so redeploying never duplicates a workflow.
async function publishWorkflow(workflow, known) {
  const body = { name: workflow.name, nodes: workflow.nodes, connections: workflow.connections, settings: workflow.settings };
  const id = known.get(workflow.name);
  const saved = id ? await apiRequest('PUT', '/workflows/' + id, body) : await apiRequest('POST', '/workflows', body);
  if (saved.empty) return saved;
  const mismatches = credentialMismatches(saved.payload);
  if (mismatches.length) return { empty: true, reason: 'left inactive — wrong credential binding: ' + mismatches.join('; ') };
  const activated = await apiRequest('POST', '/workflows/' + saved.payload.id + '/activate');
  if (activated.empty) return activated;
  return { empty: false, id: saved.payload.id, action: id ? 'updated' : 'created' };
}

// n8n silently rebinds a credential it cannot match by ID to a different one (probe, 19 Sep): check the stored binding.
function credentialMismatches(saved) {
  const expected = Object.fromEntries(Object.values(credentials).map((credential) => [credential.name, credential.id]));
  return (saved.nodes || []).flatMap((node) => Object.values(node.credentials || {})
    .filter((credential) => expected[credential.name] !== credential.id || !credential.id)
    .map((credential) => node.name + ' is bound to "' + credential.name + '" (' + credential.id + ')'));
}

const missingCredentials = order.flatMap((name) => readWorkflow(name).nodes
  .flatMap((node) => Object.values(node.credentials || {}))
  .filter((credential) => !credential.id)
  .map((credential) => name + ' needs "' + credential.name + '"'));
if (missingCredentials.length) {
  console.log('Not deploying — credential IDs missing in configuration/credentials.json:\n  ' + missingCredentials.join('\n  '));
  process.exit(1);
}
const blocked = order.flatMap((name) => emptyTables(readWorkflow(name)).map((node) => name + ' / ' + node));
if (blocked.length) {
  console.log('Not deploying — table IDs missing in configuration/tables.json (then rebuild):\n  ' + blocked.join('\n  '));
  process.exit(1);
}
const listed = await existingWorkflows();
if (listed.empty) {
  console.log('Could not list workflows: ' + listed.reason);
  process.exit(1);
}
for (const name of order) {
  const workflow = readWorkflow(name);
  const published = await publishWorkflow(workflow, listed.workflows);
  console.log(workflow.name.padEnd(34), published.empty ? 'FAILED ' + published.reason : published.action + ' + active (' + published.id + ')');
  if (published.empty || name !== 'seed') continue;
  const seeded = await webhookRequest('xr-dia-seed-evaluation');
  console.log('  seed →', seeded.status, seeded.text.slice(0, 160));
  const deactivated = await apiRequest('POST', '/workflows/' + published.id + '/deactivate');
  console.log('  seed workflow deactivated:', !deactivated.empty);
}
