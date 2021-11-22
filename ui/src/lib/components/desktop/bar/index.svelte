<section>
  <div class="screen">
    <Group>
      <Item on:click={() => (menuActive = !menuActive)}>
        {#if menuActive}⬤{:else}◯{/if}
      </Item>

      {#each left as ws, i}
      <Item on:click={() => activateWS(ws)} remAfter={i === left.length ? 1 : 0}>
        <small class:active={ws.active}>{ws.text}</small>
      </Item>
      {/each}
    </Group>
    <Group>
      <Item><small class="active">⏲ {formattedTime}</small></Item>
    </Group>
  </div>
  <div class="screen">
    <Group>
      {#each right as ws, i}
      <Item on:click={() => activateWS(ws)} remBefore={i === 0} remAfter={i === left.length ? 1 : 0}>
        <small class:active={ws.active}>{ws.text}</small>
      </Item>
      {/each}
    </Group>
    <Group>
      <Item><small class="active">⏲ {formattedTime}</small></Item>
    </Group>
  </div>
</section>

<script>
  import ws from '$lib/stores/wm';
  import Item from './item.svelte';
  import { ipc } from '$lib/socket';
  import Group from './group.svelte';
  import { time } from '$lib/stores/clock';
  let menuActive = false;
  let formattedTime;
  let left = [];
  let right = [];

  $: if ($ws) {
    left = $ws.filter(ws => ws.screen === 0);
    right = $ws.filter(ws => ws.screen === 1);
  }

  $: if ($time) formattedTime = $time.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' });

  function activateWS(n) {
    const idx = $ws.findIndex(w => w.text === n.text);
    ipc.send('wm', { msg: 'command', command: 'activate-workspace', args: [idx] });
  }
</script>

<style>
  section {
    display: flex;
    padding: 1rem;
    align-items: flex-start;
    justify-content: space-between;
  }

  .screen {
    flex: 1;
    display: flex;
    justify-content: space-between;
  }

  .screen:first-child {
    margin-right: 1rem;
  }

  .screen:last-child {
    margin-left: 1rem;
  }

  small {
    /* font-weight: bold; */
    color: var(--disabled-text);
    font-size: 1rem;
  }
  small.active {
    color: inherit;
  }
</style>