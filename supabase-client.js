// ============================================================
// supabase-client.js  v6
// Підключити в index.html (сайту) ПЕРЕД script.js:
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

// ── Supabase client ───────────────────────────────────────────
let _sb = null;
function getSb() {
  if (!_sb) {
    if (typeof supabase === 'undefined') {
      console.error('[Milan] supabase SDK не завантажено!');
      return null;
    }
    _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _sb;
}

// ── Fetch через SDK ──────────────────────────────────────────
async function sbGet(table) {
  const sb = getSb();
  if (!sb) return [];
  // Таблиця prices не має колонки position
  const hasPosition = table !== 'prices';
  let q = sb.from(table).select('*');
  if (hasPosition) q = q.order('position', { ascending: true, nullsFirst: false });
  q = q.order('id', { ascending: true });
  const { data, error } = await q;
  if (error) {
    console.warn(`[Milan] sbGet(${table}):`, error.message);
    return [];
  }
  return data || [];
}

// ── Публічний URL фото зі Storage ────────────────────────────
function getAvatarUrl(avatar) {
  if (!avatar) return null;
  if (avatar.startsWith('http')) return avatar;
  if (!avatar.startsWith('images/')) {
    return `${SUPABASE_URL}/storage/v1/object/public/avatars/${avatar}`;
  }
  return `/${avatar}`;
}

// ── Render services grid ────────────────────────────────────
// Статичні картки в HTML залишаються як є (з правильними slug і кліками).
// Ця функція нічого не замінює — лише оновлює назви якщо вони змінились в БД.
function renderServices(categories) {
  if (!categories || !categories.length) return;

  // Оновлюємо тільки текст назви категорії якщо картка вже є в HTML
  categories.forEach(cat => {
    const card = document.querySelector(`.service-card[data-service="${cat.slug}"]`);
    if (!card) return;
    const h3 = card.querySelector('h3');
    const p  = card.querySelector('p');
    if (h3) h3.textContent = cat.name;
    if (p && cat.description) p.textContent = cat.description;
  });
}


// ── Render schedule ──────────────────────────────────────────
function renderSchedule(schedule) {
  const el = document.querySelector('.location-schedule');
  if (!el || !schedule.length) return;
  el.innerHTML = schedule
    .map(s => `${s.day_label}: ${(s.open_time || '').slice(0, 5)} – ${(s.close_time || '').slice(0, 5)}`)
    .join('<br>');
}

// ── Build servicesData для price modal ───────────────────────
function buildServicesData(categories, masters, services, prices) {
  const data = {};
  categories.forEach(cat => {
    const catMasters = masters
      .filter(m => m.category_id === cat.id)
      .sort((a, b) => (a.position || 0) - (b.position || 0));
    const catSvcs = services
      .filter(s => s.category_id === cat.id)
      .sort((a, b) => (a.position || 0) - (b.position || 0));

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
      title: cat.name,
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

// ── Realtime — автооновлення сайту при змінах в адмін ────────
let _realtimeChannel = null;
function subscribeRealtime(sbClient) {
  if (_realtimeChannel) return;
  let _timer = null;

  async function refresh() {
    try {
      const [categories, masters, services, prices, schedule] = await Promise.all([
        sbGet('categories'), sbGet('masters'), sbGet('services'),
        sbGet('prices'),     sbGet('schedule'),
      ]);
      window.servicesData = buildServicesData(categories, masters, services, prices);
      renderServices(categories);
      if (schedule.length) renderSchedule(schedule);
      console.log('[Milan] Дані оновлено через Realtime');
    } catch (e) {
      console.warn('[Milan] Realtime refresh error:', e.message);
    }
  }

  function scheduleRefresh() {
    clearTimeout(_timer);
    _timer = setTimeout(refresh, 600);
  }

  _realtimeChannel = sbClient
    .channel('milan-site-live')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, scheduleRefresh)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'masters' },    scheduleRefresh)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'services' },   scheduleRefresh)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'prices' },     scheduleRefresh)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'schedule' },   scheduleRefresh)
    .subscribe(status => {
      console.log('[Milan] Realtime статус:', status);
    });
}

// ── Main ─────────────────────────────────────────────────────
async function initSupabase() {
  const sbClient = getSb();
  if (!sbClient) return;

  try {
    const [categories, masters, services, prices, schedule] = await Promise.all([
      sbGet('categories'),
      sbGet('masters'),
      sbGet('services'),
      sbGet('prices'),
      sbGet('schedule'),
    ]);

    console.log(`[Milan] Завантажено: ${categories.length} категорій, ${masters.length} майстрів, ${services.length} послуг`);

    // Будуємо servicesData і синхронізуємо з script.js
    const built = buildServicesData(categories, masters, services, prices);
    window.servicesData = built;

    // Оновлюємо grid тільки якщо є категорії
    renderServices(categories);

    // Графік роботи
    if (schedule.length) renderSchedule(schedule);

    // Підключаємо realtime для автооновлення
    subscribeRealtime(sbClient);

  } catch (err) {
    console.warn('[Milan] Помилка завантаження, використовуємо статичні дані:', err.message);
  }
}

// Запускаємо після завантаження сторінки
document.addEventListener('DOMContentLoaded', initSupabase);

