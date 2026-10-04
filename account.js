/* ============================================================
   СИСТЕМА АККАУНТОВ (localStorage)
   Без сервера. Все данные хранятся в браузере пользователя.
   ============================================================ */

(function () {

    /* Ключи в localStorage */
    var USERS_KEY = 'users_v1';           /* все аккаунты */
    var SESSION_KEY = 'current_user_v1';  /* текущая сессия */
    var PROGRESS_KEY = 'study_progress_v1';
    var GAMES_KEY = 'games_history_v1';

    /* Максимальный размер аватарки — 200 КБ */
    var MAX_AVATAR_SIZE = 200 * 1024;

    /* ============================================================
       РАБОТА С ХРАНИЛИЩЕМ
       ============================================================ */

    function readJSON(key, fallback) {
        try {
            var raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (e) {
            return fallback;
        }
    }

    function writeJSON(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    /* ============================================================
       ПРОСТОЕ ХЕШИРОВАНИЕ ПАРОЛЯ
       (не криптография, но для школьного проекта достаточно)
       ============================================================ */

    function hashPassword(password) {
        var hash = 0;
        var salt = 'chernie_2026_salt';
        var str = salt + password + salt;

        for (var i = 0; i < str.length; i++) {
            var char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }

        return 'h' + Math.abs(hash).toString(36);
    }

    /* ============================================================
       ПОЛЬЗОВАТЕЛИ
       ============================================================ */

    function getAllUsers() {
        return readJSON(USERS_KEY, {});
    }

    function saveAllUsers(users) {
        writeJSON(USERS_KEY, users);
    }

    /* Регистрация нового пользователя */
    function register(name, password) {
        name = (name || '').trim();

        if (!name || name.length < 2 || name.length > 20) {
            return { ok: false, error: 'Ник должен быть от 2 до 20 символов' };
        }

        if (!password || password.length < 4) {
            return { ok: false, error: 'Пароль должен быть минимум 4 символа' };
        }

        var users = getAllUsers();
        var lower = name.toLowerCase();

        /* Проверяем, не занят ли ник */
        for (var key in users) {
            if (users.hasOwnProperty(key) && key.toLowerCase() === lower) {
                return { ok: false, error: 'Такой ник уже занят' };
            }
        }

        /* Создаём пользователя */
        users[name] = {
            name: name,
            passHash: hashPassword(password),
            avatar: null,
            createdAt: Date.now(),
            lastLogin: Date.now(),
            stats: {
                themesRead: 0,
                gamesPlayed: 0,
                gamesWon: 0,
                downloads: 0
            }
        };

        saveAllUsers(users);
        setCurrentUser(name);

        return { ok: true, name: name };
    }

    /* Вход */
    function login(name, password) {
        name = (name || '').trim();
        var users = getAllUsers();

        /* Ищем пользователя без учёта регистра */
        var actualName = null;
        for (var key in users) {
            if (users.hasOwnProperty(key) && key.toLowerCase() === name.toLowerCase()) {
                actualName = key;
                break;
            }
        }

        if (!actualName) {
            return { ok: false, error: 'Пользователь не найден' };
        }

        if (users[actualName].passHash !== hashPassword(password)) {
            return { ok: false, error: 'Неверный пароль' };
        }

        /* Обновляем время последнего входа */
        users[actualName].lastLogin = Date.now();
        saveAllUsers(users);
        setCurrentUser(actualName);

        return { ok: true, name: actualName };
    }

    /* Выход */
    function logout() {
        localStorage.removeItem(SESSION_KEY);
    }

    /* Текущий пользователь */
    function getCurrentUser() {
        var name = localStorage.getItem(SESSION_KEY);
        if (!name) return null;
        var users = getAllUsers();
        return users[name] || null;
    }

    function setCurrentUser(name) {
        localStorage.setItem(SESSION_KEY, name);
    }

    /* Обновление данных текущего пользователя */
    function updateUser(patch) {
        var user = getCurrentUser();
        if (!user) return false;

        var users = getAllUsers();
        var current = users[user.name];
        if (!current) return false;

        for (var key in patch) {
            if (patch.hasOwnProperty(key)) current[key] = patch[key];
        }

        saveAllUsers(users);
        return true;
    }

    /* ============================================================
       АВАТАРКА
       ============================================================ */

    /* Сжимаем картинку до 200x200 перед сохранением */
    function processAvatar(file, callback) {
        if (!file) {
            callback({ ok: false, error: 'Файл не выбран' });
            return;
        }

        if (!file.type.match(/^image\//)) {
            callback({ ok: false, error: 'Это не картинка' });
            return;
        }

        if (file.size > 3 * 1024 * 1024) {
            callback({ ok: false, error: 'Файл слишком большой (макс. 3 МБ)' });
            return;
        }

        var reader = new FileReader();

        reader.onload = function (e) {
            var img = new Image();

            img.onload = function () {
                /* Ресайз через canvas */
                var maxSide = 200;
                var scale = Math.min(maxSide / img.width, maxSide / img.height, 1);
                var w = Math.round(img.width * scale);
                var h = Math.round(img.height * scale);

                var canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;

                var ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);

                /* Пробуем разные качества, чтобы уложиться в лимит */
                var dataUrl = canvas.toDataURL('image/jpeg', 0.85);

                if (dataUrl.length > MAX_AVATAR_SIZE) {
                    dataUrl = canvas.toDataURL('image/jpeg', 0.6);
                }

                if (dataUrl.length > MAX_AVATAR_SIZE) {
                    callback({ ok: false, error: 'Не удалось сжать картинку' });
                    return;
                }

                callback({ ok: true, dataUrl: dataUrl });
            };

            img.onerror = function () {
                callback({ ok: false, error: 'Ошибка чтения картинки' });
            };

            img.src = e.target.result;
        };

        reader.onerror = function () {
            callback({ ok: false, error: 'Ошибка чтения файла' });
        };

        reader.readAsDataURL(file);
    }

    /* ============================================================
       ДОСТИЖЕНИЯ
       ============================================================ */

    /* Список всех достижений с проверкой условий */
    function getAchievements() {
        var user = getCurrentUser();
        if (!user) return [];

        var progress = readJSON(PROGRESS_KEY, {});
        var gamesHistory = readJSON(GAMES_KEY, []);

        /* Считаем, сколько всего тем прочитано */
        var totalRead = 0;
        for (var page in progress) {
            if (progress.hasOwnProperty(page)) {
                totalRead += progress[page].length;
            }
        }

        /* Считаем пройденные игры */
        var gamesPlayed = gamesHistory.length;
        var gamesWon = gamesHistory.filter(function (g) { return g.won; }).length;

        return [
            {
                id: 'first-step',
                title: 'Первый шаг',
                desc: 'Зарегистрировался на сайте',
                icon: '🚀',
                unlocked: true
            },
            {
                id: 'avatar',
                title: 'Лицо проекта',
                desc: 'Загрузил аватарку',
                icon: '🎨',
                unlocked: !!user.avatar
            },
            {
                id: 'read-5',
                title: 'Начинающий',
                desc: 'Прочитал 5 тем',
                icon: '📖',
                unlocked: totalRead >= 5
            },
            {
                id: 'read-15',
                title: 'Знаток',
                desc: 'Прочитал 15 тем',
                icon: '🎓',
                unlocked: totalRead >= 15
            },
            {
                id: 'read-30',
                title: 'Мастер черчения',
                desc: 'Прочитал 30 тем',
                icon: '🏆',
                unlocked: totalRead >= 30
            },
            {
                id: 'game-1',
                title: 'Игрок',
                desc: 'Прошёл первую игру',
                icon: '🎮',
                unlocked: gamesPlayed >= 1
            },
            {
                id: 'game-5',
                title: 'Азартный',
                desc: 'Сыграл 5 раз',
                icon: '🎯',
                unlocked: gamesPlayed >= 5
            },
            {
                id: 'game-win-3',
                title: 'Победитель',
                desc: 'Выиграл 3 игры',
                icon: '🥇',
                unlocked: gamesWon >= 3
            }
        ];
    }

    /* ============================================================
       ПЛАВАЮЩАЯ КНОПКА АККАУНТА
       ============================================================ */

    /* Проверяем, не на странице ли аккаунта мы находимся */
    var currentFile = window.location.pathname.split('/').pop() || 'index.html';
    var isAccountPage = currentFile === 'account.html';

    /* На самой странице аккаунта кнопку не показываем */
    if (!isAccountPage) {

        var user = getCurrentUser();

        /* Создаём кнопку-кружок */
        var accBtn = document.createElement('a');
        accBtn.href = 'account.html';
        accBtn.className = 'account-float-btn';
        accBtn.title = user ? ('Профиль: ' + user.name) : 'Войти в аккаунт';

        /* Внутри — либо аватарка, либо иконка человека */
        if (user && user.avatar) {
            accBtn.innerHTML = '<img src="' + user.avatar + '" alt="' + user.name + '">';
        } else {
            accBtn.innerHTML =
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                    '<circle cx="12" cy="8" r="4"/>' +
                    '<path d="M4 21 C4 16 8 14 12 14 C16 14 20 16 20 21"/>' +
                '</svg>';
        }

        /* Вставляем стили и кнопку */
        var style = document.createElement('style');
        style.textContent =
            '.account-float-btn {' +
                'position: fixed;' +
                'top: 1.5rem;' +
                'right: 1.5rem;' +
                'width: 52px;' +
                'height: 52px;' +
                'border-radius: 50%;' +
                'background: linear-gradient(135deg, #1b3a5c 0%, #142438 100%);' +
                'border: 2px solid #2a4f78;' +
                'display: flex;' +
                'align-items: center;' +
                'justify-content: center;' +
                'color: #8ec5f5;' +
                'text-decoration: none;' +
                'box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);' +
                'z-index: 9998;' +
                'transition: all 0.25s;' +
                'cursor: pointer;' +
                'overflow: hidden;' +
                'animation: accFadeIn 0.6s ease-out 0.5s backwards;' +
            '}' +
            '.account-float-btn img {' +
                'width: 100%;' +
                'height: 100%;' +
                'object-fit: cover;' +
            '}' +
            '.account-float-btn svg {' +
                'width: 26px;' +
                'height: 26px;' +
            '}' +
            '.account-float-btn:hover {' +
                'border-color: #5ba3e8;' +
                'transform: scale(1.08);' +
                'box-shadow: 0 8px 28px rgba(91, 163, 232, 0.5);' +
            '}' +
            '@keyframes accFadeIn {' +
                'from { opacity: 0; transform: translateY(-10px); }' +
                'to   { opacity: 1; transform: translateY(0); }' +
            '}' +
            '@media (max-width: 700px) {' +
                '.account-float-btn {' +
                    'width: 44px;' +
                    'height: 44px;' +
                    'top: 1rem;' +
                    'right: 1rem;' +
                '}' +
                '.account-float-btn svg {' +
                    'width: 22px;' +
                    'height: 22px;' +
                '}' +
            '}';

        document.head.appendChild(style);
        document.body.appendChild(accBtn);
    }

    /* ============================================================
       ЭКСПОРТ В ГЛОБАЛЬНУЮ ОБЛАСТЬ
       ============================================================ */

    window.AccountSystem = {
        register: register,
        login: login,
        logout: logout,
        getCurrentUser: getCurrentUser,
        getAllUsers: getAllUsers,
        updateUser: updateUser,
        processAvatar: processAvatar,
        getAchievements: getAchievements,
        readJSON: readJSON,
        writeJSON: writeJSON,
        PROGRESS_KEY: PROGRESS_KEY,
        GAMES_KEY: GAMES_KEY
    };

})();