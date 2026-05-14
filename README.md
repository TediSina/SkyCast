# SkyCast

SkyCast është një aplikacion web për motin, i ndërtuar me PHP, MySQL, HTML, CSS dhe JavaScript. Aplikacioni lejon përdoruesit të krijojnë llogari, të hyjnë në panelin personal, të kërkojnë qytete, të shohin motin aktual, parashikimin orë pas ore dhe parashikimin 5-ditor, si edhe të ruajnë qytetet që duan t'i kontrollojnë më shpesh.

Të dhënat e motit dhe kërkimet e qyteteve merren nga API-të publike të Open-Meteo:

- `https://api.open-meteo.com`
- `https://geocoding-api.open-meteo.com`

## Funksionalitetet

- Regjistrim dhe hyrje në sistem për përdoruesit.
- Panel personal për kërkimin e motit sipas qytetit.
- Sugjerime qytetesh gjatë kërkimit.
- Shfaqje e motit aktual, erës dhe gjendjes së motit.
- Parashikim orë pas ore për 12 orët e ardhshme.
- Parashikim 5-ditor me temperatura minimale dhe maksimale.
- Ruajtje dhe fshirje e qyteteve të preferuara.
- Faqe llogarie për përditësim profili, ndryshim fjalëkalimi dhe fshirje llogarie.

## Kërkesat

Për ta ekzekutuar lokalisht në XAMPP duhen:

- XAMPP me Apache, PHP dhe MySQL/MariaDB.
- Shfletues modern web.
- Lidhje interneti për të marrë të dhënat nga Open-Meteo.

## Si ta ekzekutosh lokalisht me XAMPP

1. Shkarko ose klono projektin në dosjen `htdocs` të XAMPP-it.

   Shembull në Windows:

   ```text
   C:\xampp\htdocs\SkyCast
   ```

2. Hap XAMPP Control Panel.

3. Ndez shërbimet:

   - `Apache`
   - `MySQL`

4. Kontrollo konfigurimin e databazës në skedarin `db/connection.php`.

   Projekti është i konfiguruar me këto vlera standarde të XAMPP-it:

   ```php
   const DB_HOST = '127.0.0.1';
   const DB_PORT = '3306';
   const DB_NAME = 'skycast_db';
   const DB_USER = 'root';
   const DB_PASS = '';
   ```

   Aplikacioni krijon automatikisht databazën `skycast_db` dhe tabelat `users` dhe `saved_cities` kur hapet për herë të parë.

5. Hap aplikacionin në shfletues:

   ```text
   http://localhost/skycast
   ```

   Në Windows, edhe `http://localhost/SkyCast` zakonisht funksionon. Projekti përdor si bazë URL-je vlerën `/skycast` në `includes/functions.php`; nëse e ndryshon emrin e dosjes ose e vendos në një rrugë tjetër, përditëso edhe konstanten `APP_BASE`.

6. Krijo një llogari të re nga faqja e regjistrimit dhe vazhdo te paneli për të kërkuar motin dhe për të ruajtur qytete.

## Struktura e projektit

```text
SkyCast/
|-- api/
|   `-- weather.js
|-- assets/
|   |-- css/
|   |   `-- style.css
|   `-- js/
|       |-- main.js
|       `-- validation.js
|-- db/
|   `-- connection.php
|-- includes/
|   |-- auth.php
|   `-- functions.php
|-- pages/
|   |-- account.php
|   |-- dashboard.php
|   |-- login.php
|   `-- register.php
|-- index.php
|-- logout.php
|-- LICENSE
`-- README.md
```

## Shënime

- Nuk nevojitet instalim paketash me Composer ose npm.
- Nëse shfaqet gabim lidhjeje me databazën, sigurohu që `MySQL` është ndezur në XAMPP dhe që porta `3306` nuk është e zënë nga një shërbim tjetër.
- Nëse të dhënat e motit nuk ngarkohen, kontrollo lidhjen me internetin dhe nëse shfletuesi mund të arrijë API-të e Open-Meteo.

## Licenca

Ky projekt është i licencuar nën licencën MIT. Teksti i plotë i licencës është edhe në skedarin `LICENSE`.

```text
MIT License

Copyright (c) 2026 Tedi Sina, Tea Sina

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
