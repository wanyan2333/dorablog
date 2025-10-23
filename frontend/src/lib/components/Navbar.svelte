<script>
  import { goto } from '$app/navigation';
</script>

<nav class="navbar">
  <div class="nav-container">
    <div class="logo">
      <img src="/src/assets/images/bell.png" alt="DoraBlog Logo" class="logo-image" />
      <span class="logo-text">DoraBlog</span>
    </div>
    
    <div class="nav-links">
      <button class="nav-link" on:click={() => goto('/')}><span>Home</span></button>
      <button class="nav-link" on:click={() => goto('/articles')}><span>Articles</span></button>
      <button class="nav-link" on:click={() => goto('/favorites')}><span>Favorites</span></button>
      <!-- <button class="nav-link" on:click={() => goto('/new-article')}><span>New Article</span></button> -->
    </div>
    
    <div class="nav-actions">
      <button class="add-button" on:click={() => goto('/new-article')}>
        <img src="/src/assets/images/NewArticles_icon.svg" alt="New Article" class="add-icon" />
      </button>
      <button class="search-button">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button class="login-button">Log in</button>
    </div>
  </div>
</nav>

<style>
.navbar {
  background-color: #d0eaff; /* 匹配设计图的淡蓝色 */
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%; /* 确保占满整个页面宽度 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  height: 60px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: #0066cc;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  color: #0066cc;
  padding: 0.5rem 0;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: #003399;
}

.nav-actions {
  display: flex;
  gap: 0.5rem; /* 减小间距，让图标更靠近 */
  align-items: center;
}

.add-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  transition: transform 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-button:hover {
  transform: scale(1.1);
}

/* 调整新文章图标大小和颜色 */
.add-icon {
  width: 60px;
  height: 60px;
  object-fit: contain;
  filter: brightness(0) saturate(100%) invert(27%) sepia(98%) saturate(1419%) hue-rotate(184deg) brightness(95%) contrast(92%); /* 调整为与搜索图标相同的蓝色 */
}

.search-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #0066cc;
  padding: 0.5rem;
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-button:hover {
  color: #003399;
}

.login-button {
  background-color: #ffcc00;
  color: #0066cc;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-left: 0.5rem; /* 给登录按钮一些左边距 */
}

.login-button:hover {
  background-color: #e6b800;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    height: auto;
    padding: 1rem;
    gap: 1rem;
  }
  
  .nav-links {
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .nav-link {
    font-size: 0.9rem;
  }
  
  .nav-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>