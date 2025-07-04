// script.js
document.addEventListener('DOMContentLoaded', () => {
    // 🎯 Дефиниции на темите и техните изображения
    const ALL_THEMES = {
        превозни_средства: ['bus.jpg', 'airplane.jpg', 'firetruck.jpg', 'train.jpg', 'truck.jpg'],
        animals: ['dog.jpg', 'cat.jpg', 'lion.jpg', 'elephant.jpg', 'monkey.jpg'],
        flowers: ['rose.jpg', 'tulip.jpg', 'lily.jpg', 'daisy.jpg', 'sunflower.jpg']
    };

    // 🎯 DOM елементи
    const themeRadios = document.querySelectorAll('input[name="theme"]');
    const countRadios = document.querySelectorAll('input[name="count"]');
    const startGameBtn = document.getElementById('startGameBtn');
    const optionsContainer = document.getElementById('optionsContainer');

    const gameTitleEl = document.getElementById('gameTitle');
    const messageDisplay = document.getElementById('gameMessage');
    const startBtn = document.getElementById('start');
    const reloadBtn = document.getElementById('reload');
    const allPicsEl = document.getElementById('allPics');
    const gamePicsEl = document.getElementById('gamePics');
    const containerEl = document.getElementById('container');

    // 🎯 Променливи за състоянието на играта
    let currentThemeImages = [];
    let numberOfPics = 0;
    let selectedGamePics = [];
    let hiddenImageElement = null; // Референция към img елемента, който ще бъде заменен с hide.png
    let hiddenIndex = null;
    let originalHiddenImageSrc = ''; // Ще съхранява оригиналния src на скритата картинка
    let originalHiddenImageName = ''; // Ще съхранява оригиналното име на скритата картинка (от data-name)
    let awaitingChoice = false;
    // hideOverlayElement вече НЕ се използва, тъй като заместваме src директно

    // --- Функции ---

    function updateStartButtonState() {
        const themeSelected = Array.from(themeRadios).some(r => r.checked);
        const countSelected = Array.from(countRadios).some(r => r.checked);
        startGameBtn.disabled = !(themeSelected && countSelected);
    }

    function startGame() {
        const selectedTheme = document.querySelector('input[name="theme"]:checked').value;
        numberOfPics = parseInt(document.querySelector('input[name="count"]:checked').value);

        currentThemeImages = ALL_THEMES[selectedTheme];

        gameTitleEl.textContent = `Познай ${selectedTheme.replace('_', ' ').toUpperCase()}!`;
        
        optionsContainer.classList.add('hidden');
        startGameBtn.classList.add('hidden');

        document.getElementById('controls').classList.remove('hidden');
        containerEl.classList.remove('hidden');

        renderGamePics();
        renderAllPics();
        resetGameState(); // Нулираме състоянието веднага след рендерирането
    }

    function renderAllPics() {
        allPicsEl.innerHTML = '';
        currentThemeImages.forEach(name => {
            const img = document.createElement('img');
            img.src = 'images/' + name;
            img.dataset.name = name;
            img.alt = name.replace('.jpg', '');
            img.addEventListener('click', chooseHandler);
            allPicsEl.appendChild(img);
        });
    }

    function renderGamePics() {
        gamePicsEl.innerHTML = ''; // Изчистваме старите картинки

        const shuffledImages = [...currentThemeImages].sort(() => 0.5 - Math.random());
        selectedGamePics = shuffledImages.slice(0, numberOfPics);

        selectedGamePics.forEach((name, idx) => {
            const img = document.createElement('img');
            img.src = 'images/' + name;
            img.dataset.idx = idx;
            img.dataset.name = name; // Добавяме data-name за всяка картинка
            img.alt = name.replace('.jpg', '');
            gamePicsEl.appendChild(img);
        });
        // Вече НЯМА нужда да създаваме hideOverlayElement тук
    }

    // Функция за скриване на произволна картинка (чрез директна подмяна на src)
    function hideRandomPicture() {
        if (awaitingChoice) return;

        // Ако вече има скрита картинка от предишен опит без познаване, върни я видима
        if (hiddenImageElement && hiddenImageElement.src.includes('hide.png')) {
            hiddenImageElement.src = originalHiddenImageSrc;
            hiddenImageElement.dataset.name = originalHiddenImageName;
            hiddenImageElement.alt = originalHiddenImageName.replace('.jpg', '');
        }

        hiddenIndex = Math.floor(Math.random() * numberOfPics);
        hiddenImageElement = gamePicsEl.querySelectorAll('img')[hiddenIndex]; // Взимаме референция към картинката, която ще СКРИЕМ

        // Съхраняваме оригиналните данни, преди да ги променим
        originalHiddenImageSrc = hiddenImageElement.src;
        originalHiddenImageName = hiddenImageElement.dataset.name;

        // *КЛЮЧОВА ПРОМЯНА*: Директно сменяме src на оригиналната картинка
        hiddenImageElement.src = 'images/hide.png';
        hiddenImageElement.dataset.name = 'hide.png'; // Важно: Обновяваме и data-name за да го разпознаваме
        hiddenImageElement.alt = 'Скрита картинка';
        
        awaitingChoice = true;
        startBtn.classList.add('hidden');
        showMessage('Познай кое липсва!', 'info');
    }

    // Обработка на избора на играча от долните картинки
    function chooseHandler(e) {
        if (!awaitingChoice) return;

        const chosen = e.target.dataset.name;
        // Използваме originalHiddenImageName, защото hiddenImageElement.dataset.name вече е "hide.png"
        const hidden = originalHiddenImageName; 

        if (chosen === hidden) {
            showMessage('Браво, Уйли!', 'success');
            
            // *КЛЮЧОВА ПРОМЯНА*: Връщаме оригиналната картинка
            if (hiddenImageElement) {
                hiddenImageElement.src = originalHiddenImageSrc;
                hiddenImageElement.dataset.name = originalHiddenImageName;
                hiddenImageElement.alt = originalHiddenImageName.replace('.jpg', '');
            }

            awaitingChoice = false;
            reloadBtn.classList.remove('hidden');
            startBtn.classList.add('hidden');
        } else {
            showMessage('Опитай пак!', 'error');
        }
    }

    function showMessage(text, type) {
        messageDisplay.classList.remove('message-animate', 'message-success', 'message-error');
        messageDisplay.style.opacity = 0;
        messageDisplay.style.transform = 'scale(0.8)';

        messageDisplay.textContent = text;
        
        setTimeout(() => {
            messageDisplay.classList.add('message-animate', `message-${type}`);
        }, 50);
    }

    function resetGameState() {
        awaitingChoice = false;
        hiddenIndex = null;
        
        // *КОРЕКЦИЯ*: Ако имаше скрита картинка с hide.png, върни я оригинална
        if (hiddenImageElement && hiddenImageElement.src.includes('hide.png')) {
            hiddenImageElement.src = originalHiddenImageSrc;
            hiddenImageElement.dataset.name = originalHiddenImageName;
            hiddenImageElement.alt = originalHiddenImageName.replace('.jpg', '');
        }
        
        // Нулираме референциите за чисто състояние
        hiddenImageElement = null; 
        originalHiddenImageSrc = '';
        originalHiddenImageName = '';

        showMessage('Натисни "СКРИЙ КАРТИНА" за да започнеш.', 'info');
        
        reloadBtn.classList.add('hidden');
        startBtn.classList.remove('hidden');
        startBtn.disabled = false;
    }

    // --- Слушатели на събития ---
    themeRadios.forEach(r => r.addEventListener('change', updateStartButtonState));
    countRadios.forEach(r => r.addEventListener('change', updateStartButtonState));
    startGameBtn.addEventListener('click', startGame);
    startBtn.addEventListener('click', hideRandomPicture);
    reloadBtn.addEventListener('click', () => {
        showMessage('', 'info'); // Изчиства съобщението
        renderGamePics(); // Това ще пресъздаде всички картинки и ще реши проблема със скрита картинка
        resetGameState(); // Гарантира чисто състояние
    });

    // --- Първоначална инициализация при зареждане на страницата ---
    updateStartButtonState(); 

    // Уверете се, че контролите и контейнерът са скрити при първоначално зареждане
    document.getElementById('controls').classList.add('hidden');
    containerEl.classList.add('hidden');
});
