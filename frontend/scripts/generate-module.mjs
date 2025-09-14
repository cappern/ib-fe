#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync, renameSync } from 'fs';
import { join, dirname } from 'path';
import readline from 'readline';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

const modulesFile = join(process.cwd(), 'src', 'lib', 'modules.json');

function loadModules() {
  return existsSync(modulesFile)
    ? JSON.parse(readFileSync(modulesFile, 'utf8'))
    : [];
}

function saveModules(mods) {
  writeFileSync(modulesFile, JSON.stringify(mods, null, 2) + '\n');
}

function createFile(path, content) {
  if (!existsSync(path)) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
  }
}

async function createModule(name) {
  const modules = loadModules();
  if (modules.includes(name)) {
    console.error('Module already exists');
    return;
  }

  const routesDir = join(process.cwd(), 'src', 'routes');
  const libDir = join(process.cwd(), 'src', 'lib', 'modules');

  // user pages
  createFile(
    join(routesDir, name, '+page.svelte'),
    `<!--
  This page was generated for the ${name} module.
  Replace the example list below with your module's main UI and real CRUD logic.
-->
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

  // activity page
  createFile(
    join(routesDir, name, 'activity', '+page.svelte'),
    `<!--
  Activity view for ${name}. Populate the rows array with real data.
-->
<script lang="ts">
  import { DataTable } from 'carbon-components-svelte';
  const rows: any[] = [];
  const headers: any[] = [{ key: 'name', header: 'Name' }];
</script>

<DataTable {rows} {headers} />
`
  );

  // admin pages
  createFile(
    join(routesDir, 'admin', name, 'settings', '+page.svelte'),
    `<!--
  Settings for ${name}. Add form controls to persist configuration.
-->
<script lang="ts">
  import { settings } from '$lib/modules/${name}';
</script>

<h1>${name} Settings</h1>
`
  );

  createFile(
    join(routesDir, 'admin', name, 'security', '+page.svelte'),
    `<!--
  Security page for ${name}. Manage credentials and permissions here.
-->
<script lang="ts">
  import { variables } from '$lib/modules/${name}';
</script>

<h1>${name} Security</h1>
`
  );

  // module lib file
  createFile(
    join(libDir, `${name}.ts`),
    `// Definitions for the ${name} module.
// Extend settings and variables to integrate with your backend.
export const settings = {};
export const variables = {};
`
  );

  modules.push(name);
  saveModules(modules);
  console.log('Module created');
}

async function renameModule(oldName, newName) {
  const modules = loadModules();
  if (!modules.includes(oldName)) {
    console.error('Module not found');
    return;
  }
  if (modules.includes(newName)) {
    console.error('New module name already exists');
    return;
  }

  const routesDir = join(process.cwd(), 'src', 'routes');
  const libDir = join(process.cwd(), 'src', 'lib', 'modules');

  renameSync(join(routesDir, oldName), join(routesDir, newName));
  renameSync(join(routesDir, 'admin', oldName), join(routesDir, 'admin', newName));
  renameSync(join(libDir, `${oldName}.ts`), join(libDir, `${newName}.ts`));

  const idx = modules.indexOf(oldName);
  modules[idx] = newName;
  saveModules(modules);
  console.log('Module renamed');
}

async function deleteModule(name) {
  const modules = loadModules();
  if (!modules.includes(name)) {
    console.error('Module not found');
    return;
  }

  const routesDir = join(process.cwd(), 'src', 'routes');
  const libDir = join(process.cwd(), 'src', 'lib', 'modules');

  rmSync(join(routesDir, name), { recursive: true, force: true });
  rmSync(join(routesDir, 'admin', name), { recursive: true, force: true });
  rmSync(join(libDir, `${name}.ts`), { force: true });

  saveModules(modules.filter((m) => m !== name));
  console.log('Module deleted');
}

async function main() {
  const action = (await ask('Action (list/create/rename/delete): '))
    .trim()
    .toLowerCase();
  const modules = loadModules();

  if (action === 'list') {
    console.log(modules.join('\n'));
    rl.close();
    return;
  }

  if (action === 'create') {
    const name = (await ask('Module name: ')).trim();
    rl.close();
    if (name) await createModule(name);
    else console.error('Module name required');
    return;
  }

  if (action === 'rename') {
    const oldName = (await ask('Current module name: ')).trim();
    const newName = (await ask('New module name: ')).trim();
    rl.close();
    if (oldName && newName) await renameModule(oldName, newName);
    else console.error('Both names required');
    return;
  }

  if (action === 'delete') {
    const name = (await ask('Module name: ')).trim();
    rl.close();
    if (name) await deleteModule(name);
    else console.error('Module name required');
    return;
  }

  console.error('Unknown action');
  rl.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
