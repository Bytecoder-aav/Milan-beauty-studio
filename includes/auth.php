<?php
// ============================================================
// includes/auth.php
// Управління сесією та авторизацією
// ============================================================
require_once __DIR__ . '/config.php';

// Запускаємо сесію з безпечними налаштуваннями
function start_secure_session(): void {
    if (session_status() === PHP_SESSION_NONE) {
        session_name(SESSION_NAME);
        session_set_cookie_params([
            'lifetime' => SESSION_TIMEOUT,
            'path'     => '/',
            'secure'   => true,          // HTTPS only
            'httponly' => true,           // недоступна з JS
            'samesite' => 'Strict',
        ]);
        session_start();
        // Регенеруємо ID сесії для захисту від session fixation
        if (empty($_SESSION['_initiated'])) {
            session_regenerate_id(true);
            $_SESSION['_initiated'] = true;
        }
    }
}

// Перевіряємо чи авторизований
function is_logged_in(): bool {
    start_secure_session();
    if (empty($_SESSION['admin_logged_in'])) return false;
    // Перевірка таймауту
    if (time() - ($_SESSION['last_activity'] ?? 0) > SESSION_TIMEOUT) {
        logout();
        return false;
    }
    $_SESSION['last_activity'] = time();
    return true;
}

// Редірект на логін якщо не авторизований
function require_auth(): void {
    if (!is_logged_in()) {
        header('Location: /admin/login.php');
        exit;
    }
}

// Спроба логіну
function attempt_login(string $username, string $password): bool {
    start_secure_session();
    if ($username === ADMIN_USERNAME && password_verify($password, ADMIN_PASSWORD)) {
        session_regenerate_id(true);
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['last_activity']   = time();
        $_SESSION['admin_user']      = $username;
        return true;
    }
    // Захист від brute-force — штучна затримка
    sleep(1);
    return false;
}

// Вихід
function logout(): void {
    start_secure_session();
    $_SESSION = [];
    session_destroy();
    setcookie(SESSION_NAME, '', time() - 3600, '/');
}
