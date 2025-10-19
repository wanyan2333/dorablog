<script>
  import "$lib/css/app.css";

  import { page } from "$app/stores";
  $: path = $page.url.pathname;
</script>

<nav>
  <p>This is the navbar. You will need to style this (if you even want a navbar at all...)</p>
  <ul>
    <li><a href="/" class:active={path === "/"}>Home</a></li>
  </ul>
</nav>

<div class="container">
  <slot />
</div>
