<?php
// ============================================================
// admin/login.php
// ============================================================
require_once __DIR__ . '/../includes/auth.php';

// Якщо вже авторизований — в панель
if (is_logged_in()) {
    header('Location: /admin/index.php');
    exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // CSRF-перевірка
    if (!hash_equals($_SESSION['csrf_token'] ?? '', $_POST['csrf_token'] ?? '')) {
        $error = 'Невірний токен. Оновіть сторінку.';
    } else {
        $user = trim($_POST['username'] ?? '');
        $pass = $_POST['password'] ?? '';
        if (attempt_login($user, $pass)) {
            header('Location: /admin/index.php');
            exit;
        }
        $error = 'Невірний логін або пароль.';
    }
}

// Генеруємо CSRF токен
start_secure_session();
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}
?>
<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Адмін — Milan Studio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=Manrope:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/admin/assets/css/admin.css">
</head>
<body class="login-page">
  <div class="login-wrap">
    <div class="login-logo">
      <span class="logo-milan">Milan</span>
      <span class="logo-studio">STUDIO</span>
    </div>
    <h1 class="login-title">Адміністративна панель</h1>

    <?php if ($error): ?>
      <div class="alert alert-error"><?= htmlspecialchars($error) ?></div>
    <?php endif; ?>

    <form method="POST" class="login-form" autocomplete="off">
      <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">

      <div class="form-group">
        <label for="username">Логін</label>
        <input type="text" id="username" name="username" required autofocus
               value="<?= htmlspecialchars($_POST['username'] ?? '') ?>">
      </div>
      <div class="form-group">
        <label for="password">Пароль</label>
        <input type="password" id="password" name="password" required>
      </div>
      <button type="submit" class="btn btn-primary btn-full">Увійти</button>
    </form>
  </div>
</body>
</html>
