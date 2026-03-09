<?php
// ============================================================
// api/crud.php
// Проксі між адмін-панеллю та Supabase
// Всі запити на запис проходять через service_role key
// ============================================================
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/supabase.php';

header('Content-Type: application/json; charset=utf-8');

// Лише авторизовані можуть виконувати запити
if (!is_logged_in()) {
    json_response(['error' => 'Unauthorized'], 401);
}

$method = $_SERVER['REQUEST_METHOD'];
$table  = preg_replace('/[^a-z_]/', '', $_GET['table'] ?? ''); // санітація
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;

if (!$table) {
    json_response(['error' => 'No table specified'], 400);
}

// Дозволені таблиці
$allowed = ['categories', 'services', 'prices', 'masters', 'schedule'];
if (!in_array($table, $allowed, true)) {
    json_response(['error' => 'Table not allowed'], 403);
}

$db = new SupabaseClient(true); // service key для запису

switch ($method) {

    case 'GET':
        // GET /api/crud.php?table=categories
        // GET /api/crud.php?table=services&category_id=2
        $params = [];
        if (isset($_GET['category_id'])) $params['category_id'] = 'eq.' . (int)$_GET['category_id'];
        if (isset($_GET['service_id']))  $params['service_id']  = 'eq.' . (int)$_GET['service_id'];
        $data = $db->select($table, $params);
        json_response($data);

    case 'POST':
        // Створення нового запису
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $body = sanitize_input($body);
        $result = $db->insert($table, $body);
        json_response($result['data'] ?? [], $result['code'] >= 400 ? 400 : 201);

    case 'PATCH':
        // Оновлення запису
        if (!$id) json_response(['error' => 'ID required'], 400);
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $body = sanitize_input($body);
        $result = $db->update($table, $id, $body);
        json_response($result['data'] ?? [], $result['code'] >= 400 ? 400 : 200);

    case 'DELETE':
        // Видалення запису
        if (!$id) json_response(['error' => 'ID required'], 400);
        $result = $db->delete($table, $id);
        json_response(['success' => true], 200);

    default:
        json_response(['error' => 'Method not allowed'], 405);
}

// Санітація вхідних даних (рекурсивно)
function sanitize_input(array $data): array {
    $clean = [];
    foreach ($data as $key => $val) {
        $key = preg_replace('/[^a-zA-Z0-9_]/', '', (string)$key);
        if (is_array($val)) {
            $clean[$key] = sanitize_input($val);
        } elseif (is_numeric($val)) {
            $clean[$key] = $val + 0;
        } else {
            $clean[$key] = htmlspecialchars_decode(strip_tags((string)$val));
        }
    }
    return $clean;
}
