<script>
  import ImageGrid from './ImageGrid.svelte';

  export let title = '';
  export let text = '';
  export let images = [];
  export let date = '';
  export let authorName = '';

  import likeIcon from '../../../assets/images/like-icon.png';
</script>

<section class="card">
  <button class="like-btn" aria-label="Like">
    <img src={likeIcon} alt="like" />
  </button>

  <h1 class="title">{title}</h1>
  <p class="meta">By <strong>{authorName}</strong> · {date}</p>

  <article class="body">{text}</article>

  {#if images && images.length}
    <div class="images">
      <ImageGrid images={images} />
    </div>
  {/if}
</section>

<style>
  .card {
    position: relative;
    background: rgba(255, 255, 255, 0.92);
    border-radius: 18px;
    box-shadow: 0 8px 26px rgba(0, 0, 0, 0.08);
    padding: 16px 18px 18px;
  }

  .like-btn {
    position: absolute;
    top: 12px;
    right: 14px;
    width: 36px;
    height: 36px;
    border: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
    display: grid;
    place-items: center;
    cursor: pointer;
    transition: transform 0.15s ease, filter 0.15s ease;
  }

  .like-btn img {
    width: 20px;
    height: 20px;
    display: block;
  }

  .like-btn:hover {
    transform: translateY(-1px);
    filter: brightness(1.05);
  }

  .title {
    margin: 0.25rem 4px 0.4rem;
    padding-right: 48px;
    line-height: 1.2;
    color: #0f2a66;
    font-weight: 800;
    font-size: 2rem;
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.6);
  }

  .meta {
    margin: 0 4px 12px;
    color: #3b5a96;
    font-size: 0.95rem;
    opacity: 0.9;
  }

  .body {
    color: #123;
    line-height: 1.8;
    white-space: pre-wrap;
    margin-bottom: 12px;
  }

  .images {
    margin-top: 6px;
  }
</style>
