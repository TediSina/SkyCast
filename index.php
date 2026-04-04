<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/functions.php';
?>
<!DOCTYPE html>
<html lang="sq">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SkyCast - Home</title>
    <link rel="stylesheet" href="<?= e(appUrl('assets/css/style.css')) ?>">
</head>
<body>
    <header class="site-header">
        <div class="container nav">
            <h1 class="logo">SkyCast</h1>
            <nav>
                <?php if (isLoggedIn()): ?>
                    <a href="<?= e(appUrl('pages/dashboard.php')) ?>">Dashboard</a>
                    <a href="<?= e(appUrl('logout.php')) ?>">Logout</a>
                <?php else: ?>
                    <a href="<?= e(appUrl('pages/login.php')) ?>">Login</a>
                    <a href="<?= e(appUrl('pages/register.php')) ?>" class="button-link">Register</a>
                <?php endif; ?>
            </nav>
        </div>
    </header>

    <main class="container hero">
        <section class="card">
            <h2>Mirësevini në SkyCast</h2>
            <p>
                SkyCast është një aplikacion web për shikimin e motit në qytete të ndryshme.
                Përdoruesit mund të krijojnë llogari, të hyjnë në sistem dhe të ruajnë qytetet e preferuara.
            </p>

            <?php if (isLoggedIn()): ?>
                <a class="primary-btn" href="<?= e(appUrl('pages/dashboard.php')) ?>">Shko te Dashboard</a>
            <?php else: ?>
                <div class="button-row">
                    <a class="primary-btn" href="<?= e(appUrl('pages/register.php')) ?>">Krijo llogari</a>
                    <a class="secondary-btn" href="<?= e(appUrl('pages/login.php')) ?>">Hyr</a>
                </div>
            <?php endif; ?>
        </section>
    </main>
</body>
</html>
