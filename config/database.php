<?php
/**
 * Konfigurasi Koneksi Database MySQL / MariaDB
 * Menggunakan PHP Data Objects (PDO) dengan Prepared Statements & Parameter Binding
 * Kompatibel dengan PHP 8.0+ dan cPanel Shared Hosting
 */

declare(strict_types=1);

// Konfigurasi Database - Sesuaikan dengan detail database cPanel Anda
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'pos_minimarket');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');
define('DB_PORT', getenv('DB_PORT') ?: '3306');
define('DB_CHARSET', 'utf8mb4');

class Database
{
    private static ?PDO $instance = null;

    /**
     * Mendapatkan instance tunggal koneksi PDO (Singleton Pattern)
     */
    public static function getConnection(): PDO
    {
        if (self::$instance === null) {
            $dsn = sprintf(
                'mysql:host=%s;port=%s;dbname=%s;charset=%s',
                DB_HOST,
                DB_PORT,
                DB_NAME,
                DB_CHARSET
            );

            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false, // Mencegah SQL Injection dengan real prepared statements
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
            ];

            try {
                self::$instance = new PDO($dsn, DB_USER, DB_PASS, $options);
            } catch (PDOException $e) {
                // Jangan menampilkan kredensial/error raw ke end-user
                error_log('Database Connection Error: ' . $e->getMessage());
                http_response_code(500);
                die(json_encode([
                    'success' => false,
                    'message' => 'Gagal terhubung ke database. Pastikan konfigurasi di config/database.php sudah benar.'
                ]));
            }
        }

        return self::$instance;
    }
}
