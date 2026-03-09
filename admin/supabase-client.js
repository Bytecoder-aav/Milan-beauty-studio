// ============================================================
// supabase-client.js
// Підключити в index.html перед script.js:
//   <script src="supabase-client.js"></script>
//
// Завантажує категорії, послуги, прайс і графік з Supabase
// та оновлює відповідні блоки сторінки.
// ============================================================

const SUPABASE_URL      = 'https://fihxmpmxygthisgcxelj.supabase.co'; // замінити
const SUPABASE_ANON_KEY = 'sb_publishable_hm5W8KKVYexq6_3zucap_A_3qcexFOF';  // замінити

// ── REST-запит до Supabase ───────────────────────────────────
async function sbFetch(table, params = {}) {
  const defaultParams = { select: '*', order: 'position.asc,id.asc' };
  const qs = new URLSearchParams({ ...defaultParams, ...params }).toString();
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?${qs}`,
    {
      headers: {
        'apikey':        SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    }
  );
  if (!res.ok) throw new Error(`Supabase error: ${table} ${res.status}`);
  return res.json();
}

// ── SVG іконки для категорій (за slug) ──────────────────────
const CATEGORY_ICONS = {
  hair: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5Z"/><path d="M5 19H19" stroke-width="1.5"/></svg>`,
  colorist: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="7" r="3"/><circle cx="6" cy="17" r="3"/><path d="M20 4L8.12 15.88"/><path d="M14.47 14.48L20 20"/><path d="M8.12 8.12L12 12"/></svg>`,
  permanent: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12c0-3.5 4-6 8-6s8 2.5 8 6-4 6-8 6-8-2.5-8-6z"/><path d="M14 13l4 6" stroke-width="1.4"/></svg>`,
  nails: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 14v4a3 3 0 0 0 3 3h1a3 3 0 0 0 3-3v-4"/><path d="M7 14c0-2 1-3 3-3s3 1 3 3"/></svg>`,
  brows: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14c3-4 8-6 16-2"/><path d="M4 15c3-4 8-6 16-2" opacity="0.5"/></svg>`,
  massage: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="7" r="2.5"/><path d="M4 18c0-2 2-3 5-3s5 1 5 3v2H4v-2z"/><circle cx="18" cy="5" r="2.5" opacity="0.8"/></svg>`,
};

// ── Рендер блоку "Наші послуги" ──────────────────────────────
function renderServicesGrid(categories) {
  const grid = document.querySelector('.services-grid');
  if (!grid) return;

  grid.innerHTML = categories.map((cat, i) => `
    <article
      class="service-card animate-on-scroll"
      data-service="${esc(cat.slug)}"
      data-delay="${i}"
    >
      <div class="card-icon" aria-hidden="true">
        ${CATEGORY_ICONS[cat.slug] || CATEGORY_ICONS.massage}
      </div>
      <h3>${esc(cat.name)}</h3>
      <p>${esc(cat.description || '')}</p>
    </article>
  `).join('');

  // Re-observe нові елементи для animate-on-scroll
  if (window._scrollObserver) {
    grid.querySelectorAll('.animate-on-scroll').forEach(el => {
      window._scrollObserver.observe(el);
    });
  }
}

// ── Рендер блоку "Графік роботи" ─────────────────────────────
function renderSchedule(schedule) {
  const el = document.querySelector('.location-schedule');
  if (!el || !schedule.length) return;
  el.innerHTML = schedule.map(s =>
    `${esc(s.day_label)}: ${s.open_time.slice(0,5)} – ${s.close_time.slice(0,5)}`
  ).join('<br>');
}

// ── Оновлення servicesData у script.js ───────────────────────
// Будуємо структуру, яка передається в openPriceModal
function buildServicesData(categories, services, prices, masters) {
  const data = {};

  categories.forEach(cat => {
    const catServices = services
      .filter(s => s.category_id === cat.id)
      .sort((a, b) => a.position - b.position);

    const catMasters = masters.filter(m =>
      prices.some(p => p.service_id && services.find(s => s.id === p.service_id && s.category_id === cat.id) && p.master_id === m.id)
    );

    const priceRows = catServices.map(svc => {
      if (svc.is_header) {
        return { name: svc.name, isHeader: true };
      }
      const svcPrices = prices.filter(p => p.service_id === svc.id);
      const row = { name: svc.name };

      svcPrices.forEach(p => {
        const master = masters.find(m => m.id === p.master_id);
        const priceStr = p.label || (p.price_to
          ? `${p.price_from}–${p.price_to} ₴`
          : `${p.price_from} ₴`);

        if (!master) {
          row.master = priceStr; // спільна ціна
        } else if (master.role && master.role.toLowerCase().includes('топ')) {
          row.top = priceStr;
        } else {
          row.master = priceStr;
        }
      });
      return row;
    });

    data[cat.slug] = {
      title:   cat.name,
      masters: catMasters.map(m => ({
        name:  m.name,
        role:  m.role || 'Майстер',
        photo: m.avatar || '',
      })),
      prices: priceRows,
    };
  });

  return data;
}

// ── Головна функція ───────────────────────────────────────────
async function initSupabase() {
  try {
    // Паралельне завантаження всіх даних
    const [categories, services, prices, masters, schedule] = await Promise.all([
      sbFetch('categories'),
      sbFetch('services'),
      sbFetch('prices'),
      sbFetch('masters'),
      sbFetch('schedule'),
    ]);

    // 1. Рендеримо картки послуг
    renderServicesGrid(categories);

    // 2. Оновлюємо графік роботи
    renderSchedule(schedule);

    // 3. Будуємо servicesData для модального прайс-листа
    // Перезаписуємо глобальну змінну (визначена в script.js)
    window._supabaseServicesData = buildServicesData(categories, services, prices, masters);

    // 4. Патчимо openPriceModal в script.js щоб використовував свіжі дані
    //    Зберігаємо оригінал і обертаємо
    if (typeof openPriceModal === 'function') {
      const original = openPriceModal;
      window.openPriceModal = function(key) {
        // Тимчасово підміняємо servicesData якщо є дані з Supabase
        const sd = window._supabaseServicesData;
        if (sd && sd[key]) {
          const backup = window.servicesData;
          window.servicesData = sd;
          original(key);
          window.servicesData = backup;
        } else {
          original(key);
        }
      };
    }

  } catch (err) {
    // Якщо Supabase недоступний — сайт працює зі статичними даними
    console.warn('[Milan] Supabase недоступний, використовуються статичні дані:', err.message);
  }
}

// ── Escape HTML ───────────────────────────────────────────────
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Запуск після DOM ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', initSupabase);
