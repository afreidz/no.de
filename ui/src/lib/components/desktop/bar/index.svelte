<section>
  <div class="screen">
    <Group>
      <Item>
        {#if left.find(ws => ws.active)?.dir === 'ltr' }
          <span class="mode"><ColumnIcon/></span>
        {:else}
          <span class="mode"><RowIcon/></span>
        {/if}
      </Item>
      {#each left as ws, i}
        {#if ws.active}
          <Item remAfter={i === left.length ? 1 : 0}>
            <small class:active={ws.active}>{ws.text}</small>
          </Item>
        {/if}
      {/each}
    </Group>
    <Group>
      <Item><small class="active"><ClockIcon/> <span>{formattedTime}</span></small></Item>
    </Group>
  </div>
  <div class="screen">
    <Group>
      <Item>
        {#if right.find(ws => ws.active)?.dir === 'ltr' }
          <span class="mode"><ColumnIcon/></span>
        {:else}
          <span class="mode"><RowIcon/></span>
        {/if}
      </Item>
      {#each right as ws, i}
        {#if ws.active}
          <Item remBefore={i === 0} remAfter={i === left.length ? 1 : 0}>
            <small class:active={ws.active}>{ws.text}</small>
          </Item>
        {/if}
      {/each}
    </Group>
    <Group>
      <Item><small class="active"><ClockIcon/> <span>{formattedTime}</span></small></Item>
    </Group>
  </div>
</section>

<script>
  import ws from '$lib/stores/wm';
  import Item from './item.svelte';
  import Group from './group.svelte';
  import { time } from '$lib/stores/clock';
  import RowIcon from '$lib/icons/rows.svelte';
  import ClockIcon from '$lib/icons/clock.svelte';
  import ColumnIcon from '$lib/icons/columns.svelte';

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
    align-items: flex-start;
    justify-content: space-between;
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
    font-size: 1rem;
    font-weight: bold;
    align-items: center;
    color: map.get($theme, 'tokens', 'dim-text-color');

    &.active {
      color: inherit;
    }

    & > :global(svg) {
      height: 1.2rem;
      margin-right: map.get($theme, 'spacing', 0);
    }
  }

  .mode {
    width: 1.5rem;
  }
</style>