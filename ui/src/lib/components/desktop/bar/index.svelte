<section>
  <div class="screen">
    <Group>
      <Item>
        {#each left as ws, i}
          <small class="ws ws_{i} ws_left" class:active={ws.active}>{#if ws.active}⬢{:else}⬡{/if}</small>
        {/each}
      </Item>
      <Item remBefore={1}>
        <small><LayoutIcon split={$split} dir={left.find(ws => ws.active)?.dir}/></small>
      </Item>
    </Group>
    <Group>
      <Item><small class="active clock"><ClockIcon/> <span>{formattedTime}</span></small></Item>
    </Group>
  </div>
  <div class="screen">
    <Group>
      <Item>
        {#each right as ws, i}
          <small class="ws ws_{i} ws_right" class:active={ws.active}>{#if ws.active}⬢{:else}⬡{/if}</small>
        {/each}
      </Item>
      <Item remBefore={1}>
        <small><LayoutIcon split={$split} dir={right.find(ws => ws.active)?.dir}/></small>
      </Item>
    </Group>
    <Group>
      <Item><small class="clock active"><ClockIcon/> <span>{formattedTime}</span></small></Item>
    </Group>
  </div>
</section>

<script>
  import ws from '$lib/stores/wm';
  import Item from './item.svelte';
  import Group from './group.svelte';
  import split from '$lib/stores/split';
  import { time } from '$lib/stores/clock';
  import ClockIcon from '$lib/icons/clock.svelte';
  import LayoutIcon from '$lib/icons/layout.svelte';

  let formattedTime;
  let left = [];
  let right = [];

  $: if ($ws) {
    left = $ws.filter(ws => ws.screen === 0);
    right = $ws.filter(ws => ws.screen === 1);
  }

  $: if ($time) formattedTime = $time.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' });
</script>

<style lang="scss">
  @use "sass:map";
  @use "$lib/styles" as *;

  section {
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    padding: map.get($theme, 'spacing', 0);
    box-shadow: map.get($theme, 'tokens', 'panel-shadow');
    background-color: map.get($theme, 'tokens', 'panel-background');
  }

  .screen {
    flex: 1;
    display: flex;
    justify-content: space-between;
    
    &:first-child {
      margin-right: 1rem;
    }
  
    &:last-child {
      margin-left: 1rem;
    }
  }

  small {
    display: flex;
    font-weight: bold;
    align-items: center;
    color: map.get($theme, 'tokens', 'dim-text-color');

    &.ws {
      font-size: 1.5rem;
      margin-right: map.get($theme, 'spacing', 1);
      &:last-of-type {
        margin-right: 0;
      }
    }

    @for $i from 0 through 2 {
      &.ws_left.ws_#{$i}.active {
        color: map.get($theme, 'colors', 'highlights', ($i + 1));
      }
      &.ws_right.ws_#{$i}.active {
        color: map.get($theme, 'colors', 'highlights', ($i + 4));
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
