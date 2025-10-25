<script>
  // Layout shell for the article detail page
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';

  export let data;

  // Use article header image as full-page background
  const bg = data.article?.headerImage || '/src/assets/images/fallback-bg.jpg';
  const CONTENT_MAX = 1400;
  
  console.log('Layout loaded for article:', data.article?.title);
</script>

<Navbar />

<div class="page-wrap">
  <!-- Background image -->
  <img class="bg" src={bg} alt="article background" />

  <!-- Main content slot -->
  <div class="content-bound" style={`max-width:${CONTENT_MAX}px;`}>
    <slot />
  </div>
</div>

<Footer />

<style>
  .page-wrap {
    position: relative;
    min-height: 100vh;
    padding-top: 5px;
    overflow: hidden;
  }

  .bg {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: translateZ(0);
    z-index: -1;
  }

  .content-bound {
    position: relative;
    width: 100%;
    margin: 0 auto 60px;
    padding: 0 16px;
  }

  /* Optional translucent overlay for better text contrast */
  .page-wrap::before {
    content: '';
    position: fixed;
    inset: 0;
    background: rgba(255, 255, 255, 0.15);
    pointer-events: none;
    z-index: -1;
  }

  :global(html) {
    font-size: 15px;
  }

  :global(body) {
    line-height: 1.55;
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  }
</style>
