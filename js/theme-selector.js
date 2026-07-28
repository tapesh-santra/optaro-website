/* ============================================================
   OPTARO — theme switcher + demo form + minimal parallax
   ============================================================ */

/* Theme switching (persisted). All theme stylesheets are loaded;
   setting data-theme on <html> activates the matching one. */
(function(){
  const root = document.documentElement, name = document.getElementById('tsName');
  const swatches = Array.from(document.querySelectorAll('.swatch')), KEY = 'optaro-theme';
  function apply(t){
    root.setAttribute('data-theme', t);
    swatches.forEach(s => s.setAttribute('aria-pressed', String(s.dataset.theme === t)));
    const active = swatches.find(s => s.dataset.theme === t);
    if (active && name) name.textContent = active.dataset.name;
    try { localStorage.setItem(KEY, t); } catch(e){}
  }
  swatches.forEach(s => s.addEventListener('click', () => apply(s.dataset.theme)));
  let saved; try { saved = localStorage.getItem(KEY); } catch(e){}
  apply(saved && swatches.some(s => s.dataset.theme === saved) ? saved : 'warm-premium');
})();

/* Demo form → Web3Forms */
(function(){
  const form = document.getElementById('demoForm'), btn = document.getElementById('demoSubmit');
  if (!form || !btn) return;
  function done(){
    btn.disabled = true; btn.textContent = '✓ Request received'; btn.classList.add('done');
    form.querySelectorAll('input,textarea').forEach(el => el.disabled = true);
  }
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const g = id => (document.getElementById(id).value || '').trim();
    const first = g('f-first'), last = g('f-last'), email = g('f-email'),
          company = g('f-company'), title = g('f-title'), problem = g('f-problem');
    const fullName = (first + ' ' + last).trim();
    btn.disabled = true; btn.textContent = 'Sending…';
    fetch('https://api.web3forms.com/submit', {
      method:'POST', headers:{ 'Content-Type':'application/json', 'Accept':'application/json' },
      body: JSON.stringify({
        access_key:'a307bbb3-2ed2-4fc0-ba48-0c3748eeccf9',
        subject:'Demo Request from ' + (fullName || email) + ' at ' + company,
        from_name:'Optaro.ai Website',
        first_name:first || '(not provided)', last_name:last || '(not provided)', name:fullName || '(not provided)',
        email:email, company:company, title:title || '(not provided)', message:problem || '(No problem description provided)'
      })
    }).then(() => done()).catch(() => done());
  });
})();

/* Minimal parallax — transform-only, rAF, respects reduced-motion,
   viewport-height-independent travel budget (never reveals edges). */
(function(){
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = Array.from(document.querySelectorAll('[data-parallax]'));
  if (reduce || !items.length) return;
  let ticking = false;
  function update(){
    const vh = window.innerHeight;
    for (const el of items){
      const host = el.closest('.bleed') || el.parentElement;
      const r = host.getBoundingClientRect();
      if (r.bottom < -60 || r.top > vh + 60) continue;
      const progress = Math.max(0, Math.min(1, (vh - r.top) / (vh + r.height)));
      const factor = parseFloat(el.dataset.parallax) || 0.22;
      const maxTravel = r.height * factor;
      el.style.transform = 'translate3d(0,' + ((progress - 0.5) * 2 * maxTravel).toFixed(1) + 'px,0)';
    }
    ticking = false;
  }
  function onScroll(){ if (!ticking){ ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive:true });
  window.addEventListener('resize', onScroll, { passive:true });
  update();
})();
