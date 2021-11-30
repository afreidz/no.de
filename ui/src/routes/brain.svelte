<main>
  <input type="text" placeholder="🧠">
</main>

<style>
  @import '$lib/styles';

  main {
    flex: 1;
    display: flex;
    font-weight: 400;
    font-size: 10rem;
    align-items: center;
    justify-content: center;
    color: var(--text-color);
    background: var(--panel-background);
    font-family: "Poppins", sans-serif;
  }

  input {
    width: 60%;
    border-bottom: 2px solid #000;
  }
</style>