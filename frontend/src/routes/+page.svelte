<!-- src/routes/+page.svelte -->
<script>
  import { onMount } from 'svelte';
  import ArticleCard from '$lib/components/ArticleCard.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { getArticles } from '$lib/api.js';

  // Dynamic article data
  let homepageArticles = [];
  let loading = true;
  let error = null;
  
  // Daily quote data
  let dailyQuote = {
    content: 'Daily quote loading...',
    author: ''
  };
  let quoteLoading = true;

  // Fetch articles when page loads
  onMount(async () => {
    // Fetch daily quote
    fetchDailyQuote();
    
    try {
      const articles = await getArticles();
      // Sort by likes descending, then take top 4
      const sortedArticles = articles.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
      homepageArticles = sortedArticles.slice(0, 4).map(article => {
        // Process image URLs, add server address if relative path
        const getImageUrl = (url) => {
          if (!url) return '/src/assets/images/article/header.png'; // Default header image
          if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
          }
          return `http://localhost:3000${url}`;
        };
        
        const articleImage = getImageUrl(article.headerUrl);
        
        console.log('Article:', article.title);
        console.log('Using image:', articleImage);
        
        return {
          id: article.id,
          avatar: articleImage,
          title: article.title,
          author: article.authorRealName || article.author, // Prefer real name
          authorAvatar: article.authorAvatar || '/src/assets/images/avatar-placeholder.png', // Use avatar path from database directly
          excerpt: article.content ? article.content.substring(0, 100) + '...' : 'No content',
          likes: article.likeCount || 0,
          comments: 0 // Set to 0 for now, can add comment count query later
        };
      });
      loading = false;
    } catch (err) {
      console.error('Failed to fetch articles:', err);
      error = err.message;
      loading = false;
    }
  });
  
  // Fetch daily quote function 
  async function fetchDailyQuote() {
    // Reset loading state on each call
    quoteLoading = true;
    
    try {
      let data = null;
      let response = null;
      
      try {
        // Primary: Quotable API
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
        console.log('Quotable API unavailable, trying other APIs');
      }
      
      try {
        // Alternative 1: Advice Slip API
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
        console.log('Advice Slip API unavailable, trying other APIs');
      }
      
      // If all fail, use default value
      throw new Error('All APIs are unavailable');
      
    } catch (err) {
      console.error('Failed to fetch daily quote:', err);
      dailyQuote = {
        content: 'The future belongs to those who believe in the beauty of their dreams.',
        author: '— Eleanor Roosevelt'
      };
    } finally {
      quoteLoading = false;
    }
  }
</script>

<main class="home-main">
  {#if loading}
    <div class="loading">
      <p>Loading articles...</p>
    </div>
  {:else if error}
    <div class="error">
      <p>Failed to load articles: {error}</p>
      <button on:click={() => window.location.reload()}>Reload</button>
    </div>
  {:else}
    <div class="articles-grid">
      {#each homepageArticles as article}
        <ArticleCard {article} />
      {/each}
    </div>
  {/if}
  
  <!-- Optimized daily quote section -->
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
      <!-- Add refresh button -->
      <button class="refresh-quote" on:click={fetchDailyQuote} aria-label="Get new quote">
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

/* Daily quote section optimization */
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

/* Refresh button style */
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

/* Loading animation */
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

/* Responsive design */
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
</style>