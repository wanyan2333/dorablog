<script>
  import { onMount } from 'svelte';
  import { flip } from 'svelte/animate'; // 导入 flip 动画
  import { goto } from '$app/navigation';
  import { getArticles } from '$lib/api.js';
  import ArticleCard from '$lib/components/ArticleCard.svelte';

  // 文章数据
  let allArticles = [];
  let displayedArticles = [];
  let loading = true;
  let error = null;

  // 搜索和排序状态
  let searchKeyword = '';
  let sortBy = 'date'; // 'date', 'title', 'username'
  let sortOrder = 'desc'; // 'asc' or 'desc'

  // 搜索防抖定时器
  let searchTimeout;

  // 加载所有文章
  onMount(async () => {
    await loadArticles();
  });

  async function loadArticles() {
    try {
      loading = true;
      error = null;
      const articles = await getArticles();
      
      // 处理文章数据
      allArticles = articles.map(article => ({
        id: article.id,
        title: article.title,
        content: article.content,
        author: article.authorRealName || article.authorUsername || 'Unknown',
        authorUsername: article.authorUsername,
        authorAvatar: article.authorAvatar || '/avatars/doraemon1.png',
        date: article.date,
        headerUrl: article.headerUrl,
        likes: article.likeCount || 0,
        comments: 0
      }));
      
      displayedArticles = [...allArticles];
      sortArticles();
      loading = false;
    } catch (err) {
      console.error('Error loading articles:', err);
      error = 'Failed to load articles. Please try again.';
      loading = false;
    }
  }

  // 搜索功能（使用后端API进行不区分大小写的搜索）
  async function performSearch() {
    if (!searchKeyword.trim()) {
      // 如果搜索框为空，显示所有文章
      displayedArticles = [...allArticles];
      sortArticles();
      return;
    }

    try {
      loading = true;
      const response = await fetch(`http://localhost:3000/api/articles/search?keyword=${encodeURIComponent(searchKeyword)}`);
      
      if (response.ok) {
        const results = await response.json();
        displayedArticles = results.map(article => ({
          id: article.id,
          title: article.title,
          content: article.content,
          author: article.authorRealName || article.authorUsername || 'Unknown',
          authorUsername: article.authorUsername,
          authorAvatar: article.authorAvatar || '/avatars/doraemon1.png',
          date: article.date,
          headerUrl: article.headerUrl,
          likes: article.likeCount || 0,
          comments: 0
        }));
        sortArticles();
      }
      loading = false;
    } catch (err) {
      console.error('Search error:', err);
      loading = false;
    }
  }

  // 排序功能
  function sortArticles() {
    displayedArticles = [...displayedArticles].sort((a, b) => {
      let compareResult = 0;

      switch (sortBy) {
        case 'title':
          // 按标题排序（不区分大小写）
          compareResult = a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
          break;
        case 'username':
          // 按用户名排序
          compareResult = (a.authorUsername || a.author).localeCompare(b.authorUsername || b.author, undefined, { sensitivity: 'base' });
          break;
        case 'date':
          // 按日期排序
          compareResult = new Date(a.date) - new Date(b.date);
          break;
        default:
          compareResult = new Date(a.date) - new Date(b.date);
      }

      return sortOrder === 'asc' ? compareResult : -compareResult;
    });
  }

  // 监听搜索输入变化（防抖500ms）
  $: {
    clearTimeout(searchTimeout);
    if (searchKeyword !== undefined) {
      searchTimeout = setTimeout(() => {
        performSearch();
      }, 500);
    }
  }

  // 监听排序变化
  $: if (sortBy || sortOrder) {
    sortArticles();
  }

  // 切换排序顺序
  function toggleSortOrder() {
    sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
  }

  // 处理图片URL
  function getImageUrl(url) {
    if (!url) return '/src/assets/images/article/header.png';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `http://localhost:3000${url}`;
  }

  // 准备显示的文章卡片数据
  $: articleCards = displayedArticles.map(article => ({
    id: article.id,
    avatar: getImageUrl(article.headerUrl),
    title: article.title,
    author: article.author,
    authorAvatar: article.authorAvatar,
    excerpt: article.content ? article.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...' : 'No content',
    likes: article.likes,
    comments: article.comments
  }));
