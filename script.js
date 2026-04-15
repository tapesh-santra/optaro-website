/* ═══════════════════════════════════════════════
   OPTARO.AI — Main Script
   Particles, Scroll Animations, Agent Network
   ═══════════════════════════════════════════════ */

// ── Theme Toggle ──
(function initThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  const icon = document.getElementById('themeIcon');
  if (!toggle || !icon) return;

  function applyIcon() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    icon.classList.remove('fa-sun', 'fa-moon');
    icon.classList.add(isLight ? 'fa-moon' : 'fa-sun');
  }
  applyIcon();

  toggle.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const next = isLight ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('optaro-theme', next);
    applyIcon();
    if (window._updateParticleTheme) window._updateParticleTheme();
    // Notify iframes of theme change
    var iframes = document.querySelectorAll('iframe');
    iframes.forEach(function(f) {
      try { f.contentWindow.postMessage({ type: 'theme-change', theme: next }, '*'); } catch(e) {}
    });
  });
})();

// ── Particle Background ──
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, dpr;
  const particles = [];
  const PARTICLE_COUNT = 80;

  const darkColors = ['#6366f1', '#00d4ff', '#bf5fff', '#00ff87'];
  const lightColors = ['#818cf8', '#22d3ee', '#c084fc', '#34d399'];

  function isLight() {
    return document.documentElement.getAttribute('data-theme') === 'light';
  }

  function getColors() { return isLight() ? lightColors : darkColors; }
  function getConnectionAlpha(base) { return isLight() ? base * 1.5 : base; }

  function resize() {
    dpr = window.devicePixelRatio || 1;
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function createParticle() {
    const colors = getColors();
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.4 + 0.1,
      colorIndex: Math.floor(Math.random() * 4),
      get color() { return getColors()[this.colorIndex]; }
    };
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(createParticle());

  window._updateParticleTheme = function() {};

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw connections
    const connBase = isLight() ? 'rgba(129, 140, 248,' : 'rgba(99, 102, 241,';
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = connBase + (getConnectionAlpha(0.06) * (1 - dist / 150)) + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Draw particles
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Glow
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3);
      grad.addColorStop(0, p.color + '22');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  draw();
})();


// ── Navbar Scroll ──
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const links = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      navToggle.classList.toggle('active');
    });
  }

  // Active link tracking
  const sections = document.querySelectorAll('section[id]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-link[href="#${id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.3 });
  sections.forEach(s => observer.observe(s));

  // Close mobile menu on link click
  links.forEach(l => l.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('active');
  }));
})();


// ── Scroll Animations ──
// Strategy: JS hides off-screen elements, then reveals on scroll.
// If JS fails, elements stay visible (no opacity:0 in base CSS).
(function initScrollAnimations() {
  const items = document.querySelectorAll('.animate-on-scroll');

  // Hide elements that are NOT currently in the viewport
  items.forEach(item => {
    const rect = item.getBoundingClientRect();
    if (rect.top >= window.innerHeight) {
      item.classList.add('scroll-hidden');
    }
  });

  function revealVisible() {
    items.forEach(item => {
      if (!item.classList.contains('scroll-hidden')) return;
      const rect = item.getBoundingClientRect();
      if (rect.top < window.innerHeight - 40) {
        item.classList.add('scroll-visible');
        if (item.classList.contains('platform-card')) {
          item.classList.add('animated');
        }
      }
    });
  }

  window.addEventListener('scroll', revealVisible, { passive: true });
  window.addEventListener('resize', revealVisible);
  // Initial check
  revealVisible();
})();


// ── Stat Counter Animation ──
(function initStatCounters() {
  const stats = document.querySelectorAll('.stat-value');
  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    if (animated) return;
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animated = true;
        stats.forEach(stat => {
          const target = parseInt(stat.dataset.target) || 0;
          const prefix = stat.dataset.prefix || '';
          const suffix = stat.dataset.suffix || '';
          const finalText = stat.textContent;
          let current = 0;
          const duration = 2000;
          const start = performance.now();

          function step(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            current = Math.round(target * eased);
            stat.textContent = prefix + current + suffix;
            if (progress < 1) requestAnimationFrame(step);
            else stat.textContent = finalText;
          }
          stat.textContent = prefix + '0' + suffix;
          requestAnimationFrame(step);
        });
      }
    });
  }, { threshold: 0.5 });

  const container = document.querySelector('.hero-stats');
  if (container) observer.observe(container);
})();


