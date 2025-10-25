<script>
  import { api } from '$lib/api';
  import PasswordStrengthIndicator from '$lib/components/PasswordStrengthIndicator.svelte';
  
  let username='', password='', confirm='', realname='', birthdate='', description='';
  let busy=false, error='', success='', usernameError='', passwordError='';
  let usernameChecking=false, usernameAvailable=null;

  // 实时检查用户名唯一性
  async function checkUsername() {
    if (!username || username.length < 3) {
      usernameError = 'Username must be at least 3 characters';
      usernameAvailable = false;
      return;
    }
    
    // 用户名格式验证
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      usernameError = 'Username can only contain letters, numbers, and underscores';
      usernameAvailable = false;
      return;
    }
    
    usernameChecking = true;
    usernameError = '';
    
    try {
      console.log('Checking username:', username);
      const data = await api(`/api/auth/registered?username=${encodeURIComponent(username)}`);
      console.log('API response:', data);
      
      if (data.registered) {
        usernameError = 'Username already taken';
        usernameAvailable = false;
      } else {
        usernameError = '';
        usernameAvailable = true;
      }
    } catch (e) {
      console.error('Username check error:', e);
      console.error('Error details:', e.message);
      usernameError = `Unable to check username: ${e.message}`;
      usernameAvailable = false;
    } finally {
      usernameChecking = false;
    }
  }

  // 简化的密码验证 - 只检查长度
  function validatePassword(pwd) {
    if (pwd.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return '';
  }

  // 监听密码变化
  $: if (password) {
    passwordError = validatePassword(password);
  }

  // 监听用户名变化，防抖处理
  let usernameTimeout;
  $: if (username) {
    clearTimeout(usernameTimeout);
    usernameTimeout = setTimeout(checkUsername, 500);
  }

  async function submit(){
    error=''; success=''; busy=true;
    
    // 验证密码匹配
    if(password!==confirm){ 
      error='Passwords do not match'; 
      busy=false; 
      return; 
    }
    
    // 验证密码强度
    if(passwordError) {
      error = passwordError;
      busy=false;
      return;
    }
    
    // 验证用户名可用性
    if(!usernameAvailable) {
      error = 'Please choose a different username';
      busy=false;
      return;
    }
    
    try{
      await api('/api/auth/register', {
        method:'POST',
        body: JSON.stringify({ username, password, confirm, realname, birthdate, description })
      });
      success='Registration successful! Redirecting to login...';
      setTimeout(()=> location.href='/login', 1000);
    }catch(e){ 
      error = e.message || 'Registration failed'; 
    }
    finally{ busy=false; }
  }
</script>

<div class="auth-page">
  <div class="overlay"></div>
  <div class="auth-card">
    <h2>Register DoraBlog</h2>
    <form on:submit|preventDefault={submit}>
      <!-- 用户名输入 -->
      <div class="input-group">
        <input 
          placeholder="username" 
          bind:value={username} 
          class:error={usernameError}
          class:success={usernameAvailable}
          required 
        />
        {#if usernameChecking}
          <div class="status-text checking">Checking...</div>
        {/if}
        {#if usernameError}
          <div class="status-text error-text">{usernameError}</div>
        {/if}
        {#if usernameAvailable}
          <div class="status-text success-text">✓ Username available</div>
        {/if}
      </div>

      <!-- 密码输入 -->
      <div class="input-group">
        <input 
          type="password" 
          placeholder="password" 
          bind:value={password} 
          class:error={passwordError}
          required 
        />
        {#if passwordError}
          <div class="status-text error-text">{passwordError}</div>
        {/if}
        {#if password && !passwordError}
          <div class="status-text success-text">✓ Password is valid</div>
        {/if}
      </div>
      
      <!-- 密码强度指示器组件 -->
      <PasswordStrengthIndicator {password} />

      <!-- 确认密码 -->
      <div class="input-group">
        <input 
          type="password" 
          placeholder="confirm password" 
          bind:value={confirm} 
          class:error={confirm && password !== confirm}
          required 
        />
        {#if confirm && password !== confirm}
          <div class="status-text error-text">Passwords do not match</div>
        {/if}
        {#if confirm && password === confirm && password}
          <div class="status-text success-text">✓ Passwords match</div>
        {/if}
      </div>

      <!-- 其他信息 -->
      <input placeholder="real name (optional)" bind:value={realname} />
      <input placeholder="birthdate (optional, e.g. 2000-01-01)" bind:value={birthdate} />
      <textarea placeholder="About me (optional)" bind:value={description}></textarea>

      {#if error}<p class="msg error">{error}</p>{/if}
      {#if success}<p class="msg success">{success}</p>{/if}
      <button 
        class="btn" 
        type="submit" 
        disabled={busy || !usernameAvailable || passwordError || password !== confirm}
      >
        {busy ? 'Registering...' : 'Register'}
      </button>
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

  .input-group {
    position: relative;
    margin: 12px 0; /* 增加输入框之间的间隔 */
  }

  /* 状态文本 - 修复遮挡问题 */
  .status-text {
    margin-top: 6px;
    font-size: 12px;
    font-weight: 500;
    padding: 4px 8px;
    border-radius: 4px;
    text-align: center;
  }

  .status-text.error-text {
    color: #d40000;
    background: rgba(212, 0, 0, 0.1);
    border: 1px solid rgba(212, 0, 0, 0.2);
  }

  .status-text.success-text {
    color: #009944;
    background: rgba(0, 153, 68, 0.1);
    border: 1px solid rgba(0, 153, 68, 0.2);
  }

  .status-text.checking {
    color: #666;
    background: rgba(102, 102, 102, 0.1);
    border: 1px solid rgba(102, 102, 102, 0.2);
    font-style: italic;
  }

  input, textarea {
    width: 100%;
    margin: 8px 0; /* 保持原有的输入框间距 */
    padding: 12px;
    border: 1px solid #bcdfff;
    border-radius: 12px;
    outline: none;
    font-size: 14px;
    transition: all 0.3s ease;
  }

  textarea { 
    resize: vertical; 
    min-height: 80px; 
  }

  input:focus, textarea:focus {
    border-color: #49b3ff;
    box-shadow: 0 0 0 3px rgba(73,179,255,0.25);
  }

  /* 错误状态 */
  input.error {
    border-color: #d40000;
    box-shadow: 0 0 0 3px rgba(212,0,0,0.25);
  }

  /* 成功状态 */
  input.success {
    border-color: #009944;
    box-shadow: 0 0 0 3px rgba(0,153,68,0.25);
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
