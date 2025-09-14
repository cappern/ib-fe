<script lang="ts">
  import '../app.css';
  import favicon from '$lib/assets/favicon.svg';
  import { Header, HeaderNav, HeaderNavItem, Content, Button } from 'carbon-components-svelte';
  import { login } from '$lib/auth';

  let { children } = $props();

  const handleLogin = async () => {
    await login();
  };
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<Header company="IPAM" platformName="UI">
  <HeaderNav>
    <HeaderNavItem href="/subnet" text="Subnet" />
    <HeaderNavItem href="/dns-zone" text="DNS Zone" />
  </HeaderNav>
  <Button kind="ghost" on:click={handleLogin}>Login</Button>
</Header>

<Content>
  {@render children?.()}
</Content>
