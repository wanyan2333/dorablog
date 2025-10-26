<script>
  import "$lib/css/app.css";
  import { onMount } from 'svelte';
  import Navbar from "$lib/components/Navbar.svelte";
  
  import { page } from "$app/stores";
  $: path = $page.url.pathname;

  onMount(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  });
</script>

<Navbar />
<slot />