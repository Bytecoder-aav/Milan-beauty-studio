<?php
// ============================================================
// includes/supabase.php
// Обгортка для Supabase REST API
// ============================================================
require_once __DIR__ . '/config.php';

class SupabaseClient {

    private string $url;
    private string $key;

    public function __construct(bool $useServiceKey = false) {
        $this->url = rtrim(SUPABASE_URL, '/');
        $this->key = $useServiceKey ? SUPABASE_SERVICE_KEY : SUPABASE_ANON_KEY;
    }

    // ── Базовий HTTP запит ──────────────────────────────────
    private function request(string $method, string $endpoint, array $data = [], array $params = []): array {
        $url = $this->url . '/rest/v1/' . ltrim($endpoint, '/');

        if (!empty($params)) {
            $url .= '?' . http_build_query($params);
        }

        $headers = [
            'Content-Type: application/json',
            'apikey: '        . $this->key,
            'Authorization: Bearer ' . $this->key,
            'Prefer: return=representation',
        ];

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST  => $method,
            CURLOPT_HTTPHEADER     => $headers,
            CURLOPT_TIMEOUT        => 10,
        ]);

        if (!empty($data)) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($response === false) {
            return ['error' => 'cURL error', 'code' => 0];
        }

        $decoded = json_decode($response, true) ?? [];
        return ['data' => $decoded, 'code' => $httpCode];
    }

    // ── SELECT ──────────────────────────────────────────────
    public function select(string $table, array $params = []): array {
        // Завжди повертаємо масив рядків
        $defaultParams = ['select' => '*', 'order' => 'position.asc,id.asc'];
        $merged = array_merge($defaultParams, $params);
        $result = $this->request('GET', $table, [], $merged);
        return $result['data'] ?? [];
    }

    // ── INSERT ──────────────────────────────────────────────
    public function insert(string $table, array $data): array {
        return $this->request('POST', $table, $data);
    }

    // ── UPDATE ──────────────────────────────────────────────
    public function update(string $table, int $id, array $data): array {
        return $this->request('PATCH', $table . '?id=eq.' . $id, $data);
    }

    // ── DELETE ──────────────────────────────────────────────
    public function delete(string $table, int $id): array {
        return $this->request('DELETE', $table . '?id=eq.' . $id);
    }

    // ── SELECT з фільтром ───────────────────────────────────
    public function selectWhere(string $table, string $col, $val, array $extra = []): array {
        $params = array_merge(['select' => '*', $col => 'eq.' . $val], $extra);
        $result = $this->request('GET', $table, [], $params);
        return $result['data'] ?? [];
    }
}

// ── Зручна функція для JSON-відповіді ──────────────────────
function json_response(array $data, int $code = 200): never {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}
