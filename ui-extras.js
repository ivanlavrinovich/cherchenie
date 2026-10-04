/* ============================================================
   ДОПОЛНИТЕЛЬНЫЕ ЭЛЕМЕНТЫ ИНТЕРФЕЙСА
   Кнопка «Наверх»
   ============================================================ */

(function () {

    /* Создаём кнопку */
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'scroll-top-btn';
    btn.title = 'Наверх';
    btn.setAttribute('aria-label', 'Наверх');
    btn.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M12 19 V5"/>' +
            '<path d="M5 12 L12 5 L19 12"/>' +
        '</svg>';

    /* Вставляем стили */
    var style = document.createElement('style');
    style.textContent =
        '.scroll-top-btn {' +
            'position: fixed;' +
            'right: 2rem;' +
            'bottom: 2rem;' +
            'width: 48px;' +
            'height: 48px;' +
            'border-radius: 50%;' +
            'background: linear-gradient(135deg, #1b3a5c 0%, #142438 100%);' +
            'border: 1px solid #2a4f78;' +
            'color: #8ec5f5;' +
            'display: flex;' +
            'align-items: center;' +
            'justify-content: center;' +
            'cursor: pointer;' +
            'box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);' +
            'z-index: 9997;' +
            'opacity: 0;' +
            'transform: translateY(20px) scale(0.9);' +
            'pointer-events: none;' +
            'transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);' +
        '}' +
        '.scroll-top-btn.visible {' +
            'opacity: 1;' +
            'transform: translateY(0) scale(1);' +
            'pointer-events: auto;' +
        '}' +
        '.scroll-top-btn:hover {' +
            'background: linear-gradient(135deg, #5ba3e8 0%, #4a90d9 100%);' +
            'border-color: #8ec5f5;' +
            'color: #0a1424;' +
            'transform: translateY(-3px) scale(1.05);' +
            'box-shadow: 0 10px 28px rgba(91, 163, 232, 0.5);' +
        '}' +
        '.scroll-top-btn svg {' +
            'width: 22px;' +
            'height: 22px;' +
        '}' +
        /* Если на странице есть кнопка «На главную» — сдвигаем наверх */
        '.home-float-btn ~ .scroll-top-btn, .scroll-top-btn.has-home-btn {' +
            'bottom: 6rem;' +
        '}' +
        '@media (max-width: 700px) {' +
            '.scroll-top-btn {' +
                'width: 44px;' +
                'height: 44px;' +
                'right: 1rem;' +
                'bottom: 1rem;' +
            '}' +
            '.scroll-top-btn svg {' +
                'width: 20px;' +
                'height: 20px;' +
            '}' +
            '.scroll-top-btn.has-home-btn {' +
                'bottom: 5rem;' +
            '}' +
        '}';

    document.head.appendChild(style);

    /* Проверяем, есть ли на странице кнопка «На главную» */
    var hasHomeBtn = document.querySelector('.home-float-btn');
    if (hasHomeBtn) {
        btn.classList.add('has-home-btn');
    }

    /* Вставляем кнопку в body */
    document.body.appendChild(btn);

    /* Показ / скрытие при скролле */
    var SCROLL_THRESHOLD = 400;

    function updateVisibility() {
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > SCROLL_THRESHOLD) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    }

    /* Клик — плавный скролл наверх */
    btn.addEventListener('click', function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    /* Слушаем скролл */
    window.addEventListener('scroll', updateVisibility, { passive: true });
    window.addEventListener('resize', updateVisibility);

    /* Первый расчёт */
    updateVisibility();

})();