<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { api } from '$lib/api';
  import { userStore } from '$lib/session';
  import Editor from '@tinymce/tinymce-svelte';

  import Footer from '$lib/components/Footer.svelte';
  
  // Form data
  let title = '';
  let content = '';
  let selectedTag = '';
  let headerImage = null;
  let contentImages = [];
  
  // Form state
  let isSubmitting = false;
  let errors = {};
  
  // Available tags (predefined) - 简化为5-6个主要标签
  const availableTags = [
    'Technology',
    'Lifestyle', 
    'Travel',
    'Health',
    'Entertainment',
    'News'
  ];
  
  // TinyMCE configuration
  const editorConfig = {
    height: 300,
    menubar: false,
    plugins: 'lists link image anchor autolink charmap codesample emoticons media searchreplace table visualblocks wordcount',
    toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link media table | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
    content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px; }',
    branding: false,
    promotion: false
  };
  
  // TinyMCE API key
  const apiKey = 'z285vuatv7et9z4jdzehijd9c1gcajgfo9gbik4k63hpqqyf';
  
  // User authentication check - 暂时禁用
  $: user = $userStore;
  
  // onMount(() => {
  //   if (!user) {
  //     goto('/login');
  //   }
  // });
  
  // Form validation
  function validateForm() {
    errors = {};
    
    if (!title.trim()) {
      errors.title = 'Title is required';
    } else if (title.length > 200) {
      errors.title = 'Title must be less than 200 characters';
    }
    
    if (!content.trim()) {
      errors.content = 'Content is required';
    } else if (content.length > 10000) {
      errors.content = 'Content must be less than 10,000 characters';
    }
    
    if (!selectedTag) {
      errors.tag = 'Please select a tag';
    }
    
    return Object.keys(errors).length === 0;
  }
  
  // Handle form submission
  async function handleSubmit() {
    if (!validateForm()) {
      return;
    }
    
    isSubmitting = true;
    
    try {
      const articleData = {
        title: title.trim(),
        content: content.trim(),
        tag: selectedTag,
        headerImage: headerImage,
        contentImages: contentImages
      };
      
      const result = await api('/api/articles', {
        method: 'POST',
        body: JSON.stringify(articleData)
      });
      
      // 如果到这里说明请求成功
      goto(`/articles/${result.article.id}`);
    } catch (error) {
      console.error('API Error:', error);
      errors.submit = `Network error: ${error.message}`;
    } finally {
      isSubmitting = false;
    }
  }
  
  // Handle header image upload (placeholder)
  function handleHeaderImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
      headerImage = file;
    }
  }
  
  // Handle content image upload (placeholder)
  function handleContentImageUpload(event) {
    const files = Array.from(event.target.files);
    contentImages = [...contentImages, ...files];
  }

  // Get tag color
  function getTagColor(tagName) {
    const colors = {
      'Technology': '#3b82f6',
      'Lifestyle': '#10b981', 
      'Travel': '#f59e0b',
      'Health': '#ef4444',
      'Entertainment': '#ec4899',
      'News': '#6b7280'
    };
    return colors[tagName] || colors.News;
  }
</script>



