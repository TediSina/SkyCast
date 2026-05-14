<?php
declare(strict_types=1);

const DB_HOST = '127.0.0.1';
const DB_PORT = '3306';
const DB_NAME = 'skycast_db';
const DB_USER = 'root';
const DB_PASS = '';

function db(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    try {
        $serverDsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";charset=utf8mb4";
        $serverPdo = new PDO($serverDsn, DB_USER, DB_PASS, $options);

        $serverPdo->exec(
            "CREATE DATABASE IF NOT EXISTS `" . DB_NAME . "`
            CHARACTER SET utf8mb4
            COLLATE utf8mb4_unicode_ci"
        );

        $dbDsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $pdo = new PDO($dbDsn, DB_USER, DB_PASS, $options);

        initializeDatabase($pdo);

        return $pdo;
    } catch (PDOException $e) {
        exit(
            'Gabim në lidhjen me bazën e të dhënave. Sigurohu që MySQL në XAMPP është aktiv. <br><br>' .
            'Detaje: ' . htmlspecialchars($e->getMessage(), ENT_QUOTES, 'UTF-8')
        );
    }
}

function initializeDatabase(PDO $pdo): void
{
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(150) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS saved_cities (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            city_name VARCHAR(100) NOT NULL,
            latitude DECIMAL(9,6) NOT NULL,
            longitude DECIMAL(9,6) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_user_city (user_id, city_name),
            CONSTRAINT fk_saved_cities_user
                FOREIGN KEY (user_id) REFERENCES users(id)
                ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
}

db();
