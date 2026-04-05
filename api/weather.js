document.addEventListener('DOMContentLoaded', () => {
    const citySearchForm = document.getElementById('citySearchForm');
    const cityInput = document.getElementById('cityInput');
    const weatherStatus = document.getElementById('weatherStatus');
    const weatherResult = document.getElementById('weatherResult');
    const saveCityForm = document.getElementById('saveCityForm');
    const savedCityName = document.getElementById('savedCityName');
    const savedLatitude = document.getElementById('savedLatitude');
    const savedLongitude = document.getElementById('savedLongitude');

    function escapeHtml(value) {
        return String(value)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function getWeatherMeta(code) {
        const map = {
            0:  { text: 'Qiell i kthjellët', icon: '☀️' },
            1:  { text: 'Kryesisht i kthjellët', icon: '🌤️' },
            2:  { text: 'Pjesërisht me re', icon: '⛅' },
            3:  { text: 'Me re', icon: '☁️' },
            45: { text: 'Mjegull', icon: '🌫️' },
            48: { text: 'Mjegull me ngricë', icon: '🌫️' },
            51: { text: 'Shi i lehtë', icon: '🌦️' },
            53: { text: 'Shi mesatar', icon: '🌦️' },
            55: { text: 'Shi i dendur', icon: '🌧️' },
            56: { text: 'Shi i ngrirë i lehtë', icon: '🌧️' },
            57: { text: 'Shi i ngrirë i fortë', icon: '🌧️' },
            61: { text: 'Shi i lehtë', icon: '🌦️' },
            63: { text: 'Shi mesatar', icon: '🌧️' },
            65: { text: 'Shi i fortë', icon: '🌧️' },
            66: { text: 'Shi i ngrirë i lehtë', icon: '🌧️' },
            67: { text: 'Shi i ngrirë i fortë', icon: '🌧️' },
            71: { text: 'Borë e lehtë', icon: '🌨️' },
            73: { text: 'Borë mesatare', icon: '🌨️' },
            75: { text: 'Borë e dendur', icon: '❄️' },
            77: { text: 'Kokrra bore', icon: '❄️' },
            80: { text: 'Rrebeshe të lehta', icon: '🌦️' },
            81: { text: 'Rrebeshe mesatare', icon: '🌧️' },
            82: { text: 'Rrebeshe të forta', icon: '⛈️' },
            85: { text: 'Rrebeshe bore të lehta', icon: '🌨️' },
            86: { text: 'Rrebeshe bore të forta', icon: '❄️' },
            95: { text: 'Stuhi', icon: '⛈️' },
            96: { text: 'Stuhi me breshër të lehtë', icon: '⛈️' },
            99: { text: 'Stuhi me breshër të fortë', icon: '⛈️' }
        };

        return map[code] || { text: `Kodi i motit: ${code}`, icon: '🌍' };
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('sq-AL', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit'
        });
    }

    function showStatus(message, isError = false) {
        weatherStatus.textContent = message;
        weatherStatus.className = isError ? 'status-text error-text' : 'status-text';
    }

    function prepareSaveCity(cityName, latitude, longitude) {
        savedCityName.value = cityName;
        savedLatitude.value = latitude;
        savedLongitude.value = longitude;
        saveCityForm.classList.remove('hidden');
    }

    function renderWeather(cityName, countryName, data, latitude, longitude) {
        const current = data.current;
        const daily = data.daily;
        const currentMeta = getWeatherMeta(current.weather_code);

        const forecastHtml = daily.time.slice(0, 5).map((date, index) => {
            const meta = getWeatherMeta(daily.weather_code[index]);
            return `
                <div class="forecast-day">
                    <div class="forecast-icon">${meta.icon}</div>
                    <h4>${escapeHtml(formatDate(date))}</h4>
                    <p class="forecast-text">${escapeHtml(meta.text)}</p>
                    <p><strong>Max:</strong> ${daily.temperature_2m_max[index]}°C</p>
                    <p><strong>Min:</strong> ${daily.temperature_2m_min[index]}°C</p>
                </div>
            `;
        }).join('');

        weatherResult.innerHTML = `
            <div class="weather-card">
                <div class="weather-top">
                    <div>
                        <h3>${escapeHtml(cityName)}${countryName ? ', ' + escapeHtml(countryName) : ''}</h3>
                        <p class="weather-description">${escapeHtml(currentMeta.text)}</p>
                    </div>
                    <div class="weather-icon">${currentMeta.icon}</div>
                </div>

                <div class="weather-main">
                    <div class="weather-stat">
                        <span class="stat-label">Temperatura</span>
                        <span class="stat-value">${current.temperature_2m}°C</span>
                    </div>

                    <div class="weather-stat">
                        <span class="stat-label">Era</span>
                        <span class="stat-value">${current.wind_speed_10m} km/h</span>
                    </div>
                </div>

                <h4 class="forecast-title">Parashikimi 5-ditor</h4>
                <div class="forecast-grid">
                    ${forecastHtml}
                </div>
            </div>
        `;

        prepareSaveCity(cityName, latitude, longitude);
    }

    async function fetchCoordinates(cityName) {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Nuk u arrit kërkesa për qytetin.');
        }

        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            throw new Error('Qyteti nuk u gjet.');
        }

        return data.results[0];
    }

    async function fetchWeather(latitude, longitude) {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=auto`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Nuk u arrit kërkesa për motin.');
        }

        return response.json();
    }

    function isValidCityName(cityName) {
        const cityRegex = /^[A-Za-zÀ-ž\u00C0-\u024F\s'’-]{2,}$/;
        return cityRegex.test(cityName.trim());
    }

    async function loadWeatherByCityName(cityName) {
        showStatus('Duke kërkuar të dhënat e motit...');
        weatherResult.innerHTML = '';
        saveCityForm.classList.add('hidden');

        try {
            const cityData = await fetchCoordinates(cityName);
            const weatherData = await fetchWeather(cityData.latitude, cityData.longitude);

            renderWeather(
                cityData.name,
                cityData.country,
                weatherData,
                cityData.latitude,
                cityData.longitude
            );

            showStatus('Të dhënat u ngarkuan me sukses.');
        } catch (error) {
            showStatus(error.message, true);
        }
    }

    async function loadWeatherByCoordinates(cityName, latitude, longitude) {
        showStatus('Duke ngarkuar qytetin e ruajtur...');
        weatherResult.innerHTML = '';
        saveCityForm.classList.add('hidden');

        try {
            const weatherData = await fetchWeather(latitude, longitude);
            renderWeather(cityName, '', weatherData, latitude, longitude);
            showStatus('Të dhënat u ngarkuan me sukses.');
        } catch (error) {
            showStatus(error.message, true);
        }
    }

    if (citySearchForm) {
        citySearchForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const cityName = cityInput.value.trim();

            if (!isValidCityName(cityName)) {
                showStatus('Shkruaj një emër qyteti të vlefshëm.', true);
                return;
            }

            await loadWeatherByCityName(cityName);
        });
    }

    document.querySelectorAll('.saved-city-button').forEach((button) => {
        button.addEventListener('click', async () => {
            const cityName = button.dataset.city;
            const latitude = button.dataset.lat;
            const longitude = button.dataset.lon;

            await loadWeatherByCoordinates(cityName, latitude, longitude);
        });
    });
});
