<?php
// ============================================================
// includes/config.php
// Конфігурація Supabase та авторизації
// ============================================================

// --- Supabase ---
define('SUPABASE_URL',      'https://fihxmpmxygthisgcxelj.supabase.co');  // замінити
define('SUPABASE_ANON_KEY', 'sb_publishable_hm5W8KKVYexq6_3zucap_A_3qcexFOF');  // замінити
define('SUPABASE_SERVICE_KEY', 'sb_secret_AT_eH_mEQ8XedLSojePVyw_nrLLbT4b');  // замінити (для запису)

// --- Admin credentials (змінити перед деплоєм!) ---
define('ADMIN_USERNAME', 'Lena');
define('ADMIN_PASSWORD', '$2a$12$Esk4t9/P0LO.LcJsVmrao.uxfOsCMwnddQ1Gnp45EEQOn1OI4s6hG');  // bcrypt hash, генерується нижче

// --- Session ---
define('SESSION_NAME',    'milan_admin_session');
define('SESSION_TIMEOUT', 3600); // 1 година

// ============================================================
// Генерація хешу пароля (виконати один раз у CLI або окремому файлі):
//   php -r "echo password_hash('YOUR_PASSWORD', PASSWORD_BCRYPT, ['cost'=>12]);"
// Результат вставити замість PLACEHOLDER_HASH
// ============================================================
