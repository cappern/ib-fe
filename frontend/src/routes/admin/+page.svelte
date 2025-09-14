<script lang="ts">
  import { getAdminPlugins, toAdminPath } from '$lib/admin';

  const plugins = getAdminPlugins();
</script>

<h1>Admin Area</h1>

{#if plugins.length === 0}
  <p>No admin modules available.</p>
{:else}
  {#each plugins as p}
    <section>
      <h2>{p.label}</h2>
      <ul>
        {#each p.adminRoutes as route}
          <li>
            <a href={toAdminPath(p.name, route.path)}>{route.nav?.label ?? route.path}</a>
          </li>
        {/each}
      </ul>
    </section>
  {/each}
{/if}
