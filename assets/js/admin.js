// ============================================================
// assets/js/admin.js
// Адмін-панель: API-клієнт, утиліти, компоненти
// ============================================================

// ── API Client ───────────────────────────────────────────────
const API = {
  base: '/api/crud.php',

  async get(table, params = {}) {
    const qs = new URLSearchParams({ table, ...params }).toString();
    const res = await fetch(`${this.base}?${qs}`);
    if (!res.ok) throw new Error(`GET ${table} failed: ${res.status}`);
    return res.json();
  },

  async post(table, data) {
    const res = await fetch(`${this.base}?table=${table}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Помилка збереження');
    return json;
  },

  async patch(table, id, data) {
    const res = await fetch(`${this.base}?table=${table}&id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Помилка оновлення');
    return json;
  },

  async delete(table, id) {
    const res = await fetch(`${this.base}?table=${table}&id=${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Помилка видалення');
    return true;
  },
};

// ── Toast notifications ──────────────────────────────────────
const Toast = {
  container: null,
  init() {
    this.container = document.getElementById('toast-container');
  },
  show(msg, type = 'success', duration = 3500) {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = msg;
    this.container.appendChild(el);
    setTimeout(() => el.remove(), duration);
  },
};

// ── Modal ────────────────────────────────────────────────────
const Modal = {
  overlay: null,
  modal: null,
  init() {
    this.overlay = document.getElementById('modal-overlay');
    this.modal   = document.getElementById('modal');
    this.overlay.addEventListener('click', e => {
      if (e.target === this.overlay) this.close();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') this.close();
    });
  },
  open(title, bodyHTML, onSave) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHTML;
    this._onSave = onSave;
    this.overlay.classList.add('open');
    // Focus first input
    setTimeout(() => {
      const first = this.modal.querySelector('input,select,textarea');
      if (first) first.focus();
    }, 100);
  },
  close() {
    this.overlay.classList.remove('open');
    this._onSave = null;
  },
  async save() {
    if (!this._onSave) return;
    const btn = document.getElementById('modal-save-btn');
    btn.disabled = true;
    btn.textContent = 'Збереження...';
    try {
      await this._onSave();
      this.close();
    } catch (err) {
      Toast.show(err.message || 'Помилка', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Зберегти';
    }
  },
};

// ── Panel navigation ─────────────────────────────────────────
const Nav = {
  init() {
    document.querySelectorAll('.sidebar-link[data-panel]').forEach(link => {
      link.addEventListener('click', () => {
        const panelId = link.dataset.panel;
        this.show(panelId);
        // Mobile: close sidebar
        document.querySelector('.sidebar')?.classList.remove('open');
      });
    });
  },
  show(panelId) {
    // Hide all panels
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    // Show target
    const panel = document.getElementById('panel-' + panelId);
    if (panel) panel.classList.add('active');
    const link = document.querySelector(`.sidebar-link[data-panel="${panelId}"]`);
    if (link) link.classList.add('active');
    // Update topbar title
    const title = link?.querySelector('.link-text')?.textContent || '';
    const topbarTitle = document.getElementById('topbar-title');
    if (topbarTitle) topbarTitle.textContent = title;
    // Load data
    Panels[panelId]?.load?.();
  },
};

// ── Confirm dialog ───────────────────────────────────────────
function confirmDelete(msg = 'Видалити цей запис?') {
  return new Promise(resolve => {
    // Простий confirm, можна замінити на кастомний діалог
    resolve(window.confirm(msg));
  });
}

// ── Collect form data ────────────────────────────────────────
function collectForm(formId) {
  const form = document.getElementById(formId) || document.querySelector(`form[data-form="${formId}"]`);
  if (!form) return {};
  const data = {};
  new FormData(form).forEach((val, key) => {
    // Числові поля
    if (['position', 'category_id', 'service_id', 'master_id', 'price_from', 'price_to'].includes(key)) {
      data[key] = val === '' ? null : Number(val);
    } else if (key === 'is_header') {
      data[key] = val === 'on' || val === '1' || val === 'true';
    } else {
      data[key] = val.trim();
    }
  });
  return data;
}

// ── SVG Icons ────────────────────────────────────────────────
const Icons = {
  edit:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  delete: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
  add:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  export: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
};

// ── PANELS ───────────────────────────────────────────────────
const Panels = {};

// ============================================================
// PANEL: CATEGORIES
// ============================================================
Panels.categories = {
  data: [],

  async load() {
    const el = document.getElementById('categories-table-body');
    el.innerHTML = `<tr><td colspan="4" class="loading"><div class="spinner"></div> Завантаження...</td></tr>`;
    this.data = await API.get('categories');
    this.render();
  },

  render() {
    const el = document.getElementById('categories-table-body');
    if (!this.data.length) {
      el.innerHTML = `<tr><td colspan="4"><div class="empty-state">Немає категорій</div></td></tr>`;
      return;
    }
    el.innerHTML = this.data.map(c => `
      <tr>
        <td><span class="pos-badge">${c.position}</span></td>
        <td>${escHtml(c.name)}</td>
        <td><code style="font-size:0.75rem;color:var(--text-muted)">${escHtml(c.slug)}</code></td>
        <td>
          <div class="actions">
            <button class="btn-icon" title="Редагувати" onclick="Panels.categories.edit(${c.id})">${Icons.edit}</button>
            <button class="btn-icon danger" title="Видалити" onclick="Panels.categories.remove(${c.id})">${Icons.delete}</button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  openForm(cat = {}) {
    const isEdit = !!cat.id;
    Modal.open(
      isEdit ? 'Редагувати категорію' : 'Нова категорія',
      `<form data-form="cat-form">
        <div class="form-group">
          <label>Назва *</label>
          <input name="name" value="${escHtml(cat.name||'')}" required placeholder="Наприклад: Нігтьовий сервіс">
        </div>
        <div class="form-group">
          <label>Slug (URL-ключ) *</label>
          <input name="slug" value="${escHtml(cat.slug||'')}" required placeholder="nails" id="slug-field">
        </div>
        <div class="form-group">
          <label>Позиція</label>
          <input name="position" type="number" value="${cat.position||0}" min="0">
        </div>
        <div class="form-group">
          <label>Опис (необов'язково)</label>
          <textarea name="description" rows="2" placeholder="Короткий опис">${escHtml(cat.description||'')}</textarea>
        </div>
      </form>`,
      async () => {
        const data = collectForm('cat-form');
        if (isEdit) {
          await API.patch('categories', cat.id, data);
          Toast.show('Категорію оновлено ✓');
        } else {
          await API.post('categories', data);
          Toast.show('Категорію створено ✓');
        }
        await this.load();
        await loadSelectOptions(); // оновити селекти в інших панелях
      }
    );
    // Автогенерація slug з назви
    const nameInput = document.querySelector('[data-form="cat-form"] [name="name"]');
    const slugInput = document.getElementById('slug-field');
    if (nameInput && !isEdit) {
      nameInput.addEventListener('input', () => {
        slugInput.value = nameInput.value
          .toLowerCase()
          .replace(/[^a-zа-яіїєґ0-9 ]/gi, '')
          .replace(/\s+/g, '-')
          .replace(/[а-яіїєґ]/gi, c => ({
            'а':'a','б':'b','в':'v','г':'h','ґ':'g','д':'d','е':'e','є':'ye',
            'ж':'zh','з':'z','и':'y','і':'i','ї':'yi','й':'y','к':'k','л':'l',
            'м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u',
            'ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'shch','ь':'',
            'ю':'yu','я':'ya'
          }[c.toLowerCase()] || c));
      });
    }
  },

  edit(id) {
    const cat = this.data.find(c => c.id === id);
    if (cat) this.openForm(cat);
  },

  async remove(id) {
    const ok = await confirmDelete('Видалити цю категорію? Всі послуги також будуть видалені!');
    if (!ok) return;
    await API.delete('categories', id);
    Toast.show('Видалено');
    await this.load();
  },
};

// ============================================================
// PANEL: SERVICES
// ============================================================
Panels.services = {
  data: [],
  categories: [],

  async load() {
    const el = document.getElementById('services-table-body');
    el.innerHTML = `<tr><td colspan="5" class="loading"><div class="spinner"></div></td></tr>`;
    const [services, categories] = await Promise.all([
      API.get('services'),
      API.get('categories'),
    ]);
    this.data = services;
    this.categories = categories;
    this.renderCategoryFilter();
    this.render(this.data);
  },

  renderCategoryFilter() {
    const sel = document.getElementById('service-cat-filter');
    if (!sel) return;
    sel.innerHTML = `<option value="">Всі категорії</option>` +
      this.categories.map(c => `<option value="${c.id}">${escHtml(c.name)}</option>`).join('');
    sel.onchange = () => {
      const val = sel.value;
      this.render(val ? this.data.filter(s => String(s.category_id) === val) : this.data);
    };
  },

  render(rows) {
    const el = document.getElementById('services-table-body');
    if (!rows.length) {
      el.innerHTML = `<tr><td colspan="5"><div class="empty-state">Немає послуг</div></td></tr>`;
      return;
    }
    el.innerHTML = rows.map(s => {
      const cat = this.categories.find(c => c.id === s.category_id);
      return `
        <tr class="${s.is_header ? 'header-row' : ''}">
          <td><span class="pos-badge">${s.position}</span></td>
          <td>${escHtml(s.name)}${s.is_header ? ' <small>(заголовок)</small>' : ''}</td>
          <td style="color:var(--gold-light);font-size:0.8rem">${cat ? escHtml(cat.name) : '—'}</td>
          <td>
            <div class="actions">
              <button class="btn-icon" onclick="Panels.services.edit(${s.id})">${Icons.edit}</button>
              <button class="btn-icon danger" onclick="Panels.services.remove(${s.id})">${Icons.delete}</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  openForm(svc = {}) {
    const isEdit = !!svc.id;
    const catOptions = this.categories.map(c =>
      `<option value="${c.id}" ${svc.category_id === c.id ? 'selected' : ''}>${escHtml(c.name)}</option>`
    ).join('');

    Modal.open(
      isEdit ? 'Редагувати послугу' : 'Нова послуга',
      `<form data-form="svc-form">
        <div class="form-group">
          <label>Категорія *</label>
          <select name="category_id" required><option value="">— обрати —</option>${catOptions}</select>
        </div>
        <div class="form-group">
          <label>Назва послуги *</label>
          <input name="name" value="${escHtml(svc.name||'')}" required placeholder="Стрижка">
        </div>
        <div class="form-group">
          <label class="form-check">
            <input type="checkbox" name="is_header" ${svc.is_header ? 'checked' : ''}>
            Це заголовок-розділ (без ціни)
          </label>
        </div>
        <div class="form-group">
          <label>Позиція</label>
          <input name="position" type="number" value="${svc.position||0}" min="0">
        </div>
      </form>`,
      async () => {
        const data = collectForm('svc-form');
        // Нормалізуємо is_header
        const form = document.querySelector('[data-form="svc-form"]');
        data.is_header = form.querySelector('[name="is_header"]').checked;
        if (isEdit) {
          await API.patch('services', svc.id, data);
          Toast.show('Послугу оновлено ✓');
        } else {
          await API.post('services', data);
          Toast.show('Послугу створено ✓');
        }
        await this.load();
      }
    );
  },

  edit(id) {
    const svc = this.data.find(s => s.id === id);
    if (svc) this.openForm(svc);
  },

  async remove(id) {
    const ok = await confirmDelete('Видалити цю послугу? Ціни також будуть видалені.');
    if (!ok) return;
    await API.delete('services', id);
    Toast.show('Видалено');
    await this.load();
  },
};

// ============================================================
// PANEL: PRICES
// ============================================================
Panels.prices = {
  data: [],
  services: [],
  masters: [],

  async load() {
    const el = document.getElementById('prices-table-body');
    el.innerHTML = `<tr><td colspan="5" class="loading"><div class="spinner"></div></td></tr>`;
    const [prices, services, masters] = await Promise.all([
      API.get('prices'),
      API.get('services'),
      API.get('masters'),
    ]);
    this.data = prices;
    this.services = services.filter(s => !s.is_header);
    this.masters = masters;
    this.render();
  },

  render() {
    const el = document.getElementById('prices-table-body');
    if (!this.data.length) {
      el.innerHTML = `<tr><td colspan="5"><div class="empty-state">Немає цін</div></td></tr>`;
      return;
    }
    el.innerHTML = this.data.map(p => {
      const svc    = this.services.find(s => s.id === p.service_id);
      const master = this.masters.find(m => m.id === p.master_id);
      const priceStr = p.label || (p.price_to
        ? `${p.price_from}–${p.price_to} ₴`
        : `${p.price_from} ₴`);
      return `
        <tr>
          <td>${svc ? escHtml(svc.name) : '—'}</td>
          <td>${master ? escHtml(master.name) : '<span style="color:var(--text-muted)">Всі майстри</span>'}</td>
          <td style="color:var(--gold)">${escHtml(priceStr)}</td>
          <td>
            <div class="actions">
              <button class="btn-icon" onclick="Panels.prices.edit(${p.id})">${Icons.edit}</button>
              <button class="btn-icon danger" onclick="Panels.prices.remove(${p.id})">${Icons.delete}</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  openForm(price = {}) {
    const isEdit = !!price.id;
    const svcOptions = this.services.map(s =>
      `<option value="${s.id}" ${price.service_id === s.id ? 'selected' : ''}>${escHtml(s.name)}</option>`
    ).join('');
    const masterOptions = this.masters.map(m =>
      `<option value="${m.id}" ${price.master_id === m.id ? 'selected' : ''}>${escHtml(m.name)}</option>`
    ).join('');

    Modal.open(
      isEdit ? 'Редагувати ціну' : 'Нова ціна',
      `<form data-form="price-form">
        <div class="form-group">
          <label>Послуга *</label>
          <select name="service_id" required>
            <option value="">— обрати —</option>${svcOptions}
          </select>
        </div>
        <div class="form-group">
          <label>Майстер (необов'язково)</label>
          <select name="master_id">
            <option value="">— всі майстри —</option>${masterOptions}
          </select>
        </div>
        <div class="form-row-2">
          <div class="form-group">
            <label>Ціна від (₴)</label>
            <input name="price_from" type="number" value="${price.price_from||''}" placeholder="500" min="0">
          </div>
          <div class="form-group">
            <label>Ціна до (₴) — якщо діапазон</label>
            <input name="price_to" type="number" value="${price.price_to||''}" placeholder="600" min="0">
          </div>
        </div>
        <div class="form-group">
          <label>Або довільний текст (наприклад "від 4800 ₴")</label>
          <input name="label" value="${escHtml(price.label||'')}" placeholder="від 4800 ₴">
          <small style="color:var(--text-muted);font-size:0.75rem">Якщо заповнено — відображається замість чисел</small>
        </div>
      </form>`,
      async () => {
        const data = collectForm('price-form');
        if (!data.master_id) data.master_id = null;
        if (isEdit) {
          await API.patch('prices', price.id, data);
          Toast.show('Ціну оновлено ✓');
        } else {
          await API.post('prices', data);
          Toast.show('Ціну додано ✓');
        }
        await this.load();
      }
    );
  },

  edit(id) {
    const p = this.data.find(x => x.id === id);
    if (p) this.openForm(p);
  },

  async remove(id) {
    const ok = await confirmDelete('Видалити цю ціну?');
    if (!ok) return;
    await API.delete('prices', id);
    Toast.show('Видалено');
    await this.load();
  },
};

// ============================================================
// PANEL: MASTERS
// ============================================================
Panels.masters = {
  data: [],

  async load() {
    const el = document.getElementById('masters-table-body');
    el.innerHTML = `<tr><td colspan="4" class="loading"><div class="spinner"></div></td></tr>`;
    this.data = await API.get('masters');
    this.render();
  },

  render() {
    const el = document.getElementById('masters-table-body');
    if (!this.data.length) {
      el.innerHTML = `<tr><td colspan="4"><div class="empty-state">Немає майстрів</div></td></tr>`;
      return;
    }
    el.innerHTML = this.data.map(m => `
      <tr>
        <td>
          ${m.avatar
            ? `<img src="/${escHtml(m.avatar)}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:1px solid var(--border)">`
            : `<div style="width:36px;height:36px;border-radius:50%;background:var(--gold-dim);display:flex;align-items:center;justify-content:center;color:var(--gold);font-size:1rem">${escHtml(m.name[0])}</div>`}
        </td>
        <td>${escHtml(m.name)}</td>
        <td style="color:var(--text-muted)">${escHtml(m.role||'')}</td>
        <td>
          <div class="actions">
            <button class="btn-icon" onclick="Panels.masters.edit(${m.id})">${Icons.edit}</button>
            <button class="btn-icon danger" onclick="Panels.masters.remove(${m.id})">${Icons.delete}</button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  openForm(master = {}) {
    const isEdit = !!master.id;
    Modal.open(
      isEdit ? 'Редагувати майстра' : 'Новий майстер',
      `<form data-form="master-form">
        <div class="form-group">
          <label>Ім'я *</label>
          <input name="name" value="${escHtml(master.name||'')}" required placeholder="Ім'я майстра">
        </div>
        <div class="form-group">
          <label>Роль / посада</label>
          <input name="role" value="${escHtml(master.role||'')}" placeholder="Топ-майстер">
        </div>
        <div class="form-group">
          <label>Шлях до фото</label>
          <input name="avatar" value="${escHtml(master.avatar||'')}" placeholder="images/team/name.jpg">
          <small style="color:var(--text-muted);font-size:0.75rem">Відносний шлях від кореня сайту</small>
        </div>
        <div class="form-group">
          <label>Позиція</label>
          <input name="position" type="number" value="${master.position||0}" min="0">
        </div>
      </form>`,
      async () => {
        const data = collectForm('master-form');
        if (isEdit) {
          await API.patch('masters', master.id, data);
          Toast.show('Майстра оновлено ✓');
        } else {
          await API.post('masters', data);
          Toast.show('Майстра додано ✓');
        }
        await this.load();
      }
    );
  },

  edit(id) {
    const m = this.data.find(x => x.id === id);
    if (m) this.openForm(m);
  },

  async remove(id) {
    const ok = await confirmDelete('Видалити майстра?');
    if (!ok) return;
    await API.delete('masters', id);
    Toast.show('Видалено');
    await this.load();
  },
};

// ============================================================
// PANEL: SCHEDULE
// ============================================================
Panels.schedule = {
  data: [],

  async load() {
    const el = document.getElementById('schedule-table-body');
    el.innerHTML = `<tr><td colspan="4" class="loading"><div class="spinner"></div></td></tr>`;
    this.data = await API.get('schedule');
    this.render();
  },

  render() {
    const el = document.getElementById('schedule-table-body');
    if (!this.data.length) {
      el.innerHTML = `<tr><td colspan="4"><div class="empty-state">Немає записів графіка</div></td></tr>`;
      return;
    }
    el.innerHTML = this.data.map(s => `
      <tr>
        <td>${escHtml(s.day_label)}</td>
        <td style="color:var(--gold)">${s.open_time}</td>
        <td style="color:var(--gold)">${s.close_time}</td>
        <td>
          <div class="actions">
            <button class="btn-icon" onclick="Panels.schedule.edit(${s.id})">${Icons.edit}</button>
            <button class="btn-icon danger" onclick="Panels.schedule.remove(${s.id})">${Icons.delete}</button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  openForm(row = {}) {
    const isEdit = !!row.id;
    Modal.open(
      isEdit ? 'Редагувати графік' : 'Новий рядок графіка',
      `<form data-form="schedule-form">
        <div class="form-group">
          <label>День(і) *</label>
          <input name="day_label" value="${escHtml(row.day_label||'')}" required
                 placeholder="Понеділок – П'ятниця">
        </div>
        <div class="form-row-2">
          <div class="form-group">
            <label>Відкриття *</label>
            <input name="open_time" type="time" value="${row.open_time||'08:00'}" required>
          </div>
          <div class="form-group">
            <label>Закриття *</label>
            <input name="close_time" type="time" value="${row.close_time||'20:00'}" required>
          </div>
        </div>
        <div class="form-group">
          <label>Позиція</label>
          <input name="position" type="number" value="${row.position||0}" min="0">
        </div>
      </form>`,
      async () => {
        const data = collectForm('schedule-form');
        if (isEdit) {
          await API.patch('schedule', row.id, data);
          Toast.show('Графік оновлено ✓');
        } else {
          await API.post('schedule', data);
          Toast.show('Запис додано ✓');
        }
        await this.load();
      }
    );
  },

  edit(id) {
    const row = this.data.find(x => x.id === id);
    if (row) this.openForm(row);
  },

  async remove(id) {
    const ok = await confirmDelete('Видалити цей рядок графіка?');
    if (!ok) return;
    await API.delete('schedule', id);
    Toast.show('Видалено');
    await this.load();
  },
};

// ── Escape HTML ──────────────────────────────────────────────
function escHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── Preload select options for modals ────────────────────────
async function loadSelectOptions() {
  // Завантажуємо категорії заздалегідь щоб вони були в Panels
  try {
    Panels.services.categories = await API.get('categories');
    Panels.prices.services = (await API.get('services')).filter(s => !s.is_header);
    Panels.prices.masters  = await API.get('masters');
  } catch (e) {
    // silent
  }
}

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  Toast.init();
  Modal.init();
  Nav.init();

  // Mobile burger
  const burgerBtn = document.getElementById('admin-burger');
  if (burgerBtn) {
    burgerBtn.addEventListener('click', () => {
      document.querySelector('.sidebar')?.classList.toggle('open');
    });
  }

  // Modal save button
  document.getElementById('modal-save-btn')?.addEventListener('click', () => Modal.save());
  document.getElementById('modal-close-btn')?.addEventListener('click', () => Modal.close());

  // Export button
  document.getElementById('export-btn')?.addEventListener('click', () => {
    window.location.href = '/api/export.php';
  });

  // Preload
  await loadSelectOptions();

  // Open first panel
  Nav.show('categories');
});
