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
