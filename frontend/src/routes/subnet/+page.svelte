<script lang="ts">
  import { Form, FormGroup, TextInput, Button, InlineNotification } from 'carbon-components-svelte';
  import { getToken } from '$lib/auth';
  let cidr = '';
  let description = '';
  let error: string | null = null;
  let success: string | null = null;

  const submit = async (event: Event) => {
    event.preventDefault();
    error = success = null;
    if (!cidr) {
      error = 'CIDR block is required';
      return;
    }
    try {
      const token = await getToken(['api://your-api/.default']);
      const res = await fetch('/api/subnet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ cidr, description })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Request failed');
      }
      success = 'Subnet created';
      cidr = '';
      description = '';
    } catch (e) {
      error = (e as Error).message;
    }
  };
</script>

<Form on:submit={submit}>
  <FormGroup legend="Create Subnet">
    <TextInput bind:value={cidr} labelText="CIDR" placeholder="10.0.0.0/24" required invalid={!!error && !cidr} invalidText="CIDR required" />
    <TextInput bind:value={description} labelText="Description" placeholder="Optional" />
    <Button type="submit">Create</Button>
  </FormGroup>
</Form>
{#if error}
  <InlineNotification kind="error" title="Error" subtitle={error} />
{/if}
{#if success}
  <InlineNotification kind="success" title="Success" subtitle={success} />
{/if}