// ── Form Handling ──
(function initForm() {
  const form = document.getElementById('ctaForm');
  if (!form) return;

  function clearErrors() {
    form.querySelectorAll('.form-group').forEach(g => g.classList.remove('has-error'));
  }

  function showError(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    const group = el.closest('.form-group');
    group.classList.add('has-error');
    const errSpan = group.querySelector('.form-error');
    if (errSpan) errSpan.textContent = msg;
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();

    const name = document.getElementById('formName').value.trim();
    const email = document.getElementById('formEmail').value.trim();
    const company = document.getElementById('formCompany').value.trim();
    const size = document.getElementById('formSize').value;
    const message = document.getElementById('formMessage').value.trim();

    let valid = true;

    if (!name) { showError('formName', 'Please enter your name'); valid = false; }
    if (!email) { showError('formEmail', 'Please enter your email'); valid = false; }
    else if (!validateEmail(email)) { showError('formEmail', 'Please enter a valid email address'); valid = false; }
    if (!company) { showError('formCompany', 'Please enter your company name'); valid = false; }
    if (!size) { showError('formSize', 'Please select your company size'); valid = false; }

    if (!valid) return;

    // Build email body and send via mailto
    const sizeLabel = size === '50-500' ? '$50M – $500M Revenue' : '$500M – $5B+ Revenue';
    const subject = encodeURIComponent('Demo Request from ' + name + ' at ' + company);
    const body = encodeURIComponent(
      'New Demo Request\n' +
      '────────────────────\n\n' +
      'Name: ' + name + '\n' +
      'Email: ' + email + '\n' +
      'Company: ' + company + '\n' +
      'Company Size: ' + sizeLabel + '\n\n' +
      'Message:\n' + (message || '(No message provided)') + '\n'
    );

    // Show success state first
    const btn = form.querySelector('.btn');
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> <span>Thank you! We\'ll be in touch.</span>';
    form.classList.add('success');

    // Open mailto after a short delay so user sees the success message
    const mailtoLink = 'mailto:marketing@optaro.ai?subject=' + subject + '&body=' + body;
    setTimeout(() => {
      const a = document.createElement('a');
      a.href = mailtoLink;
      a.target = '_blank';
      a.rel = 'noopener';
      a.click();
    }, 500);

    setTimeout(() => {
      btn.innerHTML = original;
      form.classList.remove('success');
      form.reset();
    }, 5000);
  });

  // Clear error on input
  form.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', () => {
      const group = el.closest('.form-group');
      if (group) group.classList.remove('has-error');
    });
  });
})();


// ═══════════════════════════════════════════════
//  AGENT NETWORK VISUALIZATION
// ═══════════════════════════════════════════════

