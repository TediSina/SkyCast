<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/auth.php';

if (isLoggedIn()) {
    redirect(appUrl('pages/dashboard.php'));
}

$errors = [];
$name = '';
$email = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirmPassword = $_POST['confirm_password'] ?? '';

    if ($name === '' || strlen($name) < 2) {
        $errors[] = 'Emri duhet të ketë të paktën 2 karaktere.';
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Vendos një e-mail të vlefshëm.';
    }

    if (strlen($password) < 6) {
        $errors[] = 'Fjalëkalimi duhet të ketë të paktën 6 karaktere.';
    }

    if ($password !== $confirmPassword) {
        $errors[] = 'Fjalëkalimet nuk përputhen.';
    }

    if (empty($errors)) {
        $result = registerUser($name, $email, $password);

        if ($result['success']) {
            setFlash('success', 'Regjistrimi u krye me sukses. Tani mund të hysh në sistem.');
            redirect(appUrl('pages/login.php'));
        }

        $errors[] = $result['message'];
    }
}
?>
<!DOCTYPE html>
<html lang="sq">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Regjistrohu - SkyCast</title>
    <link rel="stylesheet" href="<?= e(appUrl('assets/css/style.css')) ?>">
    <script src="<?= e(appUrl('assets/js/validation.js')) ?>" defer></script>
</head>
<body class="auth-body">
    <main class="auth-page auth-gradient">
        <div class="auth-layout">
            <aside class="auth-visual" aria-label="Pamje e motit">
                <a class="auth-logo" href="<?= e(appUrl()) ?>">SkyCast</a>
                <div class="auth-forecast-card">
                    <span>Nesër</span>
                    <strong>24°C</strong>
                    <p>Ruaj qytetet e preferuara dhe kontrollo motin pa humbur kohë.</p>
                </div>
            </aside>

            <section class="auth-card">
                <div class="auth-badge">Regjistrohu</div>
                <h1>Krijo llogari</h1>
                <p class="auth-subtitle">Ndërto listën tënde të qyteteve dhe hap parashikimin sa herë të duhet.</p>

                <?php if (!empty($errors)): ?>
                    <div class="alert error">
                        <ul>
                            <?php foreach ($errors as $error): ?>
                                <li><?= e($error) ?></li>
                            <?php endforeach; ?>
                        </ul>
                    </div>
                <?php endif; ?>

                <form method="POST" class="form" id="registerForm" novalidate>
                    <div class="field-group">
                        <label for="name">Emri</label>
                        <input type="text" id="name" name="name" value="<?= e($name) ?>" required>
                    </div>

                    <div class="field-group">
                        <label for="email">E-mail</label>
                        <input type="email" id="email" name="email" value="<?= e($email) ?>" required>
                    </div>

                    <div class="field-group">
                        <label for="password">Fjalëkalimi</label>
                        <input type="password" id="password" name="password" required>
                    </div>

                    <div class="field-group">
                        <label for="confirm_password">Përsërit fjalëkalimin</label>
                        <input type="password" id="confirm_password" name="confirm_password" required>
                    </div>

                    <button type="submit" class="primary-btn full-width">Regjistrohu</button>
                </form>

                <p class="small-text">
                    Ke llogari? <a href="<?= e(appUrl('pages/login.php')) ?>">Hyr këtu</a>
                </p>

                <p class="small-text">
                    <a href="<?= e(appUrl()) ?>">Kthehu te kryefaqja</a>
                </p>
            </section>
        </div>
    </main>
    <?php require __DIR__ . '/../includes/footer.php'; ?>
    <script src="<?= e(appUrl('assets/js/main.js')) ?>"></script>
</body>
</html>
