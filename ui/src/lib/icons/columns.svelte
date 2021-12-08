<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <g transform="matrix(2,0,0,2,0,0)">
    <path d="M6.5,21.5a1,1,0,0,1-1,1h-4a1,1,0,0,1-1-1V1.5a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1Z" fill="none"
      stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M14.5,21.5a1,1,0,0,1-1,1h-4a1,1,0,0,1-1-1V1.5a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1Z" fill="none"
      stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M22.5,21.5a1,1,0,0,1-1,1h-4a1,1,0,0,1-1-1V1.5a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1Z" fill="none"
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