(function initAgentNetwork() {
  const canvas = document.getElementById('agentCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, dpr = 1;

  const COLORS = {
    command:      { main: '#00ff87', glow: '#00ff87', bg: 'rgba(0,255,135,0.12)',  text: '#00ff87', fill: 'rgba(0,255,135,0.08)' },
    orchestrator: { main: '#00ffcc', glow: '#00ffaa', bg: 'rgba(0,255,204,0.10)',  text: '#00ffcc', fill: 'rgba(0,255,204,0.06)' },
    super:        { main: '#bf5fff', glow: '#a855f7', bg: 'rgba(191,95,255,0.10)', text: '#d08fff', fill: 'rgba(191,95,255,0.07)' },
    utility:      { main: '#00d4ff', glow: '#00bbff', bg: 'rgba(0,212,255,0.10)',  text: '#00e5ff', fill: 'rgba(0,212,255,0.06)' },
  };

  const agents = [
    { id: 'cmd', label: 'Command Centre',             tier: 'command',      icon: '\u2B22', desc: 'Central AI brain' },
    { id: 'ppo', label: 'Planning Orchestrator',      tier: 'orchestrator', icon: '\u2699', desc: 'Coordinates planning parameters' },
    { id: 'imo', label: 'Inventory Orchestrator',     tier: 'orchestrator', icon: '\u21C4', desc: 'Manages inventory flow' },
    { id: 'dss', label: 'Dynamic Safety Stock',       tier: 'super',        icon: '\u2606', desc: 'Optimal safety stock' },
    { id: 'srb', label: 'Stock Rebalancing',          tier: 'super',        icon: '\u21F5', desc: 'Inter-site transfers' },
    { id: 'prs', label: 'Production Rescheduling',    tier: 'super',        icon: '\u2692', desc: 'Schedule adjustments' },
    { id: 'exp', label: 'Expedite',                   tier: 'super',        icon: '\u26A1', desc: 'Emergency procurement' },
    { id: 'tlt', label: 'Transport Lead Time',        tier: 'utility',      icon: '\u2708', desc: 'Route lead-time estimates' },
    { id: 'moq', label: 'MOQ Calculator',             tier: 'utility',      icon: '\u2261', desc: 'Minimum order quantities' },
    { id: 'wba', label: 'Writeback Agent',            tier: 'utility',      icon: '\u21E9', desc: 'ERP write-back' },
    { id: 'pri', label: 'Projected Inventory',        tier: 'utility',      icon: '\u2197', desc: 'Future inventory positions' },
    { id: 'isc', label: 'Shortage / Excess',          tier: 'utility',      icon: '\u26A0', desc: 'Gap detection' },
  ];

  const agentMap = {};
  agents.forEach(a => {
    a.x = 0; a.y = 0; a.activation = 0; a.baseRadius = 0;
    agentMap[a.id] = a;
  });

  const connections = [
    ['cmd','ppo'], ['cmd','imo'],
    ['ppo','dss'], ['ppo','srb'],
    ['imo','srb'], ['imo','prs'], ['imo','exp'],
    ['dss','tlt'], ['dss','pri'],
    ['srb','moq'], ['srb','pri'], ['srb','wba'], ['srb','tlt'],
    ['prs','pri'], ['prs','wba'], ['prs','moq'],
    ['exp','isc'], ['exp','pri'], ['exp','tlt'],
    ['isc','exp'], ['pri','srb'],
  ];

  const scenarios = [
    {
      title: 'Expedite Emergency Order',
      desc: 'Critical shortage detected \u2014 system triggers urgent procurement across the agent chain.',
      recommendation: {
        title: 'Expedite Order #EXP-4892',
        body: 'SKU-4892 projected <strong>shortage at DC-West</strong> in 5 days. Air freight booked. <strong>ETA: 2 days</strong>. Cost delta: +$12,400.',
      },
      steps: [
        { agent: 'cmd', action: 'Detects demand anomaly, activates Inventory Orchestrator' },
        { agent: 'imo', action: 'Evaluates situation, delegates to Expedite agent' },
        { agent: 'exp', action: 'Queries utility agents for shortage analysis' },
        { agent: 'isc', action: 'Confirms shortage: 1,200 units below safety stock' },
        { agent: 'pri', action: 'Validates no inbound orders cover the gap' },
        { agent: 'tlt', action: 'Returns fastest route: air freight, 2-day transit' },
        { agent: 'exp', action: 'Compiles expedite recommendation with cost analysis' },
        { agent: 'wba', action: 'Writes PO and updated ETA back to ERP' },
      ],
      chain: ['cmd','imo','exp','isc','pri','tlt','exp','wba'],
    },
    {
      title: 'Safety Stock Recalibration',
      desc: 'Demand variability spike triggers dynamic safety stock adjustment.',
      recommendation: {
        title: 'Safety Stock Update #SS-1201',
        body: 'SKU-1201 safety stock increased from <strong>450 to 620 units</strong> based on 34% demand variability spike. Service level: <strong>98.5%</strong>.',
      },
      steps: [
        { agent: 'cmd', action: 'Scheduled planning review, activates Planning Orchestrator' },
        { agent: 'ppo', action: 'Initiates safety stock recalculation' },
        { agent: 'dss', action: 'Pulls latest demand & lead-time data' },
        { agent: 'tlt', action: 'Returns updated supplier lead times (+1.2 days)' },
        { agent: 'pri', action: 'Projects forward inventory under new SS levels' },
        { agent: 'dss', action: 'Optimizes safety stock: 450 \u2192 620 units' },
        { agent: 'wba', action: 'Updates safety stock parameter in planning system' },
      ],
      chain: ['cmd','ppo','dss','tlt','pri','dss','wba'],
    },
    {
      title: 'Cross-DC Stock Rebalance',
      desc: 'Excess inventory at one DC, shortage at another \u2014 triggers rebalancing.',
      recommendation: {
        title: 'Stock Transfer #TR-3301',
        body: 'Transfer <strong>1,200 units of SKU-3301</strong> from DC-East to DC-Central. Transit: 3 days. Avoids <strong>$45K in lost sales</strong>.',
      },
      steps: [
        { agent: 'cmd', action: 'Inventory imbalance alert, activates Orchestrator' },
        { agent: 'imo', action: 'Routes to Stock Rebalancing agent' },
        { agent: 'srb', action: 'Queries projected inventory across all DCs' },
        { agent: 'pri', action: 'Returns: DC-East +3,400 excess, DC-Central -1,200' },
        { agent: 'tlt', action: 'Calculates inter-DC transfer lead time: 3 days' },
        { agent: 'moq', action: 'Validates transfer qty meets minimum threshold' },
        { agent: 'srb', action: 'Generates optimal transfer plan' },
        { agent: 'wba', action: 'Creates transfer order in WMS' },
      ],
      chain: ['cmd','imo','srb','pri','tlt','moq','srb','wba'],
    },
    {
      title: 'Production Reschedule',
      desc: 'Supply disruption triggers manufacturing schedule adjustment.',
      recommendation: {
        title: 'Reschedule #PR-7750',
        body: 'Shift <strong>Line-3 production of SKU-7750</strong> forward by 2 days. MOQ validated. <strong>No additional cost</strong> \u2014 capacity available.',
      },
      steps: [
        { agent: 'cmd', action: 'Supplier delay received, activates Orchestrator' },
        { agent: 'imo', action: 'Delegates to Production Rescheduling agent' },
        { agent: 'prs', action: 'Analyzes schedule and queries projected inventory' },
        { agent: 'pri', action: 'Projects stockout in 8 days without change' },
        { agent: 'moq', action: 'Confirms min production batch is feasible' },
        { agent: 'prs', action: 'Generates reschedule: move Line-3 forward 2 days' },
        { agent: 'wba', action: 'Updates production schedule in MES' },
      ],
      chain: ['cmd','imo','prs','pri','moq','prs','wba'],
    },
  ];

  let currentScenario = 0;
  let currentStep = -1;
  let stepTimer = null;
  let animFrame = null;
  let pulseParticles = [];
  let hoverAgent = null;

  // Tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'agent-tooltip';
  tooltip.style.cssText = 'position:fixed;z-index:100;background:rgba(10,10,26,0.92);border:1px solid rgba(99,102,241,0.25);border-radius:12px;padding:12px 16px;backdrop-filter:blur(16px);max-width:220px;pointer-events:none;opacity:0;transition:opacity 0.2s;font-family:Inter,sans-serif;';
  document.body.appendChild(tooltip);

  function resize() {
    const container = canvas.parentElement;
    dpr = window.devicePixelRatio || 1;
    W = container.clientWidth;
    H = container.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    layoutNodes();
  }

  function layoutNodes() {
    const cx = W / 2 + 30;
    const topY = 60;
    const tierH = (H - 100) / 3.2;

    agentMap.cmd.x = cx;         agentMap.cmd.y = topY;           agentMap.cmd.baseRadius = 36;
    agentMap.ppo.x = cx - 140;   agentMap.ppo.y = topY + tierH * 0.85; agentMap.ppo.baseRadius = 30;
    agentMap.imo.x = cx + 140;   agentMap.imo.y = topY + tierH * 0.85; agentMap.imo.baseRadius = 30;

    const sy = topY + tierH * 1.7;
    const sw = Math.min(W * 0.5, 480);
    agentMap.dss.x = cx - sw * 0.5;  agentMap.dss.y = sy; agentMap.dss.baseRadius = 26;
    agentMap.srb.x = cx - sw * 0.17; agentMap.srb.y = sy; agentMap.srb.baseRadius = 26;
    agentMap.prs.x = cx + sw * 0.17; agentMap.prs.y = sy; agentMap.prs.baseRadius = 26;
    agentMap.exp.x = cx + sw * 0.5;  agentMap.exp.y = sy; agentMap.exp.baseRadius = 26;

    const uy = topY + tierH * 2.5;
    const uw = Math.min(W * 0.56, 560);
    const utilIds = ['tlt','moq','wba','pri','isc'];
    utilIds.forEach((id, i) => {
      agentMap[id].x = cx - uw / 2 + (uw / (utilIds.length - 1)) * i;
      agentMap[id].y = uy;
      agentMap[id].baseRadius = 22;
    });
  }

  function drawConnection(a, b, alpha) {
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = `rgba(99,102,241,${0.08 * alpha})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function drawAgent(agent, time) {
    const col = COLORS[agent.tier];
    const r = agent.baseRadius;
    const act = agent.activation;
    const pulse = 1 + Math.sin(time * 2 + agents.indexOf(agent)) * 0.03;
    const finalR = r * pulse + act * 8;

    // Outer glow
    if (act > 0.1) {
      const glowR = finalR + 20 * act;
      const grd = ctx.createRadialGradient(agent.x, agent.y, finalR * 0.5, agent.x, agent.y, glowR);
      grd.addColorStop(0, col.main + Math.round(40 * act).toString(16).padStart(2, '0'));
      grd.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(agent.x, agent.y, glowR, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
    }

    // Node circle
    ctx.beginPath();
    ctx.arc(agent.x, agent.y, finalR, 0, Math.PI * 2);
    ctx.fillStyle = col.fill;
    ctx.fill();
    ctx.strokeStyle = col.main + (act > 0.3 ? 'cc' : '44');
    ctx.lineWidth = act > 0.3 ? 2 : 1;
    ctx.stroke();

    // Icon
    ctx.font = `${finalR * 0.7}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = col.text;
    ctx.globalAlpha = 0.6 + act * 0.4;
    ctx.fillText(agent.icon, agent.x, agent.y);
    ctx.globalAlpha = 1;

    // Label
    ctx.font = '500 10px Inter, sans-serif';
    ctx.fillStyle = act > 0.3 ? '#fff' : '#6a6a8e';
    ctx.fillText(agent.label, agent.x, agent.y + finalR + 14);
  }

  function drawPulseParticle(p) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life;
    ctx.fill();
    const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 8);
    grd.addColorStop(0, p.color + '66');
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function animate() {
    const time = performance.now() / 1000;
    ctx.clearRect(0, 0, W, H);

    // Draw connections
    connections.forEach(([aId, bId]) => {
      const a = agentMap[aId], b = agentMap[bId];
      const alpha = Math.max(a.activation, b.activation, 0.4);
      drawConnection(a, b, alpha);
    });

    // Draw agents
    agents.forEach(a => {
      a.activation *= 0.97; // decay
      drawAgent(a, time);
    });

    // Draw pulse particles
    pulseParticles = pulseParticles.filter(p => p.life > 0);
    pulseParticles.forEach(p => {
      p.progress += p.speed;
      if (p.progress >= 1) { p.life = 0; return; }
      p.x = p.sx + (p.ex - p.sx) * p.progress;
      p.y = p.sy + (p.ey - p.sy) * p.progress;
      p.life -= 0.005;
      drawPulseParticle(p);
    });

    animFrame = requestAnimationFrame(animate);
  }

  function emitPulse(fromId, toId) {
    const from = agentMap[fromId], to = agentMap[toId];
    if (!from || !to) return;
    const col = COLORS[from.tier];
    for (let i = 0; i < 3; i++) {
      pulseParticles.push({
        sx: from.x, sy: from.y,
        ex: to.x, ey: to.y,
        x: from.x, y: from.y,
        progress: -i * 0.08,
        speed: 0.015 + Math.random() * 0.005,
        life: 1,
        color: col.main,
      });
    }
  }

  function runScenario(idx) {
    currentScenario = idx;
    currentStep = -1;
    agents.forEach(a => a.activation = 0);
    pulseParticles = [];

    const scenario = scenarios[idx];
    const infoTitle = document.getElementById('scenarioTitle');
    const infoDesc = document.getElementById('scenarioDesc');
    const stepsEl = document.getElementById('scenarioSteps');
    const recCard = document.getElementById('recCard');

    if (infoTitle) infoTitle.textContent = scenario.title;
    if (infoDesc) infoDesc.textContent = scenario.desc;
    if (recCard) recCard.classList.remove('visible');

    // Build step UI
    if (stepsEl) {
      stepsEl.innerHTML = scenario.steps.map((s, i) => {
        const agent = agentMap[s.agent];
        return `<div class="step-row" id="step-${i}">
          <div class="step-dot"></div>
          <div class="step-text"><span class="step-agent-name">${agent.label}</span> ${s.action}</div>
        </div>`;
      }).join('');
    }

    clearInterval(stepTimer);
    stepTimer = setInterval(() => advanceStep(), 2000);
    advanceStep(); // start immediately
  }

  function advanceStep() {
    const scenario = scenarios[currentScenario];
    currentStep++;

    if (currentStep >= scenario.steps.length) {
      clearInterval(stepTimer);
      // Show recommendation
      const recCard = document.getElementById('recCard');
      const recTitle = document.getElementById('recTitle');
      const recBody = document.getElementById('recBody');
      const recChain = document.getElementById('recChain');

      if (recTitle) recTitle.textContent = scenario.recommendation.title;
      if (recBody) recBody.innerHTML = scenario.recommendation.body;
      if (recChain) {
        recChain.innerHTML = scenario.chain.map((id, i) => {
          const a = agentMap[id];
          const arrow = i < scenario.chain.length - 1 ? '<span class="rec-chain-arrow">\u2192</span>' : '';
          return `<span class="rec-chain-node">${a.label}</span>${arrow}`;
        }).join('');
      }
      if (recCard) recCard.classList.add('visible');

      // Restart after pause
      setTimeout(() => runScenario(currentScenario), 6000);
      return;
    }

    const step = scenario.steps[currentStep];
    const agent = agentMap[step.agent];
    agent.activation = 1;

    // Mark steps
    scenario.steps.forEach((_, i) => {
      const el = document.getElementById(`step-${i}`);
      if (!el) return;
      el.className = 'step-row';
      if (i < currentStep) el.classList.add('completed');
      else if (i === currentStep) el.classList.add('active');
    });

    // Emit pulse from previous step agent
    if (currentStep > 0) {
      const prev = scenario.steps[currentStep - 1];
      emitPulse(prev.agent, step.agent);
    }
  }

  // Scenario buttons / cards
  document.querySelectorAll('.scenario-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.scenario-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      runScenario(parseInt(btn.dataset.scenario));
      // Scroll the agent network into view
      const wrapper = document.querySelector('.agent-network-wrapper');
      if (wrapper) wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  // Hover detection
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    let found = null;
    for (const a of agents) {
      const dx = mx - a.x, dy = my - a.y;
      if (Math.sqrt(dx * dx + dy * dy) < a.baseRadius + 10) {
        found = a;
        break;
      }
    }
    if (found !== hoverAgent) {
      hoverAgent = found;
      if (found) {
        const col = COLORS[found.tier];
        tooltip.innerHTML = `
          <div style="font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:600;color:#fff;margin-bottom:4px">${found.label}</div>
          <div style="font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${col.text};margin-bottom:6px">${found.tier}</div>
          <div style="font-size:11px;color:#7a7a9e;line-height:1.5">${found.desc}</div>
        `;
        tooltip.style.opacity = '1';
        canvas.style.cursor = 'pointer';
      } else {
        tooltip.style.opacity = '0';
        canvas.style.cursor = 'default';
      }
    }
    if (hoverAgent) {
      tooltip.style.left = (e.clientX + 16) + 'px';
      tooltip.style.top = (e.clientY - 10) + 'px';
    }
  });

  canvas.addEventListener('mouseleave', () => {
    hoverAgent = null;
    tooltip.style.opacity = '0';
    canvas.style.cursor = 'default';
  });

  // Initialize
  resize();
  window.addEventListener('resize', resize);

  // Start when visible
  const canvasObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animFrame) {
        animate();
        runScenario(0);
      }
    });
  }, { threshold: 0.1 });
  canvasObserver.observe(canvas);
})();


