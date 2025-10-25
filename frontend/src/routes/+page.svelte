<!-- src/routes/+page.svelte -->
<script>
  import { onMount } from 'svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import ArticleCard from '$lib/components/ArticleCard.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { getArticles } from '$lib/api.js';

  // 动态文章数据
  let homepageArticles = [];
  let loading = true;
  let error = null;


  // 页面加载时获取文章数据
  onMount(async () => {
    try {
      const articles = await getArticles();
      // 按点赞数量从大到小排序，然后取前4篇
      const sortedArticles = articles.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
      homepageArticles = sortedArticles.slice(0, 4).map(article => {
        // 直接使用数据库中的本地图片路径
        const articleImage = article.headerUrl || '/src/assets/images/doraemon1.png';
        
        console.log('文章:', article.title);
        console.log('使用图片:', articleImage);
        
        return {
          id: article.id,
          avatar: articleImage, // 直接使用数据库中的本地路径
          title: article.title,
          author: article.authorRealName || article.author, // 优先使用真实姓名
          authorAvatar: article.authorAvatar || '/src/assets/images/avatar-placeholder.png', // 直接使用数据库中的头像路径
          excerpt: article.content ? article.content.substring(0, 100) + '...' : '暂无内容',
          likes: article.likeCount || 0,
          comments: 0 // 暂时设为0，后续可以添加评论数量查询
        };
      });
      loading = false;
    } catch (err) {
      console.error('获取文章数据失败:', err);
      error = err.message;
      loading = false;
    }
  });
</script>

<Navbar />

<main class="home-main">
  {#if loading}
    <div class="loading">
      <p>正在加载文章...</p>
    </div>
  {:else if error}
    <div class="error">
      <p>加载文章失败: {error}</p>
      <button on:click={() => window.location.reload()}>重新加载</button>
    </div>
  {:else}
    <div class="articles-grid">
      {#each homepageArticles as article}
        <ArticleCard {article} />
      {/each}
    </div>
  {/if}
</main>

<Footer />

<style>
.home-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 确保每行四个卡片 */
  gap: 24px;
  margin-bottom: 32px;
  width: 100%; /* 确保占满容器宽度 */
  justify-content: center; /* 居中对齐 */
}

/* 响应式设计 - 在小屏幕上调整列数 */
@media (max-width: 1024px) {
  .articles-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .articles-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .articles-grid {
    grid-template-columns: 1fr;
  }
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error {
  color: #d32f2f;
}

.error button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #0066cc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.error button:hover {
  background-color: #0052a3;
}
</style>