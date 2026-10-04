/* ============================================================
   МИНИ-ИГРЫ ПО ЧЕРЧЕНИЮ
   Викторина, найди пару, правда/ложь
   ============================================================ */

(function () {

    /* ============================================================
       ИГРА 1. ВИКТОРИНА
       ============================================================ */

    var QUIZ_POOL = [
        { q: 'Какой линией показывают невидимый контур детали?', a: ['Сплошной толстой', 'Штриховой', 'Штрихпунктирной', 'Волнистой'], c: 1 },
        { q: 'Какой формат имеет размеры 210 × 297 мм?', a: ['А1', 'А2', 'А3', 'А4'], c: 3 },
        { q: 'Какой масштаб называется натуральным?', a: ['1:2', '2:1', '1:1', '1:10'], c: 2 },
        { q: 'Какой угол наклона у чертёжного шрифта типа Б?', a: ['45°', '60°', '75°', '90°'], c: 2 },
        { q: 'Где на чертеже располагается основная надпись?', a: ['В левом верхнем углу', 'В правом нижнем углу', 'По центру', 'В правом верхнем углу'], c: 1 },
        { q: 'Какая линия используется для осевых и центровых линий?', a: ['Штриховая', 'Сплошная тонкая', 'Штрихпунктирная', 'Волнистая'], c: 2 },
        { q: 'Что такое сопряжение?', a: ['Пересечение линий', 'Плавный переход одной линии в другую', 'Разрыв линии', 'Параллельные линии'], c: 1 },
        { q: 'Какой буквой обозначается радиус?', a: ['Ø', 'R', 'S', 'C'], c: 1 },
        { q: 'Сколько основных видов даёт комплексный чертёж?', a: ['3', '4', '6', '8'], c: 2 },
        { q: 'Как называется тело, образованное вращением прямоугольника вокруг стороны?', a: ['Конус', 'Шар', 'Цилиндр', 'Тор'], c: 2 },
        { q: 'Что означает запись М 1:2 на поле чертежа?', a: ['Масштаб уменьшения', 'Масштаб увеличения', 'Натуральный', 'Условное обозначение'], c: 0 },
        { q: 'Какой толщины должна быть сплошная основная толстая линия?', a: ['0,1 мм', '0,5–1,4 мм', '2–3 мм', '0,3 мм'], c: 1 },
        { q: 'Как называется чертёж, выполненный от руки с натуры?', a: ['Сборочный', 'Эскиз', 'Схема', 'Разрез'], c: 1 },
        { q: 'Что показывает сечение?', a: ['Внешний вид детали', 'Фигуру в секущей плоскости', 'Всю деталь целиком', 'Размеры детали'], c: 1 },
        { q: 'Как наносят размеры диаметров на окружностях Ø40 мм и больше?', a: ['Числа и стрелки внутри окружности', 'Числа снаружи', 'Стрелки снаружи', 'Без стрелок'], c: 0 }
    ];

    var quizWrap = document.getElementById('game-quiz');
    if (!quizWrap) return;

    var quizQuestionEl = document.getElementById('quiz-question');
    var quizAnswersEl = document.getElementById('quiz-answers');
    var quizCurrentEl = document.getElementById('quiz-current');
    var quizTotalEl = document.getElementById('quiz-total');
    var quizScoreEl = document.getElementById('quiz-score');
    var quizFillEl = document.getElementById('quiz-fill');
    var quizResultEl = document.getElementById('quiz-result');
    var quizRestartBtn = document.getElementById('quiz-restart');

    var quizQuestions = [];
    var quizIndex = 0;
    var quizScore = 0;
    var quizAnswered = false;

    function shuffle(arr) {
        var copy = arr.slice();
        for (var i = copy.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = copy[i];
            copy[i] = copy[j];
            copy[j] = tmp;
        }
        return copy;
    }

    function startQuiz() {
        quizQuestions = shuffle(QUIZ_POOL).slice(0, 10);
        quizIndex = 0;
        quizScore = 0;
        quizScoreEl.textContent = '0';
        quizResultEl.textContent = '';
        quizResultEl.className = 'quiz-result';
        quizRestartBtn.style.display = 'none';
        quizTotalEl.textContent = quizQuestions.length;
        showQuizQuestion();
    }

    function showQuizQuestion() {
        if (quizIndex >= quizQuestions.length) {
            endQuiz();
            return;
        }

        var q = quizQuestions[quizIndex];
        quizCurrentEl.textContent = quizIndex + 1;
        quizQuestionEl.textContent = q.q;
        quizAnswersEl.innerHTML = '';
        quizAnswered = false;

        var percent = (quizIndex / quizQuestions.length) * 100;
        quizFillEl.style.width = percent + '%';

        q.a.forEach(function (text, i) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'quiz-answer';
            btn.textContent = text;
            btn.dataset.index = i;
            btn.addEventListener('click', function () { onQuizAnswer(i, btn); });
            quizAnswersEl.appendChild(btn);
        });
    }

    function onQuizAnswer(chosen, btn) {
        if (quizAnswered) return;
        quizAnswered = true;

        var q = quizQuestions[quizIndex];
        var buttons = quizAnswersEl.querySelectorAll('.quiz-answer');

        buttons.forEach(function (b) {
            var i = parseInt(b.dataset.index, 10);
            if (i === q.c) b.classList.add('answer-correct');
            if (i === chosen && chosen !== q.c) b.classList.add('answer-wrong');
            b.disabled = true;
        });

        if (chosen === q.c) {
            quizScore++;
            quizScoreEl.textContent = quizScore;
        }

        setTimeout(function () {
            quizIndex++;
            showQuizQuestion();
        }, 1200);
    }

    function endQuiz() {
        quizFillEl.style.width = '100%';
        quizQuestionEl.textContent = 'Викторина завершена!';
        quizAnswersEl.innerHTML = '';

        var percent = Math.round((quizScore / quizQuestions.length) * 100);
        var message = '';

        if (percent === 100) message = 'Идеально! Ты знаешь материал на отлично.';
        else if (percent >= 80) message = 'Отличный результат!';
        else if (percent >= 60) message = 'Хорошо, но есть что подтянуть.';
        else if (percent >= 40) message = 'Неплохо, но стоит повторить теорию.';
        else message = 'Попробуй ещё раз, почитай теорию внимательнее.';

        quizResultEl.textContent = 'Правильных ответов: ' + quizScore + ' из ' + quizQuestions.length + '. ' + message;
        quizResultEl.className = 'quiz-result show';
        quizRestartBtn.style.display = 'inline-block';
    }

    quizRestartBtn.addEventListener('click', startQuiz);
    startQuiz();

    /* ============================================================
       ИГРА 2. НАЙДИ ПАРУ
       ============================================================ */

    var MATCH_PAIRS = [
        { left: 'Сплошная толстая основная', right: 'Видимый контур' },
        { left: 'Штриховая', right: 'Невидимый контур' },
        { left: 'Штрихпунктирная', right: 'Осевые и центровые линии' },
        { left: 'Сплошная тонкая', right: 'Выносные и размерные линии' },
        { left: 'Волнистая', right: 'Линия обрыва' },
        { left: 'Разомкнутая', right: 'Обозначение секущей плоскости' }
    ];

    var matchLeftEl = document.getElementById('match-left');
    var matchRightEl = document.getElementById('match-right');
    var matchStatusEl = document.getElementById('match-status');
    var matchRestartBtn = document.getElementById('match-restart');

    var selectedLeft = null;
    var selectedRight = null;
    var matchedCount = 0;

    function startMatch() {
        selectedLeft = null;
        selectedRight = null;
        matchedCount = 0;
        matchStatusEl.textContent = 'Найди пару для каждого элемента.';
        matchStatusEl.className = 'match-status';

        var lefts = shuffle(MATCH_PAIRS.map(function (p, i) { return { text: p.left, id: i }; }));
        var rights = shuffle(MATCH_PAIRS.map(function (p, i) { return { text: p.right, id: i }; }));

        matchLeftEl.innerHTML = '';
        matchRightEl.innerHTML = '';

        lefts.forEach(function (item) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'match-card';
            btn.textContent = item.text;
            btn.dataset.id = item.id;
            btn.dataset.side = 'left';
            btn.addEventListener('click', function () { onMatchClick(btn); });
            matchLeftEl.appendChild(btn);
        });

        rights.forEach(function (item) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'match-card';
            btn.textContent = item.text;
            btn.dataset.id = item.id;
            btn.dataset.side = 'right';
            btn.addEventListener('click', function () { onMatchClick(btn); });
            matchRightEl.appendChild(btn);
        });
    }

    function onMatchClick(card) {
        if (card.classList.contains('matched')) return;

        var side = card.dataset.side;

        if (side === 'left') {
            if (selectedLeft) selectedLeft.classList.remove('selected');
            selectedLeft = card;
            card.classList.add('selected');
        } else {
            if (selectedRight) selectedRight.classList.remove('selected');
            selectedRight = card;
            card.classList.add('selected');
        }

        if (selectedLeft && selectedRight) checkMatch();
    }

    function checkMatch() {
        var leftId = selectedLeft.dataset.id;
        var rightId = selectedRight.dataset.id;

        if (leftId === rightId) {
            selectedLeft.classList.add('matched', 'match-correct');
            selectedRight.classList.add('matched', 'match-correct');
            selectedLeft.classList.remove('selected');
            selectedRight.classList.remove('selected');
            matchedCount++;

            if (matchedCount === MATCH_PAIRS.length) {
                matchStatusEl.textContent = '🎉 Все пары найдены! Отлично!';
                matchStatusEl.className = 'match-status complete';
            } else {
                matchStatusEl.textContent = 'Верно! Осталось: ' + (MATCH_PAIRS.length - matchedCount);
                matchStatusEl.className = 'match-status correct';
            }

            selectedLeft = null;
            selectedRight = null;
        } else {
            var l = selectedLeft;
            var r = selectedRight;
            l.classList.add('match-wrong');
            r.classList.add('match-wrong');
            matchStatusEl.textContent = 'Не совпало, попробуй ещё.';
            matchStatusEl.className = 'match-status wrong';

            setTimeout(function () {
                l.classList.remove('match-wrong', 'selected');
                r.classList.remove('match-wrong', 'selected');
            }, 800);

            selectedLeft = null;
            selectedRight = null;
        }
    }

    matchRestartBtn.addEventListener('click', startMatch);
    startMatch();

    /* ============================================================
       ИГРА 3. ПРАВДА ИЛИ ЛОЖЬ
       ============================================================ */

    var TF_POOL = [
        { s: 'Штриховая линия используется для невидимого контура.', t: true },
        { s: 'Основная надпись располагается в левом верхнем углу чертежа.', t: false },
        { s: 'Масштаб 1:1 называется натуральным.', t: true },
        { s: 'Угол наклона чертёжного шрифта типа Б равен 45°.', t: false },
        { s: 'Сопряжение — это плавный переход одной линии в другую.', t: true },
        { s: 'Формат А4 имеет размеры 210 × 297 мм.', t: true },
        { s: 'Осевые линии вычерчивают штриховой линией.', t: false },
        { s: 'Сплошная тонкая линия используется для размерных линий.', t: true },
        { s: 'Разрез показывает только фигуру в секущей плоскости.', t: false },
        { s: 'Куб — это тело, ограниченное шестью квадратами.', t: true },
        { s: 'Цилиндр образован вращением треугольника вокруг катета.', t: false },
        { s: 'Диаметр на чертежах обозначается буквой R.', t: false },
        { s: 'Штрихпунктирная линия выводится за контур изображения на 2 мм.', t: true },
        { s: 'Пирамида имеет два основания.', t: false },
        { s: 'Натуральная величина обозначается масштабом 1:1.', t: true }
    ];

    var tfStatementEl = document.getElementById('tf-statement');
    var tfTrueBtn = document.getElementById('tf-true');
    var tfFalseBtn = document.getElementById('tf-false');
    var tfResultEl = document.getElementById('tf-result');
    var tfCountEl = document.getElementById('tf-count');
    var tfScoreEl = document.getElementById('tf-score');

    var tfQuestions = [];
    var tfIndex = 0;
    var tfScore = 0;
    var tfAnswered = false;

    function startTF() {
        tfQuestions = shuffle(TF_POOL).slice(0, 10);
        tfIndex = 0;
        tfScore = 0;
        tfCountEl.textContent = '0';
        tfScoreEl.textContent = '0';
        tfResultEl.textContent = '';
        tfResultEl.className = 'tf-result';
        showTFQuestion();
    }

    function showTFQuestion() {
        if (tfIndex >= tfQuestions.length) {
            endTF();
            return;
        }

        tfStatementEl.textContent = tfQuestions[tfIndex].s;
        tfResultEl.textContent = '';
        tfResultEl.className = 'tf-result';
        tfAnswered = false;

        tfTrueBtn.disabled = false;
        tfFalseBtn.disabled = false;
        tfTrueBtn.classList.remove('correct', 'wrong');
        tfFalseBtn.classList.remove('correct', 'wrong');
    }

    function onTFAnswer(userSaysTrue) {
        if (tfAnswered) return;
        tfAnswered = true;

        var q = tfQuestions[tfIndex];
        var isCorrect = (userSaysTrue === q.t);

        if (q.t) tfTrueBtn.classList.add('correct');
        else tfFalseBtn.classList.add('correct');

        if (!isCorrect) {
            if (userSaysTrue) tfTrueBtn.classList.add('wrong');
            else tfFalseBtn.classList.add('wrong');
        } else {
            tfScore++;
            tfScoreEl.textContent = tfScore;
        }

        tfCountEl.textContent = tfIndex + 1;
        tfResultEl.textContent = isCorrect ? '✔ Верно!' : '✘ Неверно.';
        tfResultEl.className = 'tf-result show ' + (isCorrect ? 'good' : 'bad');

        tfTrueBtn.disabled = true;
        tfFalseBtn.disabled = true;

        setTimeout(function () {
            tfIndex++;
            showTFQuestion();
        }, 1200);
    }

    function endTF() {
        tfStatementEl.textContent = 'Игра завершена!';
        var percent = Math.round((tfScore / tfQuestions.length) * 100);
        var msg = '';
        if (percent === 100) msg = 'Идеально!';
        else if (percent >= 80) msg = 'Отличный результат!';
        else if (percent >= 60) msg = 'Хорошо.';
        else msg = 'Стоит повторить материал.';
        tfResultEl.textContent = 'Правильных ответов: ' + tfScore + ' из ' + tfQuestions.length + '. ' + msg;
        tfResultEl.className = 'tf-result show good';
    }

    tfTrueBtn.addEventListener('click', function () { onTFAnswer(true); });
    tfFalseBtn.addEventListener('click', function () { onTFAnswer(false); });

    startTF();

})();