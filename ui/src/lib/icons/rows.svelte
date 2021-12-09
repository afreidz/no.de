<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="13" height="3" rx="1"/>
  <rect x="1" y="11" width="13" height="3" rx="1"/>
  <rect x="1" y="6" width="13" height="3" rx="1"/>
</svg>


<style lang="scss">
  @use "sass:map";
  @use "$lib/styles" as *;

  rect {
    fill: map.get($theme, 'tokens', 'text-color');
  }
</style>