// Load article data from database by ID
export const load = async ({ params, fetch }) => {
  try {
    const response = await fetch(`http://localhost:3000/api/articles/${params.id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch article');
    }
    
    const articleData = await response.json();
    
    // Transform database data to match component expectations
    return {
      article: {
        id: articleData.id,
        title: articleData.title,
        content: articleData.content,
        date: articleData.date,
        
        // Header image (used as page background)
        headerImage: articleData.headerUrl || '/src/assets/images/fallback-bg.jpg',
        
        // Content images
        images: articleData.images || [],
        
        // Author information
        author: {
          name: articleData.authorRealname || articleData.authorUsername || 'Unknown',
          avatar: articleData.authorAvatar || '/src/assets/images/avatar-placeholder.jpg'
        },
        
        // Like count
        likeCount: articleData.likeCount || 0
      }
    };
  } catch (error) {
    console.error('Error loading article:', error);
    
    // Return fallback data if API fails
    return {
      article: {
        id: params.id,
        title: 'Article not found',
        content: 'Sorry, we could not load this article.',
        date: new Date().toISOString(),
        headerImage: '/src/assets/images/fallback-bg.jpg',
        images: [],
        author: {
          name: 'Unknown',
          avatar: '/src/assets/images/avatar-placeholder.jpg'
        },
        likeCount: 0
      }
    };
  }
};
