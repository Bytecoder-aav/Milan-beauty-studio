// ============================================================
// supabase-client.js  v8
// Підключити в index.html ПЕРЕД script.js:
//   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
//   <script src="supabase-client.js"></script>
//   <script src="script.js"></script>
// ============================================================

const SUPABASE_URL      = 'https://fihxmpmxygthisgcxelj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hm5W8KKVYexq6_3zucap_A_3qcexFOF';

// ── SVG іконки за замовчуванням (поки не задані в БД) ────────
const DEFAULT_ICONS = {
  hair1: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5Z"/><path d="M5 19H19" stroke-width="1.5"/></svg>`,
  hair2: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="7" r="3"/><circle cx="6" cy="17" r="3"/><path d="M20 4L8.12 15.88"/><path d="M14.47 14.48L20 20"/><path d="M8.12 8.12L12 12"/></svg>`,
  permanent:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12c0-3.5 4-6 8-6s8 2.5 8 6-4 6-8 6-8-2.5-8-6z"/><path d="M4 12c1.5 1.5 4 2.5 8 2.5s6.5-1 8-2.5"/><path d="M14 13l4 6" stroke-width="1.4"/></svg>`,
  nails:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 14v4a3 3 0 0 0 3 3h1a3 3 0 0 0 3-3v-4"/><path d="M7 14c0-2 1-3 3-3s3 1 3 3"/><path d="M6 10l12-6" stroke-width="2.5" stroke-linecap="round"/></svg>`,
  brows:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14c3-4 8-6 16-2"/><path d="M4 15c3-4 8-6 16-2" opacity="0.5"/><path d="M6 13.5L6.5 12.5" opacity="0.8"/><path d="M9 11.5L9.5 10.5" opacity="0.8"/><path d="M12 10.5L12.5 9.5" opacity="0.8"/></svg>`,
  massage:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="7" r="2.5"/><path d="M4 18c0-2 2-3 5-3s5 1 5 3v2H4v-2z"/><circle cx="18" cy="5" r="2.5" opacity="0.8"/><path d="M14 11l2-2" stroke-width="1.5"/><path d="M10 13c2-1 4-1 6 1s1 4-1 6-4 1-6-1" opacity="0.4"/></svg>`,
};

// ── Supabase SDK ──────────────────────────────────────────────
let _sb = null;
function getSb() {
  if (!_sb) {
    if (typeof supabase === 'undefined') { console.error('[Milan] supabase SDK відсутній!'); return null; }
    _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _sb;
}

// ── Запит до таблиці ─────────────────────────────────────────
async function sbGet(table) {
  const sb = getSb(); if (!sb) return [];
  const noPos = ['prices'];
  let q = sb.from(table).select('*');
  if (!noPos.includes(table)) q = q.order('position', { ascending: true, nullsFirst: false });
  q = q.order('id', { ascending: true });
  const { data, error } = await q;
  if (error) { console.warn(`[Milan] sbGet(${table}):`, error.message); return []; }
  return data || [];
}

// ── Публічний URL аватара ────────────────────────────────────
function getAvatarUrl(avatar) {
  if (!avatar) return null;
  if (avatar.startsWith('http')) return avatar;
  if (avatar.startsWith('images/')) return `/${avatar}`;
  return `${SUPABASE_URL}/storage/v1/object/public/avatars/${avatar}`;
}

// ── Публічний URL іконки ─────────────────────────────────────
// Поле icon може бути: null | '<svg...>' | 'path/to/file.svg' | 'path/to/img.png'
function resolveIconHtml(icon, slug) {
  if (!icon) return DEFAULT_ICONS[slug] || DEFAULT_ICONS.massage;
  const t = icon.trim();
  if (t.startsWith('<')) return t; // вже SVG-код
  // шлях до файлу у Storage bucket "icons"
  const url = icon.startsWith('http')
    ? icon
    : `${SUPABASE_URL}/storage/v1/object/public/icons/${icon}`;
  return `<img src="${url}" style="width:22px;height:22px;object-fit:contain" alt="" onerror="this.parentElement.innerHTML='${(DEFAULT_ICONS[slug]||'').replace(/'/g,"\\'")}'">`;
}

// ── Оновити картки на сайті ──────────────────────────────────
function renderServices(categories) {
  if (!categories || !categories.length) return;
  const grid = document.querySelector('.services-grid');

  categories.forEach((cat, idx) => {
    let card = document.querySelector(`.service-card[data-service="${cat.slug}"]`);

    // Якщо картки немає в HTML — створюємо нову
    if (!card && grid) {
      card = document.createElement('article');
      card.className = 'service-card animate-on-scroll visible';
      card.setAttribute('data-service', cat.slug);
      card.setAttribute('data-delay', String(idx));
      card.innerHTML = `
        <div class="card-icon">${resolveIconHtml(cat.icon, cat.slug)}</div>
        <h3>${cat.name || ''}</h3>
        <p>${cat.description || ''}</p>`;
      card.addEventListener('click', () => {
        if (typeof window.openPriceModal === 'function') window.openPriceModal(cat.slug);
      });
      grid.appendChild(card);
      return;
    }

    if (!card) return;

    // Оновлюємо існуючу картку
    const h3 = card.querySelector('h3');
    const p  = card.querySelector('p');
    if (h3 && cat.name) {
      const badge = h3.querySelector('b');
      h3.textContent = cat.name;
      if (badge) h3.appendChild(badge);
    }
    if (p && cat.description) p.textContent = cat.description;
    if (cat.icon !== undefined) {
      const iconEl = card.querySelector('.card-icon');
      if (iconEl) iconEl.innerHTML = resolveIconHtml(cat.icon, cat.slug);
    }
  });

  // Видаляємо картки яких більше немає в БД
  if (grid) {
    const slugsFromDb = categories.map(c => c.slug);
    grid.querySelectorAll('.service-card[data-service]').forEach(card => {
      const slug = card.getAttribute('data-service');
      if (!slugsFromDb.includes(slug)) card.remove();
    });
  }
}

