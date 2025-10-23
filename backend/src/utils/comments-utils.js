
// Utility to handle comment depths in a threaded comment system
export function buildCommentsTree(comments) {
  // First, calculate depth for each comment
  const commentsWithDepth = comments.map(comment => ({
    ...comment,
    depth: calculateDepth(comment, comments)
  }));

  // Sort comments: parent comments first, then replies in chronological order
  return sortCommentsTree(commentsWithDepth);
}

// Calculate the depth of a comment based on its parent hierarchy
function calculateDepth(comment, comments) {
  if (!comment.parentCommentId) {
    return 0;
  }
  
  const parentComment = comments.find(c => c.id === comment.parentCommentId);
  if (!parentComment) {
    return 0; // Parent not found, treat as root level
  }
  
  return 1 + calculateDepth(parentComment, comments);
}

// Sort comments to create a proper tree structure
function sortCommentsTree(comments) {
  // Create a map for quick lookup
  const commentMap = new Map();
  comments.forEach(comment => {
    commentMap.set(comment.id, comment);
  });

  // Separate root comments and replies
  const rootComments = comments.filter(comment => comment.depth === 0);
  const replies = comments.filter(comment => comment.depth > 0);

  // Sort root comments by date
  rootComments.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Build the final sorted array
  const sortedComments = [];
  
  // Process each root comment and its descendants
  rootComments.forEach(rootComment => {
    sortedComments.push(rootComment);
    
    // Add all descendants of this root comment
    const descendants = getDescendants(rootComment.id, replies, commentMap);
    sortedComments.push(...descendants);
  });

  return sortedComments;
}

// Get all descendants of a comment in proper order
function getDescendants(parentId, replies, commentMap) {
  const directReplies = replies.filter(reply => reply.parentCommentId === parentId);
  
  // Sort direct replies by date
  directReplies.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  const result = [];
  
  directReplies.forEach(reply => {
    result.push(reply);
    // Recursively get descendants of this reply
    const nestedDescendants = getDescendants(reply.id, replies, commentMap);
    result.push(...nestedDescendants);
  });
  
  return result;
}
