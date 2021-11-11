<section>
  <div class="screen">
    <Group>
      <Item on:click={() => (menuActive = !menuActive)}>
        {#if menuActive}⬤{:else}◯{/if}
      </Item>
      <Item><small>1</small></Item>
      <Item><small>2</small></Item>
      <Item remAfter={1}><small class="active">3</small></Item>
    </Group>
    <Group>
      <Item><small class="active">⏲ 10:55</small></Item>
    </Group>
  </div>
  <div class="screen">
    <Group>
      <Item remBefore={1}><small>4</small></Item>
      <Item><small>5</small></Item>
      <Item remAfter={1}><small class="active">6</small></Item>
    </Group>
    <Group>
      <Item><small class="active">⏲ 10:55</small></Item>
    </Group>
  </div>
</section>

<script>
  import Item from './item.svelte';
  import Group from './group.svelte';
  let menuActive = false;
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