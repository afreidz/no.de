<script context="module">
	export const ssr = false;
</script>

<script>
import Bar from '$lib/components/desktop/bar/index.svelte';
const bg = 'url(https://via.placeholder.com/1920x1080/7f39fb/ffffff?text=1) top left no-repeat, url(https://via.placeholder.com/1920x1080/bb86fc/ffffff?text=2) top right no-repeat';
</script>

<main style={`background: ${bg}`}>
  <Bar/>
</main>

<style>
  @import '$lib/styles';

  main {
    flex: 1;
    display: grid;
    grid-template-rows: 3.5rem auto;
  }
</style>