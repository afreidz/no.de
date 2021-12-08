<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <g transform="matrix(2,0,0,2,0,0)">
    <path
      d="M5.791,14.7S16.736,3.722,17.444,3.015c.785-.786,3.318-1.378,4.578-1.632a.5.5,0,0,1,.589.589c-.254,1.26-.846,3.792-1.632,4.578L9.311,18.217Z"
      fill="none" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M7.201 13.274L10.727 16.803" fill="none" stroke-linecap="round" stroke-linejoin="round">
    </path>
    <path
      d="M14.615,12.915a21.771,21.771,0,0,1-.353,4.6,6.82,6.82,0,0,1-1.416,2.122L10.329,22.15a.5.5,0,0,1-.851-.412l.489-4.176"
      fill="none" stroke-linecap="round" stroke-linejoin="round"></path>
    <path
      d="M11.079,9.379A21.859,21.859,0,0,0,6.454,9.7a6.79,6.79,0,0,0-2.092,1.445l-2.51,2.509a.5.5,0,0,0,.415.85l4.2-.514"
      fill="none" stroke-linecap="round" stroke-linejoin="round"></path>
    <path
      d="M7.19,18.217c.708.707.413,1.709-.353,2.476-.717.716-3.435,1.533-4.826,1.915A.5.5,0,0,1,1.4,22c.378-1.395,1.187-4.121,1.9-4.839.777-.776,1.769-1.06,2.476-.353"
      fill="none" stroke-linecap="round" stroke-linejoin="round"></path>
  </g>
</svg>

<style lang="scss">
  @use "sass:map";
  @use "$lib/styles" as *;

  path {
    stroke: map.get($theme, 'tokens', 'text-color');
  }
</style>