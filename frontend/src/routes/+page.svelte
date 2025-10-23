<!-- src/routes/+page.svelte -->
<script>
  import Navbar from '$lib/components/Navbar.svelte';
  import ArticleCard from '$lib/components/ArticleCard.svelte'; //  修正导入
  import Footer from '$lib/components/Footer.svelte';

  // 固定的首页文章数据（静态门面）
  const homepageArticles = [
    {
      avatar: '/src/assets/images/doraemon1.png',
      title: 'Terrible Semester with Hard Work',
      author: 'Steven Shi',
      authorAvatar: '/src/assets/images/avatar-stevenshi.png',
      excerpt: 'This semester have so much hard work which from COMPSCI 718 and COMPSCI719 TAT...',
      likes: 86,
      comments: 5
    },
    {
      avatar: '/src/assets/images/doraemon2.png',
      title: 'Journey to the Art World width Monet',
      author: 'Leo Mo-yung',
      authorAvatar: '/src/assets/images/avatar-leo.png',
      excerpt: 'Have you seen this genuine Monet painting of the black cat? I visited it recently and I am sure it must have been painted by Monet himself',
      likes: 100,
      comments: 8
    },
    {
      avatar: '/src/assets/images/doraemon3.png',
      title: 'Take a Photo of two Interesting Cats',
      author: 'Zhongwei Zhang',
      authorAvatar: '/src/assets/images/avatar-zhongwei.png',
      excerpt: 'I recently took a photo of an interesting big orange cat. I like its intelligent eyes and the tilt of its head',
      likes: 92,
      comments: 3
    },
    {
      avatar: '/src/assets/images/doraemon4.png',
      title: 'Planning for  Lazy Days of  Vacation',
      author: 'Xuan Zeng',
      authorAvatar: '/src/assets/images/avatar-xuan.png',
      excerpt: 'When I finish my exams I am going to lie in bed like this cat eating snacks and playing games I am really looking forward to this vacati easy!',
      likes: 81,
      comments: 6
    }
  ];
</script>

<Navbar />

<main class="home-main">
  <div class="articles-grid">
    {#each homepageArticles as article}
      <ArticleCard {article} />
    {/each}
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
</style>