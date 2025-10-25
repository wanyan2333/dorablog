// Load article data for this slug
// Header image and content images separated clearly
export const load = async ({ params }) => {
  return {
    article: {
      id: 1, // Add article ID for comments
      slug: params.slug,
      title: 'Journey to the Art World with Monet',
      content:
        'This short travel note records a quiet afternoon at the campus gallery. ' +
        'I walked in with little expectation and ended up standing for a long time in front of a small painting: a dark cat, ' +
        'a glimmering pond, and brushstrokes that felt like soft wind on water. ' +
        '\nBack in the studio, I tried to photograph details that carried the same rhythm—reflections on windows, leaves by the river, ' +
        'and a sleepy orange cat near the library steps. These photos do not explain Monet; they simply continue the feeling: ' +
        'if light can be saved for one more second, then the memory becomes a little braver. ',

      // Header image (used as page background)
      headerImage: '/src/assets/images/article/header.png',

      // Main content image gallery
      images: [
        '/src/assets/images/article/pic1.jpg',
        '/src/assets/images/article/pic2.jpg',
        '/src/assets/images/article/pic3.jpg',
        '/src/assets/images/article/pic4.jpg',
        '/src/assets/images/article/pic5.jpg',
        '/src/assets/images/article/pic6.jpg'
      ],

      author: {
        name: 'Kevin',
        avatar: '/src/assets/images/avatar-xuan.png'
      },

      date: '2025-10-23'
    }
  };
};
