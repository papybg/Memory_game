document.addEventListener('DOMContentLoaded', () => {
    // Дефиниции на темите - вече като обекти
    const ALL_THEMES = {
        превозни_средства: [
            { id: 'bus', image: 'images/превозни_средства/bus.jpg', sound: 'audio/object_sounds/bus.mp3' },
            // ... добави други
        ],
        animals: [
            { id: 'dog', image: 'images/animals/dog.jpg', sound: 'audio/object_sounds/dog.mp3' },
            { id: 'cat', image: 'images/animals/cat.jpg', sound: 'audio/object_sounds/cat.mp3' },
            // ... добави други
        ],
        flowers: [ /* ... */ ],
        птици: [ /* ... */ ]
    };

    // ... (DOM елементите остават същите) ...

    const gameState = {
        // ...
        hiddenCardElement: null, // Вече ще пазим целия card елемент
        originalPicData: null,
    };

    // ... (останалите променливи)

    // --- Функции ---

    function renderGamePics() {
        gamePicsEl.innerHTML = ''; // Изчистваме предишното съдържание
        
        // Логиката за разбъркване и избиране остава същата
        const themeKey = document.querySelector('input[name="theme"]:checked').value;
        const allThemeImages = ALL_THEMES[themeKey];
        const shuffledImages = [...allThemeImages].sort(() => 0.5 - Math.random());
        const selectedGamePicsData = shuffledImages.slice(0, 3); // Засега е фиксирано на 3
        
        gameState.selectedGamePics = selectedGamePicsData;

        selectedGamePicsData.forEach((picData) => {
            // 🌟 СЪЗДАВАНЕ НА НОВАТА СТРУКТУРА НА КАРТАТА 🌟
            const card = document.createElement('div');
            card.className = 'game-card';
            card.dataset.id = picData.id; // Използваме ID за идентификация

            const mainImage = document.createElement('img');
            mainImage.src = picData.image;
            mainImage.alt = picData.id;
            mainImage.className = 'card-image is-visible'; // Видима по подразбиране

            const placeholderImage = document.createElement('img');
            placeholderImage.src = 'images/hide.png'; // Пътят до питанката
            placeholderImage.alt = 'Скрита картинка';
            placeholderImage.className = 'card-placeholder is-hidden'; // Скрита по подразбиране

            card.appendChild(mainImage);
            card.appendChild(placeholderImage);
            gamePicsEl.appendChild(card);
        });
    }

    function hideRandomPicture() {
        if (gameState.awaitingChoice) return;
        restoreHiddenImage(); // Първо възстановяваме, ако има нещо скрито

        const cards = gamePicsEl.querySelectorAll('.game-card');
        const hiddenIndex = Math.floor(Math.random() * cards.length);
        
        gameState.hiddenCardElement = cards[hiddenIndex];
        const hiddenPicId = gameState.hiddenCardElement.dataset.id;
        gameState.originalPicData = gameState.selectedGamePics.find(p => p.id === hiddenPicId);
        
        // 🌟 НОВ НАЧИН НА СКРИВАНЕ ЧРЕЗ СМЯНА НА КЛАСОВЕ 🌟
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
            // 🌟 НОВ НАЧИН НА ВЪЗСТАНОВЯВАНЕ 🌟
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
            showMessage('Браво!', 'success'); // ... и аудио логиката
            restoreHiddenImage(); // Възстановяваме картинката
            gameState.awaitingChoice = false;
            reloadBtn.classList.remove('hidden');
            startBtn.classList.add('hidden');
        } else {
            showMessage('Опитай пак!', 'error'); // ... и аудио логиката
        }
    }
    
    // ... (останалите функции като resetGameState, showMessage и т.н. също трябва
    // да се адаптират да работят с restoreHiddenImage())
    
    // ... (слушателите на събития остават същите)
});
