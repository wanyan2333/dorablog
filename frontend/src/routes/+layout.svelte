<script>
  import "$lib/css/app.css";
  import { onMount } from 'svelte';
  import Navbar from "$lib/components/Navbar.svelte";
  
  import { page } from "$app/stores";
  $: path = $page.url.pathname;

  onMount(() => {
    // 默认使用亮色主题，除非用户之前主动切换到暗色主题
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      // 确保默认是亮色模式，清除可能存在的暗色设置
      document.documentElement.removeAttribute('data-theme');
      if (!savedTheme) {
        // 首次访问，明确设置为亮色主题
        localStorage.setItem('theme', 'light');
      }
    }
  });
</script>

<Navbar />
<slot />