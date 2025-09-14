<!--
  This page was generated for the inventory module.
  Replace the example list below with your module's main UI and real CRUD logic.
-->
<script lang="ts">
  let items: string[] = [];
  let current = '';
  const create = () => { if (current) { items = [...items, current]; current = ''; } };
  const remove = (i: number) => { items = items.filter((_, idx) => idx !== i); };
</script>

<h1>inventory Module</h1>
<input bind:value={current} placeholder="New item" />
<button on:click={create}>Add</button>
<ul>
  {#each items as item, i}
    <li>{item} <button on:click={() => remove(i)}>Delete</button></li>
  {/each}
</ul>
