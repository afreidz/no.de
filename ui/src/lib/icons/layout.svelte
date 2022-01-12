{#if dir === 'ttb'}
  <svg viewBox="0 0 15 15" fill="{fill}">
    <rect x="1" y="1" width="13" height="3" rx="1"/>
    <rect x="1" y="11" width="13" height="3" rx="1"/>
    <rect x="1" y="6" width="13" height="3" rx="1"/>
  </svg>
{:else if dir === 'ltr'}
  <svg viewBox="0 0 15 15" fill="{fill}">
    <rect x="1" y="1" width="3" height="13" rx="1"/>
    <rect x="11" y="1" width="3" height="13" rx="1"/>
    <rect x="6" y="1" width="3" height="13" rx="1"/>
  </svg>
{/if}

<script>
  let dir = 'ttb';
  let fill = 'white';
  export { dir, fill };
</script>
