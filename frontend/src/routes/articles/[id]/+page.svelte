<script>
  import ArticleDetailCard from "$lib/components/article/ArticleDetailCard.svelte";
  import SidebarAuthor from "$lib/components/article/SidebarAuthor.svelte";
  import SidebarRecommend from "$lib/components/article/SidebarRecommend.svelte";
  import CommentsList from "$lib/components/comment/CommentsList.svelte";

  export let data;
  const { article } = data;
  const SIDEBAR_W = 400;
  
  console.log('Article page loaded:', article.title);
  console.log('Current article ID:', article.id);
</script>

<div class="grid" style={`grid-template-columns:minmax(0,1fr) ${SIDEBAR_W}px;`}>
  <main class="main">
    <ArticleDetailCard
      title={article.title}
      text={article.content}
      images={article.images}
      date={article.date}
      authorName={article.author.name}
      articleId={article.id}
      initialLikeCount={article.likeCount}
      tags={article.tags}
    />

    <CommentsList articleId={article.id} articleAuthorId={article.userId} />
  </main>

  <aside class="aside">
    <SidebarAuthor name={article.author.name} avatar={article.author.avatar} />
    <SidebarRecommend articleId={article.id} />
  </aside>
</div>

<style>
  .grid {
    display: grid;
    gap: 32px;
    grid-template-columns: minmax(auto, 750px) minmax(auto, 380px);
    padding-left: 80px;
    padding-right: 20px;
  }

  .main {
    width: 100%;
    min-width: 300px;
    display: flex;
    flex-direction: column;
    gap: 8px; /* 进一步减少文章和评论之间的间距 */
  }

  .aside {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    min-width: 280px;
  }

  @media (max-width: 1200px) {
    .grid {
      grid-template-columns: 1fr !important;
      padding-left: 40px;
      padding-right: 40px;
      max-width: 800px; /* 限制最大宽度，增加留白 */
      margin: 0 auto; /* 居中显示 */
    }

    .main {
      max-width: 100%;
    }

    .aside {
      order: 2;
    }
  }

  /* 更小屏幕的响应式调整 */
  @media (max-width: 768px) {
    .grid {
      padding-left: 20px;
      padding-right: 20px;
      max-width: 100%;
    }
  }
</style>
