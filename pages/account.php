<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/auth.php';

requireLogin();

$user = currentUser();

if (!$user) {
    logoutUser();
    redirect(appUrl('pages/login.php'));
}

$savedCities = getSavedCities((int) $user['id']);
$successMessage = getFlash('success');
$profileErrors = [];
$passwordErrors = [];
$deleteErrors = [];
$profileName = $user['name'];
$profileEmail = $user['email'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'update_profile') {
        $profileName = trim($_POST['name'] ?? '');
        $profileEmail = strtolower(trim($_POST['email'] ?? ''));

        if ($profileName === '' || strlen($profileName) < 2) {
            $profileErrors[] = 'Emri duhet te kete te pakten 2 karaktere.';
        }

        if (!filter_var($profileEmail, FILTER_VALIDATE_EMAIL)) {
            $profileErrors[] = 'Vendos nje email te vlefshem.';
        }

        if ($profileEmail !== '' && emailBelongsToAnotherUser($profileEmail, (int) $user['id'])) {
            $profileErrors[] = 'Ky email perdoret nga nje llogari tjeter.';
        }

        if (empty($profileErrors)) {
            updateUserProfile((int) $user['id'], $profileName, $profileEmail);
            setFlash('success', 'Te dhenat e llogarise u perditesuan.');
            redirect(appUrl('pages/account.php'));
        }
    }

    if ($action === 'update_password') {
        $currentPassword = $_POST['current_password'] ?? '';
        $newPassword = $_POST['new_password'] ?? '';
        $confirmNewPassword = $_POST['confirm_new_password'] ?? '';

        if ($currentPassword === '' || !verifyUserPassword((int) $user['id'], $currentPassword)) {
            $passwordErrors[] = 'Password aktual nuk eshte i sakte.';
        }

        if (strlen($newPassword) < 6) {
            $passwordErrors[] = 'Password i ri duhet te kete te pakten 6 karaktere.';
        }

        if ($newPassword !== $confirmNewPassword) {
            $passwordErrors[] = 'Password-et e reja nuk perputhen.';
        }

        if (empty($passwordErrors)) {
            updateUserPassword((int) $user['id'], $newPassword);
            setFlash('success', 'Password u ndryshua me sukses.');
            redirect(appUrl('pages/account.php'));
        }
    }

    if ($action === 'delete_account') {
        $deletePassword = $_POST['delete_password'] ?? '';
        $deleteConfirm = trim($_POST['delete_confirm'] ?? '');

        if ($deleteConfirm !== 'DELETE') {
            $deleteErrors[] = 'Shkruaj DELETE per te konfirmuar fshirjen.';
        }

        if ($deletePassword === '' || !verifyUserPassword((int) $user['id'], $deletePassword)) {
            $deleteErrors[] = 'Password nuk eshte i sakte.';
        }

        if (empty($deleteErrors)) {
            deleteUserAccount((int) $user['id']);
            logoutUser();
            redirect(appUrl());
        }
    }
}

$createdAt = strtotime((string) $user['created_at']);
$createdLabel = $createdAt ? date('d M Y', $createdAt) : 'N/A';
?>
<!DOCTYPE html>
<html lang="sq">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account - SkyCast</title>
    <link rel="stylesheet" href="<?= e(appUrl('assets/css/style.css')) ?>">
    <script src="<?= e(appUrl('assets/js/validation.js')) ?>" defer></script>
