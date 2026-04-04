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

    function weatherCodeToText(code) {
        const map = {
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

        return map[code] || `Kodi i motit: ${code}`;
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

        const forecastHtml = daily.time.slice(0, 5).map((date, index) => {
            return `
                <div class="forecast-day">
                    <h4>${escapeHtml(formatDate(date))}</h4>
                    <p>${escapeHtml(weatherCodeToText(daily.weather_code[index]))}</p>
                    <p><strong>Max:</strong> ${daily.temperature_2m_max[index]}°C</p>
                    <p><strong>Min:</strong> ${daily.temperature_2m_min[index]}°C</p>
                </div>
            `;
        }).join('');

        weatherResult.innerHTML = `
            <div class="weather-card">
                <h3>${escapeHtml(cityName)}${countryName ? ', ' + escapeHtml(countryName) : ''}</h3>
                <div class="weather-main">
                    <p><strong>Temperatura:</strong> ${current.temperature_2m}°C</p>
                    <p><strong>Era:</strong> ${current.wind_speed_10m} km/h</p>
                    <p><strong>Gjendja:</strong> ${escapeHtml(weatherCodeToText(current.weather_code))}</p>
                </div>

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
            throw new Error('Nuk u arrit kerkesa per qytetin.');
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
            throw new Error('Nuk u arrit kerkesa per motin.');
        }

        return response.json();
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
            if (!cityName) {
                showStatus('Shkruaj emrin e një qyteti.', true);
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
