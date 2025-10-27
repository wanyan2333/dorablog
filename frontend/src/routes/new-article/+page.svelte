<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { api } from '$lib/api';
  import { userStore } from '$lib/session';
  import Editor from '@tinymce/tinymce-svelte';
  import { showError } from '$lib/toastStore.js';

  import Footer from '$lib/components/Footer.svelte';
  
  // 用户登录状态
  let isLoggedIn = false;
  let currentUser = null;
  
  // Form data
  let title = '';
  let content = '';
  let selectedTag = '';
  let headerImage = null;
  let uploadedImages = []; // 存储上传的图片URL
  let contentImages = [];
  
  // Form state
  let isSubmitting = false;
  let errors = {};
  
  // 检查用户登录状态
  $: {
    isLoggedIn = !!$userStore;
    currentUser = $userStore;
  }
  
  // 页面加载时检查登录状态
  onMount(() => {
    if (!isLoggedIn) {
      // 直接跳转到登录页，不延迟
      goto('/login');
    }
  });
  
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
    height: 400,
    menubar: 'file edit view insert format',
    plugins: 'image lists link anchor autolink charmap codesample emoticons media searchreplace table visualblocks wordcount',
    toolbar: 'undo redo | blocks | bold italic | image link | alignleft aligncenter alignright | bullist numlist | removeformat',
    content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px; }',
    
    // 使用CSS隐藏不需要的对话框字段
    content_css: false,
    branding: false,
    promotion: false,
    
    // 图片上传配置 - 使用handler直接处理上传
    images_upload_handler: async (blobInfo, progress) => {
      return new Promise(async (resolve, reject) => {
        try {
          // 1. 检查图片数量限制（最多9张）
          if (uploadedImages.length >= 9) {
            reject('Maximum 9 images allowed. Please remove some images before uploading more.');
            return;
          }
          
          // 2. 验证文件类型
          const file = blobInfo.blob();
          if (!file.type.startsWith('image/')) {
            reject('Please select an image file');
            return;
          }
          
          // 3. 验证文件大小（最大10MB）
          if (file.size > 10 * 1024 * 1024) {
            reject('File size must be less than 10MB');
            return;
          }
          
          // 4. 验证文件扩展名
          const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
          const fileName = blobInfo.filename().toLowerCase();
          const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
          if (!allowedExtensions.includes(fileExtension)) {
            reject('Only JPG, PNG, GIF, and WebP images are allowed');
            return;
          }
          
          // 5. 上传到后端
          const formData = new FormData();
          formData.append('image', file, blobInfo.filename());
          
          const response = await fetch('http://localhost:3000/api/articles/upload-image', {
            method: 'POST',
            credentials: 'include', // 包含认证cookie
            body: formData
          });
          
          const result = await response.json();
          
          if (result.success) {
            const imageUrl = 'http://localhost:3000' + result.imageUrl;
            // 保存图片URL到数组
            uploadedImages = [...uploadedImages, result.imageUrl];
            console.log('Uploaded images:', uploadedImages);
            resolve(imageUrl);
          } else {
            reject('Upload failed: ' + (result.error || 'Unknown error'));
          }
        } catch (error) {
          reject('Upload failed: ' + error.message);
        }
      });
    },
    
    // 简化图片对话框配置
    image_advtab: false,
    image_title: false,
    image_description: false,
    image_dimensions: false,
    image_caption: false,
    
    // 允许拖拽上传
    paste_data_images: true,
    
    // 自定义对话框行为
    setup: (editor) => {
      // 监听对话框打开
      editor.on('OpenWindow', (e) => {
        setTimeout(() => {
          const dialog = document.querySelector('.tox-dialog');
          if (dialog) {
            // 查找并隐藏Class字段
            const formGroups = dialog.querySelectorAll('.tox-form__group');
            formGroups.forEach((group) => {
              const label = group.querySelector('label');
              if (label && label.textContent.toLowerCase().includes('class')) {
                group.style.display = 'none';
              }
            });
            
            // 查找Upload标签并自动点击
            const tabs = dialog.querySelectorAll('.tox-dialog__body-nav-item');
            tabs.forEach((tab) => {
              const tabText = tab.textContent.toLowerCase();
              if (tabText.includes('upload')) {
                tab.click();
              }
            });
          }
        }, 10);
      });
      
      // 自定义图片插入逻辑
      editor.on('NodeChange', (e) => {
        // 查找新插入的图片
        const images = editor.getBody().querySelectorAll('img:not([data-processed])');
        images.forEach((img) => {
          // 标记为已处理
          img.setAttribute('data-processed', 'true');
          
          // 添加缩略图样式类
          img.classList.add('thumbnail-image');
          
          // 检查编辑器内容
          const body = editor.getBody();
          const allImages = body.querySelectorAll('img.thumbnail-image');
          const textContent = editor.getContent({ format: 'text' }).trim();
          
          // 如果是第一张图片
          if (allImages.length === 1) {
            // 检查是否有文字内容
            const hasText = textContent && textContent.length > 0;
            
            if (!hasText) {
              // 没有文字，在图片前添加空行
              const p = editor.getDoc().createElement('p');
              p.innerHTML = '<br>';
              body.insertBefore(p, body.firstChild);
            } else {
              // 有文字，在文字后面新建一行插入图片
              const parent = img.parentNode;
              
              // 创建一个新的段落来包含图片
              const imageContainer = editor.getDoc().createElement('p');
              
              // 从原父节点移除图片
              if (parent) {
                parent.removeChild(img);
              }
              
              // 把图片放入新段落
              imageContainer.appendChild(img);
              
              // 在body末尾添加新段落（文字后面）
              body.appendChild(imageContainer);
              
              // 如果原来的段落现在是空的，删除它
              if (parent && parent.childNodes.length === 0 && parent.parentNode) {
                parent.parentNode.removeChild(parent);
              }
            }
            
            // 设置光标在第一张图片右边
            setTimeout(() => {
              const range = editor.getDoc().createRange();
              const sel = editor.selection.getSel();
              range.setStartAfter(img);
              range.setEndAfter(img);
              sel.removeAllRanges();
              sel.addRange(range);
              editor.focus();
            }, 10);
          } else {
            // 不是第一张图片，在光标位置插入（光标应该在上一张图片右边）
            // 图片会自动插入到光标位置，我们只需要确保它有正确的样式
            // 然后把光标移到这张图片右边
            setTimeout(() => {
              const range = editor.getDoc().createRange();
              const sel = editor.selection.getSel();
              range.setStartAfter(img);
              range.setEndAfter(img);
              sel.removeAllRanges();
              sel.addRange(range);
              editor.focus();
            }, 10);
          }
        });
      });
      
      // 注入CSS样式
      editor.on('init', () => {
        const style = editor.getDoc().createElement('style');
        style.textContent = `
          .thumbnail-image {
            width: 150px !important;
            height: 150px !important;
            object-fit: cover !important;
            display: inline-block !important;
            margin: 5px !important;
            border-radius: 8px !important;
            vertical-align: top !important;
          }
        `;
        editor.getDoc().head.appendChild(style);
      });
    }
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
  
  // 图片验证函数
  function validateImage(file) {
    const errors = [];
    
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      errors.push('Please select an image file');
    }
    
    // 验证文件大小 (最大10MB)
    if (file.size > 10 * 1024 * 1024) {
      errors.push('File size must be less than 10MB');
    }
    
    // 验证文件扩展名
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!allowedExtensions.includes(fileExtension)) {
      errors.push('Only JPG, PNG, GIF, and WebP images are allowed');
    }
    
    return errors;
  }
  
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
    } else if (content.length > 100000) {
      errors.content = 'Content must be less than 100,000 characters';
    }
    
    if (!selectedTag) {
      errors.tag = 'Please select a tag';
    }
    
    // 验证头图（可选）
    if (headerImage) {
      const imageErrors = validateImage(headerImage);
      if (imageErrors.length > 0) {
        errors.headerImage = imageErrors.join(', ');
      }
    }
    // 头图是可选的，不上传会使用默认图片
    
    // 验证内容图片
    if (contentImages.length > 0) {
      for (let i = 0; i < contentImages.length; i++) {
        const imageErrors = validateImage(contentImages[i]);
        if (imageErrors.length > 0) {
          errors.contentImages = `Image ${i + 1}: ${imageErrors.join(', ')}`;
          break;
        }
      }
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
      // 从content中移除所有图片标签，只保留文字
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content.trim();
      
      // 移除所有img标签
      const images = tempDiv.querySelectorAll('img');
      images.forEach(img => img.remove());
      
      // 获取纯文字内容（保留其他HTML标签如p, br等）
      const contentWithoutImages = tempDiv.innerHTML.trim();
      
      // 上传headerImage（如果有）
      let headerImageUrl = null;
      if (headerImage) {
        const formData = new FormData();
        formData.append('image', headerImage);
        
        const uploadResponse = await fetch('http://localhost:3000/api/articles/upload-image', {
          method: 'POST',
          credentials: 'include', // 包含认证cookie
          body: formData
        });
        
        const uploadResult = await uploadResponse.json();
        if (uploadResult.success) {
          headerImageUrl = uploadResult.imageUrl;
        }
      }
      
      const articleData = {
        title: title.trim(),
        content: contentWithoutImages,
        tag: selectedTag,
        headerImage: headerImageUrl, // 发送URL而不是File对象
        contentImages: uploadedImages // 发送图片URL数组
      };
      
      console.log('Submitting article:', articleData);
      console.log('Content images array:', uploadedImages);
      console.log('Content images count:', uploadedImages.length);
      
      const result = await api('/api/articles', {
        method: 'POST',
        body: JSON.stringify(articleData)
      });
      
      // 如果到这里说明请求成功，跳转到文章详情页
      goto(`/articles/${result.article.id}`);
    } catch (error) {
      console.error('API Error:', error);
      
      // 检查是否是未登录错误
      if (error.status === 401) {
        goto('/login');
      } else {
        errors.submit = error.message || 'Failed to create article';
        showError(errors.submit);
      }
    } finally {
      isSubmitting = false;
    }
  }
  
  // Handle header image upload with validation
  function handleHeaderImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
      const imageErrors = validateImage(file);
      if (imageErrors.length > 0) {
        errors.headerImage = imageErrors.join(', ');
        return;
      }
      headerImage = file;
      errors.headerImage = ''; // 清除错误
    }
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
      
      <!-- Header Image Upload -->
      <div class="form-group">
        <label for="header-image">Header Image (Optional)</label>
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
        {#if errors.headerImage}
          <span class="error-message">{errors.headerImage}</span>
        {/if}
        {#if headerImage}
          <div class="image-preview">
            <img src={URL.createObjectURL(headerImage)} alt="Header preview" />
          </div>
        {/if}
      </div>
      
      <!-- Article Content -->
      <div class="form-group">
        <label for="content">Article Content *</label>
        <p class="helper-text">💡 Tip: Click the image button (🖼️) in the toolbar, or drag & drop images directly into the editor. Maximum 9 images.</p>
        <div class="editor-container" class:error={errors.content}>
          <Editor
            bind:value={content}
            conf={editorConfig}
            apiKey={apiKey}
          />
        </div>
        {#if errors.content}
          <span class="error-message">{errors.content}</span>
        {/if}
        <div class="char-count">{content.length}/100,000</div>
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
  
  .helper-text {
    font-size: 0.85rem;
    color: #667eea;
    margin: -0.25rem 0 0.5rem 0;
    font-style: italic;
    background: #f0f4ff;
    padding: 0.5rem;
    border-radius: 6px;
    border-left: 3px solid #667eea;
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
    max-width: 500px; /* 稍微加长上传框 */
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
  
  .image-preview {
    margin-top: 0.5rem;
    max-width: 500px; /* 与上传框同宽 */
    display: flex;
    justify-content: center; /* 水平居中 */
  }
  
  .image-preview img {
    width: 150px;
    height: 150px;
    object-fit: cover; /* 裁剪为方形 */
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
