document.addEventListener('DOMContentLoaded', () => {
  let currentAgentId = '';
  let autoRefreshInterval = null;

  // DOM Elements
  const agentSelect = document.getElementById('agent-select');
  const btnTriggerCycle = document.getElementById('btn-trigger-cycle');
  const btnNewAgent = document.getElementById('btn-new-agent');
  const initModal = document.getElementById('init-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnCancelModal = document.getElementById('btn-cancel-modal');
  const initAgentForm = document.getElementById('init-agent-form');
  const domainSelect = document.getElementById('persona-domain-select');
  const customDomainGroup = document.getElementById('custom-domain-group');
  const customDomainInput = document.getElementById('custom-domain-input');

  // Hero Elements
  const personaAvatar = document.getElementById('persona-avatar');
  const personaName = document.getElementById('persona-name');
  const personaDomain = document.getElementById('persona-domain');
  const personaTitleSub = document.getElementById('persona-title-sub');
  const personaStance = document.getElementById('persona-stance');
  const statPosts = document.getElementById('stat-posts');
  const statRejections = document.getElementById('stat-rejections');
  const statMemory = document.getElementById('stat-memory');
  const statLastActive = document.getElementById('stat-last-active');

  // Containers
  const feedContainer = document.getElementById('feed-container');
  const rejectionsContainer = document.getElementById('rejections-container');
  const memoryContainer = document.getElementById('memory-container');
  const promtContent = document.getElementById('promt-content');
  const btnRefreshPromt = document.getElementById('btn-refresh-promt');

  // Tab Navigation Setup
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetTab = btn.getAttribute('data-tab');
      document.getElementById(targetTab).classList.add('active');

      if (targetTab === 'tab-promt') {
        loadPromtLog();
      }
    });
  });

  // Modal toggle
  btnNewAgent.addEventListener('click', () => initModal.classList.remove('hidden'));
  btnCloseModal.addEventListener('click', () => initModal.classList.add('hidden'));
  btnCancelModal.addEventListener('click', () => initModal.classList.add('hidden'));

  domainSelect.addEventListener('change', (e) => {
    if (e.target.value === 'custom') {
      customDomainGroup.classList.remove('hidden');
      customDomainInput.required = true;
    } else {
      customDomainGroup.classList.add('hidden');
      customDomainInput.required = false;
    }
  });

  // Form Submission -> POST /api/agent/init
  initAgentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('persona-name-input').value.trim();
    let domain = domainSelect.value;
    if (domain === 'custom') {
      domain = customDomainInput.value.trim();
    }

    try {
      const res = await fetch('/api/agent/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona: { name, domain }
        })
      });

      const data = await res.json();
      if (data.agentId) {
        initModal.classList.add('hidden');
        await loadAgents(data.agentId);
      } else {
        alert('Failed to initialize agent: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Error connecting to server: ' + err.message);
    }
  });

  // Trigger manual autonomous cycle -> POST /api/agent/trigger
  btnTriggerCycle.addEventListener('click', async () => {
    if (!currentAgentId) return;
    btnTriggerCycle.disabled = true;
    btnTriggerCycle.innerHTML = `<span class="btn-icon">⌛</span> Running...`;

    try {
      await fetch('/api/agent/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: currentAgentId })
      });
      await refreshAllData();
    } catch (err) {
      console.error(err);
    } finally {
      btnTriggerCycle.disabled = false;
      btnTriggerCycle.innerHTML = `<span class="btn-icon">▶</span> Trigger Cycle`;
    }
  });

  // Agent selector change
  agentSelect.addEventListener('change', (e) => {
    currentAgentId = e.target.value;
    refreshAllData();
  });

  // Load available agents
  async function loadAgents(selectAgentId = '') {
    try {
      const res = await fetch('/api/agent/status');
      const data = await res.json();
      const agents = data.agents || [];

      agentSelect.innerHTML = '';
      if (agents.length === 0) {
        agentSelect.innerHTML = `<option value="">No active agents</option>`;
        return;
      }

      agents.forEach(a => {
        const opt = document.createElement('option');
        opt.value = a.id;
        opt.textContent = `${a.persona.name} (${a.persona.domain}) — [${a.id.substring(0, 16)}...]`;
        agentSelect.appendChild(opt);
      });

      currentAgentId = selectAgentId || agents[0].id;
      agentSelect.value = currentAgentId;
      await refreshAllData();
    } catch (err) {
      console.error('Error loading agents:', err);
    }
  }

  // Refresh feed & stats
  async function refreshAllData() {
    if (!currentAgentId) return;

    await Promise.all([
      loadAgentStats(),
      loadFeed(),
      loadRejections(),
      loadMemory()
    ]);
  }

  // Load Agent Stats
  async function loadAgentStats() {
    try {
      const res = await fetch(`/api/agent/status?agentId=${currentAgentId}`);
      const data = await res.json();
      if (data.agent) {
        const p = data.agent.config || data.agent.persona;
        personaAvatar.textContent = p.name ? p.name.charAt(0).toUpperCase() : 'A';
        personaName.textContent = p.name || 'Ada';
        personaDomain.textContent = p.domain || 'AI Security';
        personaTitleSub.textContent = p.title || `${p.domain} Specialist`;
        personaStance.textContent = `"${p.voice ? p.voice.editorialStance : 'Rigorous autonomous analysis.'}"`;

        statPosts.textContent = data.stats.postCount || 0;
        statRejections.textContent = data.stats.rejectionCount || 0;
        statMemory.textContent = data.stats.memoryItemCount || 0;

        if (data.stats.lastPublishedAt) {
          const dt = new Date(data.stats.lastPublishedAt);
          statLastActive.textContent = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        } else {
          statLastActive.textContent = 'Standby';
        }
      }
    } catch (e) {
      console.error('Error stats:', e);
    }
  }

  // Load Feed -> GET /api/agent/feed?agentId=...
  async function loadFeed() {
    try {
      const res = await fetch(`/api/agent/feed?agentId=${currentAgentId}`);
      const data = await res.json();
      const posts = data.posts || [];

      if (posts.length === 0) {
        feedContainer.innerHTML = `
          <div class="glass-card loading-state">
            <p>No published posts in feed yet.</p>
            <small>Autonomous worker will publish new posts automatically over time.</small>
          </div>
        `;
        return;
      }

      feedContainer.innerHTML = posts.map(post => `
        <article class="post-card glass-card">
          <div class="post-meta">
            <span class="post-id-tag">ID: ${post.id}</span>
            <time class="post-time">${new Date(post.createdAt).toISOString()}</time>
          </div>

          <div class="post-text">${escapeHtml(post.text)}</div>

          <div class="rationale-box">
            <div class="rationale-header">
              <span>🧠 Transparent Publishing Rationale</span>
            </div>
            <div class="rationale-text">${escapeHtml(post.rationale)}</div>
          </div>

          ${post.sources && post.sources.length > 0 ? `
            <div class="sources-list">
              <strong style="color: var(--text-muted);">Sources:</strong>
              ${post.sources.map(src => `<a href="${src}" target="_blank" rel="noopener" class="source-link">🔗 ${src}</a>`).join('')}
            </div>
          ` : ''}
        </article>
      `).join('');
    } catch (err) {
      feedContainer.innerHTML = `<div class="glass-card loading-state">Error loading feed.</div>`;
    }
  }

  // Load Rejections
  async function loadRejections() {
    try {
      const res = await fetch(`/api/agent/rejections?agentId=${currentAgentId}`);
      const data = await res.json();
      const rejections = data.rejections || [];

      if (rejections.length === 0) {
        rejectionsContainer.innerHTML = `<div class="glass-card loading-state">No candidates rejected yet.</div>`;
        return;
      }

      rejectionsContainer.innerHTML = rejections.slice(0, 15).map(rej => `
        <div class="rejection-card glass-card">
          <div class="rejection-meta">
            <span class="rejection-category">${escapeHtml(rej.category || 'Editorial Filter')}</span>
            <time>${new Date(rej.timestamp).toLocaleTimeString()}</time>
          </div>
          <div class="rejection-title">${escapeHtml(rej.candidateTitle || 'Candidate Topic')}</div>
          <div class="rejection-reason">${escapeHtml(rej.reason)}</div>
        </div>
      `).join('');
    } catch (e) {
      rejectionsContainer.innerHTML = `<div class="glass-card loading-state">Error loading rejections.</div>`;
    }
  }

  // Load Memory
  async function loadMemory() {
    try {
      const res = await fetch(`/api/agent/memory?agentId=${currentAgentId}`);
      const data = await res.json();
      const memory = data.memory || [];

      if (memory.length === 0) {
        memoryContainer.innerHTML = `<div class="glass-card loading-state">Memory bank empty.</div>`;
        return;
      }

      memoryContainer.innerHTML = memory.map(m => `
        <div class="memory-card glass-card">
          <div class="memory-title">Post ID: ${escapeHtml(m.postId)}</div>
          <div class="memory-summary">${escapeHtml(m.title || m.summary)}</div>
          <div style="font-size: 11px; color: var(--accent-cyan); margin-top: 8px;">
            Recorded: ${new Date(m.timestamp).toLocaleTimeString()}
          </div>
        </div>
      `).join('');
    } catch (e) {
      memoryContainer.innerHTML = `<div class="glass-card loading-state">Error loading memory.</div>`;
    }
  }

  // Load PROMT.md
  async function loadPromtLog() {
    btnRefreshPromt.addEventListener('click', loadPromtLog);
    try {
      const res = await fetch('/api/promt');
      const text = await res.text();
      promtContent.textContent = text;
    } catch (e) {
      promtContent.textContent = 'Error loading PROMT.md';
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Initial load
  loadAgents();

  // Setup periodic auto-refresh every 5 seconds for smooth evaluation observation
  autoRefreshInterval = setInterval(() => {
    refreshAllData();
  }, 5000);
});
