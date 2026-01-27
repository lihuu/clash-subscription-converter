export function getIndexHtml(baseUrl: string): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mihomo 订阅转换器</title>
  <meta name="description" content="将 VMESS、VLESS、Hysteria、Hysteria2、Shadowsocks、Trojan 等代理链接转换为 Mihomo YAML 配置">
  <style>
    :root {
      --bg-primary: #0a0a0f;
      --bg-secondary: #12121a;
      --bg-card: rgba(26, 26, 36, 0.8);
      --border-color: rgba(255, 255, 255, 0.1);
      --text-primary: #f0f0f5;
      --text-secondary: #8888a0;
      --accent: #6366f1;
      --accent-hover: #818cf8;
      --success: #22c55e;
      --error: #ef4444;
      --code-bg: #1e1e28;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      min-height: 100vh;
      line-height: 1.6;
    }

    .bg-gradient {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(ellipse at 20% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
      pointer-events: none;
      z-index: -1;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    header {
      text-align: center;
      margin-bottom: 40px;
    }

    h1 {
      font-size: 2.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 12px;
    }

    .subtitle {
      color: var(--text-secondary);
      font-size: 1rem;
    }

    .protocols {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 8px;
      margin-top: 16px;
    }

    .protocol-tag {
      padding: 4px 12px;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 20px;
      font-size: 0.85rem;
      color: var(--text-secondary);
      backdrop-filter: blur(10px);
    }

    .card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
      backdrop-filter: blur(20px);
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
    }

    .card-title {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .card-title::before {
      content: '';
      width: 4px;
      height: 20px;
      background: linear-gradient(180deg, var(--accent), #a855f7);
      border-radius: 2px;
    }

    .input-group {
      margin-bottom: 16px;
    }

    label {
      display: block;
      font-size: 0.9rem;
      color: var(--text-secondary);
      margin-bottom: 8px;
    }

    input[type="text"], textarea {
      width: 100%;
      padding: 14px 16px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      color: var(--text-primary);
      font-size: 0.95rem;
      font-family: 'SF Mono', 'Consolas', 'Monaco', monospace;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    input[type="text"]:focus, textarea:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    }

    textarea {
      min-height: 120px;
      resize: vertical;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 14px 28px;
      background: linear-gradient(135deg, var(--accent), #8b5cf6);
      border: none;
      border-radius: 10px;
      color: white;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      width: 100%;
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
    }

    .btn:active {
      transform: translateY(0);
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .btn-secondary {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      padding: 10px 20px;
      font-size: 0.9rem;
      width: auto;
    }

    .btn-secondary:hover {
      background: var(--bg-card);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .btn-small {
      padding: 8px 16px;
      font-size: 0.85rem;
      width: auto;
    }

    .btn-danger {
      background: var(--error);
      border-color: var(--error);
    }

    .btn-danger:hover {
      background: #dc2626;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }

    .result-container {
      display: none;
    }

    .result-container.visible {
      display: block;
    }

    .result-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      flex-wrap: wrap;
      gap: 12px;
    }

    .result-actions {
      display: flex;
      gap: 8px;
    }

    .code-block {
      background: var(--code-bg);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 16px;
      overflow-x: auto;
      font-family: 'SF Mono', 'Consolas', 'Monaco', monospace;
      font-size: 0.85rem;
      line-height: 1.6;
      max-height: 400px;
      overflow-y: auto;
      white-space: pre;
    }

    .api-link-container {
      margin-top: 16px;
      padding: 16px;
      background: var(--bg-secondary);
      border-radius: 10px;
      border: 1px solid var(--border-color);
    }

    .api-link-label {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin-bottom: 8px;
    }

    .api-link {
      display: flex;
      gap: 8px;
    }

    .api-link input {
      flex: 1;
      padding: 10px 14px;
      font-size: 0.85rem;
    }

    /* Rename Rules Styles */
    .rename-section {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--border-color);
    }

    .rename-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .rename-title {
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--text-primary);
    }

    .rename-help {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .rename-input-row {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }

    .rename-input-row input {
      flex: 1;
      padding: 10px 14px;
      font-size: 0.9rem;
    }

    .rename-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 12px;
    }

    .rename-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      font-family: 'SF Mono', 'Consolas', 'Monaco', monospace;
      font-size: 0.85rem;
    }

    .rename-item-content {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
      overflow: hidden;
    }

    .rename-pattern {
      color: var(--accent);
    }

    .rename-arrow {
      color: var(--text-secondary);
    }

    .rename-replacement {
      color: var(--success);
    }

    .rename-delete {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      transition: color 0.2s, background 0.2s;
    }

    .rename-delete:hover {
      color: var(--error);
      background: rgba(239, 68, 68, 0.1);
    }

    .toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      padding: 14px 20px;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      backdrop-filter: blur(20px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
      transform: translateY(100px);
      opacity: 0;
      transition: transform 0.3s, opacity 0.3s;
      z-index: 1000;
    }

    .toast.visible {
      transform: translateY(0);
      opacity: 1;
    }

    .toast.success {
      border-color: var(--success);
    }

    .toast.error {
      border-color: var(--error);
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid transparent;
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-message {
      color: var(--error);
      font-size: 0.9rem;
      margin-top: 12px;
      display: none;
    }

    .error-message.visible {
      display: block;
    }

    footer {
      text-align: center;
      margin-top: 40px;
      color: var(--text-secondary);
      font-size: 0.85rem;
    }

    footer a {
      color: var(--accent);
      text-decoration: none;
    }

    footer a:hover {
      text-decoration: underline;
    }

    @media (max-width: 600px) {
      h1 {
        font-size: 1.8rem;
      }
      
      .container {
        padding: 24px 16px;
      }
      
      .card {
        padding: 20px;
      }

      .rename-input-row {
        flex-direction: column;
      }
    }
  </style>
</head>
<body>
  <div class="bg-gradient"></div>
  
  <div class="container">
    <header>
      <h1>Mihomo 订阅转换器</h1>
      <p class="subtitle">将代理订阅链接转换为 Mihomo YAML 配置</p>
      <div class="protocols">
        <span class="protocol-tag">VMESS</span>
        <span class="protocol-tag">VLESS</span>
        <span class="protocol-tag">Hysteria</span>
        <span class="protocol-tag">Hysteria2</span>
        <span class="protocol-tag">Shadowsocks</span>
        <span class="protocol-tag">Trojan</span>
      </div>
    </header>

    <main>
      <div class="card">
        <h2 class="card-title">输入订阅</h2>
        
        <div class="input-group">
          <label for="subUrl">订阅链接</label>
          <input type="text" id="subUrl" placeholder="https://example.com/subscribe?token=xxx">
        </div>

        <div class="input-group">
          <label for="rawLinks">或者直接输入代理链接（每行一个）</label>
          <textarea id="rawLinks" placeholder="vmess://...&#10;vless://...&#10;ss://...&#10;trojan://..."></textarea>
        </div>

        <!-- Rename Rules Section -->
        <div class="rename-section">
          <div class="rename-header">
            <span class="rename-title">重命名规则（可选）</span>
            <span class="rename-help">正则匹配 → 替换名称</span>
          </div>
          
          <div class="rename-input-row">
            <input type="text" id="renamePattern" placeholder="匹配规则（支持正则）">
            <input type="text" id="renameReplacement" placeholder="替换名称">
            <button class="btn btn-secondary btn-small" id="addRenameBtn">添加</button>
          </div>

          <div class="rename-list" id="renameList"></div>
        </div>

        <button class="btn" id="convertBtn">
          <span class="btn-text">转换配置</span>
        </button>

        <p class="error-message" id="errorMsg"></p>
      </div>

      <div class="card result-container" id="resultContainer">
        <div class="result-header">
          <h2 class="card-title">转换结果</h2>
          <div class="result-actions">
            <button class="btn btn-secondary" id="copyBtn">复制配置</button>
            <button class="btn btn-secondary" id="downloadBtn">下载文件</button>
          </div>
        </div>

        <div class="code-block" id="yamlOutput"></div>

        <div class="api-link-container">
          <p class="api-link-label">API 链接（可在 Mihomo 中直接使用）</p>
          <div class="api-link">
            <input type="text" id="apiLink" readonly>
            <button class="btn btn-secondary" id="copyApiBtn">复制</button>
          </div>
        </div>
      </div>
    </main>

    <footer>
      <p>Powered by Cloudflare Workers</p>
    </footer>
  </div>

  <div class="toast" id="toast"></div>

  <script>
    const baseUrl = '${baseUrl}';
    const subUrlInput = document.getElementById('subUrl');
    const rawLinksInput = document.getElementById('rawLinks');
    const convertBtn = document.getElementById('convertBtn');
    const resultContainer = document.getElementById('resultContainer');
    const yamlOutput = document.getElementById('yamlOutput');
    const apiLink = document.getElementById('apiLink');
    const errorMsg = document.getElementById('errorMsg');
    const toast = document.getElementById('toast');

    // Rename rules storage
    let renameRules = [];

    function showToast(message, type = 'success') {
      toast.textContent = message;
      toast.className = 'toast visible ' + type;
      setTimeout(() => {
        toast.className = 'toast';
      }, 2500);
    }

    function setLoading(loading) {
      convertBtn.disabled = loading;
      convertBtn.innerHTML = loading 
        ? '<div class="spinner"></div><span>转换中...</span>' 
        : '<span class="btn-text">转换配置</span>';
    }

    function showError(message) {
      errorMsg.textContent = message;
      errorMsg.classList.add('visible');
    }

    function hideError() {
      errorMsg.classList.remove('visible');
    }

    // Rename rules management
    function addRenameRule() {
      const patternInput = document.getElementById('renamePattern');
      const replacementInput = document.getElementById('renameReplacement');
      const pattern = patternInput.value.trim();
      const replacement = replacementInput.value.trim();

      if (!pattern || !replacement) {
        showToast('请输入匹配规则和替换名称', 'error');
        return;
      }

      // Validate regex
      try {
        new RegExp(pattern);
      } catch (e) {
        showToast('无效的正则表达式', 'error');
        return;
      }

      renameRules.push({ pattern, replacement });
      renderRenameList();
      patternInput.value = '';
      replacementInput.value = '';
      showToast('规则已添加');
    }

    function removeRenameRule(index) {
      renameRules.splice(index, 1);
      renderRenameList();
    }

    function renderRenameList() {
      const list = document.getElementById('renameList');
      if (renameRules.length === 0) {
        list.innerHTML = '';
        return;
      }

      list.innerHTML = renameRules.map((rule, index) => 
        '<div class="rename-item">' +
          '<div class="rename-item-content">' +
            '<span class="rename-pattern">' + escapeHtml(rule.pattern) + '</span>' +
            '<span class="rename-arrow">→</span>' +
            '<span class="rename-replacement">' + escapeHtml(rule.replacement) + '</span>' +
          '</div>' +
          '<button class="rename-delete" onclick="removeRenameRule(' + index + ')">✕</button>' +
        '</div>'
      ).join('');
    }

    function escapeHtml(str) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function getRenameParam() {
      if (renameRules.length === 0) return '';
      return renameRules.map(r => r.pattern + '@' + r.replacement).join('+');
    }

    function generateApiUrl(subUrl) {
      // URL encode then Base64 encode
      const encoded = btoa(encodeURIComponent(subUrl));
      let url = baseUrl + '/convert?url=' + encodeURIComponent(encoded);
      
      // Add rename parameter if rules exist
      const renameParam = getRenameParam();
      if (renameParam) {
        url += '&rename=' + encodeURIComponent(renameParam);
      }
      
      return url;
    }

    async function convert() {
      hideError();
      const subUrl = subUrlInput.value.trim();
      const rawLinks = rawLinksInput.value.trim();

      if (!subUrl && !rawLinks) {
        showError('请输入订阅链接或代理链接');
        return;
      }

      setLoading(true);

      try {
        let response;
        const renameParam = getRenameParam();
        
        if (rawLinks) {
          // Direct links mode - encode the raw links
          const encoded = btoa(unescape(encodeURIComponent(rawLinks)));
          let postUrl = baseUrl + '/convert';
          if (renameParam) {
            postUrl += '?rename=' + encodeURIComponent(renameParam);
          }
          response = await fetch(postUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: encoded
          });
        } else {
          // Subscription URL mode
          const apiUrl = generateApiUrl(subUrl);
          response = await fetch(apiUrl);
        }

        if (!response.ok) {
          throw new Error('转换失败: ' + response.statusText);
        }

        const yaml = await response.text();
        
        if (!yaml || yaml.includes('No valid proxies found')) {
          showError('未找到有效的代理配置');
          setLoading(false);
          return;
        }

        yamlOutput.textContent = yaml;
        resultContainer.classList.add('visible');

        if (subUrl) {
          apiLink.value = generateApiUrl(subUrl);
        } else {
          apiLink.value = '（直接输入模式不生成 API 链接）';
        }

        showToast('转换成功！');
      } catch (err) {
        showError('转换出错: ' + err.message);
      } finally {
        setLoading(false);
      }
    }

    // Event listeners
    convertBtn.addEventListener('click', convert);
    document.getElementById('addRenameBtn').addEventListener('click', addRenameRule);

    document.getElementById('renamePattern').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('renameReplacement').focus();
      }
    });

    document.getElementById('renameReplacement').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addRenameRule();
    });

    document.getElementById('copyBtn').addEventListener('click', () => {
      navigator.clipboard.writeText(yamlOutput.textContent);
      showToast('配置已复制到剪贴板');
    });

    document.getElementById('copyApiBtn').addEventListener('click', () => {
      navigator.clipboard.writeText(apiLink.value);
      showToast('API 链接已复制到剪贴板');
    });

    document.getElementById('downloadBtn').addEventListener('click', () => {
      const blob = new Blob([yamlOutput.textContent], { type: 'text/yaml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mihomo-config.yaml';
      a.click();
      URL.revokeObjectURL(url);
      showToast('配置文件已下载');
    });

    // Allow Enter key to trigger conversion
    subUrlInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') convert();
    });
  </script>
</body>
</html>`;
}
