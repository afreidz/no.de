<script>
  import { onMount } from 'svelte';
  import { ipc } from '$lib/socket'; 
  import { screens, ws, root } from '$lib/stores/wm';
  let callback = (_) => {};
  let title = 'overview';
  let adjusted = [];
  let container;

  onMount(() => {
    ipc.on('wm', data => {
      if (data.msg === 'update') {
        root.update(() => (data.root));
        ws.update(() => (data.workspaces));
        screens.update(() => (data.screens));
      }
    });
    ipc.send('wm', { msg: 'query' });
  });

  $: {
    if($screens && container && $root) {
      const r = $root;
      const rect = container.getBoundingClientRect();
      const c = {
        y: rect.y,
        x: rect.x,
        w: rect.width,
        h: rect.height,
      }
      adjusted = $screens.map(s => {
        return {
          i: s.i,
          w: (s.w * c.w) / r.w,
          h: (s.h * c.h) / r.h,
          x: (s.x * c.w) / r.w,
          y: (s.y * c.h) / r.h,
        } 
      }) 
    }
  }
  export { callback, title }
</script>

<h2 class="title">{title}</h2>
<main class="overview" bind:this={container}>
  {#each adjusted as screen}
    <section class="container" style="top: {screen.y}px; left: {screen.x}px; width: {screen.w}px; height: {screen.h}px">
      <figure class="screen">
        {#each $ws as workspace}
          {#if workspace.screen === screen.i}
            <button class="workspace" on:click={() => callback(workspace)}>
              <i>{workspace.name}</i>
            </button>
          {/if}
        {/each}
      </figure>
    </section>
  {/each}
</main>

<style lang="scss">
  @use "sass:map";
  @use "$lib/styles" as *;
  @import "$lib/styles/base/index.css";

  .title {
    top: 5vh;
    width: 100%;
    font-size: 2rem;
    position: absolute;
    font-style: italic;
    text-align: center;
    color: map.get($theme, 'colors', 'highlights', 'red');
  }
  
  .overview {
    min-height: 100%;
    position: relative; 
    margin: 0 map.get($theme, 'spacing', 3);
  }

  .container { 
    display: flex;
    position: absolute; 
    align-items: center;
    padding: map.get($theme, 'spacing', 3);
  }

  .screen {
    width: 100%;
    flex-grow: 0;
    display: grid;
    flex-shrink: 0;
    aspect-ratio: 16 / 9;
    padding: map.get($theme, 'spacing', 3);
    grid-gap: map.get($theme, 'spacing', 3);
    border-radius: map.get($theme, 'radius');
    background-color: map.get($theme, 'colors', 'gray', '1');
    grid-template-columns: repeat(auto-fit, minmax(25%, 1fr));
  }

  .workspace {
    display: flex;
    font-size: 3rem;
    text-align: center;
    align-items: center;
    aspect-ratio: 16 / 9;
    justify-content: center;
    border-radius: map.get($theme, 'radius');
    background-color: map.get($theme, 'colors', 'black', '3');
  }
</style>
