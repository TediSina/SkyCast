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
        $errors[] = 'Vendos një e-mail të vlefshëm.';
    }

    if ($password === '') {
        $errors[] = 'Fjalëkalimi nuk mund të jetë bosh.';
    }

    if (empty($errors)) {
        if (loginUser($email, $password)) {
            redirect(appUrl('pages/dashboard.php'));
        }

        $errors[] = 'E-mail ose fjalëkalim i pasaktë.';
    }
}
?>
<!DOCTYPE html>
<html lang="sq">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hyr - SkyCast</title>
    <link rel="stylesheet" href="<?= e(appUrl('assets/css/style.css')) ?>">
    <script src="<?= e(appUrl('assets/js/validation.js')) ?>" defer></script>
</head>
<body class="auth-body">
    <main class="auth-page auth-gradient">
        <div class="auth-layout">
            <aside class="auth-visual" aria-label="Pamje e motit">
                <a class="auth-logo" href="<?= e(appUrl()) ?>">SkyCast</a>
                <div class="auth-forecast-card">
                    <span>Sonte</span>
                    <strong>18°C</strong>
                    <p>Qasje e shpejtë tek moti aktual, parashikimi orar dhe qytetet e tua të ruajtura.</p>
                </div>
            </aside>

            <section class="auth-card">
                <div class="auth-badge">Hyr</div>
                <h1>Hyr në sistem</h1>
                <p class="auth-subtitle">Vazhdo te paneli yt personal për motin dhe qytetet e ruajtura.</p>

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

                <form method="POST" class="form" id="loginForm" novalidate>
                    <div class="field-group">
                        <label for="email">E-mail</label>
                        <input type="email" id="email" name="email" value="<?= e($email) ?>" required>
                    </div>

                    <div class="field-group">
                        <label for="password">Fjalëkalimi</label>
                        <input type="password" id="password" name="password" required>
                    </div>

                    <button type="submit" class="primary-btn full-width">Hyr</button>
                </form>

                <p class="small-text">
                    Nuk ke llogari? <a href="<?= e(appUrl('pages/register.php')) ?>">Regjistrohu</a>
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
