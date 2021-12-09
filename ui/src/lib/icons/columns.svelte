<svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="3" height="13" rx="1"/>
  <rect x="11" y="1" width="3" height="13" rx="1"/>
  <rect x="6" y="1" width="3" height="13" rx="1"/>
</svg>

<style lang="scss">
  @use "sass:map";
  @use "$lib/styles" as *;

  rect {
    fill: map.get($theme, 'tokens', 'text-color');
  }
</style>