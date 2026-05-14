document.addEventListener('DOMContentLoaded', () => {
    const mapElement = document.getElementById('radarMap');
    const statusElement = document.getElementById('radarStatus');
    const timestampElement = document.getElementById('radarTimestamp');
    const frameSlider = document.getElementById('radarFrameSlider');
    const opacitySlider = document.getElementById('radarOpacity');
    const playButton = document.getElementById('radarPlayButton');
    const latestButton = document.getElementById('radarLatestButton');
    const focusButton = document.getElementById('radarFocusButton');

    if (!mapElement || !statusElement) {
        return;
    }

    if (typeof L === 'undefined') {
        statusElement.textContent = 'Harta nuk u ngarkua. Kontrollo lidhjen me Leaflet CDN.';
        statusElement.classList.add('error-text');
        return;
    }

    const rainViewerUrl = 'https://api.rainviewer.com/public/weather-maps.json';
    const tiranaCoordinates = [41.3275, 19.8187];
    const map = L.map(mapElement, {
        maxZoom: 7,
        minZoom: 2,
        scrollWheelZoom: true
    }).setView(tiranaCoordinates, 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    let rainViewerHost = '';
    let radarFrames = [];
    let activeFrameIndex = 0;
    let radarLayer = null;
    let cityMarker = null;
    let lastFocusedCity = null;
    let animationTimer = null;
    let tileErrorShown = false;

    function escapeHtml(value) {
        return String(value)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function setStatus(message, isError = false) {
        statusElement.textContent = message;
        statusElement.classList.toggle('error-text', isError);
    }

    function getOverlayOpacity() {
        return Number(opacitySlider?.value || 76) / 100;
    }

    function getFrameLabel(frame) {
        if (!frame?.time) {
            return '--';
        }

        return new Date(frame.time * 1000).toLocaleString('sq-AL', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function getRadarStatus(frame) {
        const frameLabel = frame ? getFrameLabel(frame) : 'korniza e fundit';

        return `Po shfaqen reshjet për ${frameLabel}. Nëse nuk sheh ngjyra në hartë, nuk ka reshje të dukshme në këtë zonë ose në këtë kohë.`;
    }

    function getWeatherLabel(code) {
        const labels = {
            0: 'Qiell i kthjellët',
            1: 'Kryesisht i kthjellët',
            2: 'Pjesërisht me re',
            3: 'Me re',
            45: 'Mjegull',
            48: 'Mjegull me ngricë',
            51: 'Shi i lehtë',
            53: 'Shi mesatar',
            55: 'Shi i dendur',
            61: 'Shi i lehtë',
            63: 'Shi mesatar',
            65: 'Shi i fortë',
            71: 'Borë e lehtë',
            73: 'Borë mesatare',
            75: 'Borë e dendur',
            80: 'Rrebeshe të lehta',
            81: 'Rrebeshe mesatare',
            82: 'Rrebeshe të forta',
            95: 'Stuhi'
        };

        return labels[code] || 'Kushte të përziera';
    }

    function removeLayer(layer) {
        if (layer) {
            map.removeLayer(layer);
        }
    }

    function makeRadarLayer(frame) {
        const url = `${rainViewerHost}${frame.path}/256/{z}/{x}/{y}/2/1_1.png`;
        const layer = L.tileLayer(url, {
            tileSize: 256,
            maxNativeZoom: 7,
            opacity: getOverlayOpacity(),
            zIndex: 420,
            attribution: 'Radar &copy; RainViewer'
        });

        layer.once('tileerror', () => {
            if (!tileErrorShown) {
                tileErrorShown = true;
                setStatus('Disa tiles të radarit nuk u ngarkuan. Provo përsëri pas pak.', true);
            }
        });

        return layer;
    }

    function setRadarControlsEnabled(isEnabled) {
        if (playButton) {
            playButton.disabled = !isEnabled;
        }

        if (latestButton) {
            latestButton.disabled = !isEnabled;
        }

        if (opacitySlider) {
            opacitySlider.disabled = !isEnabled;
        }

        if (frameSlider) {
            frameSlider.disabled = !isEnabled;
        }
    }

    function updateRadarLayer() {
        removeLayer(radarLayer);
        radarLayer = null;

        const frame = radarFrames[activeFrameIndex];

        if (frame) {
            radarLayer = makeRadarLayer(frame).addTo(map);
        }

        if (timestampElement) {
            timestampElement.textContent = frame ? getFrameLabel(frame) : '--';
        }

        if (frameSlider && radarFrames.length > 0) {
            frameSlider.value = String(activeFrameIndex);
        }

        if (radarFrames.length > 0) {
            setStatus(getRadarStatus(frame));
        }
    }

    function setFrame(index) {
        if (radarFrames.length === 0) {
            return;
        }

        activeFrameIndex = Math.max(0, Math.min(index, radarFrames.length - 1));
        updateRadarLayer();
    }

    function stopAnimation() {
        window.clearInterval(animationTimer);
        animationTimer = null;

        if (playButton) {
            playButton.textContent = 'Luaj';
            playButton.classList.remove('is-active');
        }
    }

    function startAnimation() {
        if (radarFrames.length < 2) {
            return;
        }

        stopAnimation();

        if (playButton) {
            playButton.textContent = 'Ndalo';
            playButton.classList.add('is-active');
        }

        animationTimer = window.setInterval(() => {
            const nextIndex = activeFrameIndex >= radarFrames.length - 1
                ? 0
                : activeFrameIndex + 1;
            setFrame(nextIndex);
        }, 850);
    }

    function focusMapOnCity(city) {
        const latitude = Number(city.latitude);
        const longitude = Number(city.longitude);

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            return;
        }

        lastFocusedCity = {
            name: city.name || city.cityName || 'Qyteti',
            country: city.country || city.countryName || '',
            latitude,
            longitude
        };

        if (cityMarker) {
            map.removeLayer(cityMarker);
        }

        const title = [
            lastFocusedCity.name,
            lastFocusedCity.country
        ].filter(Boolean).join(', ');

        cityMarker = L.marker([latitude, longitude])
            .addTo(map)
            .bindPopup(`<strong>${escapeHtml(title)}</strong>`)
            .openPopup();

        map.setView([latitude, longitude], 7, { animate: true });

        if (focusButton) {
            focusButton.disabled = false;
        }
    }

    async function loadPointWeather(latlng, popup) {
        const latitude = Number(latlng.lat).toFixed(4);
        const longitude = Number(latlng.lng).toFixed(4);
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,precipitation,weather_code&timezone=auto`;

        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Kërkesa nuk u krye.');
            }

            const data = await response.json();
            const current = data.current || {};
            const content = `
                <div class="radar-popup">
                    <strong>${escapeHtml(latitude)}, ${escapeHtml(longitude)}</strong>
                    <span>${escapeHtml(getWeatherLabel(current.weather_code))}</span>
                    <span>Temperatura: ${current.temperature_2m ?? '-'}°C</span>
                    <span>Era: ${current.wind_speed_10m ?? '-'} km/h</span>
                    <span>Reshjet: ${current.precipitation ?? '-'} mm</span>
                </div>
            `;

            popup.setContent(content);
        } catch (error) {
            popup.setContent('Të dhënat për këtë pikë nuk u ngarkuan.');
        }
    }

    async function loadRadarFrames() {
        setStatus('Duke ngarkuar hartën e radarit...');
        setRadarControlsEnabled(false);

        try {
            const response = await fetch(rainViewerUrl);

            if (!response.ok) {
                throw new Error('RainViewer nuk u përgjigj.');
            }

            const data = await response.json();
            radarFrames = data.radar?.past || [];
            rainViewerHost = data.host || '';

            if (!rainViewerHost || radarFrames.length === 0) {
                throw new Error('Nuk ka frames radar të disponueshme tani.');
            }

            activeFrameIndex = radarFrames.length - 1;

            if (frameSlider) {
                frameSlider.max = String(radarFrames.length - 1);
                frameSlider.value = String(activeFrameIndex);
            }

            updateRadarLayer();
            setRadarControlsEnabled(true);
        } catch (error) {
            setStatus(error.message || 'Harta e radarit nuk u ngarkua.', true);
            setRadarControlsEnabled(false);
        } finally {
            window.setTimeout(() => map.invalidateSize(), 120);
        }
    }

    frameSlider?.addEventListener('input', () => {
        stopAnimation();
        setFrame(Number(frameSlider.value));
    });

    opacitySlider?.addEventListener('input', () => {
        updateRadarLayer();
    });

    playButton?.addEventListener('click', () => {
        if (animationTimer) {
            stopAnimation();
            return;
        }

        startAnimation();
    });

    latestButton?.addEventListener('click', () => {
        stopAnimation();
        setFrame(radarFrames.length - 1);
    });

    focusButton?.addEventListener('click', () => {
        if (lastFocusedCity) {
            focusMapOnCity(lastFocusedCity);
        }
    });

    map.on('click', (event) => {
        const popup = L.popup()
            .setLatLng(event.latlng)
            .setContent('Duke ngarkuar kushtet për këtë pikë...')
            .openOn(map);

        loadPointWeather(event.latlng, popup);
    });

    document.addEventListener('skycast:city-selected', (event) => {
        focusMapOnCity(event.detail || {});
    });

    const firstSavedCityButton = document.querySelector('.saved-city-button[data-lat][data-lon]');

    if (firstSavedCityButton) {
        lastFocusedCity = {
            name: firstSavedCityButton.dataset.city,
            latitude: firstSavedCityButton.dataset.lat,
            longitude: firstSavedCityButton.dataset.lon
        };

        if (focusButton) {
            focusButton.disabled = false;
        }
    }

    loadRadarFrames();
});
