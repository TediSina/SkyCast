document.addEventListener('DOMContentLoaded', () => {
    const widgets = Array.from(document.querySelectorAll('[data-weather-news]'));

    if (widgets.length === 0) {
        return;
    }

    const apiUrl = 'https://api.gdeltproject.org/api/v2/doc/doc';
    const feedMeta = {
        label: 'Moti',
        symbol: 'WX',
        query: '("weather forecast" OR "severe weather" OR "weather warning" OR meteorology OR meteorological OR rainfall OR flooding OR heatwave OR snowstorm OR thunderstorm OR hurricane OR cyclone OR drought OR "cold snap")'
    };
    const queryTiers = [
        feedMeta.query,
        '(weather OR forecast OR storm OR rainfall OR flooding OR heatwave OR snowstorm OR thunderstorm OR hurricane OR cyclone OR drought OR climate)'
    ];
    const allowedLanguages = [
        { operator: 'english', label: 'Anglisht' },
        { operator: 'albanian', label: 'Shqip' }
    ];
    const reserveArticles = [
        {
            title: 'NSSL News: severe weather research and radar updates',
            url: 'https://inside.nssl.noaa.gov/nsslnews/',
            domain: 'inside.nssl.noaa.gov',
            country: 'United States',
            language: 'Anglisht'
        },
        {
            title: 'News Around NOAA from the National Weather Service',
            url: 'https://www.weather.gov/news/headlines/index.html',
            domain: 'weather.gov',
            country: 'United States',
            language: 'Anglisht'
        },
        {
            title: 'WMO latest weather, climate and water news',
            url: 'https://wmo.int/type-of-news/news',
            domain: 'wmo.int',
            country: 'Global',
            language: 'Anglisht'
        },
        {
            title: 'NOAA NCEI climate and environmental news',
            url: 'https://www.ncei.noaa.gov/news',
            domain: 'ncei.noaa.gov',
            country: 'United States',
            language: 'Anglisht'
        }
    ];
    const widgetState = new WeakMap();
    const dateFormatter = new Intl.DateTimeFormat('sq-AL', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });

    function escapeHtml(value) {
        return String(value)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function getSafeUrl(value) {
        if (!value) {
            return '';
        }

        try {
            const url = new URL(String(value));
            return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
        } catch (error) {
            return '';
        }
    }

    function getDomain(url) {
        try {
            return new URL(url).hostname.replace(/^www\./, '');
        } catch (error) {
            return 'Burim lajmesh';
        }
    }

    function parseArticleDate(value) {
        const rawValue = String(value || '').trim();

        if (!rawValue) {
            return null;
        }

        const compactDate = rawValue.match(/^(\d{4})(\d{2})(\d{2})T?(\d{2})?(\d{2})?(\d{2})?Z?$/);

        if (compactDate) {
            return new Date(Date.UTC(
                Number(compactDate[1]),
                Number(compactDate[2]) - 1,
                Number(compactDate[3]),
                Number(compactDate[4] || 0),
                Number(compactDate[5] || 0),
                Number(compactDate[6] || 0)
            ));
        }

        const date = new Date(rawValue);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    function formatArticleDate(value) {
        const date = parseArticleDate(value);
        return date ? dateFormatter.format(date) : 'Së fundmi';
    }

    function getSortTime(value) {
        const date = parseArticleDate(value);
        return date ? date.getTime() : 0;
    }

    function getLimit(widget) {
        const limit = Number(widget.dataset.newsLimit || 6);
        return Number.isFinite(limit) ? Math.max(1, Math.min(limit, 12)) : 6;
    }

    function getCityQueryTerm(cityName) {
        const cleaned = String(cityName || '')
            .replace(/[^A-Za-z0-9À-ž\u00C0-\u024F\s'.-]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        if (!cleaned) {
            return '';
        }

        return cleaned.includes(' ') ? `"${cleaned.replaceAll('"', '')}"` : cleaned;
    }

    function buildQuery(widget, language, baseQuery, includeCity = true) {
        const cityTerm = includeCity && widget.dataset.newsMode === 'city'
            ? getCityQueryTerm(widget.dataset.newsCity)
            : '';
        const cityQuery = cityTerm ? ` ${cityTerm}` : '';

        return `${baseQuery}${cityQuery} sourcelang:${language.operator}`;
    }

    function normalizeArticles(articles, language) {
        return articles.map((article) => {
            const url = getSafeUrl(article.url || article.url_mobile);
            const title = String(article.title || '').trim();

            if (!url || !title) {
                return null;
            }

            return {
                title,
                url,
                image: getSafeUrl(article.socialimage || article.image || ''),
                domain: String(article.domain || getDomain(url)).replace(/^www\./, ''),
                country: String(article.sourcecountry || article.sourceCountry || '').trim(),
                date: formatArticleDate(article.seendate || article.date || article.datetime),
                sortTime: getSortTime(article.seendate || article.date || article.datetime),
                language: language.label
            };
        }).filter(Boolean);
    }

    function uniqueArticles(articles) {
        const seen = new Set();

        return articles.filter((article) => {
            const key = article.url.replace(/^https?:\/\/(www\.)?/i, '').split(/[?#]/)[0].toLowerCase();

            if (seen.has(key)) {
                return false;
            }

            seen.add(key);
            return true;
        });
    }

    function getReserveArticles(limit) {
        return reserveArticles.slice(0, limit).map((article) => ({
            ...article,
            image: '',
            date: 'Burim i vazhdueshëm',
            sortTime: 0,
            isReserve: true
        }));
    }

    async function fetchLanguageArticles(widget, language, limit, signal, baseQuery, includeCity = true) {
        const url = new URL(apiUrl);
        url.searchParams.set('query', buildQuery(widget, language, baseQuery, includeCity));
        url.searchParams.set('mode', 'artlist');
        url.searchParams.set('format', 'json');
        url.searchParams.set('sort', 'datedesc');
        url.searchParams.set('timespan', '1week');
        url.searchParams.set('maxrecords', String(Math.min(limit * 3, 30)));

        const response = await fetch(url.toString(), { signal });

        if (!response.ok) {
            throw new Error('Lajmet nuk u ngarkuan.');
        }

        const data = await response.json();
        return normalizeArticles(Array.isArray(data.articles) ? data.articles : [], language);
    }

    async function fetchArticles(widget, limit, signal, includeCity = true) {
        let lastError = null;
        let hadSuccessfulRequest = false;

        for (const baseQuery of queryTiers) {
            const articleResults = await Promise.allSettled(
                allowedLanguages.map((language) => fetchLanguageArticles(
                    widget,
                    language,
                    limit,
                    signal,
                    baseQuery,
                    includeCity
                ))
            );
            const articleGroups = articleResults
                .filter((result) => result.status === 'fulfilled')
                .map((result) => result.value);
            const rejectedResult = articleResults.find((result) => result.status === 'rejected');

            if (rejectedResult) {
                lastError = rejectedResult.reason;
            }

            if (articleGroups.length === 0) {
                continue;
            }

            hadSuccessfulRequest = true;

            const articles = uniqueArticles(articleGroups.flat())
                .sort((first, second) => second.sortTime - first.sortTime)
                .slice(0, limit);

            if (articles.length > 0) {
                return articles;
            }
        }

        if (!hadSuccessfulRequest && lastError) {
            throw lastError;
        }

        return [];
    }

    function setStatus(widget, message, isError = false, isLoading = false) {
        const statusElement = widget.querySelector('[data-news-status]');

        if (!statusElement) {
            return;
        }

        statusElement.textContent = message;
        statusElement.className = [
            'weather-news-status',
            isError ? 'error-text' : '',
            isLoading ? 'loading-text' : ''
        ].filter(Boolean).join(' ');
    }

    function setContext(widget, message) {
        const contextElement = widget.querySelector('[data-news-context]');

        if (contextElement) {
            contextElement.textContent = message;
        }
    }

    function setBusy(widget, isBusy) {
        widget.querySelectorAll('[data-news-refresh]').forEach((button) => {
            button.disabled = isBusy;
            button.classList.toggle('is-busy', isBusy);
        });
    }

    function renderEmpty(widget, message) {
        const listElement = widget.querySelector('[data-news-list]');

        if (!listElement) {
            return;
        }

        listElement.innerHTML = `
            <div class="weather-news-empty">
                <strong>Pa tituj të freskët</strong>
                <span>${escapeHtml(message)}</span>
            </div>
        `;
    }

    function renderSkeleton(widget, limit) {
        const listElement = widget.querySelector('[data-news-list]');

        if (!listElement) {
            return;
        }

        listElement.innerHTML = Array.from({ length: Math.min(limit, 6) }).map(() => `
            <div class="weather-news-card weather-news-loading" aria-hidden="true">
                <div class="weather-news-media"></div>
                <div class="weather-news-content">
                    <span></span>
                    <strong></strong>
                    <small></small>
                </div>
            </div>
        `).join('');
    }

    function renderArticles(widget, articles) {
        const listElement = widget.querySelector('[data-news-list]');

        if (!listElement) {
            return;
        }

        listElement.innerHTML = articles.map((article, index) => {
            const mediaClass = article.image ? 'has-image' : 'no-image';
            const countryLabel = article.country ? escapeHtml(article.country) : '';

            return `
                <article class="weather-news-card ${mediaClass}${article.isReserve ? ' is-reserve' : ''}" style="--delay: ${index * 55}ms">
                    <a href="${escapeHtml(article.url)}" target="_blank" rel="noreferrer">
                        <div class="weather-news-media">
                            ${article.image ? `<img src="${escapeHtml(article.image)}" alt="">` : ''}
                            <span class="weather-news-symbol">${escapeHtml(feedMeta.symbol)}</span>
                        </div>
                        <div class="weather-news-content">
                            <span class="weather-news-meta">${escapeHtml(feedMeta.label)} · ${escapeHtml(article.language)} · ${escapeHtml(article.date)}</span>
                            <h4>${escapeHtml(article.title)}</h4>
                            <div class="weather-news-source-row">
                                <span>${escapeHtml(article.domain)}</span>
                                <span>${countryLabel}</span>
                            </div>
                        </div>
                    </a>
                </article>
            `;
        }).join('');

        listElement.querySelectorAll('img').forEach((image) => {
            image.addEventListener('error', () => {
                const media = image.closest('.weather-news-media');
                media?.classList.add('is-empty');
                image.remove();
            });
        });
    }

    async function loadNews(widget) {
        const state = widgetState.get(widget) || {};

        if (state.abortController) {
            state.abortController.abort();
        }

        const abortController = new AbortController();
        widgetState.set(widget, { abortController });

        const limit = getLimit(widget);
        const cityName = (widget.dataset.newsCity || '').trim();
        const countryName = (widget.dataset.newsCountry || '').trim();
        const cityLabel = [cityName, countryName].filter(Boolean).join(', ');
        const loadingLabel = cityLabel ? `Duke kërkuar lajme për ${cityLabel}` : 'Duke kërkuar lajme meteo';

        setBusy(widget, true);
        setStatus(widget, loadingLabel, false, true);
        setContext(widget, cityLabel ? `Lajme moti për ${cityLabel} · Anglisht/Shqip` : 'Mbulim global · Anglisht/Shqip');
        renderSkeleton(widget, limit);

        try {
            let articles = await fetchArticles(widget, limit, abortController.signal);
            let usedFallback = false;
            let usedReserve = false;

            if (cityName && articles.length === 0) {
                usedFallback = true;
                articles = await fetchArticles(widget, limit, abortController.signal, false);
            }

            if (abortController.signal.aborted) {
                return;
            }

            if (articles.length === 0) {
                usedReserve = true;
                articles = getReserveArticles(limit);
            }

            renderArticles(widget, articles);
            setStatus(widget, usedReserve
                ? `U shfaqën ${articles.length} burime meteo rezervë.`
                : `U ngarkuan ${articles.length} tituj moti.`
            );
            setContext(widget, usedReserve
                ? 'Burime të qëndrueshme meteo · Anglisht'
                : (usedFallback
                ? `Pak tituj për ${cityLabel}; shfaqet mbulim global · Anglisht/Shqip`
                : (cityLabel ? `Lajme moti për ${cityLabel} · Anglisht/Shqip` : 'Mbulim global · Anglisht/Shqip')
                )
            );
        } catch (error) {
            if (error.name === 'AbortError') {
                return;
            }

            const reserve = getReserveArticles(limit);
            renderArticles(widget, reserve);
            setStatus(widget, 'Burimi live nuk u arrit; po shfaqen burime meteo rezervë.');
            setContext(widget, 'Burime të qëndrueshme meteo · Anglisht');
        } finally {
            if (!abortController.signal.aborted) {
                setBusy(widget, false);
            }
        }
    }

    widgets.forEach((widget) => {
        widget.querySelectorAll('[data-news-refresh]').forEach((button) => {
            button.addEventListener('click', () => loadNews(widget));
        });

        loadNews(widget);
    });

    document.addEventListener('skycast:city-selected', (event) => {
        const detail = event.detail || {};

        widgets
            .filter((widget) => widget.dataset.newsMode === 'city')
            .forEach((widget) => {
                widget.dataset.newsCity = detail.name || '';
                widget.dataset.newsCountry = detail.country || '';
                loadNews(widget);
            });
    });
});
