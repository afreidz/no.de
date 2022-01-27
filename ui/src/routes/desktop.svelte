<script>
  import WallTile from '$lib/wallpaper/tile.svelte';
  import Bar from '$lib/components/desktop/bar/index.svelte';
</script>

<div id="wallpaper">
  <WallTile opacity={0.3}/>
</div>

<main>
  <Bar/>
</main>

<style lang="scss">
  @use "sass:map";
  @use "$lib/styles" as *;
  @import "$lib/styles/base/index.css";

  :global(body) {
    overflow: hidden;
  }

  #wallpaper {
    z-index: -1;
    top: 0; bottom: 0;
    left: 0; right: 0;
    position: absolute;
  }

</style>
