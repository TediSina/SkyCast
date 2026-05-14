<?php
declare(strict_types=1);

require_once __DIR__ . '/../db/connection.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

const APP_BASE = '/skycast';

function appUrl(string $path = ''): string
{
    return APP_BASE . ($path !== '' ? '/' . ltrim($path, '/') : '');
}

function e(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

function redirect(string $path): never
{
    header('Location: ' . $path);
    exit;
}

function setFlash(string $type, string $message): void
{
    $_SESSION['flash'][$type] = $message;
}

function getFlash(string $type): ?string
{
    if (!isset($_SESSION['flash'][$type])) {
        return null;
    }

    $message = $_SESSION['flash'][$type];
    unset($_SESSION['flash'][$type]);

    return $message;
}

function isLoggedIn(): bool
{
    return isset($_SESSION['user_id']);
}

function requireLogin(): void
{
    if (!isLoggedIn()) {
        setFlash('error', 'Duhet të hysh në llogari fillimisht.');
        redirect(appUrl('pages/login.php'));
    }
}

function currentUser(): ?array
{
    if (!isLoggedIn()) {
        return null;
    }

    $stmt = db()->prepare("SELECT id, name, email, created_at FROM users WHERE id = :id LIMIT 1");
    $stmt->execute(['id' => $_SESSION['user_id']]);
    $user = $stmt->fetch();

    return $user ?: null;
}

function getSavedCities(int $userId): array
{
    $stmt = db()->prepare("
        SELECT id, city_name, latitude, longitude, created_at
        FROM saved_cities
        WHERE user_id = :user_id
        ORDER BY city_name ASC
    ");
    $stmt->execute(['user_id' => $userId]);

    return $stmt->fetchAll();
}

function saveCity(int $userId, string $cityName, float $latitude, float $longitude): void
{
    $pdo = db();

    $checkStmt = $pdo->prepare("
        SELECT id
        FROM saved_cities
        WHERE user_id = :user_id AND city_name = :city_name
        LIMIT 1
    ");
    $checkStmt->execute([
        'user_id'   => $userId,
        'city_name' => $cityName,
    ]);

    $existing = $checkStmt->fetch();

    if ($existing) {
        $updateStmt = $pdo->prepare("
            UPDATE saved_cities
            SET latitude = :latitude,
                longitude = :longitude,
                created_at = CURRENT_TIMESTAMP
            WHERE id = :id
        ");
        $updateStmt->execute([
            'latitude'  => $latitude,
            'longitude' => $longitude,
            'id'        => $existing['id'],
        ]);
        return;
    }

    $insertStmt = $pdo->prepare("
        INSERT INTO saved_cities (user_id, city_name, latitude, longitude)
        VALUES (:user_id, :city_name, :latitude, :longitude)
    ");
    $insertStmt->execute([
        'user_id'   => $userId,
        'city_name' => $cityName,
        'latitude'  => $latitude,
        'longitude' => $longitude,
    ]);
}

function deleteCity(int $userId, int $cityId): void
{
    $stmt = db()->prepare("
        DELETE FROM saved_cities
        WHERE id = :id AND user_id = :user_id
    ");
    $stmt->execute([
        'id'      => $cityId,
        'user_id' => $userId,
    ]);
}
