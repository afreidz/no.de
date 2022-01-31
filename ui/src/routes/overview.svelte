<script>
  import { ipc } from '$lib/socket'; 
  import Overview from '$lib/components/overview.svelte';

  function callback(ws) {
    ipc.send('wm', { msg: 'command', command: 'activate-workspace', args: [ws.name] })
  }
</script>

<Overview title="Overview" {callback} />

<style lang="scss">
  :global(html) {
    background-color: rgba(0,0,0,0.5) !important;
  } 
</style>
