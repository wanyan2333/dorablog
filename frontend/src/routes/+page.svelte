<!-- src/routes/+page.svelte -->
<script>
  import { onMount } from 'svelte';
  import ArticleCard from '$lib/components/ArticleCard.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { getArticles } from '$lib/api.js';

  // 动态文章数据
  let homepageArticles = [];
  let loading = true;
  let error = null;

  // 每日一言数据
  let dailyQuote = {
    content: '正在加载每日一言...',
    author: ''
  };
  let quoteLoading = true;

  // 页面加载时获取文章数据
  onMount(async () => {
    // 获取每日一言
    fetchDailyQuote();
    
    try {
      const articles = await getArticles();
      // 按点赞数量从大到小排序，然后取前4篇
      const sortedArticles = articles.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
      homepageArticles = sortedArticles.slice(0, 4).map(article => {
        // 处理图片URL，如果是相对路径则添加服务器地址
        const getImageUrl = (url) => {
          if (!url) return '/src/assets/images/article/header.png'; // 默认头图
          if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
          }
          return `http://localhost:3000${url}`;
        };
        
        const articleImage = getImageUrl(article.headerUrl);
        
        console.log('文章:', article.title);
        console.log('使用图片:', articleImage);
        
        return {
          id: article.id,
          avatar: articleImage,
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
  
  // 获取每日一言函数
  async function fetchDailyQuote() {
    // 重置加载状态
    quoteLoading = true;
    
    try {
      let data = null;
      let response = null;
      
      try {
        // 主要：Quotable API
        response = await fetch('https://api.quotable.io/random?maxLength=120');
        if (response.ok) {
          data = await response.json();
          dailyQuote = {
            content: data.content,
            author: data.author ? `— ${data.author}` : ''
          };
          return;
        }
      } catch (e) {
        console.log('Quotable API 不可用，尝试其他 API');
      }
      
      try {
        // 备用：Advice Slip API
        response = await fetch('https://api.adviceslip.com/advice');
        if (response.ok) {
          const result = await response.json();
          data = result.slip;
          dailyQuote = {
            content: data.advice,
            author: ''
          };
          return;
        }
      } catch (e) {
        console.log('Advice Slip API 不可用，尝试其他 API');
      }
      
      // 如果所有 API 都失败，使用默认值
      throw new Error('所有 API 都不可用');
      
    } catch (err) {
      console.error('获取每日一言失败:', err);
      dailyQuote = {
        content: '未来属于那些相信自己梦想之美丽的人。',
        author: '— 埃莉诺·罗斯福'
      };
    } finally {
      quoteLoading = false;
    }
  }
</script>

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
  
  <!-- 每日一言部分 -->
  <div class="daily-quote-section">
    <div class="daily-quote-container">
      <div class="quote-icon">❝</div>
      <div class="daily-quote-content">
        {#if quoteLoading}
          <div class="quote-loading">
            <div class="skeleton-line"></div>
            <div class="skeleton-line short"></div>
          </div>
        {:else}
          <p class="quote-text">"{dailyQuote.content}"</p>
          {#if dailyQuote.author}
            <p class="quote-source">{dailyQuote.author}</p>
          {/if}
        {/if}
      </div>
      <!-- 刷新按钮 -->
      <button class="refresh-quote" on:click={fetchDailyQuote} aria-label="获取新名言">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
          <path d="M16 16h5v5"/>
        </svg>
      </button>
    </div>
  </div>
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
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 32px;
  width: 100%;
  justify-content: center;
}

/* 每日一言部分样式 */
.daily-quote-section {
  display: flex;
  justify-content: center;
  margin: 60px 0 40px 0;
  width: 100%;
}

.daily-quote-container {
  position: relative;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 32px 40px 32px 80px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.08),
    0 4px 12px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.5);
  max-width: 800px;
  width: 100%;
}

.quote-icon {
  position: absolute;
  left: 30px;
  top: 20px;
  font-size: 3rem;
  color: rgba(0, 0, 0, 0.15);
  font-family: serif;
  line-height: 1;
}

.daily-quote-content {
  text-align: center;
}

.quote-text {
  font-size: 1.25rem;
  line-height: 1.7;
  color: #333;
  margin: 0 0 12px 0;
  font-weight: 400;
  font-style: italic;
}

.quote-source {
  font-size: 1rem;
  color: #666;
  margin: 0;
  font-style: normal;
  font-weight: 500;
}

/* 刷新按钮样式 */
.refresh-quote {
  position: absolute;
  right: 20px;
  top: 20px;
  background: rgba(0, 0, 0, 0.05);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #666;
}

.refresh-quote:hover {
  background: rgba(0, 0, 0, 0.1);
  transform: rotate(90deg);
}

.refresh-quote:active {
  transform: rotate(180deg);
}

/* 加载动画 */
.quote-loading {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.skeleton-line {
  height: 1.4rem;
  width: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

.skeleton-line.short {
  width: 60%;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .articles-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .articles-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .daily-quote-container {
    padding: 24px 20px 24px 60px;
    margin: 0 16px;
  }
  
  .quote-icon {
    left: 20px;
    font-size: 2.5rem;
  }
  
  .quote-text {
    font-size: 1.1rem;
  }
  
  .quote-source {
    font-size: 0.95rem;
  }
  
  .refresh-quote {
    right: 15px;
    top: 15px;
    width: 32px;
    height: 32px;
  }
}

@media (max-width: 480px) {
  .articles-grid {
    grid-template-columns: 1fr;
  }
  
  .daily-quote-section {
    margin: 40px 0 30px 0;
  }
  
  .daily-quote-container {
    padding: 20px 16px 20px 50px;
    border-radius: 16px;
  }
  
  .quote-icon {
    left: 16px;
    font-size: 2rem;
    top: 16px;
  }
  
  .quote-text {
    font-size: 1rem;
    line-height: 1.6;
  }
  
  .quote-source {
    font-size: 0.9rem;
  }
  
  .skeleton-line {
    height: 1.2rem;
  }
  
  .refresh-quote {
    right: 12px;
    top: 12px;
    width: 28px;
    height: 28px;
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

/* 深色模式支持 */
[data-theme="dark"] .daily-quote-container {
  background: rgba(26, 32, 44, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

[data-theme="dark"] .quote-icon {
  color: rgba(255, 255, 255, 0.15);
}

[data-theme="dark"] .quote-text {
  color: #e2e8f0;
}

[data-theme="dark"] .quote-source {
  color: #94a3b8;
}

[data-theme="dark"] .refresh-quote {
  background: rgba(255, 255, 255, 0.1);
  color: #94a3b8;
}

[data-theme="dark"] .refresh-quote:hover {
  background: rgba(255, 255, 255, 0.15);
}

[data-theme="dark"] .skeleton-line {
  background: linear-gradient(90deg, #1a202c 25%, #2d3748 50%, #1a202c 75%);
  background-size: 200% 100%;
}
</style>