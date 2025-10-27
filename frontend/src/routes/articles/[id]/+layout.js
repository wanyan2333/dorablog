// Disable server-side rendering cache for this page
export const ssr = false;
// Disable prerendering
export const prerender = false;

// Load article data from database by ID
export const load = async ({ params, fetch }) => {
  console.log('Loading article with ID:', params.id);
  
  try {
    // Add cache busting to ensure fresh data
    const cacheBuster = Date.now();
    const response = await fetch(`http://localhost:3000/api/articles/${params.id}?_=${cacheBuster}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch article');
    }
    
    const articleData = await response.json();
    console.log('Article data loaded:', articleData.title);
    console.log('Author info from API:', {
      authorUsername: articleData.authorUsername,
      authorRealname: articleData.authorRealname,
      authorAvatar: articleData.authorAvatar
    });
    
    // Helper function to get full image URL
    const getImageUrl = (url) => {
      if (!url) return '/src/assets/images/article/header.png'; // 默认头图
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      return `http://localhost:3000${url}`;
    };
    
    // Helper function to get avatar URL with cache busting
    const getAvatarUrl = (url) => {
      if (!url) return '/src/assets/images/avatar-placeholder.jpg'; // 默认头像
      
      let fullUrl;
      if (url.startsWith('http://') || url.startsWith('https://')) {
        // External URL
        fullUrl = url;
      } else if (url.startsWith('/avatars/')) {
        // Frontend static avatar (default avatars)
        fullUrl = url; // Keep as-is, will be served by frontend
      } else if (url.startsWith('/uploads/')) {
        // Backend uploaded avatar
        fullUrl = `http://localhost:3000${url}`;
      } else {
        // Fallback: assume it's a backend URL
        fullUrl = `http://localhost:3000${url}`;
      }
      
      // Add timestamp to prevent browser caching
      const separator = fullUrl.includes('?') ? '&' : '?';
      return `${fullUrl}${separator}t=${Date.now()}`;
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
          name: articleData.authorUsername || 'Unknown',
          avatar: getAvatarUrl(articleData.authorAvatar)
        },
        
        // For debugging and future use
        userId: articleData.userId,
        
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
