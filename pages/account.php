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
            $profileErrors[] = 'Emri duhet të ketë të paktën 2 karaktere.';
        }

        if (!filter_var($profileEmail, FILTER_VALIDATE_EMAIL)) {
            $profileErrors[] = 'Vendos një e-mail të vlefshëm.';
        }

        if ($profileEmail !== '' && emailBelongsToAnotherUser($profileEmail, (int) $user['id'])) {
            $profileErrors[] = 'Ky e-mail përdoret nga një llogari tjetër.';
        }

        if (empty($profileErrors)) {
            updateUserProfile((int) $user['id'], $profileName, $profileEmail);
            setFlash('success', 'Të dhënat e llogarisë u përditësuan.');
            redirect(appUrl('pages/account.php'));
        }
    }

    if ($action === 'update_password') {
        $currentPassword = $_POST['current_password'] ?? '';
        $newPassword = $_POST['new_password'] ?? '';
        $confirmNewPassword = $_POST['confirm_new_password'] ?? '';

        if ($currentPassword === '' || !verifyUserPassword((int) $user['id'], $currentPassword)) {
            $passwordErrors[] = 'Fjalëkalimi aktual nuk është i saktë.';
        }

        if (strlen($newPassword) < 6) {
            $passwordErrors[] = 'Fjalëkalimi i ri duhet të ketë të paktën 6 karaktere.';
        }

        if ($newPassword !== $confirmNewPassword) {
            $passwordErrors[] = 'Fjalëkalimet e reja nuk përputhen.';
        }

        if (empty($passwordErrors)) {
            updateUserPassword((int) $user['id'], $newPassword);
            setFlash('success', 'Fjalëkalimi u ndryshua me sukses.');
            redirect(appUrl('pages/account.php'));
        }
    }

    if ($action === 'delete_account') {
        $deletePassword = $_POST['delete_password'] ?? '';
        $deleteConfirm = trim($_POST['delete_confirm'] ?? '');

        if ($deleteConfirm !== 'FSHI') {
            $deleteErrors[] = 'Shkruaj FSHI për të konfirmuar fshirjen.';
        }

        if ($deletePassword === '' || !verifyUserPassword((int) $user['id'], $deletePassword)) {
            $deleteErrors[] = 'Fjalëkalimi nuk është i saktë.';
        }

        if (empty($deleteErrors)) {
            deleteUserAccount((int) $user['id']);
            logoutUser();
            redirect(appUrl());
        }
    }
}

$createdAt = strtotime((string) $user['created_at']);
$months = [
    1 => 'Janar',
    2 => 'Shkurt',
    3 => 'Mars',
    4 => 'Prill',
    5 => 'Maj',
    6 => 'Qershor',
    7 => 'Korrik',
    8 => 'Gusht',
    9 => 'Shtator',
    10 => 'Tetor',
    11 => 'Nëntor',
    12 => 'Dhjetor',
];
$createdLabel = $createdAt
    ? date('d', $createdAt) . ' ' . $months[(int) date('n', $createdAt)] . ' ' . date('Y', $createdAt)
    : 'N/A';
?>
<!DOCTYPE html>
<html lang="sq">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Llogaria - SkyCast</title>
    <link rel="stylesheet" href="<?= e(appUrl('assets/css/style.css')) ?>">
    <script src="<?= e(appUrl('assets/js/validation.js')) ?>" defer></script>
</head>
<body class="dashboard-body">
    <header class="site-header">
        <div class="container nav">
            <h1 class="logo"><a href="<?= e(appUrl()) ?>">SkyCast</a></h1>
            <nav>
                <a href="<?= e(appUrl()) ?>">Kryefaqja</a>
                <a href="<?= e(appUrl('pages/dashboard.php')) ?>">Paneli</a>
                <a href="<?= e(appUrl('pages/account.php')) ?>">Llogaria</a>
                <a href="<?= e(appUrl('logout.php')) ?>">Dil</a>
            </nav>
        </div>
    </header>

    <main class="container account-page">
        <section class="account-hero">
            <div>
                <span class="eyebrow">Llogaria</span>
                <h2>Profili yt në SkyCast</h2>
                <p>Shiko të dhënat e llogarisë, përditëso identitetin, ndrysho fjalëkalimin ose fshi llogarinë kur nuk të duhet më.</p>
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
                    <span class="section-kicker">Të dhënat</span>
                    <h3><?= e($user['name']) ?></h3>
                </div>
            </div>

            <div class="account-metrics">
                <div class="account-metric">
                    <span>ID</span>
                    <strong>#<?= (int) $user['id'] ?></strong>
                </div>
                <div class="account-metric">
                    <span>E-mail</span>
                    <strong><?= e($user['email']) ?></strong>
                </div>
                <div class="account-metric">
                    <span>Krijuar më</span>
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
                        <h3>Ndrysho të dhënat</h3>
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
                        <label for="accountEmail">E-mail</label>
                        <input type="email" id="accountEmail" name="email" value="<?= e($profileEmail) ?>" required>
                    </div>

                    <button type="submit" class="primary-btn">Ruaj ndryshimet</button>
                </form>
            </section>

            <section class="card settings-card">
                <div class="card-heading">
                    <div>
                        <span class="section-kicker">Siguria</span>
                        <h3>Ndrysho fjalëkalimin</h3>
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
                        <label for="currentPassword">Fjalëkalimi aktual</label>
                        <input type="password" id="currentPassword" name="current_password" required>
                    </div>

                    <div class="field-group">
                        <label for="newPassword">Fjalëkalimi i ri</label>
                        <input type="password" id="newPassword" name="new_password" required>
                    </div>

                    <div class="field-group">
                        <label for="confirmNewPassword">Përsërit fjalëkalimin e ri</label>
                        <input type="password" id="confirmNewPassword" name="confirm_new_password" required>
                    </div>

                    <button type="submit" class="secondary-btn">Ndrysho fjalëkalimin</button>
                </form>
            </section>

            <section class="card settings-card danger-zone">
                <div class="card-heading">
                    <div>
                        <span class="section-kicker">Zona e rrezikut</span>
                        <h3>Fshi llogarinë</h3>
                    </div>
                </div>

                <p>Fshirja e llogarisë heq përfundimisht profilin dhe qytetet e ruajtura.</p>

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
                        <label for="deletePassword">Fjalëkalimi</label>
                        <input type="password" id="deletePassword" name="delete_password" required>
                    </div>

                    <div class="field-group">
                        <label for="deleteConfirm">Shkruaj FSHI</label>
                        <input type="text" id="deleteConfirm" name="delete_confirm" required>
                    </div>

                    <button type="submit" class="danger-btn">Fshi llogarinë</button>
                </form>
            </section>
        </div>
    </main>

    <?php require __DIR__ . '/../includes/footer.php'; ?>

    <script src="<?= e(appUrl('assets/js/main.js')) ?>"></script>
</body>
</html>
