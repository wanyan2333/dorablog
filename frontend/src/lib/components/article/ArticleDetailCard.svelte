<script>
  import { onMount } from 'svelte';
  import ImageGrid from './ImageGrid.svelte';
  import { api } from '../../api.js';

  export let title = '';
  export let text = '';
  export let images = [];
  export let date = '';
  export let authorName = '';
  export let articleId = null;
  export let initialLikeCount = 0;
  export let tags = [];

  import likeIcon from '../../../assets/images/like-icon.png';
  
  let liked = false;
  let likeCount = initialLikeCount;
  let isLoading = false;

  // Check if user has liked this article on mount
  onMount(async () => {
    if (articleId) {
      try {
        const response = await fetch(`http://localhost:3000/api/articles/${articleId}/liked`);
        if (response.ok) {
          const data = await response.json();
          liked = data.liked;
        }
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    }
  });

  // Toggle like/unlike
  async function handleLike() {
    if (!articleId || isLoading) return;
    
    isLoading = true;
    
    try {
      const response = await fetch(`http://localhost:3000/api/articles/like/${articleId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        liked = data.liked;
        likeCount = data.likeCount;
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      isLoading = false;
    }
  }

  // Get tag color
  function getTagColor(colorName) {
    const colors = {
      'blue': '#3b82f6',
      'green': '#10b981', 
      'orange': '#f59e0b',
      'purple': '#8b5cf6',
      'red': '#ef4444',
      'yellow': '#eab308',
      'cyan': '#06b6d4',
      'pink': '#ec4899',
      'magenta': '#d946ef',
      'gray': '#6b7280'
    };
    return colors[colorName] || colors.gray;
  }
</script>

<section class="card">
  <button 
    class="like-btn" 
    class:liked={liked}
    class:loading={isLoading}
    on:click={handleLike}
    disabled={isLoading}
    aria-label={liked ? 'Unlike' : 'Like'}>
    <img src={likeIcon} alt="like" />
    {#if likeCount > 0}
      <span class="like-count">{likeCount}</span>
    {/if}
  </button>

  <h1 class="title">{title}</h1>
  <div class="meta-line">
    <p class="meta">By <strong>{authorName}</strong> · {date}</p>
    {#if tags && tags.length > 0}
      <div class="tags">
        {#each tags as tag}
          <span class="tag" style="background-color: {getTagColor(tag.color)}">
            {tag.tag}
          </span>
        {/each}
      </div>
    {/if}
  </div>

  <article class="body">{@html text}</article>

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
    min-width: 36px;
    height: 36px;
    padding: 0 8px;
    border: 0;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .like-btn img {
    width: 20px;
    height: 20px;
    display: block;
    transition: transform 0.3s ease;
  }

  .like-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  }

  .like-btn:hover img {
    transform: scale(1.1);
  }

  .like-btn.liked {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  .like-btn.liked img {
    filter: brightness(0) invert(1);
    transform: scale(1.2);
  }

  .like-btn.liked:hover {
    box-shadow: 0 8px 28px rgba(102, 126, 234, 0.5);
  }

  .like-btn.loading {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .like-btn:disabled {
    cursor: not-allowed;
  }

  .like-count {
    font-size: 1.05rem;
    font-weight: 600;
    color: #333;
    transition: color 0.3s ease;
  }

  .like-btn.liked .like-count {
    color: #fff;
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

  .meta-line {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0 4px 12px;
    flex-wrap: wrap;
  }

  .meta {
    margin: 0;
    color: #3b5a96;
    font-size: 0.95rem;
    opacity: 0.9;
  }

  .tags {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .tag {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    color: white;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .body {
    color: #123;
    line-height: 1.8;
    margin-bottom: 12px;
  }

  /* Style for HTML content from TinyMCE */
  .body :global(p) {
    margin-bottom: 1em;
  }

  .body :global(h1),
  .body :global(h2),
  .body :global(h3),
  .body :global(h4),
  .body :global(h5),
  .body :global(h6) {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    font-weight: 700;
    color: #0f2a66;
  }

  .body :global(ul),
  .body :global(ol) {
    margin-left: 1.5em;
    margin-bottom: 1em;
  }

  .body :global(li) {
    margin-bottom: 0.5em;
  }

  .body :global(strong) {
    font-weight: 700;
  }

  .body :global(em) {
    font-style: italic;
  }

  .body :global(a) {
    color: #667eea;
    text-decoration: underline;
  }

  .body :global(a:hover) {
    color: #764ba2;
  }

  .body :global(blockquote) {
    border-left: 4px solid #667eea;
    padding-left: 1em;
    margin: 1em 0;
    font-style: italic;
    color: #555;
  }

  .body :global(code) {
    background: #f5f5f5;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: monospace;
    font-size: 0.9em;
  }

  .body :global(pre) {
    background: #f5f5f5;
    padding: 1em;
    border-radius: 5px;
    overflow-x: auto;
    margin: 1em 0;
  }

  .body :global(pre code) {
    background: none;
    padding: 0;
  }

  .images {
    margin-top: 6px;
  }
</style>
