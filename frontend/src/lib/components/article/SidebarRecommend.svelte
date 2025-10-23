<script>
  export let title = 'You may also like';
</script>

<section class="card">
  <div class="title">{title}</div>
  <div class="placeholder">Coming soon…</div>
</section>

<style>
  .card {
    background: rgba(255, 255, 255, 0.92);
    border-radius: 16px;
    box-shadow: 0 8px 26px rgba(0, 0, 0, 0.08);
    padding: 14px;
  }

  .title {
    color: #103066;
    font-weight: 700;
    margin-bottom: 6px;
  }

  .placeholder {
    color: #678;
    font-size: 0.92rem;
    opacity: 0.9;
    border: 1.5px dashed rgba(120, 150, 200, 0.45);
    border-radius: 10px;
    padding: 12px;
    min-height: 240px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
