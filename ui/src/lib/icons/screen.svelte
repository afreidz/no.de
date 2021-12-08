<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
  <g transform="matrix(2,0,0,2,0,0)">
    <defs>
      <style>
        .a {
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
      </style>
    </defs>
    <title>screen-1</title>
    <rect class="a" x="0.5" y="3" width="23" height="15" rx="1" ry="1"></rect>
    <line class="a" x1="6.489" y1="21" x2="17.489" y2="21"></line>
    <line class="a" x1="10.5" y1="18" x2="10.5" y2="21"></line>
    <line class="a" x1="13.5" y1="18" x2="13.5" y2="21"></line>
  </g>
</svg>

<style lang="scss">
  @use "sass:map";
  @use "$lib/styles" as *;

  .a {
    stroke: map.get($theme, 'tokens', 'text-color');
  }
</style>