// ── Smooth Scroll for anchor links ──
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});


// ── Magnetic hover effect on cards ──
document.querySelectorAll('.platform-card, .stat-card, .serve-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 8;
    card.style.transform = `translateY(-6px) perspective(800px) rotateX(${-y}deg) rotateY(${x}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ── Use Case Card mouse-tracking glow ──
document.querySelectorAll('.usecase-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.querySelector('.usecase-card-glow').style.cssText =
      `top:${y - 150}px;left:${x - 150}px;right:auto;width:300px;height:300px;opacity:0.14;filter:blur(80px);`;
  });
  card.addEventListener('mouseleave', () => {
    const glow = card.querySelector('.usecase-card-glow');
    glow.style.cssText = '';
  });
});


// ── Typing effect for hero title ──
(function initTypingEffect() {
  const glowText = document.querySelector('.text-glow');
  if (!glowText) return;
  const original = glowText.textContent;
  glowText.textContent = '';
  let visible = false;

  const obs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !visible) {
      visible = true;
      let i = 0;
      const interval = setInterval(() => {
        glowText.textContent = original.slice(0, ++i);
        if (i >= original.length) clearInterval(interval);
      }, 100);
    }
  });
  obs.observe(glowText);
})();


// Modal code moved to modal.js
// (end of script.js)
/*
    {
      title: 'Transport Lane Lead Time Recommendations',
      icon: 'fa-route',
      color: '#00d4ff',
      rgb: '0,212,255',
      value: '8–12% fewer late deliveries',
      deploy: '14 days',
      agents: '3 agents',
      desc: 'Optaro continuously analyzes transport lane performance across your carrier network — tracking actual vs. planned lead times, identifying high-variability lanes, and detecting patterns in missed delivery windows. The system surfaces root causes like seasonal congestion, carrier underperformance, or routing inefficiencies, then autonomously recommends lane-level adjustments including carrier reallocation, buffer time updates, and alternative routing strategies.',
      features: [
        'Real-time carrier performance scoring across all lanes',
        'Variability detection with seasonal and trend decomposition',
        'Automated lead-time buffer recommendations per lane',
        'Carrier reallocation suggestions based on reliability data',
        'Integration with TMS for direct parameter updates',
      ],
    },
    {
      title: 'Projected Inventory Positions',
      icon: 'fa-chart-line',
      color: '#a855f7',
      rgb: '168,85,247',
      value: '15–20% reduction in stockouts',
      deploy: '10 days',
      agents: '4 agents',
      desc: 'Build a complete forward-looking view of your inventory across every SKU and location. Optaro\'s agents synthesize current on-hand stock, confirmed inbound shipments, open purchase orders, demand forecasts, and planned production schedules to project day-by-day inventory positions weeks into the future — giving planners and algorithms the foundation they need for proactive decision-making rather than reactive firefighting.',
      features: [
        'Multi-horizon projections: daily, weekly, and monthly roll-ups',
        'Automatic reconciliation of supply, demand, and WIP data',
        'Configurable projection parameters per SKU-location',
        'Exception alerts when projected positions breach safety thresholds',
        'Seamless data ingestion from ERP, WMS, and planning tools',
      ],
    },
    {
      title: 'Inventory Shortage & Excess Detection',
      icon: 'fa-triangle-exclamation',
      color: '#f43f5e',
      rgb: '244,63,94',
      value: '$2–5M working capital released',
      deploy: '12 days',
      agents: '4 agents',
      desc: 'Optaro\'s agents continuously compare projected inventory positions against demand requirements and safety stock thresholds to detect upcoming shortages and excess before they impact your business. Each alert includes a root-cause analysis, projected magnitude, and a prioritized set of recommended actions — from expediting inbound orders to launching markdown campaigns for aging excess stock.',
      features: [
        'Proactive detection 2–8 weeks ahead of impact',
        'Shortage severity scoring with revenue-at-risk quantification',
        'Excess aging analysis with holding cost projections',
        'Automated action recommendations: expedite, defer, rebalance, markdown',
        'Configurable alert thresholds per product segment',
      ],
    },
    {
      title: 'Expedite Management',
      icon: 'fa-truck-fast',
      color: '#00ff87',
      rgb: '0,255,135',
      value: '$1.5–3M in prevented lost sales',
      deploy: '14 days',
      agents: '5 agents',
      desc: 'When shortages are imminent, Optaro identifies every order and shipment that could be expedited and evaluates each one against projected impact, priority tiers, and cost-benefit thresholds. The system autonomously triggers procurement actions — booking air freight, splitting orders across backup suppliers, or accelerating internal transfers — while tracking the cost delta and maintaining full auditability for finance teams.',
      features: [
        'Priority-based expedite queue with cost-benefit scoring',
        'Automated carrier selection for fastest available route',
        'Supplier backup activation with pre-negotiated terms',
        'Real-time ETA tracking and proactive stakeholder alerts',
        'Full cost tracking with PO writeback to ERP',
      ],
    },
    {
      title: 'Production Rescheduling',
      icon: 'fa-industry',
      color: '#6366f1',
      rgb: '99,102,241',
      value: '25–40% fewer schedule disruptions',
      deploy: '18 days',
      agents: '5 agents',
      desc: 'When supply disruptions hit or demand shifts unexpectedly, Optaro\'s production rescheduling agents analyze your current manufacturing schedule, available capacity, material availability, and downstream commitments to generate optimized reschedule recommendations. The system validates minimum order quantities, checks capacity across lines, and confirms material availability before proposing changes — ensuring every recommendation is immediately actionable.',
      features: [
        'Multi-constraint rescheduling: capacity, materials, MOQs',
        'What-if scenario modeling for schedule change options',
        'Downstream impact analysis across dependent orders',
        'Direct writeback to MES and production planning systems',
        'Zero-cost-first optimization: use available capacity before overtime',
      ],
    },
    {
      title: 'Stock Rebalancing',
      icon: 'fa-arrows-rotate',
      color: '#f59e0b',
      rgb: '245,158,11',
      value: '$3–6M in prevented lost sales',
      deploy: '14 days',
      agents: '5 agents',
      desc: 'Optaro identifies inventory imbalances across your distribution network — surplus building at one location while another faces a shortage of the same SKU. The system evaluates transfer costs, transit times, minimum shipment thresholds, and demand forecasts at both origin and destination to generate optimal rebalancing plans that maximize network-wide fill rates while minimizing logistics cost.',
      features: [
        'Network-wide surplus and deficit mapping in real time',
        'Cost-optimized transfer recommendations with ROI scoring',
        'Multi-modal logistics evaluation: ground, rail, air',
        'Minimum shipment and pallet-quantity validation',
        'Transfer order creation with direct WMS writeback',
      ],
    },
    {
      title: 'Dynamic Safety Stock Optimization',
      icon: 'fa-shield-halved',
      color: '#22d3ee',
      rgb: '34,211,238',
      value: '10–15% inventory reduction at same service level',
      deploy: '14 days',
      agents: '4 agents',
      desc: 'Static safety stock settings decay the moment demand patterns shift. Optaro dynamically recalculates optimal safety stock levels by continuously analyzing demand variability, supplier lead-time uncertainty, and your target service levels — then writes the updated parameters directly back into your planning system. The result: lower inventory investment with the same or better fill rates.',
      features: [
        'Continuous recalculation based on live demand and lead-time signals',
        'Service-level-aware optimization: set targets per SKU segment',
        'Lead-time variability decomposition by supplier and lane',
        'Automated parameter writeback to SAP, Oracle, or NetSuite',
        'Before/after impact analysis for every recommended change',
      ],
    },
  ];

  const overlay = document.getElementById('ucModalOverlay');
  const modal = document.getElementById('ucModal');
  const closeBtn = document.getElementById('ucModalClose');
  if (!overlay || !modal) return;

  function openModal(index) {
    const d = useCaseData[index];
    if (!d) return;

    // Set color
    modal.style.setProperty('--modal-color', d.color);
    modal.style.setProperty('--modal-rgb', d.rgb);

    // Populate
    document.getElementById('ucModalIcon').innerHTML = `<i class="fas ${d.icon}"></i>`;
    document.getElementById('ucModalTitle').textContent = d.title;
    document.getElementById('ucModalDesc').textContent = d.desc;
    document.getElementById('ucMetricValue').textContent = d.value;
    document.getElementById('ucMetricDeploy').textContent = d.deploy;
    document.getElementById('ucMetricAgents').textContent = d.agents;
    document.getElementById('ucModalFeatures').innerHTML = d.features.map(f => `<li>${f}</li>`).join('');

    // Open
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Bind cards — use event delegation on the grid for reliability
  const grid = document.querySelector('.usecase-cards-grid');
  if (grid) {
    grid.addEventListener('click', (e) => {
      const card = e.target.closest('.usecase-card');
      if (!card) return;
      const cards = Array.from(grid.querySelectorAll('.usecase-card'));
      const idx = cards.indexOf(card);
      if (idx >= 0) openModal(idx);
    });
  }

  // Close handlers
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

*/
