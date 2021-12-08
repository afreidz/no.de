<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <g transform="matrix(2,0,0,2,0,0)">
    <path d="M23.5,5.5a1,1,0,0,1-1,1H1.5a1,1,0,0,1-1-1v-3a1,1,0,0,1,1-1h21a1,1,0,0,1,1,1Z" fill="none"
      stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M23.5,13.5a1,1,0,0,1-1,1H1.5a1,1,0,0,1-1-1v-3a1,1,0,0,1,1-1h21a1,1,0,0,1,1,1Z" fill="none"
      stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M23.5,21.5a1,1,0,0,1-1,1H1.5a1,1,0,0,1-1-1v-3a1,1,0,0,1,1-1h21a1,1,0,0,1,1,1Z" fill="none"
      stroke-linecap="round" stroke-linejoin="round"></path>
  </g>
</svg>

<style lang="scss">
  @use "sass:map";
  @use "$lib/styles" as *;

  path {
    stroke: map.get($theme, 'tokens', 'text-color');
  }
</style>