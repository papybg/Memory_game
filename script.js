// script.js
document.addEventListener('DOMContentLoaded', () => {
    // <<< ПРОМЯНА: Дефиницията на темите е премахната оттук.
    
    // 🎯 DOM елементи
    const themeRadios = document.querySelectorAll('input[name="theme"]');
    const countRadios = document.querySelectorAll('input[name="count"]');
    const startGameBtn = document.getElementById('startGameBtn');
    const optionsContainer = document.getElementById('optionsContainer');

    const gameTitleEl = document.getElementById('gameTitle');
    const messageDisplay = document.getElementById('gameMessage');
    const startBtn = document.getElementById('start');
    const reloadBtn = document.getElementById('reload');
    const backToMenuBtn = document.getElementById('backToMenu');
    const allPicsEl = document.getElementById('allPics');
    const gamePicsEl = document.getElementById('gamePics');
    const containerEl = document.getElementById('container');
    const controlsEl = document.getElementById('controls');
    
    // <<< ПРОМЯНА: Създаваме празен обект, който ще бъде попълнен с данните от JSON файла.
    let ALL_THEMES = {};

    // 🎯 Променливи за състоянието на играта
    const gameState = {
        currentThemeImages: [],
        numberOfPics: 0,
        selectedGamePics: [],
        hiddenImageElement: null,
        originalHiddenImageSrc: '',
        originalHiddenImageName: '',
        awaitingChoice: false,
    };

    // Аудио елементи за успех и грешка
    const bravoAudio = new Audio('audio/bravo_uily.wav');
    const opitaiPakAudio = new Audio('audio/opitaj_pak.wav');

    // --- Функции (без промяна в тях) ---

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function updateStartButtonState() {
        const themeSelected = Array.from(themeRadios).some(r => r.checked);
        const countSelected = Array.from(countRadios).some(r => r.checked);
        startGameBtn.disabled = !(themeSelected && countSelected);
    }

    function startGame() {
        const selectedTheme = document.querySelector('input[name="theme"]:checked').value;
        gameState.numberOfPics = parseInt(document.querySelector('input[name="count"]:checked').value);
        gameState.currentThemeImages = ALL_THEMES[selectedTheme];

        gameTitleEl.textContent = `Познай ${selectedTheme.replace('_', ' ').toUpperCase()}!`;
        
        optionsContainer.classList.add('hidden');
        controlsEl.classList.remove('hidden');
        containerEl.classList.remove('hidden');

        renderGamePics();
        renderAllPics();
        resetGameState();
    }

    function renderAllPics() {
        allPicsEl.innerHTML = '';
        gameState.currentThemeImages.forEach(name => {
            const img = document.createElement('img');
            img.src = 'images/' + name;
            img.dataset.name = name;
            img.alt = name.replace('.jpg', '');
            img.addEventListener('click', chooseHandler);
            allPicsEl.appendChild(img);
        });
    }

    function renderGamePics() {
        gamePicsEl.innerHTML = ''; 
        const shuffledImages = shuffleArray([...gameState.currentThemeImages]);
        gameState.selectedGamePics = shuffledImages.slice(0, gameState.numberOfPics);

        gameState.selectedGamePics.forEach((name, idx) => {
            const img = document.createElement('img');
            img.src = 'images/' + name;
            img.dataset.idx = idx;
            img.dataset.name = name;
            img.alt = name.replace('.jpg', '');
            gamePicsEl.appendChild(img);
        });
    }
    
    function hideRandomPicture() {
        if (gameState.awaitingChoice) return;
        restoreHiddenImage();

        const hiddenIndex = Math.floor(Math.random() * gameState.numberOfPics);
        gameState.hiddenImageElement = gamePicsEl.querySelectorAll('img')[hiddenIndex]; 

        gameState.originalHiddenImageSrc = gameState.hiddenImageElement.src;
        gameState.originalHiddenImageName = gameState.hiddenImageElement.dataset.name;
        
        gameState.hiddenImageElement.classList.add('fading-out');

        setTimeout(() => {
            if (gameState.hiddenImageElement) {
                gameState.hiddenImageElement.src = 'images/hide.png';
                gameState.hiddenImageElement.dataset.name = 'hide.png';
                gameState.hiddenImageElement.alt = 'Скрита картинка';
                gameState.hiddenImageElement.classList.remove('fading-out');
            }
        }, 1500);

        gameState.awaitingChoice = true;
        startBtn.classList.add('hidden');
        showMessage('Познай кое липсва!', 'info');
    }

    function chooseHandler(e) {
        if (!gameState.awaitingChoice) return;

        const chosen = e.target.dataset.name;
        const hidden = gameState.originalHiddenImageName; 

        if (chosen === hidden) {
            showMessage('Браво, Уйли!', 'success');
            bravoAudio.currentTime = 0; 
            bravoAudio.play().catch(e => console.error("Error playing audio:", e));
            
            restoreHiddenImage();

            gameState.awaitingChoice = false;
            reloadBtn.classList.remove('hidden');
            startBtn.classList.add('hidden');
        } else {
            showMessage('Опитай пак!', 'error');
            opitaiPakAudio.currentTime = 0; 
            opitaiPakAudio.play().catch(e => console.error("Error playing audio:", e));
        }
    }

    function showMessage(text, type) {
        messageDisplay.className = 'gameMessage';
        messageDisplay.textContent = text;
        
        setTimeout(() => {
            messageDisplay.classList.add('message-animate', `message-${type}`);
        }, 10);
    }

    function restoreHiddenImage() {
        if (gameState.hiddenImageElement && gameState.originalHiddenImageSrc) {
            gameState.hiddenImageElement.src = gameState.originalHiddenImageSrc;
            gameState.hiddenImageElement.dataset.name = gameState.originalHiddenImageName;
            gameState.hiddenImageElement.alt = gameState.originalHiddenImageName.replace('.jpg', '');
            gameState.hiddenImageElement.classList.remove('fading-out');
        }
    }

    function resetGameState() {
        restoreHiddenImage();
        
        gameState.awaitingChoice = false;
        gameState.hiddenImageElement = null; 
        gameState.originalHiddenImageSrc = '';
        gameState.originalHiddenImageName = '';

        showMessage('Натисни "СКРИЙ КАРТИНА" за да започнеш.', 'info');
        
        reloadBtn.classList.add('hidden');
        startBtn.classList.remove('hidden');
        startBtn.disabled = false;
    }

    function goBackToMenu() {
        gameTitleEl.textContent = 'Познай КАРТИНКАТА!';
        controlsEl.classList.add('hidden');
        containerEl.classList.add('hidden');
        optionsContainer.classList.remove('hidden');
        showMessage('', 'info');
    }
    
    // <<< ПРОМЯНА: Основна функция, която първо зарежда темите и след това инициализира играта.
    async function initializeApp() {
        try {
            // Използваме fetch за зареждане на JSON файла
            const response = await fetch('themes.json');
            if (!response.ok) {
                // Хвърляме грешка, ако файлът не е намерен или има друг проблем
                throw new Error(`Грешка при зареждане на мрежата: ${response.statusText}`);
            }
            // Попълваме обекта с темите
            ALL_THEMES = await response.json();

            // --- Слушатели на събития ---
            // Слагаме ги тук, за да сме сигурни, че се активират СЛЕД като темите са заредени.
            themeRadios.forEach(r => r.addEventListener('change', updateStartButtonState));
            countRadios.forEach(r => r.addEventListener('change', updateStartButtonState));
            startGameBtn.addEventListener('click', startGame);
            startBtn.addEventListener('click', hideRandomPicture);
            reloadBtn.addEventListener('click', () => {
                renderGamePics();
                resetGameState();
            });
            backToMenuBtn.addEventListener('click', goBackToMenu);

            // --- Първоначална инициализация ---
            updateStartButtonState();
            
        } catch (error) {
            // Обработка на грешки, ако не успеем да заредим файла
            console.error("Неуспешно зареждане на темите:", error);
            gameTitleEl.textContent = 'ГРЕШКА';
            optionsContainer.innerHTML = `<p style="color: var(--error-color);">Нещо се обърка при зареждането на темите за играта. Моля, опитайте да презаредите страницата.</p>`;
        }
    }

    // <<< ПРОМЯНА: Извикваме новата ни основна функция, за да стартираме всичко.
    initializeApp();
});
