// 
// Use a unified fetch; must include credentials so HttpOnly cookies are sent.

export const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  let data = {};
  try { data = await res.json(); } catch {}
  if (!res.ok) throw new Error(data?.error || 'request failed');
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
