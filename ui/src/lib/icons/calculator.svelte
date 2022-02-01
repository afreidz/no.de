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
    <title>accounting-calculator</title>
    <rect class="a" x="4.004" y="0.5" width="16" height="23" rx="1" ry="1"></rect>
    <line class="a" x1="16.004" y1="3.5" x2="16.004" y2="4.5"></line>
    <line class="a" x1="11.004" y1="19.5" x2="16.504" y2="19.5"></line>
    <path class="a" d="M8,19.25a.25.25,0,1,1-.25.25A.25.25,0,0,1,8,19.25"></path>
    <path class="a" d="M8,15.25a.25.25,0,1,1-.25.25A.25.25,0,0,1,8,15.25"></path>
    <path class="a" d="M12,15.25a.25.25,0,1,1-.25.25.25.25,0,0,1,.25-.25"></path>
    <path class="a" d="M16,15.25a.25.25,0,1,1-.25.25.25.25,0,0,1,.25-.25"></path>
    <path class="a" d="M8,11.25a.25.25,0,1,1-.25.25A.25.25,0,0,1,8,11.25"></path>
    <path class="a" d="M12,11.25a.25.25,0,1,1-.25.25.25.25,0,0,1,.25-.25"></path>
    <path class="a" d="M16,11.25a.25.25,0,1,1-.25.25.25.25,0,0,1,.25-.25"></path>
    <line class="a" x1="4.004" y1="7.5" x2="20.004" y2="7.5"></line>
  </g>
</svg>

<style lang="scss">
  @use "sass:map";
  @use "$lib/styles" as *;

  .a {
    stroke: map.get($theme, 'colors', 'highlights', 'rosewater');
  }
</style>
