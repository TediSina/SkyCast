<?php
declare(strict_types=1);

require_once __DIR__ . '/functions.php';

function findUserByEmail(string $email): ?array
{
    $stmt = db()->prepare("SELECT * FROM users WHERE email = :email LIMIT 1");
    $stmt->execute(['email' => strtolower(trim($email))]);
    $user = $stmt->fetch();

    return $user ?: null;
}

function registerUser(string $name, string $email, string $password): array
{
    $name = trim($name);
    $email = strtolower(trim($email));

    if (findUserByEmail($email)) {
        return [
            'success' => false,
            'message' => 'Ky email ekziston tashme.',
        ];
    }

    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    $stmt = db()->prepare("
        INSERT INTO users (name, email, password)
        VALUES (:name, :email, :password)
    ");

    $stmt->execute([
        'name'     => $name,
        'email'    => $email,
        'password' => $hashedPassword,
    ]);

    return [
        'success' => true,
        'message' => 'Regjistrimi u krye me sukses.',
    ];
}

function loginUser(string $email, string $password): bool
{
    $user = findUserByEmail($email);

    if (!$user) {
        return false;
    }

    if (!password_verify($password, $user['password'])) {
        return false;
    }

    $_SESSION['user_id'] = (int) $user['id'];
    $_SESSION['user_name'] = $user['name'];

    return true;
}

function logoutUser(): void
{
    $_SESSION = [];

    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(),
            '',
            time() - 42000,
            $params['path'],
            $params['domain'],
            $params['secure'],
            $params['httponly']
        );
    }

    session_destroy();
}
