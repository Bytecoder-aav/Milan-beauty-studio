// ============================================================
// supabase-client.js  v4
// Підключити в index.html (основного сайту) ПЕРЕД script.js:
//   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
//   <script src="supabase-client.js"></script>
//   <script src="script.js"></script>
// ============================================================

const SUPABASE_URL      = 'https://fihxmpmxygthisgcxelj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hm5W8KKVYexq6_3zucap_A_3qcexFOF';

// ── SVG іконки для категорій ─────────────────────────────────
const CAT_ICONS = {
  hair:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5Z"/><path d="M5 19H19" stroke-width="1.5"/></svg>`,
  colorist:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="7" r="3"/><circle cx="6" cy="17" r="3"/><path d="M20 4L8.12 15.88"/><path d="M14.47 14.48L20 20"/></svg>`,
  permanent: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12c0-3.5 4-6 8-6s8 2.5 8 6-4 6-8 6-8-2.5-8-6z"/><path d="M14 13l4 6" stroke-width="1.4"/></svg>`,
  nails:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 14v4a3 3 0 0 0 3 3h1a3 3 0 0 0 3-3v-4"/><path d="M7 14c0-2 1-3 3-3s3 1 3 3"/></svg>`,
  brows:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14c3-4 8-6 16-2"/><path d="M4 15c3-4 8-6 16-2" opacity="0.5"/></svg>`,
  massage:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="7" r="2.5"/><path d="M4 18c0-2 2-3 5-3s5 1 5 3v2H4v-2z"/><circle cx="18" cy="5" r="2.5" opacity="0.8"/></svg>`,
};

// ── Отримати публічний URL фото з Supabase Storage ────────────
// avatar може бути:
//   - повний https:// URL (вже готовий)
//   - шлях у storage bucket, наприклад "masters/anya.jpg"
//   - старий відносний шлях "images/team/name.jpg" (показуємо як є)
function getAvatarUrl(avatar) {
  if (!avatar) return null;
  if (avatar.startsWith('http')) return avatar;
  // Якщо шлях виглядає як storage path (без "images/") — будуємо публічний URL
  if (!avatar.startsWith('images/')) {
    return `${SUPABASE_URL}/storage/v1/object/public/avatars/${avatar}`;
  }
  // Старий відносний шлях — повертаємо як є (сумісність)
  return `/${avatar}`;
}

// ── Supabase client ───────────────────────────────────────────
let _sbClient = null;
function getSbClient() {
  if (!_sbClient) {
    if (typeof supabase === 'undefined') {
      console.warn('[Milan] Supabase SDK not loaded');
      return null;
    }
    _sbClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _sbClient;
}

// ── Fetch helper через Supabase SDK ──────────────────────────
async function sbGet(table, orderCol = 'position') {
  const sb = getSbClient();
  if (!sb) return [];
  const { data, error } = await sb.from(table).select('*').order(orderCol).order('id');
  if (error) {
    console.warn(`[Milan] sbGet(${table}):`, error.message);
    return [];
  }
  return data || [];
}

// ── Render services grid ─────────────────────────────────────
function renderServices(categories) {
  const grid = document.querySelector('.services-grid');
  if (!grid || !categories.length) return;

  grid.innerHTML = categories.map((cat, i) => `
    <article class="service-card animate-on-scroll" data-service="${cat.slug}" data-delay="${i}">
      <div class="card-icon" aria-hidden="true">
        ${CAT_ICONS[cat.slug] || CAT_ICONS.massage}
      </div>
      <h3>${cat.name}</h3>
      <p>${cat.description || ''}</p>
    </article>
  `).join('');

  // Re-observe for scroll animation
  if (window._scrollObserver) {
    grid.querySelectorAll('.animate-on-scroll').forEach(el => window._scrollObserver.observe(el));
  }

  // Re-bind click → price modal
  grid.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('click', () => {
      const key = card.getAttribute('data-service');
      if (key && typeof openPriceModal === 'function') openPriceModal(key);
    });
  });
}

// ── Render schedule ──────────────────────────────────────────
function renderSchedule(schedule) {
  const el = document.querySelector('.location-schedule');
  if (!el || !schedule.length) return;
  el.innerHTML = schedule
    .map(s => `${s.day_label}: ${(s.open_time||'').slice(0,5)} – ${(s.close_time||'').slice(0,5)}`)
    .join('<br>');
}

// ── Build servicesData for price modal ───────────────────────
function buildServicesData(categories, masters, services, prices) {
  const data = {};

  categories.forEach(cat => {
    const catMasters = masters.filter(m => m.category_id === cat.id)
                              .sort((a,b) => (a.position||0) - (b.position||0));
    const catSvcs    = services.filter(s => s.category_id === cat.id)
                               .sort((a,b) => (a.position||0) - (b.position||0));

    const priceRows = catSvcs.map(svc => {
      const row = { name: svc.name, isHeader: !!svc.is_header };
      catMasters.forEach(m => {
        const p = prices.find(pr => pr.service_id === svc.id && pr.master_id === m.id);
        if (!p) return;
        const val = p.label || (p.price_to ? `${p.price_from}–${p.price_to} ₴` : `${p.price_from} ₴`);
        if (m.role === 'Топ-майстер') row.top = val;
        else row.master = val;
      });
      return row;
    });

    data[cat.slug] = {
      title:   cat.name,
      masters: catMasters.map(m => ({
        name:  m.name,
        role:  m.role || 'Майстер',
        photo: getAvatarUrl(m.avatar) || '',
      })),
      prices: priceRows,
    };
  });

  return data;
}

// ── Main ─────────────────────────────────────────────────────
async function initSupabase() {
  try {
    const [categories, masters, services, prices, schedule] = await Promise.all([
      sbGet('categories'),
      sbGet('masters'),
      sbGet('services'),
      sbGet('prices'),
      sbGet('schedule'),
    ]);

    if (categories.length) renderServices(categories);
    if (schedule.length)   renderSchedule(schedule);

    window.servicesData = buildServicesData(categories, masters, services, prices);

  } catch (err) {
    console.warn('[Milan] Supabase unavailable, using static data:', err.message);
  }
}

document.addEventListener('DOMContentLoaded', initSupabase);
