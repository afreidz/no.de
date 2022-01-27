  {#each $screens as screen, a}
    <div class="screen" style="top: {screen.y}px; left: {screen.x}px; width: {screen.w}px; height: 30px;">
      <Group>
        <Item>
          {#each $ws.filter(ws => (ws.screen == screen.i)) as ws, b}
            <small class="ws ws_screen_{temp.indexOf(ws)+1}" class:active={ws.active}>
              {#if ws.hasWindows}⬢{:else}⬡{/if}
            </small>
          {/each}
        </Item>
        <Item remBefore={1}>
          <small><LayoutIcon fill={color.gray['1']} dir={$ws.find(ws => (ws.screen === screen.i && ws.active))?.dir}/></small>
        </Item>
      </Group>
      <Group>
        <Item><small class="active clock"><ClockIcon color={color.gray['1']}/> <span>{formattedTime}</span></small></Item>
      </Group>
    </div>
  {/each}

<script>
  import { onMount } from 'svelte';
  import Item from './item.svelte';
  import { ipc } from '$lib/socket'; 
  import Group from './group.svelte';
  import { color } from '$lib/tokens.json';
  import { time } from '$lib/stores/clock';
  import { screens, ws } from '$lib/stores/wm';
  import ClockIcon from '$lib/icons/clock.svelte';
  import LayoutIcon from '$lib/icons/layout.svelte';

  onMount(() => {
    ipc.on('wm', data => {
      if (data.msg === 'update') {
        ws.update(() => (data.workspaces));
        screens.update(() => (data.screens));
      }
    });
    ipc.send('wm', { msg: 'query' });
  });

  // for some reason $ws cannot be accessed within a loop 
  // referencing itself unless this intermediate var is used
  let temp 
  $: temp = $ws;
  
  let formattedTime;
  $: if ($time) formattedTime = $time.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' });
</script>

<style lang="scss">
  @use "sass:map";
  @use "$lib/styles" as *;
 
  @each $name, $value in map.get($theme, 'colors', 'highlights') {
    $i: index(map.get($theme, 'colors', 'highlights'), ($name $value));

    .ws.ws_screen_#{$i}.active {
      color: $value;
    }
  }
  
  .screen {
    display: flex;
    position: absolute;
    justify-content: space-between;
    padding: map.get($theme, 'spacing', 0);
    backdrop-filter: blur(1px) opacity(0.2);
    background-color: map.get($theme, 'colors', 'black', '0');
    
    &:first-child {
      padding-right: 1rem;
    }
  
    &:last-child {
      padding-left: 1rem;
    }
  }

  small {
    display: flex;
    font-weight: bold;
    align-items: center;
    color: map.get($theme, 'colors', 'gray', '0');

    &.ws {
      font-size: 1.5rem;
      margin-right: map.get($theme, 'spacing', 1);
      &:last-of-type {
        margin-right: 0;
      }
    }

    

    &.clock {
      font-size: 1rem;

      & > :global(svg) {
        margin-right: map.get($theme, 'spacing', 0);
      }
    }

    &.active {
      color: inherit;
    }

    

    & > :global(svg) {
      height: 1rem;
    }
  }

  .mode {
    display: flex;
    width: 1rem;
  }
</style>
