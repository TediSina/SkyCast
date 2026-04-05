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
    <header class="site-header transparent-header">
        <div class="container nav">
            <h1 class="logo">SkyCast</h1>
            <nav>
                <a href="<?= e(appUrl()) ?>">Home</a>
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

    <main>
        <section class="landing-hero">
            <div class="container landing-grid">
                <div class="hero-copy">
                    <span class="hero-badge">Weather Web App</span>
                    <h2>Kontrollo motin. Ruaj qytetet. Qëndro gjithmonë i përgatitur.</h2>
                    <p>
                        SkyCast është një aplikacion web modern ku mund të kërkosh motin për qytete të ndryshme,
                        të shohësh temperaturën, erën dhe parashikimin disa-ditor, si edhe të ruash qytetet e tua të preferuara.
                    </p>

                    <div class="button-row">
                        <?php if (isLoggedIn()): ?>
                            <a class="primary-btn" href="<?= e(appUrl('pages/dashboard.php')) ?>">Hap Dashboard</a>
                        <?php else: ?>
                            <a class="primary-btn" href="<?= e(appUrl('pages/register.php')) ?>">Fillo tani</a>
                            <a class="secondary-btn" href="<?= e(appUrl('pages/login.php')) ?>">Hyr në sistem</a>
                        <?php endif; ?>
                    </div>

                    <div class="hero-stats">
                        <div class="stat-card">
                            <strong>Register/Login</strong>
                            <span>Sistem i sigurt përdoruesi</span>
                        </div>
                        <div class="stat-card">
                            <strong>Open-Meteo</strong>
                            <span>Të dhëna të motit në kohë reale</span>
                        </div>
                        <div class="stat-card">
                            <strong>Saved Cities</strong>
                            <span>Qasje e shpejtë te qytetet e ruajtura</span>
                        </div>
                    </div>
                </div>

                <div class="hero-panel">
                    <div class="preview-card">
                        <div class="preview-top">
                            <span class="preview-city">Tiranë</span>
                            <span class="preview-icon">⛅</span>
                        </div>
                        <div class="preview-temp">22°C</div>
                        <p class="preview-text">Pjesërisht me re · Erë 12 km/h</p>

                        <div class="mini-forecast">
                            <div><span>Mon</span><strong>23°</strong></div>
                            <div><span>Tue</span><strong>21°</strong></div>
                            <div><span>Wed</span><strong>20°</strong></div>
                            <div><span>Thu</span><strong>24°</strong></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="features-section">
            <div class="container">
                <div class="section-heading">
                    <h3>Çfarë ofron SkyCast?</h3>
                    <p>Një zgjidhje e thjeshtë, funksionale dhe e organizuar për të parë motin online.</p>
                </div>

                <div class="features-grid">
                    <article class="feature-card">
                        <div class="feature-icon">🔐</div>
                        <h4>Autentikim i sigurt</h4>
                        <p>Regjistrim, login, logout dhe mbrojtje e dashboard-it vetëm për përdorues të loguar.</p>
                    </article>

                    <article class="feature-card">
                        <div class="feature-icon">🌍</div>
                        <h4>Kërkim qytetesh</h4>
                        <p>Kërko qytete të ndryshme dhe shfaq të dhënat kryesore të motit në një ndërfaqe të pastër.</p>
                    </article>

                    <article class="feature-card">
                        <div class="feature-icon">⭐</div>
                        <h4>Ruajtje qytetesh</h4>
                        <p>Ruaj qytetet që dëshiron dhe rihapi shpejt nga dashboard-i yt personal.</p>
                    </article>
                </div>
            </div>
        </section>

        <section class="cta-section">
            <div class="container cta-box">
                <div>
                    <h3>Gati për ta përdorur SkyCast?</h3>
                    <p>Krijo llogari dhe fillo të kontrollosh motin për qytetet që të interesojnë.</p>
                </div>

                <div class="button-row">
                    <?php if (isLoggedIn()): ?>
                        <a class="primary-btn" href="<?= e(appUrl('pages/dashboard.php')) ?>">Shko te Dashboard</a>
                    <?php else: ?>
                        <a class="primary-btn" href="<?= e(appUrl('pages/register.php')) ?>">Regjistrohu</a>
                        <a class="secondary-btn" href="<?= e(appUrl('pages/login.php')) ?>">Login</a>
                    <?php endif; ?>
                </div>
            </div>
        </section>
    </main>
</body>
</html>
