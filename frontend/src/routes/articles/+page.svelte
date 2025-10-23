<script>
  import { goto } from '$app/navigation';

  // Example article slug for demo navigation
  const sampleSlug = 'journey-with-monet';
</script>

<div class="page">
  <button
    class="btn"
    on:click={() => goto(`/articles/${sampleSlug}`)}>
    Go to sample article
  </button>
</div>

<style>
  .page {
    min-height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
  }

  .btn {
    background: linear-gradient(180deg, #74a8ff, #4e86f7);
    color: #fff;
    border: 0;
    padding: 12px 18px;
    border-radius: 12px;
    box-shadow: 0 8px 20px rgba(78, 134, 247, 0.35);
    cursor: pointer;
    font-weight: 700;
    letter-spacing: 0.3px;
  }

  .btn:hover {
    filter: brightness(1.05);
  }
</style>
