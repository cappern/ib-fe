#!/usr/bin/env node
/* eslint-disable no-console */
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync, renameSync } from 'fs';
import { join, dirname, sep } from 'path';
import inquirer from 'inquirer';

// -----------------------------
// Paths & constants
// -----------------------------
const CWD = process.cwd();
const SRC_DIR = join(CWD, 'src');
const ROUTES_DIR = join(SRC_DIR, 'routes');
const LIB_DIR = join(SRC_DIR, 'lib');
const MODULES_DIR = join(LIB_DIR, 'modules');
const MODULES_REG = join(LIB_DIR, 'modules.json');
const PAGES_REG = join(LIB_DIR, 'pages.json');

const TPL_DIR = join(CWD, 'templates');
const TPL_PAGE_SVELTE = join(TPL_DIR, 'page.svelte.tpl');
const TPL_PAGE_SERVER = join(TPL_DIR, 'page.server.ts.tpl');
const TPL_SERVER = join(TPL_DIR, 'server.ts.tpl');

// -----------------------------
// Utilities
// -----------------------------
function ensureDir(path) {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}

function readJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    console.error(`Failed to parse JSON: ${path}`);
    throw e;
  }
}

function writeJson(path, value) {
  ensureDir(dirname(path));
  writeFileSync(path, JSON.stringify(value, null, 2) + '\n');
}

function createFileIfMissing(path, content) {
  ensureDir(dirname(path));
  if (!existsSync(path)) writeFileSync(path, content);
}

function toKebabKeepParams(str) {
  // Convert to kebab, but keep [param] segments (lowercased & kebabbed inside)
  // Examples:
  //  "User List" -> "user-list"
  //  "Some/[ID Value]/Thing" -> "some/[id-value]/thing"
  const parts = str.split('/').filter(Boolean);
  const kebabbed = parts.map((p) => {
    const isParam = p.startsWith('[') && p.endsWith(']');
    const raw = isParam ? p.slice(1, -1) : p;

    const kebabInner = raw
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-zA-Z0-9-]/g, '-') // strip special chars
      .replace(/-+/g, '-')
      .toLowerCase();

    return isParam ? `[${kebabInner}]` : kebabInner;
  });
  return kebabbed.join('/');
}

function fileExists(path) {
  try {
    return existsSync(path);
  } catch {
    return false;
  }
}

