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
    <title>programming-browser-1</title>
    <polyline class="a" points="6.5 10.5 9 13 6.5 15.5"></polyline>
    <line class="a" x1="12.5" y1="13.5" x2="16.5" y2="13.5"></line>
    <path class="a" d="M14,4.75a.25.25,0,1,1-.25.25A.25.25,0,0,1,14,4.75"></path>
    <path class="a" d="M17,4.75a.25.25,0,1,1-.25.25A.25.25,0,0,1,17,4.75"></path>
    <path class="a" d="M20,4.75a.25.25,0,1,1-.25.25A.25.25,0,0,1,20,4.75"></path>
    <rect class="a" x="0.5" y="2.5" width="23" height="19" rx="1" ry="1"></rect>
    <line class="a" x1="0.5" y1="7.5" x2="23.5" y2="7.5"></line>
  </g>
</svg>

<style lang="scss">
  @use "sass:map";
  @use "$lib/styles" as *;

  .a {
    stroke: map.get($theme, 'tokens', 'text-color');
  }
</style>