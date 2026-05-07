<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/functions.php';
?>
<!DOCTYPE html>
<html lang="sq">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SkyCast - Weather App</title>
    <link rel="stylesheet" href="<?= e(appUrl('assets/css/style.css')) ?>">
</head>
<body class="home-page">
    <header class="site-header transparent-header">
        <div class="container nav">
            <h1 class="logo"><a href="<?= e(appUrl()) ?>">SkyCast</a></h1>
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
                    <h2>SkyCast</h2>
                    <p>
                        Mot aktual, parashikim ore pas ore dhe qytete te ruajtura ne nje eksperience te shpejte,
                        te qarte dhe te ndertuar per perdorim te perditshem.
                    </p>

                    <div class="button-row">
                        <?php if (isLoggedIn()): ?>
                            <a class="primary-btn" href="<?= e(appUrl('pages/dashboard.php')) ?>">Hap Dashboard</a>
                        <?php else: ?>
                            <a class="primary-btn" href="<?= e(appUrl('pages/register.php')) ?>">Fillo tani</a>
                            <a class="secondary-btn" href="<?= e(appUrl('pages/login.php')) ?>">Hyr ne sistem</a>
                        <?php endif; ?>
                    </div>

                    <div class="hero-stats">
                        <div class="stat-card">
                            <strong>12 ore</strong>
                            <span>Parashikim i shpejte per pjesen tjeter te dites.</span>
                        </div>
                        <div class="stat-card">
                            <strong>5 dite</strong>
                            <span>Temperatura maksimale, minimale dhe gjendja e motit.</span>
                        </div>
                        <div class="stat-card">
                            <strong>Qytete</strong>
                            <span>Ruaji vendet qe ndjek me shpesh ne dashboard.</span>
                        </div>
                    </div>
                </div>

                <div class="hero-panel" aria-label="Pamje e motit ne SkyCast">
                    <div class="sky-visual">
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
                            <span class="preview-city">Tirane</span>
                            <span class="preview-icon">⛅</span>
                        </div>
                        <div class="preview-temp">22°C</div>
                        <p class="preview-text">Pjeserisht me re · Ere 12 km/h</p>

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
                    <span class="section-kicker">Forecast tools</span>
                    <h3>Nje pamje e paster per motin qe te duhet.</h3>
                    <p>SkyCast bashkon kerkimin, parashikimin orar dhe qytetet e ruajtura ne nje panel te lehte per t'u perdorur.</p>
                </div>

                <div class="features-grid">
                    <article class="feature-card">
                        <div class="feature-icon">⏱️</div>
                        <h4>Ore pas ore</h4>
                        <p>Shiko ndryshimin e temperatures, eres dhe mundesine e shiut gjate dites.</p>
                    </article>

                    <article class="feature-card">
                        <div class="feature-icon">🌦️</div>
                        <h4>Parashikim ditor</h4>
                        <p>Krahaso shpejt ditet e ardhshme me karta te lexueshme dhe te qarta.</p>
                    </article>

                    <article class="feature-card">
                        <div class="feature-icon">📍</div>
                        <h4>Qytete te ruajtura</h4>
                        <p>Kthehu menjehere te qytetet qe ndjek me shpesh pa i kerkuar nga fillimi.</p>
                    </article>
                </div>
            </div>
        </section>

        <section class="cta-section">
            <div class="container cta-box">
                <div>
                    <h3>Gati per parashikimin tend?</h3>
                    <p>Krijo llogari dhe mbaje motin e qyteteve te preferuara gjithmone afer.</p>
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
    <script src="<?= e(appUrl('assets/js/main.js')) ?>"></script>
</body>
</html>
