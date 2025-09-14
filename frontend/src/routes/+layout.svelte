<script lang="ts">
  import '../app.css';
  import favicon from '$lib/assets/favicon.svg';
  import {
    Header,
    HeaderAction,
    HeaderPanelLinks,
    HeaderPanelLink,
    SideNav,
    SideNavItems,
    SideNavLink,
    Content
  } from 'carbon-components-svelte';
  import Switcher from 'carbon-icons-svelte/lib/Switcher.svelte';
  import UserAvatar from 'carbon-icons-svelte/lib/UserAvatarFilledAlt.svelte';
  import { login } from '$lib/auth';
  import modules from '$lib/modules.json';

  let { children } = $props();
  let switcherOpen = $state(false);

  const handleLogin = async () => {
    await login();
  };
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<Header company="NETMax">
  <HeaderAction
    icon={Switcher}
    bind:isOpen={switcherOpen}
    iconDescription="App Switcher"
  >
    <HeaderPanelLinks>
      <HeaderPanelLink href="/">NETMax</HeaderPanelLink>
    </HeaderPanelLinks>
  </HeaderAction>
  <HeaderAction
    icon={UserAvatar}
    iconDescription="Login"
    on:click={handleLogin}
  />
</Header>

<SideNav fixed isOpen={true} aria-label="Sidebar">
  <SideNavItems>
    {#each modules as mod}
      <SideNavLink href={`/${mod}`}>{mod}</SideNavLink>
    {/each}
    <SideNavLink href="/admin">Admin</SideNavLink>
  </SideNavItems>
</SideNav>

<Content>
  {@render children?.()}
</Content>
