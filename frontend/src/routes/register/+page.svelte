<script>
  import { api } from '$lib/api';
  let userName='', password='', confirm='', realName='', birthDate='', description='';
  let busy=false, error='', success='';

  async function submit(){
    error=''; success=''; busy=true;
    if(password!==confirm){ error='Passwords do not match'; busy=false; return; }
    try{
      await api('/api/register', {
        method:'POST',
        body: JSON.stringify({ userName, password, confirm, realName, birthDate, description })
      });
      success='Registration successful! Redirecting to login...';
      setTimeout(()=> location.href='/login', 1000);
    }catch(e){ error = e.message || 'Registration failed'; }
    finally{ busy=false; }
  }
</script>

<div class="auth-page">
  <div class="overlay"></div>
  <div class="auth-card">
    <h2>Register DoraBlog</h2>
    <form on:submit|preventDefault={submit}>
      <input placeholder="username" bind:value={userName} required />
      <input type="password" placeholder="password" bind:value={password} required />
      <input type="password" placeholder="confirm password" bind:value={confirm} required />
      <input placeholder="real name (optional)" bind:value={realName} />
      <input placeholder="birthDate (optional, e.g. 2000-01-01)" bind:value={birthDate} />
      <textarea placeholder="About me (optional)" bind:value={description}></textarea>

      {#if error}<p class="msg error">{error}</p>{/if}
      {#if success}<p class="msg success">{success}</p>{/if}
      <button class="btn" type="submit" disabled={busy}>Register</button>
    </form>
    <a class="switch" href="/login">Already have an account? Log in</a>
  </div>
</div>

<style>
  .auth-page {
    min-height: 100vh;
    background: url("/background.jpg") center/cover no-repeat fixed;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .overlay {
    position: absolute;
    inset: 0;
    background: rgba(255,255,255,0.55);
    backdrop-filter: blur(3px);
    z-index: 0;
  }

  .auth-card {
    position: relative;
    z-index: 1;
    width: min(460px, 90vw);
    padding: 40px 30px;
    border-radius: 20px;
    background: rgba(255,255,255,0.88);
    box-shadow: 0 10px 28px rgba(11,116,216,0.25);
    text-align: center;
  }

  h2 {
    color: #0b74d8;
    font-weight: 700;
    margin-bottom: 24px;
  }

  input, textarea {
    width: 100%;
    margin: 8px 0;
    padding: 12px;
    border: 1px solid #bcdfff;
    border-radius: 12px;
    outline: none;
    font-size: 14px;
  }

  textarea { resize: vertical; min-height: 80px; }

  input:focus, textarea:focus {
    border-color: #49b3ff;
    box-shadow: 0 0 0 3px rgba(73,179,255,0.25);
  }

  .btn {
    width: 100%;
    padding: 12px;
    margin-top: 12px;
    border: none;
    border-radius: 12px;
    font-weight: bold;
    font-size: 15px;
    color: white;
    background: linear-gradient(135deg, #4ecbff, #0b74d8);
    box-shadow: 0 8px 18px rgba(0,118,255,0.25);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn:hover {
    transform: translateY(-1.5px);
    box-shadow: 0 12px 28px rgba(0,118,255,0.35);
  }

  .switch {
    display: block;
    margin-top: 18px;
    color: #0b74d8;
    text-decoration: none;
    font-size: 14px;
  }

  .msg.error { color: #d40000; }
  .msg.success { color: #009944; }
</style>