// ── Графік роботи ────────────────────────────────────────────
function renderSchedule(schedule) {
  const el = document.querySelector('.location-schedule');
  if (!el || !schedule.length) return;
  el.innerHTML = schedule
    .map(s => `${s.day_label}: ${(s.open_time||'').slice(0,5)} – ${(s.close_time||'').slice(0,5)}`)
    .join('<br>');
}

// ── Будуємо servicesData для price modal ─────────────────────
function buildServicesData(categories, masters, services, prices) {
  const data = {};
  categories.forEach(cat => {
    const catMasters = masters
      .filter(m => m.category_id === cat.id)
      .sort((a,b) => (a.position||0)-(b.position||0));
    const catSvcs = services
      .filter(s => s.category_id === cat.id)
      .sort((a,b) => (a.position||0)-(b.position||0));

    const priceRows = catSvcs.map(svc => {
      const row = { name: svc.name, isHeader: !!svc.is_header };
      if (!svc.is_header) {
        catMasters.forEach(m => {
          const p = prices.find(pr => pr.service_id === svc.id && pr.master_id === m.id);
          if (!p) return;
          const val = p.label || (p.price_to ? `${p.price_from}–${p.price_to} ₴` : `${p.price_from} ₴`);
          if (m.role === 'Майстер2') row.top = val; else row.master = val;
          row[m.name] = val; // точне співставлення по імені
        });
      }
      return row;
    });

    data[cat.slug] = {
      title:   cat.name,
      masters: catMasters.map(m => ({
        name:  m.name,
        role:  m.role || 'Майстер1',
        photo: getAvatarUrl(m.avatar) || '',
      })),
      prices: priceRows,
    };
  });
  return data;
}

// ── Realtime ──────────────────────────────────────────────────
let _realtimeChannel = null;
function subscribeRealtime(sbClient) {
  if (_realtimeChannel) return;
  let _timer = null;

  async function refresh() {
    try {
      const [cats, masters, svcs, prices, sched] = await Promise.all([
        sbGet('categories'), sbGet('masters'), sbGet('services'),
        sbGet('prices'),     sbGet('schedule'),
      ]);
      window.servicesData = buildServicesData(cats, masters, svcs, prices);
      renderServices(cats);
      if (sched.length) renderSchedule(sched);
      console.log('[Milan] Realtime: оновлено');
    } catch(e) { console.warn('[Milan] Realtime error:', e.message); }
  }

  function go() { clearTimeout(_timer); _timer = setTimeout(refresh, 600); }

  _realtimeChannel = sbClient.channel('milan-live')
    .on('postgres_changes',{event:'*',schema:'public',table:'categories'}, go)
    .on('postgres_changes',{event:'*',schema:'public',table:'masters'},    go)
    .on('postgres_changes',{event:'*',schema:'public',table:'services'},   go)
    .on('postgres_changes',{event:'*',schema:'public',table:'prices'},     go)
    .on('postgres_changes',{event:'*',schema:'public',table:'schedule'},   go)
    .subscribe(s => console.log('[Milan] Realtime статус:', s));
}

// ── Ініціалізація ────────────────────────────────────────────
async function initSupabase() {
  const sb = getSb(); if (!sb) return;
  try {
    const [cats, masters, svcs, prices, sched] = await Promise.all([
      sbGet('categories'), sbGet('masters'), sbGet('services'),
      sbGet('prices'),     sbGet('schedule'),
    ]);
    console.log(`[Milan] Завантажено: ${cats.length} кат, ${masters.length} майстрів, ${svcs.length} послуг`);
    window.servicesData = buildServicesData(cats, masters, svcs, prices);
    renderServices(cats);
    if (sched.length) renderSchedule(sched);
    // Показуємо картки після оновлення
    setTimeout(() => {
      document.querySelectorAll('.service-card').forEach(el => {
        if (window._scrollObserver) window._scrollObserver.observe(el);
      });
    }, 100);
    subscribeRealtime(sb);
  } catch(err) {
    console.warn('[Milan] Помилка, статичні дані залишились:', err.message);
  }
}

document.addEventListener('DOMContentLoaded', initSupabase);

// Аварійний показ якщо анімація заховала картки
setTimeout(() => {
  document.querySelectorAll('.service-card').forEach(el => {
    if (getComputedStyle(el).opacity === '0') el.classList.add('visible');
  });
}, 2500);
