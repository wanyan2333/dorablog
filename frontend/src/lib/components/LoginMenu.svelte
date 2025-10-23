<script>
  import { onMount } from 'svelte';
  import { userStore, loadMe } from '$lib/session';

  let open = false;
  $: user = $userStore;

  onMount(() => loadMe());

  function gotoLogin() { window.location.href = '/login'; }

  async function logout() {
    await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    await loadMe();
    open = false;
  }
</script>

<div class="login-menu">
  {#if !user}
    <button class="btn-login" on:click={gotoLogin} aria-label="Login">
      <svg class="ico" width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 3c2.761 0 5 2.239 5 5v2.2c0 .59.24 1.155.66 1.57l1.35 1.33c.64.63.19 1.7-.7 1.7H5.69c-.89 0-1.34-1.07-.7-1.7l1.35-1.33c.42-.415.66-.98.66-1.57V8c0-2.761 2.239-5 5-5Z" stroke="#fff" stroke-width="1.6"/>
        <circle cx="12" cy="18.2" r="1.9" fill="#fff"/>
        <path d="M12 16.6v1.3" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>
      </svg>
      <span>Login</span>
    </button>
  {:else}
    <div class="user">
      <button class="btn-user" on:click={() => (open = !open)} aria-haspopup="menu" aria-expanded={open}>
        <span class="ring">
          <img src="/favicon.png" alt="avatar" class="avatar" />
        </span>
        <span class="name">{user.userName}</span>
        <svg class="caret" width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M6 9l6 6 6-6" stroke="#0b74d8" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>

      {#if open}
        <div class="dropdown" role="menu">
          <button class="item" on:click={logout}>🚪 Logout</button>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .login-menu {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 100px; 
  }

  .btn-login {
    background: linear-gradient(135deg, #4ecbff, #0b74d8);
    color: #fff;
    border: none;
    padding: 10px 22px;
    border-radius: 999px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    box-shadow: 0 6px 18px rgba(0, 118, 255, 0.28);
    transition: transform .18s ease, box-shadow .18s ease, filter .18s ease;
  }
  .btn-login:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(0, 118, 255, 0.35);
    filter: saturate(1.05);
  }
  .ico { display:block; }

  .user { position: relative; }
  .btn-user {
    display: inline-flex; align-items: center; gap: 10px;
    background: #ffffff; border: 2px solid #7fc6ff;
    color: #0b74d8; padding: 8px 14px; border-radius: 999px;
    font-weight: 700; box-shadow: 0 6px 18px rgba(0,0,0,.12);
    cursor: pointer;
  }
  .btn-user:hover { background:#e7f4ff; }
  .ring { position: relative; display: inline-flex; }
  .ring::before {
    content:""; position:absolute; inset:-3px; border-radius: 50%;
    background: conic-gradient(from 90deg, #7fc6ff, #0b74d8, #7fc6ff);
    filter: blur(.6px); z-index:0;
  }
  .avatar { position:relative; z-index:1; width:26px; height:26px; border-radius:50%; border:2px solid #fff; background:#e8f4ff; object-fit:cover; }
  .name { max-width:140px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .caret { margin-left:-2px; }

  .dropdown {
    position:absolute; top: calc(100% + 8px); right:0;
    min-width: 160px; padding: 6px;
    background: rgba(255,255,255,.85); backdrop-filter: blur(8px);
    border: 1px solid #d7eaff; border-radius: 14px; box-shadow: 0 12px 28px rgba(0,0,0,.18);
    display:grid; gap:4px; z-index:1000;
  }
  .item {
    background: transparent; border:none; text-align:left; padding:10px 12px;
    border-radius:10px; font-weight:700; color:#0b74d8; cursor:pointer;
  }
  .item:hover { background:#e7f4ff; }
</style>
