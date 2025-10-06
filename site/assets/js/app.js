(function(){
  const data = window.PORTFOLIO_DATA || {};
  const A = window.PortfolioAnimations || {};

  function setActiveNav() {
    const path = (location.pathname.split('/').pop() || 'index.html');
    const links = document.querySelectorAll('.nav a');
    links.forEach(a => {
      const href = a.getAttribute('href');
      if (href === path) a.classList.add('active');
      else a.classList.remove('active');
    });
  }

  function setupNavToggle() {
    const btn = document.querySelector('.nav-toggle');
    const nav = document.getElementById('primary-nav');
    if (!btn || !nav) return;
    btn.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(isOpen));
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open');
      document.querySelector('.nav-toggle')?.setAttribute('aria-expanded', 'false');
    }));
  }

  function ensureYear() {
    const y = document.getElementById('year');
    if (y) y.textContent = String(new Date().getFullYear());
  }

  function renderFeaturedProjects(){
    const mount = document.getElementById('featuredProjects');
    if (!mount) return;
    const projects = (data.projects || []).filter(p => p.featured).slice(0, 3);
    mount.innerHTML = projects.map(projectCard).join('');
    A.initializeTilt?.('#featuredProjects .card');
  }

  function renderProjects(){
    const grid = document.getElementById('projectsGrid');
    const filters = document.getElementById('projectFilters');
    if (!grid || !filters) return;
    const all = data.projects || [];
    const tagSet = new Set();
    all.forEach(p => (p.tags||[]).forEach(t => tagSet.add(t)));
    const tags = ['All', ...Array.from(tagSet)];
    let current = 'All';

    function drawFilters(){
      filters.innerHTML = tags.map(t => `<button class="filter${t===current?' active':''}" data-tag="${t}">${t}</button>`).join('');
      filters.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => {
        current = btn.dataset.tag;
        drawFilters();
        drawGrid();
      }));
    }

    function drawGrid(){
      const list = current==='All' ? all : all.filter(p => (p.tags||[]).includes(current));
      grid.innerHTML = list.map(projectCard).join('');
      A.initializeTilt?.('#projectsGrid .card');
    }

    drawFilters();
    drawGrid();
  }

  function projectCard(p){
    const tags = (p.tags||[]).map(t => `<span class="tag">${t}</span>`).join('');
    const stack = (p.stack||[]).join(' • ');
    const linkBtn = p.link ? `<a class="btn" href="${p.link}" target="_blank" rel="noopener">Live</a>` : '';
    const repoBtn = p.repo ? `<a class="btn" href="${p.repo}" target="_blank" rel="noopener">Code</a>` : '';
    return `
      <article class="card tilt reveal-on-scroll">
        <h3>${p.title}</h3>
        <p>${p.description || ''}</p>
        <div class="tags">${tags}</div>
        <div class="stack">${stack}</div>
        <div class="actions">${linkBtn}${repoBtn}</div>
      </article>
    `;
  }

  function renderOrbitalSkills(mountId, maxPerRing = 8) {
    const mount = document.getElementById(mountId);
    if (!mount) return;
    const all = (data.skills||[]).flatMap(c => c.items.map(it => ({...it, category: c.category})));
    const top = all.slice(0, Math.min(16, all.length));
    mount.innerHTML = '';

    const center = document.createElement('div');
    center.className = 'center-node';
    center.innerHTML = `<strong>Harshal</strong><span>Cloud • Data</span>`;
    mount.appendChild(center);

    const rings = [120, 180];
    rings.forEach((radius, idx) => {
      const ring = document.createElement('div');
      ring.className = 'orbit' + (idx === 1 ? ' slower' : '');
      ring.style.width = ring.style.height = `${radius*2}px`;
      mount.appendChild(ring);
    });

    function placeOnRing(ringIndex, i, total, label){
      const ring = mount.querySelectorAll('.orbit')[ringIndex];
      if (!ring) return;
      const angle = (i / total) * Math.PI * 2;
      const r = parseFloat(ring.style.width)/2;
      const x = Math.cos(angle) * r + (mount.clientWidth/2) - 20;
      const y = Math.sin(angle) * r + (mount.clientHeight/2) - 20;
      const dot = document.createElement('div');
      dot.className = 'skill-dot';
      dot.style.left = `${x}px`;
      dot.style.top = `${y}px`;
      dot.textContent = label;
      mount.appendChild(dot);
    }

    const mid = Math.ceil(top.length/2);
    top.slice(0, mid).forEach((s, i) => placeOnRing(0, i, mid, s.name));
    top.slice(mid).forEach((s, i) => placeOnRing(1, i, top.length-mid, s.name));
  }

  function renderSkillsList(){
    const mount = document.getElementById('skillsList');
    if (!mount) return;
    const cats = data.skills || [];
    mount.innerHTML = cats.map(c => `
      <div class="skill-row">
        <h3>${c.category}</h3>
        <ul>${c.items.map(it => `<li><span class="skill-chip">${it.name}</span></li>`).join('')}</ul>
      </div>
    `).join('');
  }

  function renderCerts(){
    const mount = document.getElementById('certTimeline');
    if (!mount) return;
    const certs = data.certifications || [];
    mount.innerHTML = certs.map(c => `
      <div class="timeline-item reveal-on-scroll">
        <h3>${c.name}</h3>
        <div class="meta">${c.issuer} • ${c.year || ''} ${c.link ? `• <a href="${c.link}" target="_blank" rel="noopener">Verify</a>` : ''}</div>
      </div>
    `).join('');
  }

  function renderAbout(){
    const mount = document.getElementById('aboutContent');
    if (!mount) return;
    const p = data.person || {};
    mount.innerHTML = `
      <article class="card reveal-on-scroll">
        <h2>Hi, I'm ${p.name || 'me'} 👋</h2>
        <p>${p.summary || ''}</p>
        <p>I specialize in ${p.specialization || ''} and work across cloud engineering and data science to build reliable, scalable, and insightful systems.</p>
        <p><strong>Focus:</strong> Azure • MLOps • Data Platforms • Analytics</p>
      </article>
    `;
  }

  function renderContact(){
    const list = document.getElementById('socialLinks');
    if (!list) return;
    const s = (data.person && data.person.socials) || {};
    const items = [
      s.github && { label: 'GitHub', url: s.github },
      s.linkedin && { label: 'LinkedIn', url: s.linkedin },
      s.twitter && { label: 'X / Twitter', url: s.twitter },
      s.website && { label: 'Website', url: s.website },
      data.person?.email && { label: 'Email', url: `mailto:${data.person.email}` }
    ].filter(Boolean);
    list.innerHTML = items.map(i => `<li><a href="${i.url}" target="_blank" rel="noopener">${i.label}</a></li>`).join('');

    const form = document.getElementById('contactForm');
    if (form && data.person?.email) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const name = encodeURIComponent(fd.get('name') || '');
        const email = encodeURIComponent(fd.get('email') || '');
        const msg = encodeURIComponent(fd.get('message') || '');
        const subject = `Portfolio contact from ${name}`;
        const body = `From: ${name}%0AEmail: ${email}%0A%0A${msg}`;
        window.location.href = `mailto:${data.person.email}?subject=${subject}&body=${body}`;
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    ensureYear();
    setupNavToggle();
    setActiveNav();

    A.initializeStarfield?.();
    A.initializeScrollReveal?.();

    const typer = document.getElementById('role-typer');
    if (typer && Array.isArray(data.roles)) {
      A.startTypewriter?.(typer, data.roles, { speed: 55, backDelay: 1000, loop: true });
    }

    renderFeaturedProjects();
    renderProjects();
    renderOrbitalSkills('skillsOrbital');
    renderOrbitalSkills('skillsOrbitalFull');
    renderSkillsList();
    renderCerts();
    renderAbout();
    renderContact();
  });
})();
