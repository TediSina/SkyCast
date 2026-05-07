document.addEventListener('DOMContentLoaded', () => {
    const citySearchForm = document.getElementById('citySearchForm');
    const cityInput = document.getElementById('cityInput');
    const weatherStatus = document.getElementById('weatherStatus');
    const weatherResult = document.getElementById('weatherResult');
    const saveCityForm = document.getElementById('saveCityForm');
    const savedCityName = document.getElementById('savedCityName');
    const savedLatitude = document.getElementById('savedLatitude');
    const savedLongitude = document.getElementById('savedLongitude');
    const weatherSearchCard = document.querySelector('.weather-search-card');
    const searchButton = citySearchForm?.querySelector('button[type="submit"]');

    function escapeHtml(value) {
        return String(value)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function getWeatherMeta(code) {
        if (code === undefined || code === null) {
            return { text: 'Pa të dhëna', icon: '🌍' };
        }

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

    function getWeatherTheme(code) {
        if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
            return 'theme-rain';
        }

        if ([71, 73, 75, 77, 85, 86].includes(code)) {
            return 'theme-snow';
        }

        if ([95, 96, 99].includes(code)) {
            return 'theme-storm';
        }

        if ([45, 48].includes(code)) {
            return 'theme-fog';
        }

        if ([2, 3].includes(code)) {
            return 'theme-cloud';
        }

        return 'theme-clear';
    }

    function formatMeasurement(value, suffix = '') {
        return value === undefined || value === null ? '-' : `${value}${suffix}`;
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('sq-AL', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit'
        });
    }

    function formatHour(dateTimeString, currentTimeString = '') {
        if (currentTimeString && dateTimeString.slice(0, 13) === currentTimeString.slice(0, 13)) {
            return 'Tani';
        }

        const timePart = dateTimeString.split('T')[1];
        return timePart ? timePart.slice(0, 5) : dateTimeString;
    }

    function getUpcomingHours(hourly, currentTimeString) {
        if (!hourly || !Array.isArray(hourly.time) || hourly.time.length === 0) {
            return [];
        }

        const currentHour = currentTimeString ? currentTimeString.slice(0, 13) : '';
        const firstUpcomingIndex = currentHour
            ? hourly.time.findIndex((time) => time.slice(0, 13) >= currentHour)
            : 0;
        const startIndex = firstUpcomingIndex >= 0 ? firstUpcomingIndex : 0;
        const temperatures = Array.isArray(hourly.temperature_2m) ? hourly.temperature_2m : [];
        const weatherCodes = Array.isArray(hourly.weather_code) ? hourly.weather_code : [];
        const windSpeeds = Array.isArray(hourly.wind_speed_10m) ? hourly.wind_speed_10m : [];
        const precipitationProbabilities = Array.isArray(hourly.precipitation_probability)
            ? hourly.precipitation_probability
            : [];

        return hourly.time.slice(startIndex, startIndex + 12).map((time, offset) => {
            const index = startIndex + offset;

            return {
                time,
                temperature: temperatures[index],
                weatherCode: weatherCodes[index],
                windSpeed: windSpeeds[index],
                precipitationProbability: precipitationProbabilities[index]
            };
        });
    }

    function renderWeatherSkeleton() {
        return `
            <div class="weather-skeleton" aria-hidden="true">
                <div class="skeleton-current"></div>
                <div class="skeleton-row">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <div class="skeleton-card"></div>
            </div>
        `;
    }

    function setActiveSavedCity(button = null) {
        document.querySelectorAll('.saved-city-button.is-active').forEach((savedButton) => {
            savedButton.classList.remove('is-active');
        });

        if (button) {
            button.classList.add('is-active');
        }
    }

    function setLoadingState(isLoading) {
        weatherSearchCard?.classList.toggle('is-loading', isLoading);
        searchButton?.classList.toggle('is-busy', isLoading);

        if (searchButton) {
            searchButton.disabled = isLoading;
        }

        document.querySelectorAll('.saved-city-button').forEach((button) => {
            button.disabled = isLoading;
        });
    }

    function showStatus(message, isError = false, isLoading = false) {
        weatherStatus.textContent = message;
        weatherStatus.className = [
            'status-text',
            isError ? 'error-text' : '',
            isLoading ? 'loading-text' : ''
        ].filter(Boolean).join(' ');
    }

    function prepareSaveCity(cityName, latitude, longitude) {
        savedCityName.value = cityName;
        savedLatitude.value = latitude;
        savedLongitude.value = longitude;
        saveCityForm.classList.remove('hidden');
    }

    function renderWeather(cityName, countryName, data, latitude, longitude) {
        const current = data.current;
        const hourly = data.hourly;
        const daily = data.daily;
        const currentMeta = getWeatherMeta(current.weather_code);
        const currentTheme = getWeatherTheme(current.weather_code);
        const currentTime = current.time ? formatHour(current.time) : '-';
        const hourlyItems = getUpcomingHours(hourly, current.time);

        const hourlyHtml = hourlyItems.length > 0 ? hourlyItems.map((hour, index) => {
            const meta = getWeatherMeta(hour.weatherCode);

            return `
                <div class="hourly-card" style="--delay: ${index * 45}ms">
                    <span class="hourly-time">${escapeHtml(formatHour(hour.time, current.time))}</span>
                    <span class="hourly-icon">${meta.icon}</span>
                    <strong>${formatMeasurement(hour.temperature, '°C')}</strong>
                    <span>${escapeHtml(meta.text)}</span>
                    <small>${formatMeasurement(hour.windSpeed, ' km/h')} · ${formatMeasurement(hour.precipitationProbability, '% shi')}</small>
                </div>
            `;
        }).join('') : '<p class="empty-forecast">Nuk ka të dhëna orare për këtë vendndodhje.</p>';

        const forecastHtml = daily.time.slice(0, 5).map((date, index) => {
            const meta = getWeatherMeta(daily.weather_code[index]);
            return `
                <div class="forecast-day" style="--delay: ${index * 70}ms">
                    <div class="forecast-icon">${meta.icon}</div>
                    <h4>${escapeHtml(formatDate(date))}</h4>
                    <p class="forecast-text">${escapeHtml(meta.text)}</p>
                    <p><strong>Max:</strong> ${daily.temperature_2m_max[index]}°C</p>
                    <p><strong>Min:</strong> ${daily.temperature_2m_min[index]}°C</p>
                </div>
            `;
        }).join('');

        weatherResult.innerHTML = `
            <div class="weather-card ${currentTheme}">
                <section class="weather-current">
                    <div class="weather-top">
                        <div>
                            <span class="section-kicker">Mot aktual</span>
                            <h3>${escapeHtml(cityName)}${countryName ? ', ' + escapeHtml(countryName) : ''}</h3>
                            <p class="weather-description">${escapeHtml(currentMeta.text)}</p>
                            <div class="weather-temp">${formatMeasurement(current.temperature_2m, '°C')}</div>
                        </div>
                        <div class="weather-icon">${currentMeta.icon}</div>
                    </div>

                    <div class="weather-main">
                        <div class="weather-stat">
                            <span class="stat-label">Temperatura</span>
                            <span class="stat-value">${formatMeasurement(current.temperature_2m, '°C')}</span>
                        </div>

                        <div class="weather-stat">
                            <span class="stat-label">Era</span>
                            <span class="stat-value">${formatMeasurement(current.wind_speed_10m, ' km/h')}</span>
                        </div>

                        <div class="weather-stat">
                            <span class="stat-label">Ora</span>
                            <span class="stat-value">${escapeHtml(currentTime)}</span>
                        </div>
                    </div>
                </section>

                <section class="forecast-section">
                    <h4 class="forecast-title">Parashikimi ore pas ore</h4>
                    <div class="hourly-forecast" aria-label="Parashikimi ore pas ore">
                        ${hourlyHtml}
                    </div>
                </section>

                <section class="forecast-section">
                    <h4 class="forecast-title">Parashikimi 5-ditor</h4>
                    <div class="forecast-grid">
                        ${forecastHtml}
                    </div>
                </section>
            </div>
        `;

        weatherResult.classList.remove('weather-result-ready');
        requestAnimationFrame(() => {
            weatherResult.classList.add('weather-result-ready');
        });

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
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,weather_code&hourly=temperature_2m,weather_code,wind_speed_10m,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=auto`;
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
        showStatus('Duke kërkuar të dhënat e motit...', false, true);
        weatherResult.innerHTML = renderWeatherSkeleton();
        saveCityForm.classList.add('hidden');
        setActiveSavedCity();
        setLoadingState(true);

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
            weatherResult.innerHTML = '';
            showStatus(error.message, true);
        } finally {
            setLoadingState(false);
        }
    }

    async function loadWeatherByCoordinates(cityName, latitude, longitude, button = null) {
        showStatus('Duke ngarkuar qytetin e ruajtur...', false, true);
        weatherResult.innerHTML = renderWeatherSkeleton();
        saveCityForm.classList.add('hidden');
        setActiveSavedCity(button);
        setLoadingState(true);

        try {
            const weatherData = await fetchWeather(latitude, longitude);
            renderWeather(cityName, '', weatherData, latitude, longitude);
            showStatus('Të dhënat u ngarkuan me sukses.');
        } catch (error) {
            weatherResult.innerHTML = '';
            showStatus(error.message, true);
        } finally {
            setLoadingState(false);
        }
    }

    if (citySearchForm) {
        citySearchForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const cityName = cityInput.value.trim();

            if (!isValidCityName(cityName)) {
                setActiveSavedCity();
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

            await loadWeatherByCoordinates(cityName, latitude, longitude, button);
        });
    });
});
