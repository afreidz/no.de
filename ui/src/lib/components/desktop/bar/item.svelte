<script>
  let remAfter = 0;
  let remBefore = 0;

  export { remAfter, remBefore };
</script>

<button on:click style="margin-right: {remAfter}rem; margin-left: {remBefore}rem">
  <slot/>
</button>

<style lang="scss">
  @use 'sass:map';
  @use '$lib/styles' as *;

  button {
    height: 100%;
    display: flex;
    cursor: pointer;
    font-size: 1.5rem;
    align-items: stretch;
    border-radius: 50vh;
    justify-content: stretch;
    background-color: map.get($theme, 'colors', 'black', '1');
    padding: 0 map.get($theme, 'spacing', 2);
  }
</style>
