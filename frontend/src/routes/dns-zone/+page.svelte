<script lang="ts">
  import { Form, FormGroup, TextInput, Button, InlineNotification } from 'carbon-components-svelte';
  import { getToken } from '$lib/auth';
  let zone = '';
  let error: string | null = null;
  let success: string | null = null;

  const submit = async (event: Event) => {
    event.preventDefault();
    error = success = null;
    if (!zone) {
      error = 'Zone name is required';
      return;
    }
    try {
      const token = await getToken(['api://your-api/.default']);
      const res = await fetch('/api/dns-zone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ zone })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Request failed');
      }
      success = 'DNS zone created';
      zone = '';
    } catch (e) {
      error = (e as Error).message;
    }
  };
</script>

<Form on:submit={submit}>
  <FormGroup legend="Create DNS Zone"> 
    <TextInput bind:value={zone} labelText="Zone" placeholder="example.com" required invalid={!!error && !zone} invalidText="Zone required" />
    <Button type="submit">Create</Button>
  </FormGroup>
</Form>
{#if error}
  <InlineNotification kind="error" title="Error" subtitle={error} />
{/if}
{#if success}
  <InlineNotification kind="success" title="Success" subtitle={success} />
{/if}
