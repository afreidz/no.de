<script>
  import { ipc } from '$lib/socket'; 
  import Overview from '$lib/components/overview.svelte';

  function callback(ws) {
    ipc.send('wm', { msg: 'command', command: 'move-to-workspace', args: [ws.name] })
  }
</script>

<Overview title="Move window to workspace" {callback} />

<style lang="scss">
  @use "sass:map";
  @use "$lib/styles" as *;
  @import "$lib/styles/base/index.css";

  :global(html) {
    background-color: map.get($theme, 'modal') !important;
  } 
</style>
