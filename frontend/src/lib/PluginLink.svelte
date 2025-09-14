<script lang="ts">
  import { SideNavLink } from 'carbon-components-svelte';
  import { goto } from '$app/navigation';
  let { mod } = $props<{ mod: string }>();
  const handleClick = async (event: MouseEvent) => {
    event.preventDefault();
    await import(`../routes/${mod}/+page.svelte`);
    goto(`/${mod}`);
  };
</script>

<SideNavLink href={`/${mod}`} on:click={handleClick}>{mod}</SideNavLink>
