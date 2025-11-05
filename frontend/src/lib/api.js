// 
// Use a unified fetch; must include credentials so HttpOnly cookies are sent.

export const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function api(path, options = {}) {
  // 如果是FormData，不设置Content-Type，让浏览器自动设置
  const isFormData = options.body instanceof FormData;
  const headers = isFormData 
    ? { ...(options.headers || {}) }
    : { 'Content-Type': 'application/json', ...(options.headers || {}) };
    
  const res = await fetch(`${API}${path}`, {
    credentials: 'include',
    headers,
    ...options
  });
  let data = {};
  try { data = await res.json(); } catch {}
  if (!res.ok) {
    const error = new Error(data?.error || `HTTP ${res.status}: ${res.statusText}`);
    error.status = res.status;
    error.statusText = res.statusText;
    error.data = data;
    throw error;
  }
  return data;
}

// 获取所有文章列表
export async function getArticles() {
  return await api('/api/articles');
}

// 根据ID获取单篇文章
export async function getArticleById(id) {
  return await api(`/api/articles/${id}`);
}

// 获取完整的资源URL（用于图片等静态资源）
export function getResourceUrl(path) {
  if (!path) return '';
  // 如果已经是完整URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // 如果是静态资源（/avatars/开头），直接返回
  if (path.startsWith('/avatars/')) {
    return path;
  }
  // 其他情况拼接API地址
  return `${API}${path}`;
}
