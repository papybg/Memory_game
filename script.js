document.addEventListener('DOMContentLoaded', () => {
    // --- КОНФИГУРАЦИЯ ---
    let ALL_THEMES = {};

    // --- DOM ЕЛЕМЕНТИ ---
    const themeRadios = document.querySelectorAll('input[name="theme"]');
    const countRadios = document.querySelectorAll('input[name="count"]');
    const startGameBtn = document.getElementById('startGameBtn');
    const optionsContainer = document.getElementById('optionsContainer');
    const gameTitleEl = document.getElementById('gameTitle');
    const messageDisplay = document.getElementById('gameMessage');
    const startBtn = document.getElementById('start');
    const backToMenuBtn = document.getElementById('backToMenu');
    const allPicsEl = document.getElementById('allPics');
    const gamePicsEl = document.getElementById('gamePics');
    const containerEl = document.getElementById('container');
    const muteBtn = document.getElementById('muteBtn');
    const topControls = document.getElementById('topControls');
    const startActionContainer = document.getElementById('startActionContainer');

    // --- СЪСТОЯНИЕ НА ИГРАТА ---
    const gameState = {
        currentThemeData: [],
        numberOfPics: 0,
        selectedGameItems: [],
        hiddenItem: null,
        awaitingChoice: false,
    };

    // --- АУДИО ---
    const bravoAudio = new Audio('audio/bravo_uily.wav');
    const opitaiPakAudio = new Audio('audio/opitaj_pak.wav');
    let isMuted = false;

    // --- "СЪБУЖДАНЕ" НА WEB SPEECH API ---
    if ('speechSynthesis' in window) {
        speechSynthesis.getVoices(); // Първоначално извикване
        speechSynthesis.onvoiceschanged = () => {
            speechSynthesis.getVoices(); // Повторно при промяна
        };
    }

    // --- ФУНКЦИИ ---
    function speakText(text) {
        if ('speechSynthesis' in window) {
            const voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
                const bulgarianVoice = voices.find(voice => voice.lang === 'bg-BG');
                if (bulgarianVoice) {
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.voice = bulgarianVoice;
                    utterance.lang = 'bg-BG';
                    window.speechSynthesis.speak(utterance);
                    return; // Успех, излизаме
                }
            }
        }
        // Ако нещо от горното не успее, пускаме резервния звук
        opitaiPakAudio.currentTime = 0;
        opitaiPakAudio.play().catch(err => console.error("Резервен звук:", err));
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function updateCountOptionsAvailability() {
        const selectedThemeKey = document.querySelector('input[name="theme"]:checked')?.value;
        if (!selectedThemeKey || !ALL_THEMES[selectedThemeKey]) return;
        const maxPicsInTheme = ALL_THEMES[selectedThemeKey].length;
        countRadios.forEach(radio => {
            const label = radio.closest('label');
            const shouldDisable = parseInt(radio.value) > maxPicsInTheme;
            radio.disabled = shouldDisable;
            label.classList.toggle('disabled-theme', shouldDisable);
        });
        const currentSelectedCount = document.querySelector('input[name="count"]:checked');
        if (currentSelectedCount && currentSelectedCount.disabled) {
            const lastEnabledRadio = [...countRadios].reverse().find(r => !r.disabled);
            if (lastEnabledRadio) lastEnabledRadio.checked = true;
        }
    }
    
    function updateStartButtonState() {
        const themeSelected = document.querySelector('input[name="theme"]:checked');
        const countSelected = document.querySelector('input[name="count"]:checked');
        startGameBtn.disabled = !(themeSelected && countSelected);
    }

    function showGameUI() {
        optionsContainer.classList.add('hidden');
        topControls.classList.remove('hidden');
        startActionContainer.classList.remove('hidden');
        containerEl.classList.remove('hidden');
        gameMessage.classList.remove('message-hidden');
    }

    function showMenuUI() {
        document.body.classList.remove('bg-game');
        document.body.classList.add('bg-menu');
        gameTitleEl.innerHTML = 'Познай<br>КАРТИНКАТА!';
        optionsContainer.classList.remove('hidden');
        topControls.classList.add('hidden');
        startActionContainer.classList.add('hidden');
        containerEl.classList.add('hidden');
        messageDisplay.classList.add('message-hidden');
    }

    function startGame() {
        document.body.classList.remove('bg-menu');
        document.body.classList.add('bg-game');
        const selectedTheme = document.querySelector('input[name="theme"]:checked').value;
        const themeLabel = document.querySelector(`input[value="${selectedTheme}"]`).closest('label');
        const themeDisplayName = themeLabel.textContent.trim();
        gameState.numberOfPics = parseInt(document.querySelector('input[name="count"]:checked').value);
        gameState.currentThemeData = ALL_THEMES[selectedTheme];
        gameTitleEl.innerHTML = `Познай<br>${themeDisplayName.toUpperCase()}!`;
        
        showGameUI();

        renderGamePics();
        renderAllPics();
        resetGameState();
    }

    function renderAllPics() {
        allPicsEl.innerHTML = '';
        shuffleArray(gameState.currentThemeData).forEach(item => { // Разбъркваме всички, за да е по-интересно
            const img = document.createElement('img');
            img.src = item.image;
            img.dataset.id = item.id;
            img.alt = item.name;
            img.addEventListener('click', () => chooseHandler(item.id));
            allPicsEl.appendChild(img);
        });
    }

    function renderGamePics() {
        gamePicsEl.innerHTML = '';
        gameState.selectedGameItems = shuffleArray([...gameState.currentThemeData]).slice(0, gameState.numberOfPics);
        gameState.selectedGameItems.forEach((item) => {
            const img = document.createElement('img');
            img.src = item.image;
            img.dataset.id = item.id;
            img.alt = item.name;
            gamePicsEl.appendChild(img);
        });
    }
    
    function hideRandomPicture() {
        if (gameState.awaitingChoice) return;
        restoreHiddenImage();
        const hiddenIndex = Math.floor(Math.random() * gameState.selectedGameItems.length);
        const hiddenImageElement = gamePicsEl.children[hiddenIndex];
        gameState.hiddenItem = gameState.selectedGameItems[hiddenIndex];
        gameState.hiddenItem.element = hiddenImageElement;
        hiddenImageElement.src = 'images/hide.png';
        hiddenImageElement.alt = 'Скрита картинка';
        gameState.awaitingChoice = true;
        startBtn.classList.add('hidden');
        showMessage('Познай кое липсва!');
    }

    function chooseHandler(chosenId) {
        if (!gameState.awaitingChoice) return;
        const hiddenId = gameState.hiddenItem.id;
        if (chosenId === hiddenId) {
            gameState.awaitingChoice = false;
            restoreHiddenImage();
            
            const playBravoAndRestart = () => {
                if (!isMuted) {
                    bravoAudio.currentTime = 0;
                    bravoAudio.play().catch(err => console.error("Грешка при пускане на 'Браво':", err));
                }
                setTimeout(startGame, 2500);
            };

            showMessage('Браво!', 'success');

            const itemSoundPath = gameState.hiddenItem.sound;
            if (itemSoundPath && !isMuted) {
                const itemSound = new Audio(itemSoundPath);
                itemSound.onended = playBravoAndRestart;
                itemSound.play().catch(err => {
                    console.error("Грешка при пускане на звук на обект:", err);
                    playBravoAndRestart();
                });
            } else {
                playBravoAndRestart();
            }
        } else {
            const tryAgainMessages = ['Опитай пак!', 'Сигурен ли си?', 'Почти позна!'];
            const randomIndex = Math.floor(Math.random() * tryAgainMessages.length);
            const randomMessage = tryAgainMessages[randomIndex];
            
            if (!isMuted) {
                speakText(randomMessage);
            }
            
            showMessage(randomMessage, 'error');
        }
    }

    function showMessage(text, type = 'info') {
        messageDisplay.textContent = text;
        messageDisplay.classList.remove('message-hidden', 'message-success', 'message-error');
        messageDisplay.classList.add('message-animate');
    }

    function restoreHiddenImage() {
        if (gameState.hiddenItem && gameState.hiddenItem.element) {
            const el = gameState.hiddenItem.element;
            el.src = gameState.hiddenItem.image;
            el.alt = gameState.hiddenItem.name;
        }
    }

    function resetGameState() {
        restoreHiddenImage();
        gameState.awaitingChoice = false;
        gameState.hiddenItem = null;
        showMessage('Натисни "СКРИЙ КАРТИНА" за да започнеш.');
        startBtn.classList.remove('hidden');
    }
    
    async function initializeApp() {
        document.body.classList.add('bg-menu');
        try {
            const response = await fetch('themes.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            ALL_THEMES = await response.json();
            
            const allRadios = document.querySelectorAll('#optionsContainer input[type="radio"]');
            allRadios.forEach(radio => radio.addEventListener('change', () => {
                if (radio.name === 'theme') {
                    updateCountOptionsAvailability();
                }
                updateStartButtonState();
            }));

            startGameBtn.addEventListener('click', startGame);
            startBtn.addEventListener('click', hideRandomPicture);
            backToMenuBtn.addEventListener('click', showMenuUI);
            
            muteBtn.addEventListener('click', () => {
                isMuted = !isMuted;
                muteBtn.querySelector('.icon-unmuted').classList.toggle('hidden', isMuted);
                muteBtn.querySelector('.icon-muted').classList.toggle('hidden', !isMuted);
            });
            
            updateCountOptionsAvailability();
            updateStartButtonState();
        } catch (error) {
            console.error("Неуспешно зареждане или парсване на themes.json:", error);
            optionsContainer.innerHTML = `<p style="color: var(--error-color);">Грешка при зареждане на темите. Моля, проверете дали файлът 'themes.json' е наличен и синтактично коректен.</p>`;
        }
    }

    initializeApp();
});