// Very small templating: {{key}} & {{#if key}}...{{/if}}
function renderTemplate(tpl, data) {
  // Handle {{#if key}} ... {{/if}}
  tpl = tpl.replace(/{{#if\s+([\w.]+)}}([\s\S]*?){{\/if}}/g, (_, key, block) =>
    data[key] ? block : ''
  );
  // Replace {{key}}
  tpl = tpl.replace(/{{\s*([\w.]+)\s*}}/g, (_, key) => {
    const v = key.split('.').reduce((acc, k) => (acc ? acc[k] : undefined), data);
    return v == null ? '' : String(v);
  });
  return tpl;
}

// -----------------------------
// Ensure registries & templates
// -----------------------------
function ensureRegistries() {
  if (!existsSync(MODULES_REG)) writeJson(MODULES_REG, []);
  if (!existsSync(PAGES_REG)) writeJson(PAGES_REG, []);
}

function defaultTemplates() {
  return {
    pageSvelte: `<!-- {{description}} -->
<script lang="ts">
  {{#if auth}}
  // Placeholder auth check. Replace with MSAL/Entra logic or a guard in +layout.server.ts
  export const load = async () => {
    // await checkAuth();
  };
  {{/if}}
</script>

<section>
  <h1>{{module}} – {{page}}</h1>
  <p>{{description}}</p>
</section>
`,
    pageServerTs: `// +page.server.ts for {{module}}/{{page}}
// Add actions or load() here as needed.
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  // Example: enforce auth server-side if needed
  {{#if auth}}// await requireAuth(event.locals);{{/if}}
  return {};
};

export const actions: Actions = {
  default: async (event) => {
    // Handle form actions
    return { success: true };
  }
};
`,
    serverTs: `// +server.ts for {{module}}/{{page}}
// Add REST endpoints (GET/POST/etc.) here.
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
  {{#if auth}}// await requireAuth(event.locals);{{/if}}
  return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } });
};
`
  };
}

function ensureTemplates() {
  ensureDir(TPL_DIR);
  const defaults = defaultTemplates();
  createFileIfMissing(TPL_PAGE_SVELTE, defaults.pageSvelte);
  createFileIfMissing(TPL_PAGE_SERVER, defaults.pageServerTs);
  createFileIfMissing(TPL_SERVER, defaults.serverTs);
}

function loadTemplate(path) {
  return readFileSync(path, 'utf8');
}

// -----------------------------
// Registries helpers
// -----------------------------
function loadModules() {
  ensureRegistries();
  return readJson(MODULES_REG, []);
}

function saveModules(mods) {
  writeJson(MODULES_REG, Array.from(new Set(mods)).sort());
}

function loadPages() {
  ensureRegistries();
  return readJson(PAGES_REG, []);
}

function savePages(pages) {
  writeJson(PAGES_REG, pages);
}

function addPageMeta({ module, page, description, auth, hasPageServer, hasServer, routePath }) {
  const all = loadPages();
  const entry = {
    module,
    page,
    path: routePath, // e.g., src/routes/network/[id]
    description,
    auth: !!auth,
    hasPageServer: !!hasPageServer,
    hasServer: !!hasServer
  };
  // If already present => update
  const idx = all.findIndex(
    (p) => p.module === module && p.page === page && p.path === routePath
  );
  if (idx >= 0) {
    all[idx] = entry;
  } else {
    all.push(entry);
  }
  savePages(all);
}

// -----------------------------
// Scaffold helpers
// -----------------------------
function createModuleSkeleton(name) {
  const routesModDir = join(ROUTES_DIR, name);
  const routesAdminModDir = join(ROUTES_DIR, 'admin', name);
  const libModuleFile = join(MODULES_DIR, `${name}.ts`);

  // Create main module page (index)
  ensureDir(routesModDir);
  const mainPage = join(routesModDir, '+page.svelte');
  createFileIfMissing(
    mainPage,
    `<!-- Auto-generated index page for ${name} -->
<script lang="ts">
  let items: string[] = [];
  let current = '';
  const create = () => { if (current) { items = [...items, current]; current = ''; } };
  const remove = (i: number) => { items = items.filter((_, idx) => idx !== i); };
</script>

<h1>${name} Module</h1>
<input bind:value={current} placeholder="New item" />
<button on:click={create}>Add</button>
<ul>
  {#each items as item, i}
    <li>{item} <button on:click={() => remove(i)}>Delete</button></li>
  {/each}
</ul>
`
  );

  // Activity page
  ensureDir(join(routesModDir, 'activity'));
  createFileIfMissing(
    join(routesModDir, 'activity', '+page.svelte'),
    `<!-- Activity view for ${name}. Replace with real data -->
<script lang="ts">
  // Example scaffold; swap out for your UI lib.
  const rows = [];
  const headers = [{ key: 'name', header: 'Name' }];
</script>

<h1>${name} – Activity</h1>
<pre>{JSON.stringify({ rows, headers }, null, 2)}</pre>
`
  );

  // Admin settings/security
  ensureDir(join(routesAdminModDir, 'settings'));
  ensureDir(join(routesAdminModDir, 'security'));

  createFileIfMissing(
    join(routesAdminModDir, 'settings', '+page.svelte'),
    `<!-- Settings for ${name} -->
<script lang="ts">
  import { settings } from '$lib/modules/${name}';
</script>

<h1>${name} Settings</h1>
<pre>{JSON.stringify(settings, null, 2)}</pre>
`
  );

  createFileIfMissing(
    join(routesAdminModDir, 'security', '+page.svelte'),
    `<!-- Security for ${name} -->
<script lang="ts">
  import { variables } from '$lib/modules/${name}';
</script>

<h1>${name} Security</h1>
<pre>{JSON.stringify(variables, null, 2)}</pre>
`
  );

  // Module lib
  ensureDir(MODULES_DIR);
  createFileIfMissing(
    libModuleFile,
    `// Definitions for the ${name} module
export const settings = {};
export const variables = {};
`
  );

  // Add default pages to pages registry
  addPageMeta({
    module: name,
    page: 'index',
    description: `Index for ${name}`,
    auth: false,
    hasPageServer: false,
    hasServer: false,
    routePath: `src${sep}routes${sep}${name}`
  });

  addPageMeta({
    module: name,
    page: 'activity',
    description: `Activity for ${name}`,
    auth: false,
    hasPageServer: false,
    hasServer: false,
    routePath: `src${sep}routes${sep}${name}${sep}activity`
  });
}

function createPage({ module, page, description, auth, withPageServer, withServer }) {
  // Normalize names
  const modName = toKebabKeepParams(module);
  const pageName = toKebabKeepParams(page);

  const routeDir = join(ROUTES_DIR, modName, pageName === 'index' ? '' : pageName);
  const pageSveltePath = join(routeDir, '+page.svelte');
  const pageServerPath = join(routeDir, '+page.server.ts');
  const serverTsPath = join(routeDir, '+server.ts');

  // Prepare template data
  const tplData = {
    module: modName,
    page: pageName,
    description,
    auth: !!auth
  };

  // Read templates
  const tplSvelte = loadTemplate(TPL_PAGE_SVELTE);
  const tplPageServer = loadTemplate(TPL_PAGE_SERVER);
  const tplServer = loadTemplate(TPL_SERVER);

  // Render
  const svelteOut = renderTemplate(tplSvelte, tplData);
  const pageServerOut = renderTemplate(tplPageServer, tplData);
  const serverOut = renderTemplate(tplServer, tplData);

  // Write
  ensureDir(routeDir);
  createFileIfMissing(pageSveltePath, svelteOut);
  if (withPageServer) createFileIfMissing(pageServerPath, pageServerOut);
  if (withServer) createFileIfMissing(serverTsPath, serverOut);

  // Update registry
  addPageMeta({
    module: modName,
    page: pageName,
    description,
    auth,
    hasPageServer: !!withPageServer,
    hasServer: !!withServer,
    routePath: `src${sep}routes${sep}${modName}${pageName === 'index' ? '' : sep + pageName}`
  });

  console.log(`Created page at ${routeDir}`);
}

function previewAndConfirm(files, actionLabel = 'proceed') {
  console.log('\nPlanned changes:');
  files.forEach((f) => console.log(`  • ${f}`));
  return inquirer.prompt([
    { type: 'confirm', name: 'ok', message: `Do you want to ${actionLabel}?`, default: true }
  ]);
}

// -----------------------------
// Actions
// -----------------------------
async function actionListModules() {
  const mods = loadModules();
  if (!mods.length) return console.log('(no modules)');
  console.log(mods.join('\n'));
}

async function actionCreateModule() {
  const { rawName } = await inquirer.prompt([
    { type: 'input', name: 'rawName', message: 'Module name:' }
  ]);
  const name = toKebabKeepParams(rawName || '');
  if (!name) {
    console.error('Module name required');
    return;
  }

  const modules = loadModules();
  if (modules.includes(name)) {
    console.error('Module already exists');
    return;
  }

  const files = [
    join(ROUTES_DIR, name, '+page.svelte'),
    join(ROUTES_DIR, name, 'activity', '+page.svelte'),
    join(ROUTES_DIR, 'admin', name, 'settings', '+page.svelte'),
    join(ROUTES_DIR, 'admin', name, 'security', '+page.svelte'),
    join(MODULES_DIR, `${name}.ts`)
  ];
  const { ok } = await previewAndConfirm(files, 'create these files');
  if (!ok) return;

  createModuleSkeleton(name);
  modules.push(name);
  saveModules(modules);
  console.log('Module created');
}

async function actionRenameModule() {
  const modules = loadModules();
  if (!modules.length) {
    console.error('No modules to rename');
    return;
  }

  const { oldName } = await inquirer.prompt([
    { type: 'list', name: 'oldName', message: 'Select module to rename:', choices: modules }
  ]);
  const { newRaw } = await inquirer.prompt([
    { type: 'input', name: 'newRaw', message: 'New module name:' }
  ]);
  const newName = toKebabKeepParams(newRaw || '');
  if (!newName) return console.error('New name required');
  if (modules.includes(newName)) return console.error('New module name already exists');

  const files = [
    `${join(ROUTES_DIR, oldName)} → ${join(ROUTES_DIR, newName)}`,
    `${join(ROUTES_DIR, 'admin', oldName)} → ${join(ROUTES_DIR, 'admin', newName)}`,
    `${join(MODULES_DIR, `${oldName}.ts`)} → ${join(MODULES_DIR, `${newName}.ts`)}`
  ];
  const { ok } = await previewAndConfirm(files, 'rename these paths');
  if (!ok) return;

  // Perform rename
  renameSync(join(ROUTES_DIR, oldName), join(ROUTES_DIR, newName));
  if (fileExists(join(ROUTES_DIR, 'admin', oldName))) {
    renameSync(join(ROUTES_DIR, 'admin', oldName), join(ROUTES_DIR, 'admin', newName));
  }
  if (fileExists(join(MODULES_DIR, `${oldName}.ts`))) {
    renameSync(join(MODULES_DIR, `${oldName}.ts`), join(MODULES_DIR, `${newName}.ts`));
  }

  // Update registries
  const mods = modules.filter((m) => m !== oldName);
  mods.push(newName);
  saveModules(mods);

  const pages = loadPages().map((p) => {
    if (p.module === oldName) {
      const updatedPath = p.path.replace(
        new RegExp(`(^|\\W)${oldName}(\\W|$)`),
        (m, a, b) => `${a}${newName}${b}`
      );
      return { ...p, module: newName, path: updatedPath };
    }
    return p;
  });
  savePages(pages);

  console.log('Module renamed');
}

async function actionDeleteModule() {
  const modules = loadModules();
  if (!modules.length) {
    console.error('No modules to delete');
    return;
  }
  const { name } = await inquirer.prompt([
    { type: 'list', name: 'name', message: 'Select module to delete:', choices: modules }
  ]);

  const toDelete = [
    join(ROUTES_DIR, name),
    join(ROUTES_DIR, 'admin', name),
    join(MODULES_DIR, `${name}.ts`)
  ];
  const { ok } = await previewAndConfirm(toDelete, 'delete these paths');
  if (!ok) return;

  rmSync(join(ROUTES_DIR, name), { recursive: true, force: true });
  rmSync(join(ROUTES_DIR, 'admin', name), { recursive: true, force: true });
  rmSync(join(MODULES_DIR, `${name}.ts`), { force: true });

  // Update registries
  saveModules(modules.filter((m) => m !== name));
  savePages(loadPages().filter((p) => p.module !== name));

  console.log('Module deleted');
}

async function actionAddPage() {
  const modules = loadModules();
  if (!modules.length) {
    console.error('No modules found. Create a module first.');
    return;
  }

  const answers = await inquirer.prompt([
    { type: 'list', name: 'module', message: 'Select module:', choices: modules },
    {
      type: 'input',
      name: 'page',
      message: 'Page route (e.g. index, list, [id], settings/advanced):',
      filter: (v) => toKebabKeepParams(v || '')
    },
    { type: 'input', name: 'description', message: 'Page description:' },
    { type: 'confirm', name: 'auth', message: 'Require authentication?', default: true },
    { type: 'confirm', name: 'withPageServer', message: 'Create +page.server.ts?', default: true },
    { type: 'confirm', name: 'withServer', message: 'Create +server.ts?', default: false }
  ]);

  if (!answers.page) return console.error('Page name required');

  // Preview files
  const baseDir = join(ROUTES_DIR, answers.module, answers.page === 'index' ? '' : answers.page);
  const planned = [join(baseDir, '+page.svelte')];
  if (answers.withPageServer) planned.push(join(baseDir, '+page.server.ts'));
  if (answers.withServer) planned.push(join(baseDir, '+server.ts'));

  const { ok } = await previewAndConfirm(planned, 'create these files');
  if (!ok) return;

  // Create & register
  createPage(answers);
}

// -----------------------------
// Boot
// -----------------------------
async function main() {
  ensureRegistries();
  ensureTemplates();

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What do you want to do?',
      choices: [
        { name: 'List modules', value: 'list' },
        { name: 'Create module', value: 'create' },
        { name: 'Rename module', value: 'rename' },
        { name: 'Delete module', value: 'delete' },
        new inquirer.Separator(),
        { name: 'Add page to module', value: 'addpage' }
      ]
    }
  ]);

  switch (action) {
    case 'list':
      await actionListModules();
      break;
    case 'create':
      await actionCreateModule();
      break;
    case 'rename':
      await actionRenameModule();
      break;
    case 'delete':
      await actionDeleteModule();
      break;
    case 'addpage':
      await actionAddPage();
      break;
    default:
      console.error('Unknown action');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
