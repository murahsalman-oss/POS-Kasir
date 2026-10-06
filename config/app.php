<?php
/**
 * Konfigurasi Aplikasi & Session Security
 * POS Minimarket
 */

declare(strict_types=1);

// Set Timezone Indonesia (WIB)
date_default_timezone_set('Asia/Jakarta');

// Konfigurasi Aplikasi
define('APP_NAME', 'POS Minimarket Pro');
define('APP_VERSION', '1.0.0');
define('BASE_URL', getenv('BASE_URL') ?: 'http://localhost/pos-minimarket');

// Inisialisasi Session yang aman
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.cookie_samesite', 'Lax');
    if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
        ini_set('session.cookie_secure', '1');
    }
    session_start();
}

/**
 * Generate dan Validasi CSRF Token
 */
function getCsrfToken(): string
{
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verifyCsrfToken(?string $token): bool
{
    if (!$token || empty($_SESSION['csrf_token'])) {
        return false;
    }
    return hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * Format mata uang Rupiah
 */
function formatRupiah(float $angka): string
{
    return 'Rp ' . number_format($angka, 0, ',', '.');
}

/**
 * Helper Audit Log
 */
function logActivity(PDO $db, string $action, string $module, string $details): void
{
    $userId = $_SESSION['user_id'] ?? null;
    $userName = $_SESSION['user_name'] ?? 'System';
    $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? '';

    $stmt = $db->prepare("
        INSERT INTO audit_logs (user_id, user_name, action, module, details, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$userId, $userName, $action, $module, $details, $ip, $ua]);
}
