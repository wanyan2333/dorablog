<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { getArticleCommentCount } from '../api.js';

  export let article = {
    id: 1,
    avatar: '/images/doraemon1.png',
    title: 'Sample Article',
    author: 'Steven Shi',
    authorAvatar: '/images/avatar-placeholder.png',
    excerpt: 'This semester have so much hard work which from COMPSCI...',
    likes: 86,
    comments: 0
  };

  let commentCount = 0;

  // 组件挂载时获取评论数
  onMount(async () => {
    try {
      const data = await getArticleCommentCount(article.id);
      commentCount = data.count;
    } catch (error) {
      console.error('获取评论数失败:', error);
      commentCount = 0;
    }
  });

  // 处理卡片点击事件
  function handleCardClick() {
    goto(`/articles/${article.id}`);
  }

  // 处理点赞按钮点击事件（阻止事件冒泡）
  function handleLikeClick(event) {
    event.stopPropagation();
    // 这里可以添加点赞功能
    console.log('点赞文章:', article.id);
  }

  // 处理评论按钮点击事件（阻止事件冒泡）
  function handleCommentClick(event) {
    event.stopPropagation();
    // 直接跳转到文章详情页（评论区域）
    goto(`/articles/${article.id}#comments`);
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
    
    <!-- 底部互动区域 -->
    <div class="interaction-container">
      <!-- 点赞按钮 - 固定在左下角 -->
      <div class="like-container">
        <span class="like" on:click={handleLikeClick} on:keydown={(e) => e.key === 'Enter' && handleLikeClick(e)} role="button" tabindex="0" aria-label="点赞文章">
          <img src='/src/assets/images/like-icon.png' alt="Like" />
          {article.likes}
        </span>
      </div>
      
      <!-- 评论按钮 - 固定在右下角 -->
      <div class="comment-container">
        <span class="comment" on:click={handleCommentClick} on:keydown={(e) => e.key === 'Enter' && handleCommentClick(e)} role="button" tabindex="0" aria-label="查看评论">
          <img src='/src/assets/images/comment.png' alt="Comment" />
          {commentCount}
        </span>
      </div>
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
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  width: 250px;
  max-width: 100%;
  position: relative;
  min-height: 400px; /* 拉长卡片 */
  cursor: pointer;
  outline: none;
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.article-card:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

.article-card:active {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

/* 主图容器 - 填满顶部区域 */
.main-image-container {
  width: 100%;
  height: 160px;
  overflow: hidden;
  border-radius: 12px;
  margin-bottom: 1rem;
  background-color: #d0eaff; /* 淡蓝色背景 */
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
  height: calc(100% - 170px); /* 减去图片高度和margin */
  position: relative;
}

.title {
  font-size: 1.1rem;
  font-weight: bold;
  color: #0066cc;
  margin: 0;
  line-height: 1.4;
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
}

/* 互动容器 - 固定在底部 */
.interaction-container {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  right: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 点赞容器 */
.like-container {
  display: flex;
  align-items: center;
}

.like {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #0066cc;
}

.like:hover {
  color: #003399;
}

.like img {
  width: 20px;
  height: 20px;
}

/* 评论容器 */
.comment-container {
  display: flex;
  align-items: center;
}

.comment {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #0066cc;
}

.comment:hover {
  color: #003399;
}

.comment img {
  width: 20px;
  height: 20px;
}
</style>