<script>
import Bar from '$lib/components/desktop/bar/index.svelte';
const bg = 'url(/img/wall.jpg) bottom left no-repeat';
</script>

<main style={`background: ${bg}`}>
  <Bar/>
</main>

<style lang="scss">
  @use "sass:map";
  @use "$lib/styles" as *;
  @import "$lib/styles/base.css";

  main {
    height: 100%;
    display: grid;
    grid-template-rows: 3.5rem auto;
  }
</style>