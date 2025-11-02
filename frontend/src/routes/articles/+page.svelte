<script>
  import { onMount } from 'svelte';
  import { flip } from 'svelte/animate'; // 导入 flip 动画
  import { fade } from 'svelte/transition'; // 导入 fade 过渡效果
  import { goto } from '$app/navigation';
  import { getArticles } from '$lib/api.js';
  import ArticleCard from '$lib/components/ArticleCard.svelte';
  import { userStore } from '$lib/session.js';

  // 文章数据
  let allArticles = [];
  let displayedArticles = [];
  let loading = true;
  let isRefreshing = false; // 用于刷新时的加载状态（不会完全替换页面）
  let error = null;

  // 搜索、排序和筛选状态
  let searchKeyword = '';
  let sortBy = 'date'; // 'date', 'title', 'username'
  let sortOrder = 'desc'; // 'asc' or 'desc'
  let selectedTag = ''; // 选中的标签
  let availableTags = []; // 所有可用标签
  let showMyLikes = false; // 是否只显示我点赞的文章

  // 分页状态
  let currentPage = 1;
  let pageSize = 6; // 每页显示6篇文章

  // 搜索防抖定时器
  let searchTimeout;
  
  // 用户登录状态
  $: isLoggedIn = $userStore !== null;

  // 加载所有文章和标签
  onMount(async () => {
    await loadTags();
    await loadArticles(true); // 初始加载
  });

  // 加载所有标签
  async function loadTags() {
    try {
      const response = await fetch('http://localhost:3000/api/articles/tags');
      if (response.ok) {
        availableTags = await response.json();
      }
    } catch (err) {
      console.error('Error loading tags:', err);
    }
  }

  // 加载文章（支持标签筛选和"我的点赞"筛选）
  async function loadArticles(isInitialLoad = false) {
    try {
      // 初始加载时显示全屏loading，刷新时使用小的刷新指示器
      if (isInitialLoad) {
        loading = true;
      } else {
        isRefreshing = true;
      }
      error = null;
      
      let url = 'http://localhost:3000/api/articles';
      
      // 如果显示"我的点赞"
      if (showMyLikes) {
        url = 'http://localhost:3000/api/articles/liked';
      } else if (selectedTag) {
        // 否则如果有选中的标签，添加tag参数
        url += `?tag=${encodeURIComponent(selectedTag)}`;
      }
      
      const response = await fetch(url, {
        credentials: 'include' // 添加认证信息（用于"我的点赞"）
      });
      
      if (!response.ok && showMyLikes && response.status === 401) {
        // 未登录时访问"我的点赞"
        error = 'Please log in to view your liked articles.';
        allArticles = [];
        displayedArticles = [];
        loading = false;
        isRefreshing = false;
        return;
      }
      
      const articles = await response.json();
      
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
      isRefreshing = false;
    } catch (err) {
      console.error('Error loading articles:', err);
      error = 'Failed to load articles. Please try again.';
      loading = false;
      isRefreshing = false;
    }
  }

  // 搜索功能（在已筛选的文章中搜索）
  async function performSearch() {
    if (!searchKeyword.trim() && !selectedTag) {
      // 如果搜索框为空且没有选标签，重新加载所有文章
      await loadArticles();
      return;
    }

    if (!searchKeyword.trim()) {
      // 如果只有标签筛选，没有搜索关键词，重新加载该标签的文章
      await loadArticles();
      return;
    }

    // 如果有搜索关键词，在当前显示的文章中进行客户端搜索
    // 这样可以叠加标签筛选和搜索功能
    const keyword = searchKeyword.toLowerCase();
    displayedArticles = allArticles.filter(article => {
      return article.title.toLowerCase().includes(keyword) ||
             article.content.toLowerCase().includes(keyword) ||
             article.author.toLowerCase().includes(keyword) ||
             (article.authorUsername && article.authorUsername.toLowerCase().includes(keyword));
    });
    sortArticles();
  }
  
  // 标签筛选变化时重新加载文章
  async function handleTagChange() {
    searchKeyword = ''; // 清空搜索框
    showMyLikes = false; // 关闭"我的点赞"筛选
    await loadArticles();
  }
  
  // 切换"我的点赞"筛选
  async function toggleMyLikes() {
    showMyLikes = !showMyLikes;
    searchKeyword = ''; // 清空搜索框
    selectedTag = ''; // 清空标签筛选
    await loadArticles();
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

  // 计算总页数
  $: totalPages = Math.ceil(displayedArticles.length / pageSize);

  // 当筛选条件变化时，重置到第一页
  $: if (searchKeyword !== undefined || selectedTag !== undefined || sortBy || sortOrder) {
    if (currentPage > totalPages && totalPages > 0) {
      currentPage = 1;
    }
  }

  // 分页导航函数
  function goToPage(page) {
    if (page >= 1 && page <= totalPages) {
      currentPage = page;
      // 滚动到页面顶部
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function nextPage() {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }

  function prevPage() {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }

  // 计算当前页显示的文章
  $: paginatedArticles = displayedArticles.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // 准备显示的文章卡片数据（使用分页后的文章）
  $: articleCards = paginatedArticles.map(article => ({
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
    <!-- 我的点赞按钮（最左边） -->
    {#if isLoggedIn}
      <button 
        class="my-likes-btn" 
        class:active={showMyLikes}
        on:click={toggleMyLikes}
        title={showMyLikes ? "Show all articles" : "Show my liked articles"}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill={showMyLikes ? "currentColor" : "none"}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        {showMyLikes ? 'My Likes' : 'My Likes'}
      </button>
    {/if}

    <!-- 标签筛选 -->
    <div class="filter-container">
      <label for="tag-filter" class="filter-label">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="vertical-align: middle; margin-right: 4px;">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <line x1="7" y1="7" x2="7.01" y2="7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Tag:
      </label>
      <select 
        id="tag-filter" 
        bind:value={selectedTag} 
        on:change={handleTagChange}
        class="tag-select"
        disabled={showMyLikes}
      >
        <option value="">All Tags</option>
        {#each availableTags as tag}
          <option value={tag.tag}>{tag.tag} ({tag.count})</option>
        {/each}
      </select>
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

    <!-- 搜索框（最右边） -->
    <div class="search-container">
      <div class="search-input-wrapper">
        <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" 
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <input
          type="text"
          bind:value={searchKeyword}
          placeholder="Search articles..."
          class="search-input"
          disabled={showMyLikes}
        />
        {#if searchKeyword}
          <button class="clear-btn" on:click={() => searchKeyword = ''} aria-label="Clear search">
            ×
          </button>
        {/if}
      </div>
    </div>
  </div>

  <!-- 结果信息和刷新指示器 -->
  <div class="results-info">
    <div class="results-text">
      {#if showMyLikes}
        <p>Showing <strong>{displayedArticles.length}</strong> article{displayedArticles.length !== 1 ? 's' : ''} you liked ❤️</p>
      {:else if searchKeyword && selectedTag}
        <p>Found <strong>{displayedArticles.length}</strong> article{displayedArticles.length !== 1 ? 's' : ''} in tag "<em>{selectedTag}</em>" matching "<em>{searchKeyword}</em>"</p>
      {:else if searchKeyword}
        <p>Found <strong>{displayedArticles.length}</strong> article{displayedArticles.length !== 1 ? 's' : ''} matching "<em>{searchKeyword}</em>"</p>
      {:else if selectedTag}
        <p>Showing <strong>{displayedArticles.length}</strong> article{displayedArticles.length !== 1 ? 's' : ''} in tag "<em>{selectedTag}</em>"</p>
      {:else}
        <p>Showing <strong>{displayedArticles.length}</strong> article{displayedArticles.length !== 1 ? 's' : ''}</p>
      {/if}
    </div>
    
    <!-- 小的刷新指示器 -->
    {#if isRefreshing}
      <div class="small-spinner" transition:fade={{ duration: 200 }}>
        <svg width="20" height="20" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" opacity="0.25"/>
          <path d="M12 2 A 10 10 0 0 1 22 12" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round">
            <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
          </path>
        </svg>
        <span>Updating...</span>
      </div>
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
    <div class="articles-grid" transition:fade={{ duration: 300 }}>
      {#each articleCards as article (article.id)}
        <div animate:flip={{ duration: 555 }}>
          <ArticleCard {article} />
        </div>
      {/each}
    </div>

    <!-- 分页导航 -->
    {#if totalPages > 1}
      <div class="pagination">
        <button 
          class="pagination-btn"
          class:disabled={currentPage === 1}
          on:click={prevPage}
          disabled={currentPage === 1}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Previous
        </button>

        <div class="pagination-pages">
          {#each Array(totalPages) as _, i}
            {#if i + 1 === 1 || i + 1 === totalPages || (i + 1 >= currentPage - 1 && i + 1 <= currentPage + 1)}
              <button
                class="pagination-number"
                class:active={currentPage === i + 1}
                on:click={() => goToPage(i + 1)}
              >
                {i + 1}
              </button>
            {:else if i + 1 === currentPage - 2 || i + 1 === currentPage + 2}
              <span class="pagination-ellipsis">...</span>
            {/if}
          {/each}
        </div>

        <button 
          class="pagination-btn"
          class:disabled={currentPage === totalPages}
          on:click={nextPage}
          disabled={currentPage === totalPages}
        >
          Next
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <div style="text-align: center; width: 100%;">
        <div class="pagination-info">
          Showing {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, displayedArticles.length)} of {displayedArticles.length} articles
        </div>
      </div>
    {/if}
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

  /* 标签筛选控制 */
  .filter-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: white;
    padding: 0.5rem 1rem;
    border-radius: 12px;
    border: 2px solid #e0e6ed;
    transition: all 0.3s ease;
  }

  .filter-container:focus-within {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .filter-label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #4a5568;
    display: flex;
    align-items: center;
    white-space: nowrap;
  }

  .tag-select {
    padding: 0.4rem 0.75rem;
    border: 1px solid #e0e6ed;
    border-radius: 8px;
    font-size: 0.9rem;
    color: #2d3748;
    background: white;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 140px;
  }

  .tag-select:hover {
    border-color: #667eea;
  }

  .tag-select:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
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

  /* 我的点赞按钮 */
  .my-likes-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    color: #667eea;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    white-space: nowrap;
  }

  .my-likes-btn svg {
    transition: all 0.3s ease;
  }

  .my-likes-btn:hover {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-color: #667eea;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  .my-likes-btn:hover svg {
    fill: white;
  }

  .my-likes-btn.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-color: #667eea;
    color: white;
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
  }

  .my-likes-btn.active svg {
    fill: white;
    animation: heartbeat 1.5s ease infinite;
  }

  @keyframes heartbeat {
    0%, 100% { transform: scale(1); }
    10%, 30% { transform: scale(1.1); }
    20%, 40% { transform: scale(0.95); }
  }
 
/* 结果信息 */
.results-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding: 0 0.25rem;
}

.results-text p {
  color: #7f8c8d;
  font-size: 0.95rem;
  margin: 0;
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

/* 小的刷新指示器 */
.small-spinner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #667eea;
  font-size: 0.9rem;
  animation: fadeIn 0.2s ease-in;
}

.small-spinner svg {
  color: #667eea;
}

.small-spinner span {
  font-weight: 500;
}

/* 暗色模式支持 */
[data-theme="dark"] .results-text p {
  color: #a0aec0;
}

[data-theme="dark"] .results-info strong {
  color: #e2e8f0;
}

[data-theme="dark"] .results-info em {
  color: #90cdf4;
}

[data-theme="dark"] .small-spinner {
  color: #90cdf4;
}

[data-theme="dark"] .small-spinner svg {
  color: #90cdf4;
}

  /* 文章网格 */
  .articles-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
    min-height: 600px;
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
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
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

  /* 分页样式 */
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.75rem;
    margin-top: 3rem;
    padding: 2rem 0;
    background: linear-gradient(to bottom, transparent, rgba(102, 126, 234, 0.03));
    border-radius: 12px;
  }

  .pagination-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 10px;
    color: white;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.25);
  }

  .pagination-btn:hover:not(.disabled) {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  .pagination-btn:active:not(.disabled) {
    transform: translateY(-1px);
  }

  .pagination-btn.disabled {
    background: linear-gradient(135deg, #cbd5e0 0%, #a0aec0 100%);
    cursor: not-allowed;
    box-shadow: none;
  }

  .pagination-pages {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0 0.5rem;
  }

  .pagination-number {
    min-width: 44px;
    height: 44px;
    padding: 0.5rem;
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    color: #4a5568;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.25s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }

  .pagination-number:hover {
    background: #f7fafc;
    border-color: #667eea;
    color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  }

  .pagination-number.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-color: #667eea;
    color: white;
    transform: scale(1.1);
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
  }

  .pagination-ellipsis {
    padding: 0 0.75rem;
    color: #a0aec0;
    font-weight: 700;
    font-size: 1.1rem;
  }

  .pagination-info {
    text-align: center;
    color: #718096;
    font-size: 0.95rem;
    font-weight: 500;
    margin-top: 1.25rem;
    padding: 0.75rem 1.5rem;
    background: rgba(102, 126, 234, 0.05);
    border-radius: 8px;
    display: inline-block;
  }

  /* 分页响应式 */
  @media (max-width: 768px) {
    .pagination {
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .pagination-btn {
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
    }

    .pagination-number {
      min-width: 36px;
      height: 36px;
      font-size: 0.875rem;
    }

    .pagination-info {
      width: 100%;
      margin-top: 1rem;
    }
  }

  /* 深色模式分页 */
  [data-theme="dark"] .pagination {
    background: linear-gradient(to bottom, transparent, rgba(102, 126, 234, 0.08));
  }

  [data-theme="dark"] .pagination-btn {
    /* 保持渐变色，深色模式下依然好看 */
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
  }

  [data-theme="dark"] .pagination-btn.disabled {
    background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
  }

  [data-theme="dark"] .pagination-number {
    background: #2d3748;
    border-color: #4a5568;
    color: #e2e8f0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }

  [data-theme="dark"] .pagination-number:hover {
    background: #4a5568;
    border-color: #667eea;
    color: #a3bffa;
  }

  [data-theme="dark"] .pagination-number.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-color: #667eea;
    color: white;
  }

  [data-theme="dark"] .pagination-ellipsis {
    color: #718096;
  }

  [data-theme="dark"] .pagination-info {
    color: #cbd5e0;
    background: rgba(102, 126, 234, 0.12);
  }
</style>