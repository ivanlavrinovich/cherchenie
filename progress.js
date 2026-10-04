/* ============================================================
   ПРОГРЕСС ИЗУЧЕНИЯ + КНОПКА «НА ГЛАВНУЮ»
   Отмечает прочитанные темы, сохраняет в localStorage,
   добавляет плавающую кнопку возврата на главную
   ============================================================ */

(function () {

    /* ============================================================
       ПЛАВАЮЩАЯ КНОПКА «НА ГЛАВНУЮ»
       Показывается на всех страницах, кроме главной и игр
       ============================================================ */

    var currentFile = window.location.pathname.split('/').pop() || 'index.html';

    /* Если мы на главной или на странице игр — кнопку не показываем */
    var skipPages = ['index.html', '', 'games.html'];
    var showButton = skipPages.indexOf(currentFile) === -1;

    if (showButton) {

        /* Создаём кнопку */
        var homeBtn = document.createElement('a');
        homeBtn.href = 'index.html';
        homeBtn.className = 'home-float-btn';
        homeBtn.title = 'Вернуться на главную';
        homeBtn.setAttribute('aria-label', 'На главную');

        /* Внутренний HTML: SVG-иконка домика + текст */
        homeBtn.innerHTML =
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                '<path d="M3 12 L12 3 L21 12"/>' +
                '<path d="M5 10 L5 21 L19 21 L19 10"/>' +
                '<path d="M10 21 L10 14 L14 14 L14 21"/>' +
            '</svg>' +
            '<span class="home-float-text">На главную</span>';

        /* Стили прямо в JS — чтобы не искать в CSS */
        var style = document.createElement('style');
        style.textContent =
            /* Основной стиль кнопки */
            '.home-float-btn {' +
                'position: fixed;' +
                'bottom: 2rem;' +
                'right: 2rem;' +
                'display: inline-flex;' +
                'align-items: center;' +
                'gap: 0.6rem;' +
                'padding: 0.9rem 1.2rem;' +
                'background: linear-gradient(135deg, #1b3a5c 0%, #142438 100%);' +
                'border: 1px solid #2a4f78;' +
                'border-radius: 50px;' +
                'color: #d5e3f0;' +
                'font-family: "JetBrains Mono", monospace;' +
                'font-size: 0.9rem;' +
                'font-weight: 600;' +
                'text-decoration: none;' +
                'letter-spacing: 0.5px;' +
                'box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(91, 163, 232, 0.1) inset;' +
                'z-index: 9998;' +
                'opacity: 0;' +
                'transform: translateY(20px);' +
                'transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);' +
                'pointer-events: none;' +
                'cursor: pointer;' +
            '}' +

            /* Класс, который добавляем через 1 сек после загрузки */
            '.home-float-btn.visible {' +
                'opacity: 1;' +
                'transform: translateY(0);' +
                'pointer-events: auto;' +
            '}' +

            /* При наведении кнопка приподнимается и подсвечивается */
            '.home-float-btn:hover {' +
                'background: linear-gradient(135deg, #5ba3e8 0%, #4a90d9 100%);' +
                'border-color: #8ec5f5;' +
                'color: #0a1424;' +
                'transform: translateY(-3px);' +
                'box-shadow: 0 12px 32px rgba(91, 163, 232, 0.5), 0 0 0 1px rgba(142, 197, 245, 0.4) inset;' +
                'text-decoration: none;' +
            '}' +

            /* Иконка внутри кнопки */
            '.home-float-btn svg {' +
                'width: 18px;' +
                'height: 18px;' +
                'flex-shrink: 0;' +
                'transition: transform 0.25s;' +
            '}' +

            /* Иконка при наведении чуть шевелится */
            '.home-float-btn:hover svg {' +
                'transform: translateY(-2px);' +
            '}' +

            /* Текст внутри кнопки */
            '.home-float-text {' +
                'white-space: nowrap;' +
            '}' +

            /* На телефоне — круглая кнопка без текста */
            '@media (max-width: 700px) {' +
                '.home-float-btn {' +
                    'bottom: 1.2rem;' +
                    'right: 1.2rem;' +
                    'padding: 0.9rem;' +
                    'border-radius: 50%;' +
                '}' +
                '.home-float-text {' +
                    'display: none;' +
                '}' +
                '.home-float-btn svg {' +
                    'width: 22px;' +
                    'height: 22px;' +
                '}' +
            '}';

        /* Вставляем стили и кнопку в документ */
        document.head.appendChild(style);
        document.body.appendChild(homeBtn);

        /* Показываем кнопку с задержкой — чтобы не мелькала при загрузке */
        setTimeout(function () {
            homeBtn.classList.add('visible');
        }, 800);
    }

    /* ============================================================
       ПРОГРЕСС ИЗУЧЕНИЯ МАТЕРИАЛА
       ============================================================ */

    var STORAGE_KEY = 'study_progress_v1';
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';

    /* На главной и странице игр прогресс не считаем */
    if (currentPage === 'index.html' || currentPage === 'games.html') return;

    /* Находим сайдбар */
    var sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    /* Все ссылки-якоря в сайдбаре */
    var sidebarLinks = sidebar.querySelectorAll('.sidebar-link[href^="#"]');
    if (sidebarLinks.length === 0) return;

    /* Загрузка прогресса из localStorage */
    function getProgress() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        } catch (e) {
            return {};
        }
    }

    /* Сохранение прогресса */
    function saveProgress(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    /* Прогресс по текущей странице */
    function getPageProgress() {
        var all = getProgress();
        return all[currentPage] || [];
    }

    /* Сохранить прогресс по текущей странице */
    function savePageProgress(list) {
        var all = getProgress();
        all[currentPage] = list;
        saveProgress(all);
    }

    /* ---------- ВИДЖЕТ ПРОГРЕССА ---------- */

    var widget = document.createElement('div');
    widget.className = 'progress-widget';
    widget.innerHTML =
        '<div class="progress-header">' +
            '<span class="progress-label">Изучено</span>' +
            '<span class="progress-count"><span class="progress-done">0</span> / <span class="progress-total">0</span></span>' +
        '</div>' +
        '<div class="progress-track"><div class="progress-fill"></div></div>' +
        '<div class="progress-percent">0%</div>';

    var title = sidebar.querySelector('.sidebar-title');
    if (title) {
        sidebar.insertBefore(widget, title);
    } else {
        sidebar.insertBefore(widget, sidebar.firstChild);
    }

    var doneEl = widget.querySelector('.progress-done');
    var totalEl = widget.querySelector('.progress-total');
    var fillEl = widget.querySelector('.progress-fill');
    var percentEl = widget.querySelector('.progress-percent');

    /* Обновление виджета и подсветки ссылок */
    function updateProgress() {
        var readTopics = getPageProgress();
        var total = sidebarLinks.length;
        var done = readTopics.length;
        var percent = total > 0 ? Math.round((done / total) * 100) : 0;

        doneEl.textContent = done;
        totalEl.textContent = total;
        percentEl.textContent = percent + '%';
        fillEl.style.width = percent + '%';

        if (percent === 100) {
            fillEl.classList.add('progress-complete');
        } else {
            fillEl.classList.remove('progress-complete');
        }

        sidebarLinks.forEach(function (link) {
            var href = link.getAttribute('href');
            var id = href.replace('#', '');
            if (readTopics.indexOf(id) !== -1) {
                link.classList.add('link-read');
            } else {
                link.classList.remove('link-read');
            }
        });
    }

    /* ---------- ОТСЛЕЖИВАНИЕ ПРОЧИТАННЫХ ТЕМ ---------- */

    var visibilityTimers = {};
    var READ_TIME = 2000;

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            var id = entry.target.id;
            if (!id) return;

            if (entry.isIntersecting) {
                if (!visibilityTimers[id]) {
                    visibilityTimers[id] = setTimeout(function () {
                        markAsRead(id);
                    }, READ_TIME);
                }
            } else {
                if (visibilityTimers[id]) {
                    clearTimeout(visibilityTimers[id]);
                    visibilityTimers[id] = null;
                }
            }
        });
    }, { threshold: 0.3 });

    /* Отметить тему прочитанной */
    function markAsRead(id) {
        var readTopics = getPageProgress();
        if (readTopics.indexOf(id) === -1) {
            readTopics.push(id);
            savePageProgress(readTopics);
            updateProgress();
        }
    }

    /* Наблюдаем за заголовками, на которые ссылается сайдбар */
    sidebarLinks.forEach(function (link) {
        var href = link.getAttribute('href');
        var id = href.replace('#', '');
        var target = document.getElementById(id);
        if (target) observer.observe(target);
    });

    /* Клик по ссылке — сразу отмечаем как прочитанное */
    sidebarLinks.forEach(function (link) {
        link.addEventListener('click', function () {
            var href = link.getAttribute('href');
            var id = href.replace('#', '');
            markAsRead(id);
        });
    });

    /* ---------- КНОПКА СБРОСА ПРОГРЕССА ---------- */

    var resetBtn = document.createElement('button');
    resetBtn.className = 'progress-reset';
    resetBtn.type = 'button';
    resetBtn.textContent = 'Сбросить';
    resetBtn.title = 'Сбросить прогресс по всем страницам';
    widget.appendChild(resetBtn);

    resetBtn.addEventListener('click', function () {
        if (confirm('Сбросить весь прогресс изучения?')) {
            localStorage.removeItem(STORAGE_KEY);
            visibilityTimers = {};
            updateProgress();
        }
    });

    /* ---------- СТАРТ ---------- */

    updateProgress();

})();