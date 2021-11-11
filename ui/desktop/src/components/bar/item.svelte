<script>
  let remAfter = 0;
  let remBefore = 0;

  export { remAfter, remBefore };
</script>

<button on:click style="margin-right: {remAfter}rem; margin-left: {remBefore}rem">
  <slot/>
</button>

<style>
  button {
    height: 100%;
    padding: 1rem;
    display: flex;
    cursor: pointer;
    font-size: 1.5rem;
    line-height: 0.5rem;
    align-items: stretch;
    color: var(--text-color);
    justify-content: stretch;
  }
</style>