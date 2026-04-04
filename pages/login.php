<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/auth.php';

if (isLoggedIn()) {
    redirect(appUrl('pages/dashboard.php'));
}

$errors = [];
$email = '';
$successMessage = getFlash('success');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Vendos nje email te vlefshem.';
    }

    if ($password === '') {
        $errors[] = 'Password nuk mund te jete bosh.';
    }

    if (empty($errors)) {
        if (loginUser($email, $password)) {
            redirect(appUrl('pages/dashboard.php'));
        }

        $errors[] = 'Email ose password i pasakte.';
    }
}
?>
<!DOCTYPE html>
<html lang="sq">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - SkyCast</title>
    <link rel="stylesheet" href="<?= e(appUrl('assets/css/style.css')) ?>">
</head>
<body>
    <main class="auth-page">
        <section class="auth-card">
            <h1>Hyr në sistem</h1>

            <?php if ($successMessage): ?>
                <div class="alert success"><?= e($successMessage) ?></div>
            <?php endif; ?>

            <?php if (!empty($errors)): ?>
                <div class="alert error">
                    <ul>
                        <?php foreach ($errors as $error): ?>
                            <li><?= e($error) ?></li>
                        <?php endforeach; ?>
                    </ul>
                </div>
            <?php endif; ?>

            <form method="POST" class="form">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" value="<?= e($email) ?>" required>

                <label for="password">Password</label>
                <input type="password" id="password" name="password" required>

                <button type="submit" class="primary-btn full-width">Login</button>
            </form>

            <p class="small-text">
                Nuk ke llogari? <a href="<?= e(appUrl('pages/register.php')) ?>">Regjistrohu</a>
            </p>

            <p class="small-text">
                <a href="<?= e(appUrl()) ?>">Kthehu te Home</a>
            </p>
        </section>
    </main>
</body>
</html>
