# Plugin System Overview

This document describes the low level mechanics of the frontend plugin system.

## Directory structure
Each plugin lives under `frontend/src/lib/modules/<plugin>/` and contains:

- `manifest.json` – metadata used for discovery and routing.
- `routes/` – Svelte components implementing the plugin pages.
- Optional supporting files such as settings modules or assets.

## Manifest
The manifest is a JSON file that declares how the host should load the plugin. Fields:

| Field | Description |
| --- | --- |
| `name` | Unique identifier used in URLs and imports. |
| `label` | Human friendly name for navigation. |
| `icon` | Icon reference used in UI elements. |
| `version` | Plugin version for compatibility checks. |
| `permissions` | Optional array of authorization scopes. |
| `routes` | Array of route objects defining pages exposed by the plugin. |

A route object contains:

- `path`: subpath mounted under the plugin base path.
- `entry`: relative file path to the Svelte component. Components are lazy‑loaded using dynamic `import()`.
- `nav`: optional navigation metadata (`label`, `icon`, `admin`).

## Discovery and loading
1. At startup the host scans `frontend/src/lib/modules/*/manifest.json` to build a registry of available plugins.
2. For each manifest, the host verifies required permissions and version compatibility.
3. Routes from all manifests are combined to build the runtime router. When the user navigates to a plugin route the corresponding component is imported on demand.
4. Navigation components (sidebar, admin menu) read `label`/`icon` from the manifests. Routes flagged with `admin: true` are surfaced only in administration UIs.

## Permissions
If a manifest lists `permissions`, the host checks the current session. Missing scopes trigger an auth flow before the plugin becomes active.

## Settings hooks
A plugin may optionally expose a `settings.ts` module referenced from the manifest. The host loads this module when rendering plugin configuration screens.

This contract keeps plugins self‑contained and discoverable while allowing the core application to control authentication, authorization and lifecycle.

