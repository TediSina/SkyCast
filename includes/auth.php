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

function findUserById(int $userId): ?array
{
    $stmt = db()->prepare("SELECT * FROM users WHERE id = :id LIMIT 1");
    $stmt->execute(['id' => $userId]);
    $user = $stmt->fetch();

    return $user ?: null;
}

function emailBelongsToAnotherUser(string $email, int $userId): bool
{
    $stmt = db()->prepare("
        SELECT id
        FROM users
        WHERE email = :email AND id <> :id
        LIMIT 1
    ");
    $stmt->execute([
        'email' => strtolower(trim($email)),
        'id'    => $userId,
    ]);

    return (bool) $stmt->fetch();
}

function registerUser(string $name, string $email, string $password): array
{
    $name = trim($name);
    $email = strtolower(trim($email));

    if (findUserByEmail($email)) {
        return [
            'success' => false,
            'message' => 'Ky email ekziston tashmë.',
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

function verifyUserPassword(int $userId, string $password): bool
{
    $user = findUserById($userId);

    if (!$user) {
        return false;
    }

    return password_verify($password, $user['password']);
}

function updateUserProfile(int $userId, string $name, string $email): void
{
    $stmt = db()->prepare("
        UPDATE users
        SET name = :name,
            email = :email
        WHERE id = :id
    ");
    $stmt->execute([
        'name'  => trim($name),
        'email' => strtolower(trim($email)),
        'id'    => $userId,
    ]);

    $_SESSION['user_name'] = trim($name);
}

function updateUserPassword(int $userId, string $password): void
{
    $stmt = db()->prepare("
        UPDATE users
        SET password = :password
        WHERE id = :id
    ");
    $stmt->execute([
        'password' => password_hash($password, PASSWORD_DEFAULT),
        'id'       => $userId,
    ]);
}

function deleteUserAccount(int $userId): void
{
    $stmt = db()->prepare("DELETE FROM users WHERE id = :id");
    $stmt->execute(['id' => $userId]);
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
