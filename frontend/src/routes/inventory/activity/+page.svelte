<!--
  Activity view for inventory. Populate the rows array with real data.
-->
<script lang="ts">
  import { DataTable } from 'carbon-components-svelte';
  const rows: any[] = [];
  const headers: any[] = [{ key: 'name', header: 'Name' }];
</script>

<DataTable {rows} {headers} />
