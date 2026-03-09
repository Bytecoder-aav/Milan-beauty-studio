<?php
// ============================================================
// api/export.php
// Експорт всіх даних у JSON файл
// ============================================================
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/supabase.php';

if (!is_logged_in()) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$db = new SupabaseClient(false); // anon key достатньо для читання

$export = [
    'exported_at' => date('c'),
    'categories'  => $db->select('categories'),
    'services'    => $db->select('services'),
    'prices'      => $db->select('prices'),
    'masters'     => $db->select('masters'),
    'schedule'    => $db->select('schedule'),
];

$filename = 'milan_data_' . date('Ymd_His') . '.json';
header('Content-Type: application/json; charset=utf-8');
header('Content-Disposition: attachment; filename="' . $filename . '"');
echo json_encode($export, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
exit;
