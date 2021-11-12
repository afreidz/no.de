<nav>
  <slot/>
</nav>

<style>
  nav {
    display: flex;
    box-shadow: var(--panel-shadow);
    border-radius: var(--panel-radius);
    backdrop-filter: blur(var(--blur-radius));
    background-color: var(--panel-background);
  }
</style>