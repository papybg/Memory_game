document.addEventListener('DOMContentLoaded', () => {
    // --- 1. КОНФИГУРАЦИЯ ---
    let ALL_THEMES = {}; // Ще се зареди от themes.json
    const GAMES_TO_UNLOCK = 30;

    // --- 2. DOM ЕЛЕМЕНТИ ---
    const themeRadios = document.querySelectorAll('input[name="theme"]');
    const countRadios = document.querySelectorAll('input[name="count"]');
    const birdThemeRadio = document.querySelector('input[value="птици"]');
    const startGameBtn = document.getElementById('startGameBtn');
    const optionsContainer = document.getElementById('optionsContainer');
    const gameTitleEl = document.getElementById('gameTitle');
    const messageDisplay = document.getElementById('gameMessage');
    const controlsEl = document.getElementById('controls');
    const startBtn = document.getElementById('start');
    const reloadBtn = document.getElementById('reload');
    const backToMenuBtn = document.getElementById('backToMenu');
    const allPicsEl = document.getElementById('allPics');
    const gamePicsEl = document.getElementById('gamePics');
    const containerEl = document.getElementById('container');

    // --- 3. СЪСТОЯНИЕ НА ИГРАТА ---
    const gameState = {
        currentThemeKey: null,
        numberOfPics: 0,
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
        const countSelected = document.querySelector('input[name="count"]:checked');
        startGameBtn.disabled = !(themeSelected && countSelected);
    }

    function updateCountOptionsAvailability() {
        const selectedThemeKey = document.querySelector('input[name="theme"]:checked')?.value;
        if (!selectedThemeKey || !ALL_THEMES[selectedThemeKey]) return;

        const maxPicsInTheme = ALL_THEMES[selectedThemeKey].length;

        countRadios.forEach(radio => {
            const label = radio.closest('label');
            if (parseInt(radio.value) > maxPicsInTheme) {
                radio.disabled = true;
                label.classList.add('disabled-theme');
            } else {
                radio.disabled = false;
                label.classList.remove('disabled-theme');
            }
        });

        const currentSelectedCount = document.querySelector('input[name="count"]:checked');
        if (currentSelectedCount && currentSelectedCount.disabled) {
            const lastEnabledRadio = [...countRadios].reverse().find(r => !r.disabled);
            if (lastEnabledRadio) {
                lastEnabledRadio.checked = true;
            }
        }
    }

    function checkUnlockStatus() {
        let gamesPlayed = parseInt(localStorage.getItem('gamesPlayedCount') || '0');
        if (gamesPlayed >= GAMES_TO_UNLOCK) {
            birdThemeRadio.disabled = false;
            const label = birdThemeRadio.closest('label');
            if(label) {
                label.classList.remove('disabled-theme');
                label.innerHTML = label.innerHTML.replace('🔒', '✔️');
            }
        }
    }

    function incrementGamesPlayed() {
        let gamesPlayed = parseInt(localStorage.getItem('gamesPlayedCount') || '0');
        if (gamesPlayed < GAMES_TO_UNLOCK) {
            gamesPlayed++;
            localStorage.setItem('gamesPlayedCount', gamesPlayed);
            if (gamesPlayed === GAMES_TO_UNLOCK) {
                alert('Поздравления! Отключи нова тема: Птици!');
                checkUnlockStatus();
            }
        }
    }

    function startGame() {
        gameState.currentThemeKey = document.querySelector('input[name="theme"]:checked').value;
        gameState.numberOfPics = parseInt(document.querySelector('input[name="count"]:checked').value);
        
        const themeLabel = document.querySelector(`input[value="${gameState.currentThemeKey}"]`).closest('label');
        const themeName = themeLabel.textContent.replace('🔒', '').replace('✔️', '').trim();

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
        gameState.selectedGamePics = shuffledImages.slice(0, gameState.numberOfPics);

        gameState.selectedGamePics.forEach((picData) => {
            const card = document.createElement('div');
            card.className = 'game-card';
            card.dataset.id = picData.id;

            const mainImage = document.createElement('img');
            mainImage.src = picData.image;
            mainImage.alt = picData.name;
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
            img.alt = picData.name;
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
        showMessage('Познай кое липсва!');
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
            restoreHiddenImage();
            
            const correctSoundPath = gameState.originalPicData.sound;
            if (correctSoundPath) {
                const objectAudio = new Audio(correctSoundPath);
                objectAudio.play().catch(err => console.error("Грешка при пускане на звука на обекта:", err));
            }

            setTimeout(() => {
                bravoAudio.currentTime = 0;
                bravoAudio.play().catch(err => console.error("Грешка при пускане на 'Браво':", err));
            }, 800);
            
            showMessage('Браво!', 'success');
            gameState.awaitingChoice = false;
            reloadBtn.classList.remove('hidden');
            startBtn.classList.add('hidden');

        } else {
            opitaiPakAudio.currentTime = 0;
            opitaiPakAudio.play().catch(err => console.error("Error playing audio:", err));
            showMessage('Опитай пак!', 'error');
        }
    }

    function showMessage(text, type = 'info') {
        messageDisplay.textContent = text;
        messageDisplay.className = 'gameMessage'; // Reset classes
        
        setTimeout(() => {
            messageDisplay.classList.add('message-animate', `message-${type}`);
        }, 10);
    }

    function resetGameState() {
        restoreHiddenImage();
        gameState.awaitingChoice = false;
        gameState.originalPicData = null;
        showMessage('Натисни "СКРИЙ КАРТИНА" за да започнеш.');
        reloadBtn.classList.add('hidden');
        startBtn.classList.remove('hidden');
    }
    
    function goBackToMenu() {
        incrementGamesPlayed();
        gameTitleEl.innerHTML = 'Познай<br>КАРТИНКАТА!';
        controlsEl.classList.add('hidden');
        containerEl.classList.add('hidden');
        optionsContainer.classList.remove('hidden');
        showMessage('');
    }

    async function initializeApp() {
        try {
            const response = await fetch('themes.json');
            if (!response.ok) {
                throw new Error(`Грешка: ${response.statusText}`);
            }
            ALL_THEMES = await response.json();

            themeRadios.forEach(r => {
                r.addEventListener('change', () => {
                    updateCountOptionsAvailability();
                    updateStartButtonState();
                });
            });
            countRadios.forEach(r => r.addEventListener('change', updateStartButtonState));
            
            startGameBtn.addEventListener('click', startGame);
            startBtn.addEventListener('click', hideRandomPicture);
            reloadBtn.addEventListener('click', startGame);
            backToMenuBtn.addEventListener('click', goBackToMenu);

            checkUnlockStatus();
            updateCountOptionsAvailability();
            updateStartButtonState();
            
        } catch (error) {
            console.error("Неуспешно зареждане на themes.json:", error);
            optionsContainer.innerHTML = `<p style="color: var(--error-color);">Грешка при зареждане на темите. Моля, уверете се, че файлът 'themes.json' съществува и е правилно форматиран.</p>`;
        }
    }

    initializeApp();
});
