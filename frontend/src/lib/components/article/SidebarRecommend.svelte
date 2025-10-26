<script>
  import { onMount } from 'svelte';
  import { goto, invalidateAll } from '$app/navigation';
  
  export let articleId = null;
  export let title = 'You may also like';
  
  let recommendations = [];
  let loading = true;
  let error = null;
  
  onMount(async () => {
    if (!articleId) return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/articles/${articleId}/recommendations?limit=5`);
      if (response.ok) {
        recommendations = await response.json();
        
        // 初始化文章状态
        recommendations.forEach(article => {
          article.isLoading = false;
          article.liked = false;
        });
        
        // 并行检查每篇文章的点赞状态
        const likePromises = recommendations.map(async (article) => {
          try {
            const likeResponse = await fetch(`http://localhost:3000/api/articles/${article.id}/liked`);
            if (likeResponse.ok) {
              const likeData = await likeResponse.json();
              article.liked = likeData.liked;
            }
          } catch (err) {
            console.error('Error checking like status for article', article.id, err);
          }
        });
        
        await Promise.all(likePromises);
      } else {
        error = 'Failed to load recommendations';
      }
    } catch (err) {
      console.error('Error loading recommendations:', err);
      error = 'Failed to load recommendations';
    } finally {
      loading = false;
    }
  });
  
  async function handleArticleClick(articleId) {
    // Force navigation with data refresh
    await goto(`/articles/${articleId}`, { 
      replaceState: false,
      noScroll: false,
      keepFocus: false,
      invalidateAll: true
    });
    
    // Force page refresh as fallback
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }

  async function handleLikeClick(articleId) {
    const article = recommendations.find(a => a.id === articleId);
    if (!article || article.isLoading) return;
    
    article.isLoading = true;
    
    try {
      const response = await fetch(`http://localhost:3000/api/articles/like/${articleId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        // 更新本地点赞状态和数量
        article.liked = result.liked;
        article.likeCount = result.likeCount;
        // 强制重新渲染
        recommendations = [...recommendations];
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      article.isLoading = false;
    }
  }

  // Get tag color (same as ArticleDetailCard)
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
  <div class="title">{title}</div>
  
  {#if loading}
    <div class="loading">
      <div class="spinner"></div>
      <span>Loading recommendations...</span>
    </div>
  {:else if error}
    <div class="error">
      <p>{error}</p>
    </div>
  {:else if recommendations.length === 0}
    <div class="placeholder">
      <p>No recommendations available</p>
    </div>
  {:else}
    <div class="recommendations">
      {#each recommendations as article}
        <div 
          class="recommendation-item" 
          role="button"
          tabindex="0"
          on:click={() => handleArticleClick(article.id)}
          on:keydown={(e) => e.key === 'Enter' && handleArticleClick(article.id)}
        >
          <div class="article-image">
            <img 
              src={article.headerUrl || '/src/assets/images/doraemon1.png'} 
              alt={article.title}
              loading="lazy"
            />
          </div>
          <div class="article-content">
            <h4 class="article-title">{article.title}</h4>
            <div class="article-meta-line">
              <p class="article-author">By {article.authorRealName || article.author}</p>
              {#if article.tags && article.tags.length > 0}
                <div class="article-tags">
                  {#each article.tags as tag}
                    <span class="article-tag" style="background-color: {getTagColor(tag.color)}">
                      {tag.tag}
                    </span>
                  {/each}
                </div>
              {/if}
            </div>
            <div class="article-actions">
              <button 
                class="like-btn" 
                class:liked={article.liked}
                class:loading={article.isLoading}
                on:click|stopPropagation={() => handleLikeClick(article.id)}
                disabled={article.isLoading}
                title="点赞"
              >
                <img src="/src/assets/images/like-icon.png" alt="like" />
                {#if article.likeCount > 0}
                  <span class="like-count">{article.likeCount}</span>
                {/if}
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
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
    margin-bottom: 12px;
  }

  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    color: #678;
  }

  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #103066;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 8px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .error {
    color: #d32f2f;
    text-align: center;
    padding: 20px;
  }

  .placeholder {
    color: #678;
    font-size: 0.92rem;
    opacity: 0.9;
    border: 1.5px dashed rgba(120, 150, 200, 0.45);
    border-radius: 10px;
    padding: 12px;
    min-height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .recommendations {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .recommendation-item {
    display: flex;
    gap: 10px;
    padding: 8px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;
  }

  .recommendation-item:hover {
    background: rgba(16, 48, 102, 0.05);
    border-color: rgba(16, 48, 102, 0.1);
    transform: translateY(-1px);
  }

  .article-image {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
  }

  .article-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .article-content {
    flex: 1;
    min-width: 0;
  }

  .article-title {
    font-size: 0.85rem;
    font-weight: 600;
    color: #103066;
    margin: 0 0 4px 0;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .article-author {
    font-size: 0.75rem;
    color: #678;
    margin: 0 0 4px 0;
  }


  .like-btn {
    min-width: 24px;
    height: 24px;
    padding: 0 4px;
    border: 0;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 3px 9px rgba(0, 0, 0, 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .like-btn img {
    width: 12px;
    height: 12px;
    display: block;
    transition: transform 0.3s ease;
  }

  .like-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
  }

  .like-btn:hover img {
    transform: scale(1.1);
  }

  .like-btn.liked {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-shadow: 0 3px 10px rgba(102, 126, 234, 0.4);
  }

  .like-btn.liked img {
    filter: brightness(0) invert(1);
    transform: scale(1.2);
  }

  .like-btn.liked:hover {
    box-shadow: 0 4px 14px rgba(102, 126, 234, 0.5);
  }

  .like-btn.loading {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .like-btn:disabled {
    cursor: not-allowed;
  }

  .like-count {
    font-size: 0.8rem;
    font-weight: 600;
    color: #333;
    transition: color 0.3s ease;
  }

  .like-btn.liked .like-count {
    color: #fff;
  }

  /* Article meta line styles */
  .article-meta-line {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
    flex-wrap: wrap;
  }

  .article-author {
    margin: 0;
    font-size: 0.75rem;
    color: #666;
    font-weight: 500;
  }

  .article-tags {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }

  .article-tag {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 8px;
    font-size: 0.6rem;
    font-weight: 600;
    color: white;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .article-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
</style>
