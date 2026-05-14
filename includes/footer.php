<?php
declare(strict_types=1);
?>
<footer class="site-footer">
    <div class="container footer-grid">
        <div class="footer-brand">
            <a class="footer-logo" href="<?= e(appUrl()) ?>">SkyCast</a>
            <p>Parashikim, radar i reshjeve dhe lajme kryesore në një hapësirë të qartë për vendet që ndjek më shpesh.</p>
        </div>

        <nav class="footer-links" aria-label="Navigimi në fund të faqes">
            <span>Faqet</span>
            <a href="<?= e(appUrl()) ?>">Kryefaqja</a>
            <?php if (isLoggedIn()): ?>
                <a href="<?= e(appUrl('pages/dashboard.php')) ?>">Paneli</a>
                <a href="<?= e(appUrl('pages/account.php')) ?>">Llogaria</a>
            <?php else: ?>
                <a href="<?= e(appUrl('pages/login.php')) ?>">Hyr</a>
                <a href="<?= e(appUrl('pages/register.php')) ?>">Regjistrohu</a>
            <?php endif; ?>
        </nav>

        <div class="footer-sources">
            <span>Burimet</span>
            <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a>
            <a href="https://www.rainviewer.com/" target="_blank" rel="noreferrer">RainViewer</a>
            <a href="https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/" target="_blank" rel="noreferrer">GDELT</a>
        </div>

        <div class="footer-signal" aria-label="Përmbledhje e platformës">
            <span class="footer-signal-dot"></span>
            <strong>Parashikim i përditësuar</strong>
            <small>© <?= date('Y') ?> SkyCast</small>
        </div>
    </div>
</footer>
