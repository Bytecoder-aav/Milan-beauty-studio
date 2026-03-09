<?php
// ============================================================
// admin/index.php — Головна сторінка адмін-панелі
// ============================================================
require_once __DIR__ . '/../includes/auth.php';
require_auth(); // Редірект на login якщо не авторизований
?>
<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Адмін — Milan Studio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=Manrope:wght@300;400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/admin/assets/css/admin.css">
</head>
<body>

<div class="admin-layout">

  <!-- ══ SIDEBAR ══════════════════════════════════════════ -->
  <aside class="sidebar">
    <div class="sidebar-logo">
      <a href="/" style="text-decoration:none">
        <span class="logo-milan">Milan</span>
        <span class="logo-studio">STUDIO</span>
      </a>
    </div>

    <nav class="sidebar-nav">
      <div class="sidebar-section">Контент</div>

      <button class="sidebar-link" data-panel="categories">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
        <span class="link-text">Категорії</span>
      </button>

      <button class="sidebar-link" data-panel="services">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1"/><circle cx="3" cy="12" r="1"/><circle cx="3" cy="18" r="1"/></svg>
        <span class="link-text">Послуги</span>
      </button>

      <button class="sidebar-link" data-panel="prices">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 1 0 0 7h5a3.5 3.5 0 1 1 0 7H6"/></svg>
        <span class="link-text">Прайс</span>
      </button>

      <button class="sidebar-link" data-panel="masters">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <span class="link-text">Майстри</span>
      </button>

      <button class="sidebar-link" data-panel="schedule">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <span class="link-text">Графік роботи</span>
      </button>

      <div class="sidebar-section" style="margin-top:0.5rem">Інструменти</div>

      <button class="sidebar-link" id="export-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        <span class="link-text">Експорт JSON</span>
      </button>
    </nav>

    <div class="sidebar-footer">
      <a href="/admin/logout.php" class="sidebar-link" style="color:var(--danger)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        <span class="link-text">Вийти</span>
      </a>
    </div>
  </aside>

  <!-- ══ MAIN ═════════════════════════════════════════════ -->
  <div class="main">

    <!-- Topbar -->
    <div class="topbar">
      <button id="admin-burger" class="btn-icon" style="display:none">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
      <span class="topbar-title" id="topbar-title">Категорії</span>
      <span style="font-size:0.75rem;color:var(--text-muted)">
        <?= htmlspecialchars($_SESSION['admin_user'] ?? 'admin') ?>
      </span>
    </div>

    <!-- Content area -->
    <div class="content">

      <!-- ══ PANEL: CATEGORIES ══════════════════════════ -->
      <div class="panel" id="panel-categories">
        <div class="panel-header">
          <h2 class="panel-title">Категорії послуг</h2>
          <button class="btn btn-primary" onclick="Panels.categories.openForm()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Нова категорія
          </button>
        </div>
        <div class="card">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width:60px">#</th>
                <th>Назва</th>
                <th>Slug</th>
                <th style="width:100px">Дії</th>
              </tr>
            </thead>
            <tbody id="categories-table-body">
              <tr><td colspan="4" class="loading"><div class="spinner"></div></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ══ PANEL: SERVICES ═══════════════════════════ -->
      <div class="panel" id="panel-services">
        <div class="panel-header">
          <h2 class="panel-title">Послуги</h2>
          <div style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap">
            <select id="service-cat-filter" style="padding:0.5rem 0.75rem;background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--radius);color:var(--text);font-size:0.85rem"></select>
            <button class="btn btn-primary" onclick="Panels.services.openForm()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Нова послуга
            </button>
          </div>
        </div>
        <div class="card">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width:60px">#</th>
                <th>Назва</th>
                <th>Категорія</th>
                <th style="width:100px">Дії</th>
              </tr>
            </thead>
            <tbody id="services-table-body">
              <tr><td colspan="4" class="loading"><div class="spinner"></div></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ══ PANEL: PRICES ════════════════════════════ -->
      <div class="panel" id="panel-prices">
        <div class="panel-header">
          <h2 class="panel-title">Прайс</h2>
          <button class="btn btn-primary" onclick="Panels.prices.openForm()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Нова ціна
          </button>
        </div>
        <div class="card">
          <table class="data-table">
            <thead>
              <tr>
                <th>Послуга</th>
                <th>Майстер</th>
                <th>Ціна</th>
                <th style="width:100px">Дії</th>
              </tr>
            </thead>
            <tbody id="prices-table-body">
              <tr><td colspan="4" class="loading"><div class="spinner"></div></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ══ PANEL: MASTERS ════════════════════════════ -->
      <div class="panel" id="panel-masters">
        <div class="panel-header">
          <h2 class="panel-title">Майстри</h2>
          <button class="btn btn-primary" onclick="Panels.masters.openForm()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Новий майстер
          </button>
        </div>
        <div class="card">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width:56px">Фото</th>
                <th>Ім'я</th>
                <th>Роль</th>
                <th style="width:100px">Дії</th>
              </tr>
            </thead>
            <tbody id="masters-table-body">
              <tr><td colspan="4" class="loading"><div class="spinner"></div></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ══ PANEL: SCHEDULE ══════════════════════════ -->
      <div class="panel" id="panel-schedule">
        <div class="panel-header">
          <h2 class="panel-title">Графік роботи</h2>
          <button class="btn btn-primary" onclick="Panels.schedule.openForm()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Додати рядок
          </button>
        </div>
        <div class="card">
          <table class="data-table">
            <thead>
              <tr>
                <th>Дні</th>
                <th>Відкриття</th>
                <th>Закриття</th>
                <th style="width:100px">Дії</th>
              </tr>
            </thead>
            <tbody id="schedule-table-body">
              <tr><td colspan="4" class="loading"><div class="spinner"></div></td></tr>
            </tbody>
          </table>
        </div>
      </div>

    </div><!-- /content -->
  </div><!-- /main -->
</div><!-- /admin-layout -->

<!-- ══ MODAL ══════════════════════════════════════════════ -->
<div class="modal-overlay" id="modal-overlay">
  <div class="modal" id="modal">
    <div class="modal-header">
      <span class="modal-title" id="modal-title">Редагувати</span>
      <button class="btn-icon" id="modal-close-btn" title="Закрити">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div id="modal-body"></div>
    <div style="display:flex;gap:0.5rem;justify-content:flex-end;margin-top:1.25rem;padding-top:0.75rem;border-top:1px solid var(--border)">
      <button class="btn btn-secondary" id="modal-close-btn2" onclick="Modal.close()">Скасувати</button>
      <button class="btn btn-primary" id="modal-save-btn">Зберегти</button>
    </div>
  </div>
</div>

<!-- ══ TOASTS ════════════════════════════════════════════ -->
<div class="toast-container" id="toast-container"></div>

<script src="/admin/assets/js/admin.js"></script>
</body>
</html>
