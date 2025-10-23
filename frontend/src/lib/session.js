import { writable } from 'svelte/store';

export const userStore = writable(null);


export async function loadMe() {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/userInfo`, {
      credentials: 'include'
    });
    if (!res.ok) return userStore.set(null);
    const { user } = await res.json();
    userStore.set(user);
  } catch {
    userStore.set(null);
  }
}
