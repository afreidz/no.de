<script>
  let opacity = 0.5;

  export { opacity };
</script>

<svg width="100%" height="100%" class="wall" xmlns="http://www.w3.org/2000/svg">
  <defs>
  <pattern id="pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
      <g opacity={opacity}>
        <path d="M22.4985 31H22.5033L24.5 32L31 28.25V20.75L24.5 17L18 20.75V28.25L20.0015 29.5L24.5 25.5" class="poly-1"/>
        <path d="M22.4985 131H22.5033L24.5 132L31 128.25V120.75L24.5 117L18 120.75V128.25L20.0015 129.5L24.5 125.5" class="poly-2"/>
        <path d="M122.499 31H122.503L124.5 32L131 28.25V20.75L124.5 17L118 20.75V28.25L120.001 29.5L124.5 25.5" class="poly-3"/>
        <path d="M122.499 131H122.503L124.5 132L131 128.25V120.75L124.5 117L118 120.75V128.25L120.001 129.5L124.5 125.5" class="poly-4"/>
        <path d="M72.4985 81H72.5033L74.5 82L81 78.25V70.75L74.5 67L68 70.75V78.25L70.0015 79.5L74.5 75.5" class="poly-5"/>
        <path d="M172.499 81H172.503L174.5 82L181 78.25V70.75L174.5 67L168 70.75V78.25L170.001 79.5L174.5 75.5" class="poly-6"/>
        <path d="M72.4985 181H72.5033L74.5 182L81 178.25V170.75L74.5 167L68 170.75V178.25L70.0015 179.5L74.5 175.5" class="poly-7"/>
        <path d="M172.499 181H172.503L174.5 182L181 178.25V170.75L174.5 167L168 170.75V178.25L170.001 179.5L174.5 175.5" class="poly-8"/>
      </g>
    </pattern>
  </defs>
  <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern)"/>
</svg>

<style lang="scss">
  @use "sass:map";
  @use "$lib/styles" as *;

  path {
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .wall { background-color: map.get($theme, 'colors', 'black', '2'); }
  .poly-1 { fill: none; stroke: map.get($theme, 'colors', 'highlights', 'flamingo'); }
  .poly-2 { fill: none; stroke: map.get($theme, 'colors', 'highlights', 'mauve'); }
  .poly-3 { fill: none; stroke: map.get($theme, 'colors', 'highlights', 'red'); }
  .poly-4 { fill: none; stroke: map.get($theme, 'colors', 'highlights', 'yellow'); }
  .poly-5 { fill: none; stroke: map.get($theme, 'colors', 'highlights', 'green'); }
  .poly-6 { fill: none; stroke: map.get($theme, 'colors', 'highlights', 'blue'); }
  .poly-7 { fill: none; stroke: map.get($theme, 'colors', 'highlights', 'sky'); }
  .poly-8 { fill: none; stroke: map.get($theme, 'colors', 'highlights', 'lavender'); }
</style>
