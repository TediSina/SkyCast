<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/functions.php';
?>
<!DOCTYPE html>
<html lang="sq">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SkyCast - Aplikacion për Motin</title>
    <link rel="stylesheet" href="<?= e(appUrl('assets/css/style.css')) ?>">
</head>
<body class="home-page">
    <header class="site-header transparent-header">
        <div class="container nav">
            <h1 class="logo"><a href="<?= e(appUrl()) ?>">SkyCast</a></h1>
            <nav>
                <a href="<?= e(appUrl()) ?>">Kryefaqja</a>
                <?php if (isLoggedIn()): ?>
                    <a href="<?= e(appUrl('pages/dashboard.php')) ?>">Paneli</a>
                    <a href="<?= e(appUrl('pages/account.php')) ?>">Llogaria</a>
                    <a href="<?= e(appUrl('logout.php')) ?>">Dil</a>
                <?php else: ?>
                    <a href="<?= e(appUrl('pages/login.php')) ?>">Hyr</a>
                    <a href="<?= e(appUrl('pages/register.php')) ?>" class="button-link">Regjistrohu</a>
                <?php endif; ?>
            </nav>
        </div>
    </header>

    <main>
        <section class="landing-hero">
            <div class="container landing-grid">
                <div class="hero-copy">
                    <span class="hero-badge">Aplikacion web për motin dhe radar reshjesh</span>
                    <h2>SkyCast</h2>
                    <p>
                        Moti aktual, parashikim orë pas ore, radar reshjesh dhe qytete të ruajtura në një panel
                        të shpejtë, të qartë dhe të ndërtuar për përdorim të përditshëm.
                    </p>

                    <div class="button-row">
                        <?php if (isLoggedIn()): ?>
                            <a class="primary-btn" href="<?= e(appUrl('pages/dashboard.php')) ?>">Hap panelin</a>
                        <?php else: ?>
                            <a class="primary-btn" href="<?= e(appUrl('pages/register.php')) ?>">Fillo tani</a>
                            <a class="secondary-btn" href="<?= e(appUrl('pages/login.php')) ?>">Hyr në sistem</a>
                        <?php endif; ?>
                    </div>

                    <div class="hero-stats">
                        <div class="stat-card">
                            <strong>12 orë</strong>
                            <span>Parashikim i shpejtë për pjesën tjetër të ditës.</span>
                        </div>
                        <div class="stat-card">
                            <strong>5 ditë</strong>
                            <span>Temperatura maksimale, minimale dhe gjendja e motit.</span>
                        </div>
                        <div class="stat-card">
                            <strong>Radar</strong>
                            <span>Shiko lëvizjen e reshjeve në hartë interaktive.</span>
                        </div>
                        <div class="stat-card">
                            <strong>Qytete</strong>
                            <span>Ruaji vendet që ndjek më shpesh në panel.</span>
                        </div>
                    </div>
                </div>

                <div class="hero-panel" aria-label="Pamje e motit në SkyCast">
                    <div class="sky-visual">
                        <div class="radar-sweep" aria-hidden="true"></div>
                        <div class="radar-blip radar-blip-one" aria-hidden="true"></div>
                        <div class="radar-blip radar-blip-two" aria-hidden="true"></div>
                        <div class="sun-disc"></div>
                        <div class="cloud"></div>
                        <div class="rain-lines">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>

                    <div class="preview-card">
                        <div class="preview-top">
                            <span class="preview-city">Tiranë</span>
                            <span class="preview-icon">⛅</span>
                        </div>
                        <div class="preview-temp">22°C</div>
                        <p class="preview-text">Pjesërisht me re · Erë 12 km/h</p>

                        <div class="mini-forecast">
                            <div><span>09:00</span><strong>20°</strong></div>
                            <div><span>12:00</span><strong>23°</strong></div>
                            <div><span>15:00</span><strong>24°</strong></div>
                            <div><span>18:00</span><strong>21°</strong></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="features-section">
            <div class="container">
                <div class="section-heading">
                    <span class="section-kicker">Mjetet e parashikimit</span>
                    <h3>Një pamje e plotë për motin që të duhet.</h3>
                    <p>SkyCast bashkon kërkimin, parashikimin orar, radarin e reshjeve dhe qytetet e ruajtura në një panel të lehtë për t'u përdorur.</p>
                </div>

                <div class="features-grid">
                    <article class="feature-card">
                        <div class="feature-icon">⏱️</div>
                        <h4>Orë pas ore</h4>
                        <p>Shiko ndryshimin e temperaturës, erës dhe mundësinë e shiut gjatë ditës.</p>
                    </article>

                    <article class="feature-card">
                        <div class="feature-icon">🌦️</div>
                        <h4>Parashikim ditor</h4>
                        <p>Krahaso shpejt ditët e ardhshme me karta të lexueshme dhe të qarta.</p>
                    </article>

                    <article class="feature-card">
                        <div class="feature-icon">◉</div>
                        <h4>Radar reshjesh</h4>
                        <p>Ndiq në hartë intensitetin e reshjeve dhe lëvizjen e tyre në kohë.</p>
                    </article>

                    <article class="feature-card">
                        <div class="feature-icon">📍</div>
                        <h4>Qytete të ruajtura</h4>
                        <p>Kthehu menjëherë te qytetet që ndjek më shpesh pa i kërkuar nga fillimi.</p>
                    </article>
                </div>
            </div>
        </section>

        <section class="weather-wire-section">
            <div
                class="container weather-wire-shell"
                data-weather-news
                data-news-mode="global"
                data-news-limit="6"
            >
                <div class="weather-wire-top">
                    <div class="section-heading weather-wire-heading">
                        <span class="section-kicker">Lajme meteo</span>
                        <h3>Sinjale nga lajmet që lëvizin bashkë me motin.</h3>
                        <p>Tituj të fundit që lidhen me motin, të filtruar vetëm në anglisht ose shqip.</p>
                    </div>
                </div>

                <div class="weather-news-status loading-text" data-news-status>Duke kërkuar lajme meteo</div>
                <div class="weather-news-grid" data-news-list></div>

                <div class="weather-news-footer">
                    <span data-news-context>Mbulim global</span>
                    <a href="https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/" target="_blank" rel="noreferrer">GDELT DOC API</a>
                </div>
            </div>
        </section>

        <section class="cta-section">
            <div class="container cta-box">
                <div>
                    <h3>Gati për parashikimin tënd?</h3>
                    <p>Krijo llogari dhe mbaje motin e qyteteve të preferuara gjithmonë afër.</p>
                </div>

                <div class="button-row">
                    <?php if (isLoggedIn()): ?>
                        <a class="primary-btn" href="<?= e(appUrl('pages/dashboard.php')) ?>">Shko te paneli</a>
                    <?php else: ?>
                        <a class="primary-btn" href="<?= e(appUrl('pages/register.php')) ?>">Regjistrohu</a>
                        <a class="secondary-btn" href="<?= e(appUrl('pages/login.php')) ?>">Hyr</a>
                    <?php endif; ?>
                </div>
            </div>
        </section>
    </main>
    <script src="<?= e(appUrl('assets/js/weather-news.js')) ?>"></script>
    <script src="<?= e(appUrl('assets/js/main.js')) ?>"></script>
</body>
</html>
