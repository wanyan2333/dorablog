<script>
  import { onMount } from "svelte";
  import { PUBLIC_API_BASE_URL } from "$env/static/public";
  import CommentItem from "./CommentItem.svelte";
  import { userStore } from "$lib/session.js";

  export let articleId;
  export let articleAuthorId;

  let comments = [];
  let loading = true;
  let error = null;

  // Form for new top-level comments
  let newCommentContent = "";
  let isSubmitting = false;

  $: isLoggedIn = $userStore !== null;
  $: currentUser = $userStore;

  onMount(async () => {
    await loadComments();
  });

  async function loadComments() {
    try {
      loading = true;
      error = null;
      const res = await fetch(`${PUBLIC_API_BASE_URL}/comments/articles/${articleId}`);
      if (res.ok) {
        comments = await res.json();
      } else {
        error = "Failed to load comments";
      }
    } catch (err) {
      error = "Error loading comments";
      console.error("Error loading comments:", err);
    } finally {
      loading = false;
    }
  }

  async function submitNewComment() {
    if (!newCommentContent.trim() || isSubmitting) return;

    isSubmitting = true;

    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          content: newCommentContent.trim(),
          articleId: articleId
        })
      });

      if (response.ok) {
        const newComment = await response.json();
        // Add the new comment to the beginning of the list
        comments = [newComment, ...comments];
        newCommentContent = "";
      } else {
        console.error("Failed to submit comment");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      isSubmitting = false;
    }
  }

  function handleCommentAdded(event) {
    const { comment, parentId } = event.detail;

    // Reload comments to get the proper nested structure
    loadComments();
  }

  function handleCommentUpdated(event) {
    const { comment } = event.detail;

    // Update the comment in the nested structure
    function updateCommentInTree(commentList) {
      for (let i = 0; i < commentList.length; i++) {
        if (commentList[i].id === comment.id) {
          commentList[i] = comment;
          return true;
        }
        if (commentList[i].childrenComments && commentList[i].childrenComments.length > 0) {
          if (updateCommentInTree(commentList[i].childrenComments)) {
            return true;
          }
        }
      }
      return false;
    }

    updateCommentInTree(comments);
    comments = [...comments]; // Trigger reactivity
  }

  function handleCommentDeleted(event) {
    const { commentId } = event.detail;

    // Remove the comment from the nested structure
    function removeCommentFromTree(commentList) {
      for (let i = 0; i < commentList.length; i++) {
        if (commentList[i].id === commentId) {
          commentList.splice(i, 1);
          return true;
        }
        if (commentList[i].childrenComments && commentList[i].childrenComments.length > 0) {
          if (removeCommentFromTree(commentList[i].childrenComments)) {
            return true;
          }
        }
      }
      return false;
    }

    removeCommentFromTree(comments);
    comments = [...comments]; // Trigger reactivity
  }
</script>

<div class="comments-section">
  <h3>Comments</h3>

  {#if loading}
    <p class="loading">Loading comments...</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else if !comments || comments.length === 0}
    <p class="no-comments">No comments yet. Be the first to comment!</p>
  {:else}
    <div class="comments-list">
      {#each comments as comment (comment.id)}
        <CommentItem
          {comment}
          depth={0}
          {articleId}
          {isLoggedIn}
          {currentUser}
          {articleAuthorId}
          on:commentAdded={handleCommentAdded}
          on:commentUpdated={handleCommentUpdated}
          on:commentDeleted={handleCommentDeleted}
        />
      {/each}
    </div>
  {/if}

  {#if isLoggedIn}
    <div class="new-comment-form">
      <h4>Add a Comment</h4>
      <textarea
        bind:value={newCommentContent}
        placeholder="Write your comment..."
        rows="4"
        disabled={isSubmitting}
      ></textarea>
      <div class="form-actions">
        <button
          class="submit-btn"
          on:click={submitNewComment}
          disabled={!newCommentContent.trim() || isSubmitting}
        >
          {isSubmitting ? "Posting..." : "Post Comment"}
        </button>
      </div>
    </div>
  {:else}
    <div class="login-prompt">
      <p>Please <a href="/login">log in</a> to post comments.</p>
    </div>
  {/if}
</div>

<style>
  .comments-section {
    margin-top: 0px; /* 完全移除上边距 */
    padding: 24px;
    background: white;
    opacity: 0.95;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .comments-section h3 {
    margin: 0 0 24px 0;
    color: #333;
    font-size: 24px;
    font-weight: 600;
  }

  .comments-section h4 {
    margin: 0 0 16px 0;
    color: #555;
    font-size: 18px;
    font-weight: 500;
  }

  .loading,
  .error,
  .no-comments {
    text-align: center;
    padding: 24px;
    font-style: italic;
    color: #666;
  }

  .error {
    color: #dc3545;
  }

  .comments-list {
    margin-bottom: 32px;
  }

  .new-comment-form {
    border-top: 1px solid #e0e0e0;
    padding-top: 24px;
  }

  .new-comment-form textarea {
    width: 100%;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 12px;
    font-family: inherit;
    resize: vertical;
    margin-bottom: 12px;
    font-size: 14px;
  }

  .new-comment-form textarea:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
  }

  .submit-btn {
    background: #007bff;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 0.2s ease;
  }

  .submit-btn:hover:not(:disabled) {
    background: #0056b3;
  }

  .submit-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .login-prompt {
    text-align: center;
    padding: 24px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
  }

  .login-prompt a {
    color: #007bff;
    text-decoration: none;
    font-weight: 500;
  }

  .login-prompt a:hover {
    text-decoration: underline;
  }
</style>
