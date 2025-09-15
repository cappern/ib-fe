<script lang="ts">
  import { Tag } from 'carbon-components-svelte';
  import { onMount } from 'svelte';
  import type { StatusMap } from '$lib/api';
  import { getStatus } from '$lib/api';

  let { pollMs = 30000 } = $props<{ pollMs?: number }>();
  let status = $state<StatusMap>({ frontend: 'ok', gateway: 'unknown', ipam: 'unknown' });

  const typeFor = (s: string) => {
    switch (s) {
      case 'ok':
        return 'green';
      case 'degraded':
        return 'warm-gray';
      case 'down':
        return 'red';
      default:
        return 'gray';
    }
  };

  let timer: any;
  async function refresh() {
    status = await getStatus();
  }

  onMount(() => {
    refresh();
    timer = setInterval(refresh, pollMs);
    return () => clearInterval(timer);
  });
</script>

<div class="status-strip">
  <div class="status-item">
    <span>Frontend</span>
    <Tag size="sm" type={typeFor(status.frontend)}>{status.frontend}</Tag>
  </div>
  <div class="status-item">
    <span>Gateway</span>
    <Tag size="sm" type={typeFor(status.gateway)}>{status.gateway}</Tag>
  </div>
  <div class="status-item">
    <span>IPAM</span>
    <Tag size="sm" type={typeFor(status.ipam)}>{status.ipam}</Tag>
  </div>
</div>

<style>
  .status-strip {
    display: flex;
    gap: 1rem;
    align-items: center;
    padding: 0.5rem 0 1rem;
  }
  .status-item {
    display: inline-flex;
    gap: 0.5rem;
    align-items: center;
    color: var(--cds-text-secondary);
    font-size: 0.875rem;
  }
</style>
