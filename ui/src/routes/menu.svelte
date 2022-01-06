<script>
  import { ipc } from '$lib/socket';
  import { writable } from 'svelte/store';
  const active = writable(false);

  ipc.on('wm', data => {
    if(data.command !== 'toggle-menu') return;
    $active = !$active;
  });

</script>

<style lang="scss">
  @use 'sass:map';
  @use '$lib/styles' as *;
  
  $nav-width: 500px;

  @keyframes move {
    from { left: calc(-1 * $nav-width); }
    to { left: 0; }
  }

  nav {
    top: 0;
    bottom: 0;
    animation: none;
    width: $nav-width;
    position: absolute;
    left: calc(-1 * $nav-width);
    background: map.get($theme, 'tokens', 'panel-background');
  }
  
  nav.active {
    animation: move 500ms ease-in-out 5ms 1 forwards;
  }
</style>


<nav class:active={$active}>
  Hello!
</nav>