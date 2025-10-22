<footer class="footer">
  <div class="footer-container">
    <p class="copyright">@2025 BlueCatFour</p>
  </div>
</footer>

<footer class="footer">
  <div class="footer-container">
    <p class="copyright">@2025 BlueCatFour</p>
  </div>
</footer>

<style>
.footer {
  background-color: rgba(255, 255, 255, 0.328); /* 更明显的半透明效果 */
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  position: fixed; /* 改为 fixed 以吸附在底部 */
  bottom: 0;
  left: 0;
  z-index: 100;
  width: 100%;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  min-height: 60px; /* 增加最小高度 */
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem; /* 增加内边距 */
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.copyright {
  color: #0066cc;
  font-size: 0.9rem;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .footer-container {
    padding: 1rem; /* 调整小屏幕下的内边距 */
  }
  
  .copyright {
    font-size: 0.8rem;
  }
}
</style>