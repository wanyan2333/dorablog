<script>
  import { PUBLIC_IMAGES_URL } from "$env/static/public";
  import MessageView from "$lib/components/MessageView.svelte";
  export let data;
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<h1>Home page</h1>
<p>This is the homepage.</p>

<!-- These images are stored on our Express server. -->
<img src={`${PUBLIC_IMAGES_URL}/Dragonite.png`} alt="Dragonite" style="width: 320px" />
$IMAGE

<h2>Messages from server</h2>
{#each data.messages as message (message.id)}
  <MessageView {message} />
{/each}
