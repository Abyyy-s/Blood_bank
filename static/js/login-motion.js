/* Life Link — interactive entry motion system.
 * Vanilla JS/CSS only. Scoped to .lifeline-entry so the admin app stays restrained.
 */
(() => {
  const root = document.querySelector('.lifeline-entry');
  const stage = document.querySelector('.entry-stage');
  const card = document.querySelector('.login-card');
  const visual = document.querySelector('.blood-visual');
  const drop = document.querySelector('.blood-drop');
  const orbits = [...document.querySelectorAll('.blood-orbit, .blood-orbit-2')];
  const cells = [...document.querySelectorAll('.blood-cell')];
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const role = document.getElementById('role');
  const button = document.getElementById('loginBtn');
  if (!root || !stage || !card || !visual || !drop || !button) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer: fine)');
  if (reduce.matches) return;

  const state = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, active: false, lastTrail: 0, spin: 0 };
  const trailLayer = document.createElement('div');
  trailLayer.className = 'cursor-trail-layer';
  root.appendChild(trailLayer);

  const cursor = document.createElement('div');
  cursor.className = 'cursor-glow';
  root.appendChild(cursor);

  const spotlight = document.createElement('div');
  spotlight.className = 'cursor-spotlight';
  root.appendChild(spotlight);

  const particles = document.createElement('div');
  particles.className = 'entry-particles';
  for (let i = 0; i < 18; i += 1) {
    const p = document.createElement('span');
    p.className = 'entry-particle';
    p.style.setProperty('--px', `${8 + Math.random() * 84}%`);
    p.style.setProperty('--py', `${8 + Math.random() * 84}%`);
    p.style.setProperty('--s', `${2 + Math.random() * 4}px`);
    p.style.setProperty('--d', `${6 + Math.random() * 9}s`);
    p.style.setProperty('--delay', `${-Math.random() * 10}s`);
    particles.appendChild(p);
  }
  root.prepend(particles);

  const roleAccent = { Admin: '#d12d43', Staff: '#1486a5', Hospital: '#9b5de5' };

  function setPointer(clientX, clientY) {
    const rect = stage.getBoundingClientRect();
    state.tx = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    state.ty = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    state.active = true;
    root.style.setProperty('--mx', `${clientX}px`);
    root.style.setProperty('--my', `${clientY}px`);
  }

  function makeTrail(x, y) {
    const now = performance.now();
    if (now - state.lastTrail < 55) return;
    state.lastTrail = now;
    const dot = document.createElement('i');
    dot.className = 'cursor-trail';
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;
    trailLayer.appendChild(dot);
    dot.addEventListener('animationend', () => dot.remove(), { once: true });
  }

  function animate() {
    state.x += (state.tx - state.x) * 0.075;
    state.y += (state.ty - state.y) * 0.075;
    const dx = state.x - 0.5;
    const dy = state.y - 0.5;
    const tiltX = -dy * 3.4;
    const tiltY = dx * 3.8;
    const distance = Math.min(1, Math.hypot(dx, dy) * 1.8);
    const active = state.active ? 1 : 0;
    state.spin += 0.28;

    cursor.style.transform = `translate3d(${state.x * 100}vw, ${state.y * 100}vh, 0)`;
    spotlight.style.transform = `translate3d(${state.x * 100}vw, ${state.y * 100}vh, 0)`;

    card.style.setProperty('--card-rx', `${tiltX}deg`);
    card.style.setProperty('--card-ry', `${tiltY}deg`);
    card.style.setProperty('--card-lift', `${active * 2}px`);

    const dropX = dx * 24;
    const dropY = dy * 18;
    const scale = 1 + distance * 0.075;
    drop.style.setProperty('--drop-x', `${dropX}px`);
    drop.style.setProperty('--drop-y', `${dropY}px`);
    drop.style.setProperty('--drop-scale', scale.toFixed(3));
    drop.style.setProperty('--drop-tilt', `${dx * 12}deg`);

    visual.style.setProperty('--visual-x', `${dx * 18}px`);
    visual.style.setProperty('--visual-y', `${dy * 14}px`);
    orbits.forEach((orbit, index) => {
      const speed = index ? -0.72 : 0.48;
      orbit.style.transform = `rotateX(${66 + dy * (index ? 10 : 16)}deg) rotateY(${dx * (index ? 14 : 22)}deg) rotateZ(${state.spin * speed}deg)`;
    });
    cells.forEach((cell, index) => {
      const strength = 5 + index * 1.5;
      cell.style.setProperty('--cell-x', `${dx * strength}px`);
      cell.style.setProperty('--cell-y', `${dy * strength}px`);
    });
    requestAnimationFrame(animate);
  }

  if (finePointer.matches) {
    window.addEventListener('pointermove', (event) => {
      setPointer(event.clientX, event.clientY);
      makeTrail(event.clientX, event.clientY);
    }, { passive: true });
    window.addEventListener('pointerleave', () => { state.active = false; }, { passive: true });
  }

  [email, password, role].filter(Boolean).forEach((field) => {
    field.addEventListener('focus', () => {
      field.closest('.form-group')?.classList.add('is-focused');
      root.classList.add('form-active');
    });
    field.addEventListener('blur', () => {
      field.closest('.form-group')?.classList.toggle('is-focused', Boolean(field.value));
      if (![email, password, role].some((f) => f && document.activeElement === f)) root.classList.remove('form-active');
    });
    field.addEventListener('input', () => {
      field.closest('.form-group')?.classList.toggle('has-value', Boolean(field.value));
    });
  });

  role?.addEventListener('change', () => {
    const accent = roleAccent[role.value] || '#d12d43';
    root.style.setProperty('--role-accent', accent);
    card.classList.toggle('role-selected', Boolean(role.value));
  });

  document.querySelector('.show-hide')?.addEventListener('click', () => {
    root.classList.toggle('password-visible', password.type === 'text');
  });

  button.addEventListener('pointermove', (event) => {
    const r = button.getBoundingClientRect();
    const x = ((event.clientX - r.left) / r.width - 0.5) * 10;
    const y = ((event.clientY - r.top) / r.height - 0.5) * 8;
    button.style.setProperty('--button-x', `${x}px`);
    button.style.setProperty('--button-y', `${y}px`);
  });
  button.addEventListener('pointerleave', () => {
    button.style.setProperty('--button-x', '0px');
    button.style.setProperty('--button-y', '0px');
  });

  window.lifeLinkLoginTransition = () => root.classList.add('login-transition');
  animate();
})();
