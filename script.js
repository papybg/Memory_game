document.addEventListener('DOMContentLoaded', () => {
    // --- 1. КОНФИГУРАЦИЯ ---
    const ALL_THEMES = {
        превозни_средства: [
            { id: 'bus', image: 'images/bus.jpg', sound: 'audio/object_sounds/bus.mp3' },
            { id: 'airplane', image: 'images/airplane.jpg', sound: 'audio/object_sounds/airplane.mp3' },
            { id: 'firetruck', image: 'images/firetruck.jpg', sound: 'audio/object_sounds/firetruck.mp3' },
            { id: 'train', image: 'images/train.jpg', sound: 'audio/object_sounds/train.mp3' },
            { id: 'truck', image: 'images/truck.jpg', sound: 'audio/object_sounds/truck.mp3' }
        ],
        animals: [
            { id: 'dog', image: 'images/animals/dog.jpg', sound: 'audio/object_sounds/dog.mp3' },
            { id: 'cat', image: 'images/animals/cat.jpg', sound: 'audio/object_sounds/cat.mp3' },
            { id: 'lion', image: 'images/animals/lion.jpg', sound: 'audio/object_sounds/lion.mp3' },
            { id: 'elephant', image: 'images/animals/elephant.jpg', sound: 'audio/object_sounds/elephant.mp3' },
            { id: 'monkey', image: 'images/animals/monkey.jpg', sound: 'audio/object_sounds/monkey.mp3' }
        ],
        flowers: [
             { id: 'rose', image: 'images/flowers/rose.jpg', sound: 'audio/object_sounds/rose_magic.mp3' },
             { id: 'tulip', image: 'images/flowers/tulip.jpg', sound: 'audio/object_sounds/tulip_magic.mp3' },
             { id: 'lily', image: 'images/flowers/lily.jpg', sound: 'audio/object_sounds/lily_magic.mp3' },
             { id: 'daisy', image: 'images/flowers/daisy.jpg', sound: 'audio/object_sounds/daisy_magic.mp3' },
             { id: 'sunflower', image: 'images/flowers/sunflower.jpg', sound: 'audio/object_sounds/sunflower_magic.mp3' }
        ],
        птици: [
            // ... добави птиците тук
        ]
    };
    const GAMES_TO_UNLOCK = 30;

    // --- 2. DOM ЕЛЕМЕНТИ ---
    const themeRadios = document.querySelectorAll('input[name="theme"]');
    const birdThemeRadio = document.querySelector('input[value="птици"]');
    const startGameBtn = document.getElementById('startGameBtn');
    const optionsContainer = document.getElementById('optionsContainer');
    const gameTitleEl = document.getElementById('gameTitle');
    const messageDisplay = document.getElementById('gameMessage');
    const controlsEl = document.getElementById('controls');
    const startBtn = document.getElementById('start');
    const reloadBtn = document.getElementById('reload');
    const allPicsEl = document.getElementById('allPics');
    const gamePicsEl = document.getElementById('gamePics');
    const containerEl = document.getElementById('container');

    // --- 3. СЪСТОЯНИЕ НА ИГРАТА ---
    const gameState = {
        currentThemeKey: null,
        selectedGamePics: [],
        hiddenCardElement: null,
        originalPicData: null,
        awaitingChoice: false,
    };

    // --- 4. АУДИО ---
    const bravoAudio = new Audio('audio/bravo_uily.wav'); 
    const opitaiPakAudio = new Audio('audio/opitaj_pak.wav');

    // --- 5. ОСНОВНИ ФУНКЦИИ ---

    function updateStartButtonState() {
        const themeSelected = document.querySelector('input[name="theme"]:checked');
        startGameBtn.disabled = !themeSelected;
    }

    function checkUnlockStatus() {
        let gamesPlayed = parseInt(localStorage.getItem('gamesPlayedCount') || '0');
        if (gamesPlayed >= GAMES_TO_UNLOCK) {
            birdThemeRadio.disabled = false;
            // Може да се добави и някакъв визуален ефект, че е отключено
            const label = birdThemeRadio.closest('label');
            if(label) label.innerHTML = label.innerHTML.replace('🔒', ' unlocked');
        }
    }

    function incrementGamesPlayed() {
        let gamesPlayed = parseInt(localStorage.getItem('gamesPlayedCount') || '0');
        gamesPlayed++;
        localStorage.setItem('gamesPlayedCount', gamesPlayed);
        if (gamesPlayed === GAMES_TO_UNLOCK) {
            alert('Поздравления! Отключи нова тема: Птици!');
            checkUnlockStatus();
        }
    }

    function startGame() {
        gameState.currentThemeKey = document.querySelector('input[name="theme"]:checked').value;
        const themeName = gameState.currentThemeKey.replace('_', ' ');

        gameTitleEl.innerHTML = `Познай<br>${themeName.toUpperCase()}!`;
        
        optionsContainer.classList.add('hidden');
        controlsEl.classList.remove('hidden');
        containerEl.classList.remove('hidden');

        renderGamePics();
        renderAllPics();
        resetGameState();
    }
    
    function renderGamePics() {
        gamePicsEl.innerHTML = ''; 
        
        const allThemeImages = ALL_THEMES[gameState.currentThemeKey];
        const shuffledImages = [...allThemeImages].sort(() => 0.5 - Math.random());
        const selectedGamePicsData = shuffledImages.slice(0, 3); // Фиксирано на 3 за детската игра
        
        gameState.selectedGamePics = selectedGamePicsData;

        selectedGamePicsData.forEach((picData) => {
            const card = document.createElement('div');
            card.className = 'game-card';
            card.dataset.id = picData.id;

            const mainImage = document.createElement('img');
            mainImage.src = picData.image;
            mainImage.alt = picData.id;
            mainImage.className = 'card-image is-visible';

            const placeholderImage = document.createElement('img');
            placeholderImage.src = 'images/hide.png';
            placeholderImage.alt = 'Скрита картинка';
            placeholderImage.className = 'card-placeholder is-hidden';

            card.appendChild(mainImage);
            card.appendChild(placeholderImage);
            gamePicsEl.appendChild(card);
        });
    }

    function renderAllPics() {
        allPicsEl.innerHTML = '';
        const allThemeImages = ALL_THEMES[gameState.currentThemeKey];

        allThemeImages.forEach(picData => {
            const img = document.createElement('img');
            img.src = picData.image;
            img.dataset.id = picData.id;
            img.alt = picData.id;
            img.addEventListener('click', chooseHandler);
            allPicsEl.appendChild(img);
        });
    }

    function hideRandomPicture() {
        if (gameState.awaitingChoice) return;
        restoreHiddenImage();

        const cards = gamePicsEl.querySelectorAll('.game-card');
        const hiddenIndex = Math.floor(Math.random() * cards.length);
        
        gameState.hiddenCardElement = cards[hiddenIndex];
        const hiddenPicId = gameState.hiddenCardElement.dataset.id;
        gameState.originalPicData = gameState.selectedGamePics.find(p => p.id === hiddenPicId);
        
        const mainImage = gameState.hiddenCardElement.querySelector('.card-image');
        const placeholderImage = gameState.hiddenCardElement.querySelector('.card-placeholder');

        mainImage.classList.remove('is-visible');
        mainImage.classList.add('is-hidden');
        
        placeholderImage.classList.remove('is-hidden');
        placeholderImage.classList.add('is-visible');

        gameState.awaitingChoice = true;
        startBtn.classList.add('hidden');
        showMessage('Познай кое липсва!', 'info');
    }
    
    function restoreHiddenImage() {
        if (gameState.hiddenCardElement) {
            const mainImage = gameState.hiddenCardElement.querySelector('.card-image');
            const placeholderImage = gameState.hiddenCardElement.querySelector('.card-placeholder');

            mainImage.classList.add('is-visible');
            mainImage.classList.remove('is-hidden');

            placeholderImage.classList.add('is-hidden');
            placeholderImage.classList.remove('is-visible');

            gameState.hiddenCardElement = null;
        }
    }

    function chooseHandler(e) {
        if (!gameState.awaitingChoice) return;

        const chosenId = e.target.dataset.id;
        const hiddenId = gameState.originalPicData.id;

        if (chosenId === hiddenId) {
            const correctSoundPath = gameState.originalPicData.sound;
            
            if (correctSoundPath) {
                const objectAudio = new Audio(correctSoundPath);
                objectAudio.play();
                objectAudio.onended = () => {
                    bravoAudio.currentTime = 0;
                    bravoAudio.play();
                };
            } else {
                bravoAudio.currentTime = 0;
                bravoAudio.play();
            }
            
            showMessage(translations.bravoMessage || 'Браво!', 'success');
            restoreHiddenImage();
            gameState.awaitingChoice = false;
            reloadBtn.classList.remove('hidden');
            startBtn.classList.add('hidden');
        } else {
            opitaiPakAudio.currentTime = 0;
            opitaiPakAudio.play();
            showMessage(translations.tryAgainMessage || 'Опитай пак!', 'error');
        }
    }

    function showMessage(text, type) {
        messageDisplay.className = 'gameMessage';
        messageDisplay.textContent = text;
        
        setTimeout(() => {
            messageDisplay.classList.add('message-animate', `message-${type}`);
        }, 10);
    }

    function resetGameState() {
        restoreHiddenImage();
        gameState.awaitingChoice = false;
        gameState.originalPicData = null;

        showMessage('Натисни "СКРИЙ КАРТИНА" за да започнеш.', 'info');
        
        reloadBtn.classList.add('hidden');
        startBtn.classList.remove('hidden');
    }

    // --- 6. СЛУШАТЕЛИ НА СЪБИТИЯ ---
    themeRadios.forEach(r => r.addEventListener('change', updateStartButtonState));
    startGameBtn.addEventListener('click', startGame);
    startBtn.addEventListener('click', hideRandomPicture);

    reloadBtn.addEventListener('click', () => {
        incrementGamesPlayed(); // Броим играта за изиграна
        renderGamePics();
        resetGameState();
    });

    // --- 7. ПЪРВОНАЧАЛНА ИНИЦИАЛИЗАЦИЯ ---
    updateStartButtonState();
    checkUnlockStatus();
});