</head>
<body class="dashboard-body">
    <header class="site-header">
        <div class="container nav">
            <h1 class="logo"><a href="<?= e(appUrl()) ?>">SkyCast</a></h1>
            <nav>
                <a href="<?= e(appUrl()) ?>">Home</a>
                <a href="<?= e(appUrl('pages/dashboard.php')) ?>">Dashboard</a>
                <a href="<?= e(appUrl('pages/account.php')) ?>">Account</a>
                <a href="<?= e(appUrl('logout.php')) ?>">Logout</a>
            </nav>
        </div>
    </header>

    <main class="container account-page">
        <section class="account-hero">
            <div>
                <span class="eyebrow">Account</span>
                <h2>Profili yt ne SkyCast</h2>
                <p>Shiko te dhenat e llogarise, perditeso identitetin, ndrysho password-in ose fshi llogarine kur nuk te duhet me.</p>
            </div>

            <div class="account-avatar" aria-hidden="true">
                <?= e(strtoupper(substr((string) $user['name'], 0, 1))) ?>
            </div>
        </section>

        <?php if ($successMessage): ?>
            <div class="alert success"><?= e($successMessage) ?></div>
        <?php endif; ?>

        <section class="card account-summary-card">
            <div class="card-heading">
                <div>
                    <span class="section-kicker">Te dhenat</span>
                    <h3><?= e($user['name']) ?></h3>
                </div>
            </div>

            <div class="account-metrics">
                <div class="account-metric">
                    <span>ID</span>
                    <strong>#<?= (int) $user['id'] ?></strong>
                </div>
                <div class="account-metric">
                    <span>Email</span>
                    <strong><?= e($user['email']) ?></strong>
                </div>
                <div class="account-metric">
                    <span>Krijuar me</span>
                    <strong><?= e($createdLabel) ?></strong>
                </div>
                <div class="account-metric">
                    <span>Qytete</span>
                    <strong><?= count($savedCities) ?></strong>
                </div>
            </div>
        </section>

        <div class="account-grid">
            <section class="card settings-card">
                <div class="card-heading">
                    <div>
                        <span class="section-kicker">Profili</span>
                        <h3>Ndrysho te dhenat</h3>
                    </div>
                </div>

                <?php if (!empty($profileErrors)): ?>
                    <div class="alert error">
                        <ul>
                            <?php foreach ($profileErrors as $error): ?>
                                <li><?= e($error) ?></li>
                            <?php endforeach; ?>
                        </ul>
                    </div>
                <?php endif; ?>

                <form method="POST" class="form" id="accountProfileForm" novalidate>
                    <input type="hidden" name="action" value="update_profile">
                    <div class="field-group">
                        <label for="accountName">Emri</label>
                        <input type="text" id="accountName" name="name" value="<?= e($profileName) ?>" required>
                    </div>

                    <div class="field-group">
                        <label for="accountEmail">Email</label>
                        <input type="email" id="accountEmail" name="email" value="<?= e($profileEmail) ?>" required>
                    </div>

                    <button type="submit" class="primary-btn">Ruaj ndryshimet</button>
                </form>
            </section>

            <section class="card settings-card">
                <div class="card-heading">
                    <div>
                        <span class="section-kicker">Siguria</span>
                        <h3>Ndrysho password-in</h3>
                    </div>
                </div>

                <?php if (!empty($passwordErrors)): ?>
                    <div class="alert error">
                        <ul>
                            <?php foreach ($passwordErrors as $error): ?>
                                <li><?= e($error) ?></li>
                            <?php endforeach; ?>
                        </ul>
                    </div>
                <?php endif; ?>

                <form method="POST" class="form" id="accountPasswordForm" novalidate>
                    <input type="hidden" name="action" value="update_password">
                    <div class="field-group">
                        <label for="currentPassword">Password aktual</label>
                        <input type="password" id="currentPassword" name="current_password" required>
                    </div>

                    <div class="field-group">
                        <label for="newPassword">Password i ri</label>
                        <input type="password" id="newPassword" name="new_password" required>
                    </div>

                    <div class="field-group">
                        <label for="confirmNewPassword">Perserit password-in e ri</label>
                        <input type="password" id="confirmNewPassword" name="confirm_new_password" required>
                    </div>

                    <button type="submit" class="secondary-btn">Ndrysho password-in</button>
                </form>
            </section>

            <section class="card settings-card danger-zone">
                <div class="card-heading">
                    <div>
                        <span class="section-kicker">Zona e Rrezikut</span>
                        <h3>Fshi llogarine</h3>
                    </div>
                </div>

                <p>Fshirja e llogarise heq perfundimisht profilin dhe qytetet e ruajtura.</p>

                <?php if (!empty($deleteErrors)): ?>
                    <div class="alert error">
                        <ul>
                            <?php foreach ($deleteErrors as $error): ?>
                                <li><?= e($error) ?></li>
                            <?php endforeach; ?>
                        </ul>
                    </div>
                <?php endif; ?>

                <form method="POST" class="form" id="deleteAccountForm" novalidate>
                    <input type="hidden" name="action" value="delete_account">
                    <div class="field-group">
                        <label for="deletePassword">Password</label>
                        <input type="password" id="deletePassword" name="delete_password" required>
                    </div>

                    <div class="field-group">
                        <label for="deleteConfirm">Shkruaj DELETE</label>
                        <input type="text" id="deleteConfirm" name="delete_confirm" required>
                    </div>

                    <button type="submit" class="danger-btn">Fshi llogarine</button>
                </form>
            </section>
        </div>
    </main>

    <script src="<?= e(appUrl('assets/js/main.js')) ?>"></script>
</body>
</html>
