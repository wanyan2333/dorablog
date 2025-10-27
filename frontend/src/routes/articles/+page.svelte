<script>
  import { goto } from '$app/navigation';

  // Article titles for navigation
  const articles = [
    { id: 1, title: 'Getting Started with Web Development' },
    { id: 2, title: 'The Art of Photography' },
    { id: 3, title: 'Healthy Living: A Complete Guide' },
    { id: 4, title: 'Travel Adventures in Asia' },
    { id: 5, title: 'Mastering JavaScript in 2024' },
    { id: 6, title: 'The Future of Artificial Intelligence' },
    { id: 7, title: 'Cooking Basics: From Kitchen to Table' },
    { id: 8, title: 'Sustainable Living: Small Changes, Big Impact' },
    { id: 9, title: 'Fitness Journey: Building Strength and Endurance' },
    { id: 10, title: 'Digital Marketing Strategies for 2024' }
  ];
</script>

<div class="page">
  <h1 class="page-title">Article List</h1>
  <div class="article-grid">
    {#each articles as article}
      <button
        class="btn"
        on:click={() => goto(`/articles/${article.id}`)}>
        <span class="article-number">#{article.id}</span>
        <span class="article-title">{article.title}</span>
      </button>
    {/each}
  </div>
</div>

<style>
  .page {
    min-height: 60vh;
    padding: 40px 20px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .page-title {
    text-align: center;
    font-size: 2.5rem;
    color: var(--text-color, #2c3e50);
    margin-bottom: 2rem;
    font-weight: 700;
    transition: color 0.3s ease;
  }

  .article-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }

  .btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border: 0;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    cursor: pointer;
    font-weight: 600;
    letter-spacing: 0.3px;
    text-align: left;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  /* 深色模式下的按钮样式 */
  [data-theme="dark"] .btn {
    background: linear-gradient(135deg, #4c5f8c 0%, #5a3e73 100%);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
  }

  .btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  [data-theme="dark"] .btn:hover {
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
  }

  .article-number {
    font-size: 0.85rem;
    opacity: 0.8;
    font-weight: 500;
  }

  .article-title {
    font-size: 1.1rem;
    line-height: 1.4;
  }

  @media (max-width: 768px) {
    .article-grid {
      grid-template-columns: 1fr;
    }

    .page-title {
      font-size: 2rem;
    }
  }
</style>
