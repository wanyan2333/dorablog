// Load article data from database by ID
export const load = async ({ params, fetch }) => {
  console.log('Loading article with ID:', params.id);
  
  try {
    const response = await fetch(`http://localhost:3000/api/articles/${params.id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch article');
    }
    
    const articleData = await response.json();
    console.log('Article data loaded:', articleData.title);
    
    // Helper function to get full image URL
    const getImageUrl = (url) => {
      if (!url) return '/src/assets/images/article/header.png'; // 默认头图
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      return `http://localhost:3000${url}`;
    };
    
    // Transform database data to match component expectations
    return {
      article: {
        id: articleData.id,
        title: articleData.title,
        content: articleData.content,
        date: articleData.date,
        
        // Header image (used as page background)
        headerImage: getImageUrl(articleData.headerUrl),
        
        // Content images
        images: articleData.images || [],
        
        // Author information
        author: {
          name: articleData.authorRealname || articleData.authorUsername || 'Unknown',
          avatar: articleData.authorAvatar || '/src/assets/images/avatar-placeholder.jpg'
        },
        
        // Like count
        likeCount: articleData.likeCount || 0,
        
        // Tags
        tags: articleData.tags || []
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
        headerImage: '/src/assets/images/article/header.png', // 默认头图
        images: [],
        author: {
          name: 'Unknown',
          avatar: '/src/assets/images/avatar-placeholder.jpg'
        },
        likeCount: 0,
        tags: []
      }
    };
  }
};
