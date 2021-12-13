{#if dir === 'ttb'}
  {#if split}
    <svg viewBox="0 0 15 15">
      <rect x="1" y="1" width="6" height="3" rx="1" />
      <rect x="1" y="11" width="6" height="3" rx="1" />
      <rect x="9" y="1" width="5" height="13" rx="1" />
      <rect x="1" y="6" width="6" height="3" rx="1" />
    </svg>
  {:else}
    <svg viewBox="0 0 15 15">
      <rect x="1" y="1" width="13" height="3" rx="1"/>
      <rect x="1" y="11" width="13" height="3" rx="1"/>
      <rect x="1" y="6" width="13" height="3" rx="1"/>
    </svg>
  {/if}
{:else if dir === 'ltr'}
  {#if split}
    <svg viewBox="0 0 15 15">
      <rect x="1" y="1" width="3" height="6" rx="1"/>
      <rect x="11" y="1" width="3" height="6" rx="1"/>
      <rect x="6" y="1" width="3" height="6" rx="1"/>
      <rect x="1" y="9" width="13" height="5" rx="1"/>
    </svg>
  {:else}
    <svg viewBox="0 0 15 15">
      <rect x="1" y="1" width="3" height="13" rx="1"/>
      <rect x="11" y="1" width="3" height="13" rx="1"/>
      <rect x="6" y="1" width="3" height="13" rx="1"/>
    </svg>
  {/if}
{/if}

<style lang="scss">
  @use "sass:map";
  @use "$lib/styles" as *;

  rect {
    fill: map.get($theme, 'tokens', 'text-color');
  }
</style>

<script>
  let dir = 'ttb';
  let split = false;

  export { dir, split };
</script>