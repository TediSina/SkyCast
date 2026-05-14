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
            setFlash('error', 'Të dhënat e qytetit nuk janë të vlefshme.');
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
    <title>Paneli - SkyCast</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
    <link rel="stylesheet" href="<?= e(appUrl('assets/css/style.css')) ?>">
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

    <main class="container dashboard-page">
        <section class="dashboard-intro">
            <div>
                <span class="eyebrow">Paneli</span>
                <h2>Mirë se erdhe, <?= e($user['name']) ?>.</h2>
                <p>Kërko një qytet, shiko motin aktual, ndiq orët e ardhshme dhe ruaj vendet që të interesojnë.</p>
            </div>

            <div class="dashboard-weather-mark">
                <span>☀️</span>
                <strong>Parashikim drejtpërdrejt</strong>
            </div>
        </section>

        <div class="dashboard-grid">
            <section class="card weather-search-card">
                <div class="card-heading">
                    <div>
                        <span class="section-kicker">Kërkim</span>
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
                    <div class="city-search-field">
                        <input
                            type="text"
                            id="cityInput"
                            placeholder="Shembull: Tirana"
                            autocomplete="off"
                            role="combobox"
                            aria-autocomplete="list"
                            aria-expanded="false"
                            aria-controls="citySuggestions"
                            required
                        >
                        <div id="citySuggestions" class="city-suggestions hidden" role="listbox"></div>
                    </div>
                    <button type="submit" class="primary-btn">Kërko</button>
                </form>

                <div id="weatherStatus" class="status-text" role="status" aria-live="polite"></div>

                <form id="saveCityForm" method="POST" class="save-city-form hidden" aria-label="Ruaj qytetin e zgjedhur" aria-live="polite">
                    <input type="hidden" name="action" value="save_city">
                    <input type="hidden" name="city_name" id="savedCityName">
                    <input type="hidden" name="latitude" id="savedLatitude">
                    <input type="hidden" name="longitude" id="savedLongitude">
                    <div class="save-city-copy">
                        <span>Qyteti i zgjedhur</span>
                        <strong id="saveCityLabel"></strong>
                    </div>
                    <button type="submit" class="secondary-btn">Ruaje këtë qytet</button>
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
                        <strong>Asnjë qytet ende</strong>
                        <span>Kërko një qytet dhe ruaje për ta hapur më shpejt herën tjetër.</span>
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

        <div id="weatherResult" class="weather-output-stage"></div>

        <section
            class="weather-news-panel"
            data-weather-news
            data-news-mode="city"
            data-news-limit="5"
        >
            <div class="weather-news-panel-top">
                <div>
                    <span class="section-kicker">Lajme</span>
                    <h3>Çfarë po ndodh rreth vendit që po ndjek</h3>
                    <p data-news-context>Mbulim global në shqip derisa të zgjedhësh një qytet.</p>
                </div>

                <div class="weather-news-actions">
                    <button type="button" class="secondary-btn weather-news-refresh" data-news-refresh>Rifresko</button>
                </div>
            </div>

            <div class="weather-news-status loading-text" data-news-status>Duke kërkuar lajme</div>
            <div class="weather-news-grid dashboard-news-grid" data-news-list></div>

            <p class="weather-news-source">
                Burimi: <a href="https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/" target="_blank" rel="noreferrer">GDELT DOC API</a>.
                Titujt hapen në faqet origjinale.
            </p>
        </section>

        <section class="card radar-card" aria-labelledby="radarTitle">
            <div class="radar-top">
                <div>
                    <span class="section-kicker">Radar</span>
                    <h3 id="radarTitle">Harta e reshjeve</h3>
                    <p>Radar reshjesh dhe kushte të shpejta për pikën që zgjedh në hartë.</p>
                </div>

                <div class="radar-actions" aria-label="Kontrollet e hartës së radarit">
                    <button type="button" class="secondary-btn" id="radarPlayButton">Luaj</button>
                    <button type="button" class="secondary-btn" id="radarLatestButton">Më i fundit</button>
                    <button type="button" class="secondary-btn" id="radarFocusButton" disabled>Te qyteti</button>
                </div>
            </div>

            <div class="radar-controls">
                <label for="radarFrameSlider">Koha</label>
                <input type="range" id="radarFrameSlider" min="0" max="0" value="0" disabled>

                <label for="radarOpacity">Dukshmëria</label>
                <input type="range" id="radarOpacity" min="25" max="100" value="76">
            </div>

            <div id="radarStatus" class="radar-status">Duke ngarkuar hartën e radarit...</div>

            <div class="radar-map-shell">
                <div id="radarMap" class="radar-map" aria-label="Hartë interaktive me radar reshjesh"></div>
                <div class="radar-time-badge" id="radarTimestamp">--</div>
                <div class="radar-legend" aria-label="Legjenda e intensitetit të reshjeve">
                    <span>I dobët</span>
                    <div class="radar-legend-bar"></div>
                    <span>I fortë</span>
                </div>
            </div>

            <p class="radar-source">
                Burimi i radarit: <a href="https://www.rainviewer.com/" target="_blank" rel="noreferrer">RainViewer API</a>.
                Harta përdor tiles nga OpenStreetMap.
            </p>
        </section>
    </main>

    <?php require __DIR__ . '/../includes/footer.php'; ?>

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="<?= e(appUrl('api/weather.js')) ?>"></script>
    <script src="<?= e(appUrl('assets/js/weather-news.js')) ?>"></script>
    <script src="<?= e(appUrl('assets/js/radar-map.js')) ?>"></script>
    <script src="<?= e(appUrl('assets/js/main.js')) ?>"></script>
</body>
</html>
