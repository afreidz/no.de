<script>
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import copy from 'copy-text-to-clipboard';

  let modes = [
    {
      name: 'default',
      shortcut: null,
      icon: '🧠',
    },
    {
      name: 'launch',
      shortcut: 'l',
      icon: '🚀',
    },
    {
      name: 'command',
      shortcut: 'r',
      icon: '>_',
    },
    {
      name: 'calculator',
      shortcut: 'c',
      icon: '🖩',
    }
  ];

  const results = writable([]);
  let resultDOM = [];
  let active = 0;
  let mode = 0;
  let current;
  let query;
  let input;

  $: current = modes[mode];

  onMount(() => {
    if (input) input.focus();
  });

  async function search(e) {
    if (query === '') {
      active = 0;
      $results = [];
      return;
    }
    
    const qs = new URLSearchParams();
    qs.set('mode', current.name);
    qs.set('query', query);
    fetch(`/endpoints/brain.json?${qs.toString()}`)
      .then(resp => (resp.json()))
      .then(r => { $results = r });
  }

  async function capture(e) {
    switch (e.key) {
      case 'Tab':
        e.preventDefault();
        if (query.length !== 1) break;
        const match = modes.find(m => m.shortcut === query);
        mode = match ? modes.indexOf(match) : 0;
        query = '';
        active = 0;
        $results = [];
      break;
      case 'Escape':
        e.preventDefault();
        mode = 0;
        query = '';
        active = 0;
        $results = [];
        fetch(`/endpoints/brain.json`, {
          method: 'POST',
          body: JSON.stringify({ type: 'app' }),
        });
      break;
      case 'ArrowUp':
        e.preventDefault();
        active = active === 0
          ? $results.length-1
          : (active - 1);
        resultDOM[active]?.scrollIntoViewIfNeeded();
      break;
      case 'ArrowDown':
        e.preventDefault();
        active = active === $results.length-1
          ? 0
          : (active + 1);
        resultDOM[active]?.scrollIntoViewIfNeeded();
      break;
      case 'Enter':
        const { item } = $results[active];
        if (item.type === 'calculator') copy(item.name);
        if (item.type === 'app') {
          fetch(`/endpoints/brain.json`, {
            method: 'POST',
            body: JSON.stringify(item),
          });
        }
        query = '';
        active = 0;
        $results = [];
      break;
    }
  }
</script>

<main>
  <label>
    <i>{current.icon}</i>
    <input bind:this={input} bind:value={query} on:keyup={search} on:keydown={capture} type="text"/>
  </label>
  <ul>
    {#each $results as result, i }
    <li class:active={i === active} bind:this={resultDOM[i]}>
      <span>{result.item.name}</span>
      <small>{result.item.type}</small>
    </li>
    {/each}
  </ul>
</main>

<style lang="scss">
  @use "sass:map";
  @use "$lib/styles" as *;
  @import "$lib/styles/base.css";

  main {
    height: 100%;
    display: flex;
    font-size: 8rem;
    font-weight: 400;
    line-height: 10rem;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    color: map.get($theme, 'text-color');
    background: map.get($theme, 'panel-background');
  }

  label {
    width: 60%;
    display: flex;
    padding: map.get($spacing, 2);
    border-bottom: 1px solid map.get($theme, 'dividers');
  }

  i {
    flex: 0 0 2rem;
    padding-right: map.get($spacing, 1);
  }

  input {
    width: 0;
    flex: 1 1 auto;
    font-size: inherit;
  }

  ul {
    width: 60%;
    overflow: auto;
    font-weight: 200;
    font-size: 3.5rem;
    line-height: 5rem;
    height: calc(6 * 5rem);
    &::-webkit-scrollbar {
      display: none;
    }
    li {
      display: flex;
      justify-content: space-between;
      padding: 0 map.get($spacing, 1);

      small {
        font-weight: 500;
        font-size: 1.5rem;
        color: map.get($theme, 'dim-text-color');
      }

      &.active {
        background: map.get($theme, "highlighted-background");
      }
    }
  }

</style>