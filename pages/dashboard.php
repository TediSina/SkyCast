<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/auth.php';

requireLogin();

$user = currentUser();

if (!$user) {
    logoutUser();
    redirect(appUrl('pages/login.php'));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'save_city') {
        $cityName = trim($_POST['city_name'] ?? '');
        $latitude = $_POST['latitude'] ?? '';
        $longitude = $_POST['longitude'] ?? '';

        if ($cityName !== '' && is_numeric($latitude) && is_numeric($longitude)) {
            saveCity(
                (int) $user['id'],
                $cityName,
                (float) $latitude,
                (float) $longitude
            );
            setFlash('success', 'Qyteti u ruajt me sukses.');
        } else {
            setFlash('error', 'Te dhenat e qytetit nuk jane te vlefshme.');
        }

        redirect(appUrl('pages/dashboard.php'));
    }

    if ($action === 'delete_city') {
        $cityId = (int) ($_POST['city_id'] ?? 0);

        if ($cityId > 0) {
            deleteCity((int) $user['id'], $cityId);
            setFlash('success', 'Qyteti u fshi me sukses.');
        }

        redirect(appUrl('pages/dashboard.php'));
    }
}

$savedCities = getSavedCities((int) $user['id']);
$successMessage = getFlash('success');
$errorMessage = getFlash('error');
?>
<!DOCTYPE html>
<html lang="sq">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - SkyCast</title>
    <link rel="stylesheet" href="<?= e(appUrl('assets/css/style.css')) ?>">
</head>
<body class="dashboard-body">
    <header class="site-header">
        <div class="container nav">
            <h1 class="logo"><a href="<?= e(appUrl()) ?>">SkyCast</a></h1>
            <nav>
                <a href="<?= e(appUrl()) ?>">Home</a>
                <a href="<?= e(appUrl('pages/dashboard.php')) ?>">Dashboard</a>
                <a href="<?= e(appUrl('logout.php')) ?>">Logout</a>
            </nav>
        </div>
    </header>

    <main class="container dashboard-page">
        <section class="dashboard-intro">
            <div>
                <span class="eyebrow">Dashboard</span>
                <h2>Mire se erdhe, <?= e($user['name']) ?>.</h2>
                <p>Kerko nje qytet, shiko motin aktual, ndiq oret e ardhshme dhe ruaj vendet qe te interesojne.</p>
            </div>

            <div class="dashboard-weather-mark">
                <span>☀️</span>
                <strong>Live forecast</strong>
            </div>
        </section>

        <div class="dashboard-grid">
            <section class="card weather-search-card">
                <div class="card-heading">
                    <div>
                        <span class="section-kicker">Kerkim</span>
                        <h3>Kontrollo motin</h3>
                    </div>
                </div>

                <?php if ($successMessage): ?>
                    <div class="alert success"><?= e($successMessage) ?></div>
                <?php endif; ?>

                <?php if ($errorMessage): ?>
                    <div class="alert error"><?= e($errorMessage) ?></div>
                <?php endif; ?>

                <form id="citySearchForm" class="form form-inline">
                    <label for="cityInput">Qyteti</label>
                    <input type="text" id="cityInput" placeholder="Shembull: Tirana" required>
                    <button type="submit" class="primary-btn">Kerko</button>
                </form>

                <div id="weatherStatus" class="status-text"></div>
                <div id="weatherResult"></div>

                <form id="saveCityForm" method="POST" class="save-city-form hidden">
                    <input type="hidden" name="action" value="save_city">
                    <input type="hidden" name="city_name" id="savedCityName">
                    <input type="hidden" name="latitude" id="savedLatitude">
                    <input type="hidden" name="longitude" id="savedLongitude">
                    <button type="submit" class="secondary-btn">Ruaje kete qytet</button>
                </form>
            </section>

            <aside class="card saved-cities-card">
                <div class="saved-card-top">
                    <div>
                        <span class="section-kicker">Lista jote</span>
                        <h3>Qytetet e ruajtura</h3>
                    </div>
                    <span class="saved-count"><?= count($savedCities) ?></span>
                </div>

                <?php if (empty($savedCities)): ?>
                    <div class="empty-state">
                        <strong>Asnje qytet ende</strong>
                        <span>Kerko nje qytet dhe ruaje per ta hapur me shpejt heren tjeter.</span>
                    </div>
                <?php else: ?>
                    <ul class="saved-city-list">
                        <?php foreach ($savedCities as $city): ?>
                            <li class="saved-city-item">
                                <button
                                    type="button"
                                    class="saved-city-button"
                                    data-city="<?= e($city['city_name']) ?>"
                                    data-lat="<?= e((string) $city['latitude']) ?>"
                                    data-lon="<?= e((string) $city['longitude']) ?>"
                                >
                                    <?= e($city['city_name']) ?>
                                </button>

                                <form method="POST" class="inline-form">
                                    <input type="hidden" name="action" value="delete_city">
                                    <input type="hidden" name="city_id" value="<?= (int) $city['id'] ?>">
                                    <button type="submit" class="danger-btn">Fshije</button>
                                </form>
                            </li>
                        <?php endforeach; ?>
                    </ul>
                <?php endif; ?>
            </aside>
        </div>
    </main>

    <script src="<?= e(appUrl('api/weather.js')) ?>"></script>
    <script src="<?= e(appUrl('assets/js/main.js')) ?>"></script>
</body>
</html>
