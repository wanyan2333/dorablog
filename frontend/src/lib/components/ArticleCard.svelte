<script>
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { userStore } from '$lib/session.js'; 
  
  export let article = {
    id: 1,
    avatar: '/images/doraemon1.png',
    title: 'Sample Article',
    author: 'Steven Shi',
    authorAvatar: '/images/avatar-placeholder.png',
    excerpt: 'This semester have so much hard work which from COMPSCI...',
    likes: 86,
    comments: 5
  };

  $: isLoggedIn = $userStore !== null;
  $: currentUser = $userStore;
  
  let commentCount = article.comments || 0;
  let likeCount = article.likes || 0;

  // 处理卡片点击跳转到文章详情页
  function handleCardClick() {
    goto(`/articles/${article.id}`);
  }

  // 获取评论数
  onMount(async () => {
    if (article.id) {
      try {
        const response = await fetch(`http://localhost:3000/api/comments/articles/${article.id}`);
        if (response.ok) {
          const comments = await response.json();
          commentCount = comments.length;
        }
      } catch (error) {
        console.error('Error loading comment count:', error);
      }
    }
  });

  // 添加点赞处理函数
  async function handleLikeClick(event) {
    event.stopPropagation();
    
    // 直接使用 isLoggedIn 变量判断是否登录
    if (!isLoggedIn) {
      alert('Please log in to like articles');
      return;
    }
    
    // 如果已登录，执行点赞逻辑
    try {
      const response = await fetch(`http://localhost:3000/api/articles/like/${article.id}`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        likeCount = result.likeCount;
      } else if (response.status === 401) {
        alert('You need to log in to like articles');
      } else {
        console.error('Failed to like article:', response.status);
      }
    } catch (error) {
      console.error('Error liking article:', error);
    }
  }
</script>

<div class="article-card" on:click={handleCardClick} role="button" tabindex="0" on:keydown={(e) => e.key === 'Enter' && handleCardClick()}>
  <!-- 主图 - 填满顶部区域 -->
  <div class="main-image-container">
    <img src={article.avatar} alt={article.title} class="main-image" />
  </div>
  
  <!-- 文章内容 -->
  <div class="content">
    <h3 class="title">{article.title}</h3>
    <div class="author-info">
      <img src={article.authorAvatar} alt="Author Avatar" class="author-avatar" />
      <p class="author">{article.author}</p>
    </div>
    <p class="excerpt">{article.excerpt}</p>
    
    <!-- 互动按钮 - 固定在左下角 -->
   <div class="interaction-container" on:click|stopPropagation>
      <span class="like" on:click={handleLikeClick}> <!-- 添加点击处理 -->
        <img src='/src/assets/images/like-icon.png' alt="Like" />
        {likeCount} <!-- 使用 likeCount 变量 -->
      </span>
      <span class="comment">
        <img src='/src/assets/images/comment.png' alt="Comment" />
        {commentCount}
      </span>
    </div>
  </div>
</div>

<style>
.article-card {
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  margin: 1rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.3s ease;
  width: 250px;
  max-width: 100%;
  position: relative;
  min-height: 400px; /* 拉长卡片 */
  cursor: pointer;
}

[data-theme="dark"] .article-card {
  background-color: rgba(26, 32, 44, 0.9);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

[data-theme="dark"] .article-card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
}

/* 主图容器 - 填满顶部区域 */
.main-image-container {
  width: 100%;
  height: 160px;
  overflow: hidden;
  border-radius: 12px;
  margin-bottom: 1rem;
  background-color: #d0eaff; /* 淡蓝色背景 */
  transition: background-color 0.3s ease;
}

[data-theme="dark"] .main-image-container {
  background-color: #2d3748; /* 深色背景 */
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 关键：确保图片填满容器 */
  display: block;
}

/* 文章内容样式 */
.content {
  text-align: left;
  background-color: transparent; /* 透明背景 */
  padding: 0;
}

.title {
  font-size: 1.1rem;
  font-weight: bold;
  color: #0066cc;
  margin: 0;
  line-height: 1.4;
  transition: color 0.3s ease;
}

[data-theme="dark"] .title {
  color: #63b3ed;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.2rem 0;
}

.author-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
}

.author {
  font-size: 0.8rem;
  color: #0066cc;
  margin: 0;
  font-style: italic;
  transition: color 0.3s ease;
}

[data-theme="dark"] .author {
  color: #63b3ed;
}

.excerpt {
  font-size: 0.9rem;
  color: #333;
  margin: 0.5rem 0;
  line-height: 1.4;
  text-align: left;
  padding: 0 0.5rem;
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  transition: color 0.3s ease;
}

[data-theme="dark"] .excerpt {
  color: #e2e8f0;
}

/* 互动按钮容器 - 固定在左下角 */
.interaction-container {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.9rem;
  color: #0066cc;
  transition: color 0.3s ease;
}

[data-theme="dark"] .interaction-container {
  color: #63b3ed;
}

.like, .comment {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  cursor: pointer;
  transition: color 0.3s ease;
}

.like:hover, .comment:hover {
  color: #003399;
}

[data-theme="dark"] .like:hover, 
[data-theme="dark"] .comment:hover {
  color: #90cdf4;
}

.like img, .comment img {
  width: 20px;
  height: 20px;
} 
</style>