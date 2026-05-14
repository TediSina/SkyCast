document.addEventListener('DOMContentLoaded', () => {
    const citySearchForm = document.getElementById('citySearchForm');
    const cityInput = document.getElementById('cityInput');
    const weatherStatus = document.getElementById('weatherStatus');
    const weatherResult = document.getElementById('weatherResult');
    const saveCityForm = document.getElementById('saveCityForm');
    const savedCityName = document.getElementById('savedCityName');
    const savedLatitude = document.getElementById('savedLatitude');
    const savedLongitude = document.getElementById('savedLongitude');
    const saveCityLabel = document.getElementById('saveCityLabel');
    const saveCityButton = saveCityForm?.querySelector('button[type="submit"]');
    const weatherSearchCard = document.querySelector('.weather-search-card');
    const searchButton = citySearchForm?.querySelector('button[type="submit"]');
    const citySuggestions = document.getElementById('citySuggestions');
    let suggestionAbortController = null;
    let suggestionDebounceId = null;
    let cityMatches = [];
    let highlightedSuggestionIndex = -1;
    let selectedCityMatch = null;

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

    function getCityLabel(city) {
        return [city.name, city.admin1, city.country].filter(Boolean).join(', ');
    }

    function getCityMeta(city) {
        return [
            city.country_code,
            city.timezone,
            city.latitude !== undefined && city.longitude !== undefined
                ? `${Number(city.latitude).toFixed(2)}, ${Number(city.longitude).toFixed(2)}`
                : ''
        ].filter(Boolean).join(' · ');
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

    function getNumericValue(value) {
        const number = Number(value);
        return Number.isFinite(number) ? number : null;
    }

    function getMetricRange(values, minFloor = null, maxCeiling = null) {
        const numericValues = values.map(getNumericValue).filter((value) => value !== null);

        if (numericValues.length === 0) {
            return null;
        }

        let min = Math.min(...numericValues);
        let max = Math.max(...numericValues);

        if (minFloor !== null) {
            min = Math.min(min, minFloor);
        }

        if (maxCeiling !== null) {
            max = Math.max(max, maxCeiling);
        }

        if (min === max) {
            min -= 1;
            max += 1;
        }

        return { min, max };
    }

    function getMetricStats(values, fallbackSuffix = '') {
        const numericValues = values.map(getNumericValue).filter((value) => value !== null);

        if (numericValues.length === 0) {
            return {
                min: '-',
                max: '-',
                average: '-'
            };
        }

        const min = Math.min(...numericValues);
        const max = Math.max(...numericValues);
        const average = numericValues.reduce((total, value) => total + value, 0) / numericValues.length;

        return {
            min: `${Math.round(min)}${fallbackSuffix}`,
            max: `${Math.round(max)}${fallbackSuffix}`,
            average: `${Math.round(average)}${fallbackSuffix}`
        };
    }

    function getChartPoints(items, key, range) {
        const width = 640;
        const height = 220;
        const left = 36;
        const right = width - 20;
        const top = 18;
        const bottom = height - 36;
        const usableWidth = right - left;
        const usableHeight = bottom - top;
        const denominator = Math.max(items.length - 1, 1);

        return items.map((item, index) => {
            const value = getNumericValue(item[key]);

            if (value === null) {
                return null;
            }

            const x = left + (usableWidth * index / denominator);
            const y = bottom - ((value - range.min) / (range.max - range.min) * usableHeight);

            return {
                x: Number(x.toFixed(2)),
                y: Number(y.toFixed(2)),
                value,
                label: formatHour(item.time)
            };
        }).filter(Boolean);
    }

    function renderGridLines() {
        return [18, 73.33, 128.66, 184].map((y) => `
            <line class="chart-grid-line" x1="36" y1="${y}" x2="620" y2="${y}"></line>
        `).join('');
    }

    function renderAxisLabels(items) {
        if (items.length === 0) {
            return '';
        }

        const labelIndexes = [0, Math.floor((items.length - 1) / 2), items.length - 1];
        const uniqueIndexes = [...new Set(labelIndexes)];

        return uniqueIndexes.map((itemIndex) => {
            const x = 36 + ((620 - 36) * itemIndex / Math.max(items.length - 1, 1));
            return `<text class="chart-axis-label" x="${x.toFixed(2)}" y="212">${escapeHtml(formatHour(items[itemIndex].time))}</text>`;
        }).join('');
    }

    function renderLineGraph(items, key, unit, variant, minFloor = null, maxCeiling = null) {
        const values = items.map((item) => item[key]);
        const range = getMetricRange(values, minFloor, maxCeiling);

        if (!range) {
            return '';
        }

        const points = getChartPoints(items, key, range);

        if (points.length < 2) {
            return '';
        }

        const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
        const areaPath = `M 36 184 L ${points.map((point) => `${point.x} ${point.y}`).join(' L ')} L 620 184 Z`;
        const pointHtml = points.map((point) => `
            <circle class="chart-point" cx="${point.x}" cy="${point.y}" r="4">
                <title>${escapeHtml(point.label)}: ${Math.round(point.value)}${escapeHtml(unit)}</title>
            </circle>
        `).join('');

        return `
            <svg class="metric-chart ${variant}" viewBox="0 0 640 220" role="img" aria-label="Grafiku i ${escapeHtml(unit === '°C' ? 'temperaturës' : 'erës')} për orët e ardhshme" preserveAspectRatio="none">
                ${renderGridLines()}
                <path class="chart-area" d="${areaPath}"></path>
                <path class="chart-line" d="${linePath}"></path>
                ${pointHtml}
                ${renderAxisLabels(items)}
            </svg>
        `;
    }

    function renderBarGraph(items, key) {
        const values = items.map((item) => item[key]);
        const range = getMetricRange(values, 0, 100);

        if (!range) {
            return '';
        }

        const width = 640;
        const left = 36;
        const right = width - 20;
        const bottom = 184;
        const top = 18;
        const usableWidth = right - left;
        const gap = 7;
        const barWidth = Math.max((usableWidth / items.length) - gap, 12);

        const bars = items.map((item, index) => {
            const value = getNumericValue(item[key]);

            if (value === null) {
                return '';
            }

            const x = left + (usableWidth * index / items.length) + (gap / 2);
            const barHeight = ((value - range.min) / (range.max - range.min)) * (bottom - top);
            const y = bottom - barHeight;

            return `
                <rect class="chart-bar" x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${barWidth.toFixed(2)}" height="${Math.max(barHeight, 2).toFixed(2)}" rx="5">
                    <title>${escapeHtml(formatHour(item.time))}: ${Math.round(value)}%</title>
                </rect>
            `;
        }).join('');

        return `
            <svg class="metric-chart rain-bars" viewBox="0 0 640 220" role="img" aria-label="Grafiku i mundësisë së shiut për orët e ardhshme" preserveAspectRatio="none">
                ${renderGridLines()}
                ${bars}
                ${renderAxisLabels(items)}
            </svg>
        `;
    }

    function renderWeatherGraphs(hourlyItems) {
        if (hourlyItems.length < 2) {
            return `
                <section class="forecast-section weather-graphs-section">
                    <h4 class="forecast-title">Grafikët e motit</h4>
                    <p class="empty-forecast">Nuk ka mjaftueshëm të dhëna orare për grafikë.</p>
                </section>
            `;
        }

        const temperatureStats = getMetricStats(hourlyItems.map((item) => item.temperature), '°');
        const precipitationStats = getMetricStats(hourlyItems.map((item) => item.precipitationProbability), '%');
        const windStats = getMetricStats(hourlyItems.map((item) => item.windSpeed), ' km/h');

        return `
            <section class="forecast-section weather-graphs-section">
                <div class="graphs-heading">
                    <div>
                        <span class="section-kicker">Grafikë</span>
                        <h4 class="forecast-title">Lexim vizual për 12 orët e ardhshme</h4>
                    </div>
                </div>

                <div class="weather-graphs-grid">
                    <article class="weather-graph-card temperature-graph">
                        <div class="graph-card-top">
                            <span>Temperatura</span>
                            <strong>${escapeHtml(temperatureStats.min)} / ${escapeHtml(temperatureStats.max)}</strong>
                        </div>
                        ${renderLineGraph(hourlyItems, 'temperature', '°C', 'temperature-line')}
                        <p>Mesatarja: <strong>${escapeHtml(temperatureStats.average)}</strong></p>
                    </article>

                    <article class="weather-graph-card rain-graph">
                        <div class="graph-card-top">
                            <span>Mundësia e shiut</span>
                            <strong>${escapeHtml(precipitationStats.max)}</strong>
                        </div>
                        ${renderBarGraph(hourlyItems, 'precipitationProbability')}
                        <p>Piku i reshjeve: <strong>${escapeHtml(precipitationStats.max)}</strong></p>
                    </article>

                    <article class="weather-graph-card wind-graph">
                        <div class="graph-card-top">
                            <span>Era</span>
                            <strong>${escapeHtml(windStats.max)}</strong>
                        </div>
                        ${renderLineGraph(hourlyItems, 'windSpeed', ' km/h', 'wind-line', 0)}
                        <p>Mesatarja: <strong>${escapeHtml(windStats.average)}</strong></p>
                    </article>
                </div>
            </section>
        `;
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

    function setSuggestionExpanded(isExpanded) {
        cityInput?.setAttribute('aria-expanded', String(isExpanded));
    }

    function hideCitySuggestions() {
        if (!citySuggestions) {
            return;
        }

        if (suggestionAbortController) {
            suggestionAbortController.abort();
            suggestionAbortController = null;
        }

        citySuggestions.classList.add('hidden');
        citySuggestions.innerHTML = '';
        weatherSearchCard?.classList.remove('has-open-suggestions');
        highlightedSuggestionIndex = -1;
        cityInput?.removeAttribute('aria-activedescendant');
        setSuggestionExpanded(false);
    }

    function updateHighlightedSuggestion(nextIndex) {
        if (!citySuggestions || cityMatches.length === 0) {
            highlightedSuggestionIndex = -1;
            cityInput?.removeAttribute('aria-activedescendant');
            return;
        }

        highlightedSuggestionIndex = (nextIndex + cityMatches.length) % cityMatches.length;

        citySuggestions.querySelectorAll('.city-suggestion').forEach((button, index) => {
            const isHighlighted = index === highlightedSuggestionIndex;
            button.classList.toggle('is-highlighted', isHighlighted);
            button.setAttribute('aria-selected', String(isHighlighted));

            if (isHighlighted) {
                cityInput?.setAttribute('aria-activedescendant', button.id);
                button.scrollIntoView({ block: 'nearest' });
            }
        });
    }

    function renderCitySuggestions(matches, message = '') {
        if (!citySuggestions) {
            return;
        }

        cityMatches = matches;
        highlightedSuggestionIndex = -1;

        if (matches.length === 0) {
            citySuggestions.innerHTML = message
                ? `<p class="city-suggestions-empty">${escapeHtml(message)}</p>`
                : '';
            citySuggestions.classList.toggle('hidden', !message);
            weatherSearchCard?.classList.toggle('has-open-suggestions', Boolean(message));
            setSuggestionExpanded(Boolean(message));
            return;
        }

        citySuggestions.innerHTML = matches.map((city, index) => `
            <button
                type="button"
                id="citySuggestion${index}"
                class="city-suggestion"
                role="option"
                aria-selected="false"
                data-index="${index}"
            >
                <strong>${escapeHtml(getCityLabel(city))}</strong>
                <span>${escapeHtml(getCityMeta(city))}</span>
            </button>
        `).join('');

        citySuggestions.classList.remove('hidden');
        weatherSearchCard?.classList.add('has-open-suggestions');
        setSuggestionExpanded(true);
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

        if (isLoading) {
            hideCitySuggestions();
        }
    }

    function showStatus(message, isError = false, isLoading = false) {
        weatherStatus.textContent = message;
        weatherStatus.className = [
            'status-text',
            isError ? 'error-text' : '',
            isLoading ? 'loading-text' : ''
        ].filter(Boolean).join(' ');
    }

    function hideSaveCityAction() {
        saveCityForm.classList.add('hidden');

        if (saveCityLabel) {
            saveCityLabel.textContent = '';
        }

        saveCityButton?.removeAttribute('aria-label');
    }

    function prepareSaveCity(cityName, countryName, latitude, longitude) {
        const cityLabel = [cityName, countryName].filter(Boolean).join(', ');

        savedCityName.value = cityName;
        savedLatitude.value = latitude;
        savedLongitude.value = longitude;

        if (saveCityLabel) {
            saveCityLabel.textContent = cityLabel;
        }

        saveCityButton?.setAttribute('aria-label', `Ruaje ${cityLabel} në listën e qyteteve`);
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
                    <small>${formatMeasurement(hour.windSpeed, ' km/h')} · ${formatMeasurement(hour.precipitationProbability, '% mundësi shiu')}</small>
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
                    <p><strong>Maks:</strong> ${daily.temperature_2m_max[index]}°C</p>
                    <p><strong>Min:</strong> ${daily.temperature_2m_min[index]}°C</p>
                </div>
            `;
        }).join('');

        weatherResult.innerHTML = `
            <div class="weather-card ${currentTheme}">
                <section class="weather-current">
                    <div class="weather-top">
                        <div>
                            <span class="section-kicker">Moti aktual</span>
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

                ${renderWeatherGraphs(hourlyItems)}

                <section class="forecast-section">
                    <h4 class="forecast-title">Parashikimi orë pas ore</h4>
                    <div class="hourly-forecast" aria-label="Parashikimi orë pas ore">
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

        prepareSaveCity(cityName, countryName, latitude, longitude);

        document.dispatchEvent(new CustomEvent('skycast:city-selected', {
            detail: {
                name: cityName,
                country: countryName,
                latitude,
                longitude
            }
        }));
    }

    async function fetchCityMatches(cityName, count = 6, signal = undefined) {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=${count}&language=en&format=json`;
        const response = await fetch(url, { signal });

        if (!response.ok) {
            throw new Error('Nuk u arrit kërkesa për qytetin.');
        }

        const data = await response.json();

        return data.results || [];
    }

    async function fetchCoordinates(cityName) {
        const matches = await fetchCityMatches(cityName, 1);

        if (matches.length === 0) {
            throw new Error('Qyteti nuk u gjet.');
        }

        return matches[0];
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

    function canRequestCitySuggestions(cityName) {
        const cityRegex = /^[A-Za-zÀ-ž\u00C0-\u024F\s'’-]{2,}$/;
        return cityRegex.test(cityName.trim());
    }

    function scheduleCitySuggestions() {
        const query = cityInput.value.trim();
        selectedCityMatch = null;

        window.clearTimeout(suggestionDebounceId);

        if (suggestionAbortController) {
            suggestionAbortController.abort();
        }

        if (!canRequestCitySuggestions(query)) {
            cityMatches = [];
            hideCitySuggestions();
            return;
        }

        suggestionDebounceId = window.setTimeout(async () => {
            suggestionAbortController = new AbortController();

            try {
                renderCitySuggestions([], 'Duke kërkuar qytete...');
                const matches = await fetchCityMatches(query, 6, suggestionAbortController.signal);
                renderCitySuggestions(matches, 'Nuk u gjet asnjë qytet.');
            } catch (error) {
                if (error.name !== 'AbortError') {
                    renderCitySuggestions([], 'Sugjerimet nuk u ngarkuan.');
                }
            }
        }, 260);
    }

    async function loadWeatherByCityName(cityName) {
        showStatus('Duke kërkuar të dhënat e motit...', false, true);
        weatherResult.innerHTML = renderWeatherSkeleton();
        hideSaveCityAction();
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

    async function loadWeatherByCoordinates(
        cityName,
        latitude,
        longitude,
        button = null,
        countryName = '',
        loadingMessage = 'Duke ngarkuar qytetin e ruajtur...'
    ) {
        showStatus(loadingMessage, false, true);
        weatherResult.innerHTML = renderWeatherSkeleton();
        hideSaveCityAction();
        setActiveSavedCity(button);
        setLoadingState(true);

        try {
            const weatherData = await fetchWeather(latitude, longitude);
            renderWeather(cityName, countryName, weatherData, latitude, longitude);
            showStatus('Të dhënat u ngarkuan me sukses.');
        } catch (error) {
            weatherResult.innerHTML = '';
            showStatus(error.message, true);
        } finally {
            setLoadingState(false);
        }
    }

    async function selectCitySuggestion(index) {
        const cityData = cityMatches[index];

        if (!cityData) {
            return;
        }

        selectedCityMatch = cityData;
        cityInput.value = getCityLabel(cityData);
        hideCitySuggestions();
        await loadWeatherByCoordinates(
            cityData.name,
            cityData.latitude,
            cityData.longitude,
            null,
            cityData.country,
            'Duke ngarkuar qytetin...'
        );
    }

    if (citySearchForm) {
        citySearchForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const cityName = cityInput.value.trim();

            if (selectedCityMatch && cityName === getCityLabel(selectedCityMatch)) {
                await loadWeatherByCoordinates(
                    selectedCityMatch.name,
                    selectedCityMatch.latitude,
                    selectedCityMatch.longitude,
                    null,
                    selectedCityMatch.country,
                    'Duke ngarkuar qytetin...'
                );
                return;
            }

            if (!isValidCityName(cityName)) {
                setActiveSavedCity();
                showStatus('Shkruaj një emër qyteti të vlefshëm.', true);
                return;
            }

            await loadWeatherByCityName(cityName);
        });
    }

    if (cityInput && citySuggestions) {
        cityInput.addEventListener('input', scheduleCitySuggestions);

        cityInput.addEventListener('keydown', async (event) => {
            const suggestionsVisible = !citySuggestions.classList.contains('hidden') && cityMatches.length > 0;

            if (!suggestionsVisible && ['ArrowDown', 'ArrowUp', 'Escape'].includes(event.key)) {
                return;
            }

            if (event.key === 'ArrowDown') {
                event.preventDefault();
                updateHighlightedSuggestion(highlightedSuggestionIndex + 1);
            }

            if (event.key === 'ArrowUp') {
                event.preventDefault();
                updateHighlightedSuggestion(highlightedSuggestionIndex - 1);
            }

            if (event.key === 'Enter' && suggestionsVisible && highlightedSuggestionIndex >= 0) {
                event.preventDefault();
                await selectCitySuggestion(highlightedSuggestionIndex);
            }

            if (event.key === 'Escape') {
                hideCitySuggestions();
            }
        });

        citySuggestions.addEventListener('pointerdown', (event) => {
            event.preventDefault();
        });

        citySuggestions.addEventListener('click', async (event) => {
            const button = event.target.closest('.city-suggestion');

            if (!button) {
                return;
            }

            await selectCitySuggestion(Number(button.dataset.index));
        });

        document.addEventListener('click', (event) => {
            if (!citySearchForm.contains(event.target)) {
                hideCitySuggestions();
            }
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
