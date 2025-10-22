<script>
  export let article = {
    avatar: '/images/doraemon1.png',
    title: 'Sample Article',
    author: 'Steven Shi',
    authorAvatar: '/images/avatar-placeholder.png',
    excerpt: 'This semester have so much hard work which from COMPSCI...',
    likes: 86,
    comments: 5
  };
</script>

<div class="article-card">
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
    
    <!-- 点赞按钮 - 固定在左下角 -->
    <div class="like-container">
      <span class="like">
        <img src='/src/assets/images/like-icon.png' alt="Like" />
        {article.likes}
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
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  width: 250px;
  max-width: 100%;
  position: relative;
  min-height: 400px; /* 拉长卡片 */
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
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
  -webkit-box-orient: vertical;
}

/* 点赞容器 - 固定在左下角 */
.like-container {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.9rem;
  color: #0066cc;
}

.like {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  cursor: pointer;
}

.like:hover {
  color: #003399;
}
.like img {
  width: 20px;
  height: 20px;
} 
</style>