<div class="new-article-page">
  <div class="container">
    <div class="header">
      <h1>Create New Article</h1>
      <p>Share your thoughts with the community</p>
    </div>
    
    <form on:submit|preventDefault={handleSubmit} class="article-form">
      <!-- Article Title -->
      <div class="form-group">
        <label for="title">Article Title *</label>
        <input
          id="title"
          type="text"
          bind:value={title}
          placeholder="Enter your article title..."
          class:error={errors.title}
          maxlength="200"
        />
        {#if errors.title}
          <span class="error-message">{errors.title}</span>
        {/if}
        <div class="char-count">{title.length}/200</div>
      </div>
      
      <!-- Tag Selection -->
      <div class="form-group">
        <label for="tag">Category *</label>
        <div class="tag-selector">
          {#each availableTags as tag}
            <button 
              type="button"
              class="tag-option" 
              class:selected={selectedTag === tag}
              style="background-color: {getTagColor(tag)}"
              on:click={() => selectedTag = tag}
            >
              {#if selectedTag === tag}
                <span class="selected-indicator">✓</span>
              {/if}
              {tag}
            </button>
          {/each}
        </div>
        {#if errors.tag}
          <span class="error-message">{errors.tag}</span>
        {/if}
      </div>
      
      <!-- Header Image Upload (Placeholder) -->
      <div class="form-group">
        <label for="header-image">Header Image</label>
        <div class="image-upload">
          <input
            id="header-image"
            type="file"
            accept="image/*"
            on:change={handleHeaderImageUpload}
            style="display: none;"
          />
          <label for="header-image" class="upload-button">
            {#if headerImage}
              <span>✓ {headerImage.name}</span>
            {:else}
              <span>📷 Upload Header Image</span>
            {/if}
          </label>
        </div>
      </div>
      
      <!-- Article Content -->
      <div class="form-group">
        <label for="content">Article Content *</label>
        <div class="editor-container" class:error={errors.content}>
          <Editor
            bind:value={content}
            config={editorConfig}
            apiKey={apiKey}
          />
        </div>
        {#if errors.content}
          <span class="error-message">{errors.content}</span>
        {/if}
        <div class="char-count">{content.length}/10,000</div>
      </div>
      
      <!-- Content Images Upload (Placeholder) -->
      <div class="form-group">
        <label for="content-images">Content Images</label>
        <div class="image-upload">
          <input
            id="content-images"
            type="file"
            accept="image/*"
            multiple
            on:change={handleContentImageUpload}
            style="display: none;"
          />
          <label for="content-images" class="upload-button">
            <span>📷 Upload Content Images</span>
          </label>
          {#if contentImages.length > 0}
            <div class="uploaded-images">
              {#each contentImages as image, index}
                <span class="image-item">
                  {image.name}
                  <button type="button" on:click={() => contentImages = contentImages.filter((_, i) => i !== index)}>×</button>
                </span>
              {/each}
            </div>
          {/if}
        </div>
      </div>
      
      <!-- Submit Error -->
      {#if errors.submit}
        <div class="submit-error">{errors.submit}</div>
      {/if}
      
      <!-- Action Buttons -->
      <div class="form-actions">
        <button type="button" class="btn-secondary" on:click={() => goto('/')}>
          Cancel
        </button>
        <button type="submit" class="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Publishing...' : 'Publish Article'}
        </button>
      </div>
    </form>
  </div>
</div>

<Footer />

<style>
  .new-article-page {
    min-height: calc(100vh - 120px); /* 减去导航栏和页脚的高度 */
    padding: 0.5rem 0 4rem 0;
  }
  
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 1rem;
  }
  
  .header {
    text-align: center;
    margin-bottom: 1rem;
    color: #2c3e50;
    background: rgba(255, 255, 255, 0.9);
    padding: 0.8rem;
    border-radius: 12px;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
  
  .header h1 {
    font-size: 2.2rem;
    margin-bottom: 0.2rem;
    font-weight: 700;
    color: #2c3e50;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .header p {
    font-size: 1.1rem;
    color: #7f8c8d;
    opacity: 0.9;
    font-weight: 500;
  }
  
  .article-form {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #333;
  }
  
  .form-group input {
    width: 100%;
    padding: 0.7rem;
    border: 2px solid #e8ecf0;
    border-radius: 8px;
    font-size: 0.9rem;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.8);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .tag-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 0.5rem;
  }

  .tag-option {
    padding: 6px 12px;
    border: 2px solid transparent;
    border-radius: 16px;
    font-size: 0.8rem;
    font-weight: 600;
    color: white;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    text-transform: uppercase;
    letter-spacing: 0.3px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    position: relative;
    overflow: hidden;
    white-space: nowrap;
  }

  .tag-option::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  .tag-option:hover::before {
    left: 100%;
  }

  .tag-option:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .tag-option.selected {
    border: 3px solid #ffffff;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    position: relative;
    z-index: 10;
  }


  .selected-indicator {
    display: inline-block;
    margin-right: 4px;
    font-size: 12px;
    font-weight: bold;
  }
  
  .form-group input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    transform: translateY(-1px);
  }
  
  .form-group input.error {
    border-color: #e74c3c;
  }
  
  .error-message {
    color: #e74c3c;
    font-size: 0.875rem;
    margin-top: 0.25rem;
    display: block;
  }
  
  .char-count {
    text-align: right;
    font-size: 0.875rem;
    color: #666;
    margin-top: 0.25rem;
  }
  
  .editor-container {
    border: 2px solid #e8ecf0;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
  }
  
  .editor-container:hover {
    border-color: #d1d9e0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
  
  .editor-container.error {
    border-color: #e74c3c;
  }
  
  .image-upload {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }
  
  .upload-button {
    display: inline-block;
    padding: 0.5rem 0.8rem;
    background: #f8f9fa;
    border: 2px dashed #dee2e6;
    border-radius: 6px;
    cursor: pointer;
    text-align: center;
    transition: all 0.2s;
    font-size: 0.8rem;
  }
  
  .upload-button:hover {
    background: #e9ecef;
    border-color: #667eea;
  }
  
  .uploaded-images {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .image-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #f8f9fa;
    padding: 0.5rem;
    border-radius: 6px;
    font-size: 0.875rem;
  }
  
  .image-item button {
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    cursor: pointer;
    font-size: 12px;
  }
  
  .submit-error {
    background: #f8d7da;
    color: #721c24;
    padding: 0.75rem;
    border-radius: 6px;
    margin-bottom: 1rem;
    border: 1px solid #f5c6cb;
  }
  
  .form-actions {
    display: flex;
    gap: 0.8rem;
    justify-content: flex-end;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e1e5e9;
  }
  
  .btn-primary,
  .btn-secondary {
    padding: 0.7rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    font-size: 0.9rem;
    letter-spacing: 0.3px;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  }
  
  .btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }
  
  .btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }
  
  .btn-primary:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .btn-secondary {
    background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
    color: white;
  }
  
  .btn-secondary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(149, 165, 166, 0.4);
  }
  
  @media (max-width: 768px) {
    .container {
      padding: 0 0.5rem;
    }
    
    .article-form {
      padding: 1.5rem;
    }
    
    .form-actions {
      flex-direction: column;
    }
  }
</style>