</script>

<div class="articles-page">
  <div class="header-section">
    <h1 class="page-title">All Articles</h1>
    <p class="page-subtitle">Discover and explore articles from our community</p>
  </div>

  <!-- 搜索和排序控制栏 -->
  <div class="controls-bar">
    <!-- 搜索框 -->
    <div class="search-container">
      <div class="search-input-wrapper">
        <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" 
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <input
          type="text"
          bind:value={searchKeyword}
          placeholder="Search articles by title, content, or author..."
          class="search-input"
        />
        {#if searchKeyword}
          <button class="clear-btn" on:click={() => searchKeyword = ''} aria-label="Clear search">
            ×
          </button>
        {/if}
      </div>
    </div>

    <!-- 排序控制 -->
    <div class="sort-container">
      <label for="sort-by" class="sort-label">Sort by:</label>
      <select id="sort-by" bind:value={sortBy} class="sort-select">
        <option value="date">Date</option>
        <option value="title">Title</option>
        <option value="username">Author</option>
      </select>
      
      <button 
        class="sort-order-btn" 
        on:click={toggleSortOrder}
        aria-label="Toggle sort order"
        title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
      >
        {#if sortOrder === 'asc'}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19M12 5L6 11M12 5L18 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        {:else}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 19V5M12 19L6 13M12 19L18 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        {/if}
      </button>
    </div>
  </div>

  <!-- 结果信息 -->
  <div class="results-info">
    {#if searchKeyword}
      <p>Found <strong>{displayedArticles.length}</strong> article{displayedArticles.length !== 1 ? 's' : ''} matching "<em>{searchKeyword}</em>"</p>
    {:else}
      <p>Showing <strong>{displayedArticles.length}</strong> article{displayedArticles.length !== 1 ? 's' : ''}</p>
    {/if}
  </div>

  <!-- 文章列表 -->
  {#if loading}
    <div class="loading-container">
      <div class="spinner"></div>
      <p>Loading articles...</p>
    </div>
  {:else if error}
    <div class="error-container">
      <p class="error-message">{error}</p>
      <button class="retry-btn" on:click={loadArticles}>Retry</button>
    </div>
  {:else if displayedArticles.length === 0}
    <div class="no-results">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
        <path d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" 
              stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <h3>No articles found</h3>
      <p>
        {#if searchKeyword}
          Try adjusting your search terms or <button class="link-btn" on:click={() => searchKeyword = ''}>clear the search</button>
        {:else}
          Be the first to create an article!
        {/if}
      </p>
    </div>
  {:else}
    <div class="articles-grid">
      {#each articleCards as article (article.id)}
        <div animate:flip={{ duration: 555 }}>
          <ArticleCard {article} />
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .articles-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
    min-height: calc(100vh - 120px);
  }

  .header-section {
    text-align: center;
    margin-bottom: 2.5rem;
  }

  .page-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--text-color, #2c3e50);
    margin-bottom: 0.5rem;
    transition: color 0.3s ease;
  }

.page-subtitle {
  font-size: 1.1rem;
  color: #2c3e50; 
  margin: 0;
}
[data-theme="dark"] .articles-page .header-section .page-subtitle,
[data-theme="dark"] .page-subtitle {
  color: #ffffff !important; 
}

.dark .page-subtitle,
.dark-theme .page-subtitle {
  color: #ffffff !important;
}

  /* 搜索和排序控制栏 */
  .controls-bar {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    align-items: center;
  }

  .search-container {
    flex: 1;
    min-width: 300px;
  }

  .search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-icon {
    position: absolute;
    left: 1rem;
    color: #7f8c8d;
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    padding: 0.75rem 2.5rem 0.75rem 3rem;
    border: 2px solid #e0e6ed;
    border-radius: 12px;
    font-size: 0.95rem;
    transition: all 0.3s ease;
    background: white;
  }

  .search-input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .clear-btn {
    position: absolute;
    right: 0.75rem;
    background: #e0e6ed;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 1.2rem;
    color: #666;
    transition: all 0.2s ease;
  }

  .clear-btn:hover {
    background: #d0d6dd;
    transform: scale(1.1);
  }

  /* 排序控制 */
  .sort-container {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: white;
    padding: 0.5rem 1rem;
    border-radius: 12px;
    border: 2px solid #e0e6ed;
  }

  .sort-label {
    font-weight: 600;
    color: #2c3e50;
    font-size: 0.9rem;
  }

  .sort-select {
    padding: 0.5rem 2rem 0.5rem 0.75rem;
    border: 1px solid #d0d6dd;
    border-radius: 8px;
    font-size: 0.9rem;
    background: white;
    cursor: pointer;
    transition: all 0.2s ease;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.5rem center;
  }

  .sort-select:focus {
    outline: none;
    border-color: #667eea;
  }

  .sort-order-btn {
    background: #f8f9fa;
    border: 1px solid #d0d6dd;
    border-radius: 8px;
    padding: 0.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    color: #2c3e50;
  }

  .sort-order-btn:hover {
    background: #e9ecef;
    transform: translateY(-1px);
  }

 
/* 结果信息 */
.results-info {
  margin-bottom: 1.5rem;
  padding: 0 0.25rem;
}

.results-info p {
  color: #7f8c8d;
  font-size: 0.95rem;
}

.results-info strong {
  color: #2c3e50;
  font-weight: 600;
}

.results-info em {
  color: #667eea;
  font-style: normal;
  font-weight: 600;
}

/* 暗色模式支持 */
[data-theme="dark"] .results-info p {
  color: #a0aec0;
}

[data-theme="dark"] .results-info strong {
  color: #e2e8f0;
}

[data-theme="dark"] .results-info em {
  color: #90cdf4;
}

  /* 文章网格 */
  .articles-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  /* 加载状态 */
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    color: #7f8c8d;
  }

  .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid #e0e6ed;
    border-top-color: #667eea;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* 错误状态 */
  .error-container {
    text-align: center;
    padding: 4rem 2rem;
  }

  .error-message {
    color: #e74c3c;
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
  }

  .retry-btn {
    padding: 0.75rem 2rem;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .retry-btn:hover {
    background: #5568d3;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  /* 无结果状态 */
  .no-results {
    text-align: center;
    padding: 4rem 2rem;
    color: #7f8c8d;
  }

  .no-results svg {
    color: #d0d6dd;
    margin-bottom: 1rem;
  }

  .no-results h3 {
    font-size: 1.5rem;
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }

  .no-results p {
    font-size: 1rem;
    color: #7f8c8d;
  }

  .link-btn {
    background: none;
    border: none;
    color: #667eea;
    text-decoration: underline;
    cursor: pointer;
    font-size: inherit;
    padding: 0;
  }

  .link-btn:hover {
    color: #5568d3;
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .articles-page {
      padding: 1.5rem 1rem;
    }

    .page-title {
      font-size: 2rem;
    }

    .controls-bar {
      flex-direction: column;
      align-items: stretch;
    }

    .search-container {
      min-width: 100%;
    }

    .sort-container {
      justify-content: space-between;
    }

    .articles-grid {
      grid-template-columns: 1fr;
    }
  }

  /* 深色模式支持 */
  [data-theme="dark"] .search-input,
  [data-theme="dark"] .sort-container,
  [data-theme="dark"] .sort-select {
    background: rgba(26, 32, 44, 0.8);
    border-color: rgba(255, 255, 255, 0.1);
    color: #e2e8f0;
  }

  [data-theme="dark"] .search-icon,
  [data-theme="dark"] .sort-label {
    color: #a0aec0;
  }

  [data-theme="dark"] .clear-btn {
    background: rgba(255, 255, 255, 0.1);
    color: #e2e8f0;
  }

  [data-theme="dark"] .sort-order-btn {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
    color: #e2e8f0;
  }
</style>