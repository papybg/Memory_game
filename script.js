// script.js
document.addEventListener('DOMContentLoaded', () => {
    // Обект за превод на имената на темите
    const THEME_TRANSLATIONS = {
        превозни_средства: 'ПРЕВОЗНИ СРЕДСТВА',
        animals: 'ЖИВОТНИ',
        flowers: 'ЦВЕТЯ',
        птици: 'ПТИЦИ'
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
    const backToMenuBtn = document.getElementById('backToMenu');
    const allPicsEl = document.getElementById('allPics');
    const gamePicsEl = document.getElementById('gamePics');
    const containerEl = document.getElementById('container');
    const controlsEl = document.getElementById('controls');
    const birdsThemeRadio = document.getElementById('birdsThemeRadio');
    const birdsThemeLabel = document.getElementById('birdsThemeLabel');
    
    let ALL_THEMES = {};

    const gameState = {
        currentThemeData: [], // Променено име
        numberOfPics: 0,
        selectedGameItems: [], // Променено име
        hiddenItem: null, // Променено име
        awaitingChoice: false,
    };

    const bravoAudio = new Audio('audio/bravo.wav');
    const opitaiPakAudio = new Audio('audio/opitaj_pak.wav');

    // --- Функции ---
    
    function checkAndUnlockThemes() {
        const gamesPlayed = parseInt(localStorage.getItem('gamesPlayedCount')) || 0;
        
        if (gamesPlayed >= 15) {
            birdsThemeRadio.disabled = false;
            birdsThemeLabel.classList.remove('theme-locked');
            birdsThemeLabel.title = `Изиграни игри: ${gamesPlayed}. Темата е отключена!`;
        } else {
            birdsThemeRadio.disabled = true;
            birdsThemeLabel.classList.add('theme-locked');
            birdsThemeLabel.title = `Изиграни игри: ${gamesPlayed}/15. Нужни са още ${15 - gamesPlayed}.`;
        }
    }

    function incrementGamesPlayed() {
        let gamesPlayed = parseInt(localStorage.getItem('gamesPlayedCount')) || 0;
        gamesPlayed++;
        localStorage.setItem('gamesPlayedCount', gamesPlayed);
        checkAndUnlockThemes();
    }

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
        document.body.classList.remove('bg-menu');
        document.body.classList.add('bg-game');

        const selectedTheme = document.querySelector('input[name="theme"]:checked').value;
        const themeDisplayName = THEME_TRANSLATIONS[selectedTheme] || selectedTheme.replace('_', ' ').toUpperCase();

        gameState.numberOfPics = parseInt(document.querySelector('input[name="count"]:checked').value);
        gameState.currentThemeData = ALL_THEMES[selectedTheme];

        gameTitleEl.textContent = `Познай ${themeDisplayName}!`;
        
        optionsContainer.classList.add('hidden');
        controlsEl.classList.remove('hidden');
        containerEl.classList.remove('hidden');

        renderGamePics();
        renderAllPics();
        resetGameState();
    }

    function renderAllPics() {
        allPicsEl.innerHTML = '';
        gameState.currentThemeData.forEach(item => {
            const img = document.createElement('img');
            img.src = 'images/' + item.image;
            img.dataset.image = item.image; // Използваме data-image
            img.alt = item.image.replace('.jpg', '');
            img.addEventListener('click', chooseHandler);
            allPicsEl.appendChild(img);
        });
    }

    function renderGamePics() {
        gamePicsEl.innerHTML = ''; 
        const shuffledItems = shuffleArray([...gameState.currentThemeData]);
        gameState.selectedGameItems = shuffledItems.slice(0, gameState.numberOfPics);

        gameState.selectedGameItems.forEach((item, idx) => {
            const img = document.createElement('img');
            img.src = 'images/' + item.image;
            img.dataset.idx = idx;
            img.dataset.image = item.image; // Използваме data-image
            img.alt = item.image.replace('.jpg', '');
            gamePicsEl.appendChild(img);
        });
    }
    
    function hideRandomPicture() {
        if (gameState.awaitingChoice) return;
        restoreHiddenImage();

        const hiddenIndex = Math.floor(Math.random() * gameState.numberOfPics);
        const hiddenImageElement = gamePicsEl.querySelectorAll('img')[hiddenIndex]; 
        
        // Запазваме целия обект на скрития елемент
        gameState.hiddenItem = gameState.selectedGameItems[hiddenIndex];
        gameState.hiddenItem.element = hiddenImageElement; // Запазваме и самия HTML елемент

        hiddenImageElement.src = 'images/hide.png';
        hiddenImageElement.dataset.image = 'hide.png';
        hiddenImageElement.alt = 'Скрита картинка';
        
        gameState.awaitingChoice = true;
        startBtn.classList.add('hidden');
        showMessage('Познай кое липсва!', 'info');
    }

    function chooseHandler(e) {
        if (!gameState.awaitingChoice) return;

        const chosenImageName = e.target.dataset.image;
        const hiddenImageName = gameState.hiddenItem.image;

        if (chosenImageName === hiddenImageName) {
            // Първо възстановяваме картинката
            restoreHiddenImage();
            
            // Създаваме и пускаме звука на картинката
            const itemSound = new Audio('audio/' + gameState.hiddenItem.sound);
            itemSound.play();
            
            // След като звукът на картинката свърши, пускаме "Браво"
            itemSound.onended = () => {
                bravoAudio.currentTime = 0; 
                bravoAudio.play().catch(e => console.error("Error playing audio:", e));
            };

            showMessage('Браво!', 'success');
            incrementGamesPlayed();

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
        if (gameState.hiddenItem && gameState.hiddenItem.element) {
            const el = gameState.hiddenItem.element;
            el.src = 'images/' + gameState.hiddenItem.image;
            el.dataset.image = gameState.hiddenItem.image;
            el.alt = gameState.hiddenItem.image.replace('.jpg', '');
        }
    }

    function resetGameState() {
        restoreHiddenImage();
        
        gameState.awaitingChoice = false;
        gameState.hiddenItem = null; 

        showMessage('Натисни "СКРИЙ КАРТИНА" за да започнеш.', 'info');
        
        reloadBtn.classList.add('hidden');
        startBtn.classList.remove('hidden');
        startBtn.disabled = false;
    }

    function goBackToMenu() {
        document.body.classList.remove('bg-game');
        document.body.classList.add('bg-menu');

        gameTitleEl.textContent = 'Познай КАРТИНКАТА!';
        controlsEl.classList.add('hidden');
        containerEl.classList.add('hidden');
        optionsContainer.classList.remove('hidden');
        showMessage('', 'info');
    }
    
    async function initializeApp() {
        document.body.classList.add('bg-menu');
        try {
            const response = await fetch('themes.json');
            if (!response.ok) {
                throw new Error(`Грешка при зареждане на мрежата: ${response.statusText}`);
            }
            ALL_THEMES = await response.json();

            themeRadios.forEach(r => r.addEventListener('change', updateStartButtonState));
            countRadios.forEach(r => r.addEventListener('change', updateStartButtonState));
            startGameBtn.addEventListener('click', startGame);
            startBtn.addEventListener('click', hideRandomPicture);
            reloadBtn.addEventListener('click', () => {
                renderGamePics();
                resetGameState();
            });
            backToMenuBtn.addEventListener('click', goBackToMenu);

            updateStartButtonState();
            checkAndUnlockThemes();
            
        } catch (error) {
            console.error("Неуспешно зареждане на темите:", error);
            gameTitleEl.textContent = 'ГРЕШКА';
            optionsContainer.innerHTML = `<p style="color: var(--error-color);">Нещо се обърка при зареждането на темите за играта. Моля, опитайте да презаредите страницата.</p>`;
        }
    }

    initializeApp();
});
