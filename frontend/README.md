# NETMax frontend

A SvelteKit-based user interface for managing networking tools within a large enterprise.

## Developing

Install dependencies and start the development server:

```sh
npm install
npm run dev
```

## Building

Create a production build and preview it locally:

```sh
npm run build
npm run preview
```

## Checks

Run linting and type checks:

```sh
npm run check
```

## Module generator

Manage UI modules with the interactive generator:

```sh
npm run generate
```

The script supports creating, renaming, listing, and deleting modules. Each module is scaffolded with a CRUD page, an activity page using a Carbon DataTable, and admin settings and security pages. Modules are tracked in `src/lib/modules.json` to populate the sidebar.

Generated files include inline comments to help you continue building out each module.
