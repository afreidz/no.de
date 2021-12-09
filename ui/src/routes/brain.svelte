<script>
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import copy from 'copy-text-to-clipboard';
  import RunIcon from '$lib/icons/run.svelte';
  import BrainIcon from '$lib/icons/brain.svelte';
  import RocketIcon from '$lib/icons/rocket.svelte';
  import CalculatorIcon from '$lib/icons/calculator.svelte';

  let modes = [
    {
      name: 'default',
      shortcut: null,
      icon: BrainIcon,
    },
    {
      name: 'launch',
      shortcut: 'l',
      icon: RocketIcon,
    },
    {
      name: 'command',
      shortcut: 'r',
      icon: RunIcon,
    },
    {
      name: 'calculator',
      shortcut: 'c',
      icon: CalculatorIcon,
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
  <div class="brain">
    <label>
      <i>
        <svelte:component this={current.icon}/>
      </i>
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
  </div>
</main>

<style lang="scss">
  @use "sass:map";
  @use "$lib/styles" as *;
  @import "$lib/styles/base.css";

  $width: 50%;

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
  }

  .brain {
    width: $width;
    box-shadow: map.get($theme, 'tokens', 'panel-shadow');
    background: map.get($theme, 'tokens', 'panel-background');
  }
  
  label {
    display: flex;
    border-bottom: 1px solid map.get($theme, 'tokens', 'dividers');
    padding: map.get($theme, 'spacing', 2) map.get($theme, 'spacing', 5);
  }

  i {
    flex: 0 0 7rem;
    padding-right: map.get($theme, 'spacing', 1);
  }

  input {
    width: 0;
    flex: 1 1 auto;
    font-size: inherit;
  }

  ul {
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
      padding: 0 map.get($theme, 'spacing', 3);

      small {
        font-weight: 500;
        font-size: 1.5rem;
        color: map.get($theme, 'tokens', 'dim-text-color');
      }

      &.active {
        background: map.get($theme, 'tokens', "highlighted-background");
      }
    }
  }

</style>