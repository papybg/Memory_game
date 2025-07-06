document.addEventListener('DOMContentLoaded', function() {
    const images = ['bus.jpg', 'airplane.jpg', 'firetruck.jpg', 'train.jpg', 'truck.jpg'];
    const gamePicsContainer = document.getElementById('game-pics-container');
    const allPicsContainer = document.getElementById('all-pics-container');
    const startButton = document.getElementById('start-button');
    const reloadButton = document.getElementById('reload-button');
    const gameMessage = document.getElementById('game-message');

    let gamePics = [];
    let allShuffledPics = [];
    let hiddenCard = null;
    let originalPicSrc = '';
    let awaitingChoice = false;

    function setupGame() {
        gamePicsContainer.innerHTML = '';
        allPicsContainer.innerHTML = '';
        gameMessage.textContent = '';
        awaitingChoice = false;
        hiddenCard = null;
        originalPicSrc = '';

        // Избираме 3 случайни картинки за игра
        const shuffled = [...images].sort(() => 0.5 - Math.random());
        gamePics = shuffled.slice(0, 3);
        
        // Показваме играещите картинки по новия начин
        gamePics.forEach(picSrc => {
            const card = document.createElement('div');
            card.className = 'game-card';
            
            const mainImage = document.createElement('img');
            mainImage.src = picSrc;
            mainImage.className = 'card-image is-visible';
            mainImage.dataset.src = picSrc; // Пазим src за идентификация

            const placeholder = document.createElement('img');
            placeholder.src = 'hide.png'; // Път до питанката
            placeholder.className = 'card-placeholder is-hidden';
            
            card.appendChild(mainImage);
            card.appendChild(placeholder);
            gamePicsContainer.appendChild(card);
        });

        // Показваме всички картинки отдолу
        allShuffledPics = [...images].sort(() => 0.5 - Math.random());
        allShuffledPics.forEach(picSrc => {
            const img = document.createElement('img');
            img.src = picSrc;
            img.addEventListener('click', () => chooseHandler(picSrc));
            allPicsContainer.appendChild(img);
        });

        startButton.style.display = 'inline-block';
        reloadButton.style.display = 'none';
    }

    startButton.addEventListener('click', function() {
        if (awaitingChoice || gamePics.length === 0) return;

        const cards = gamePicsContainer.querySelectorAll('.game-card');
        const randomIndex = Math.floor(Math.random() * cards.length);
        hiddenCard = cards[randomIndex];
        
        const imageToHide = hiddenCard.querySelector('.card-image');
        originalPicSrc = imageToHide.dataset.src;

        // --- НОВ НАЧИН НА СКРИВАНЕ С АНИМАЦИЯ ---
        const placeholderToShow = hiddenCard.querySelector('.card-placeholder');

        imageToHide.classList.remove('is-visible');
        imageToHide.classList.add('is-hidden');

        placeholderToShow.classList.remove('is-hidden');
        placeholderToShow.classList.add('is-visible');
        // -----------------------------------------

        awaitingChoice = true;
        gameMessage.textContent = 'Познай коя е скритата картинка!';
        startButton.style.display = 'none';
        reloadButton.style.display = 'inline-block';
    });

    function chooseHandler(chosenSrc) {
        if (!awaitingChoice) return;

        if (chosenSrc === originalPicSrc) {
            gameMessage.textContent = 'Браво! Позна!';
            
            // Възстановяваме картинката
            const imageToShow = hiddenCard.querySelector('.card-image');
            const placeholderToHide = hiddenCard.querySelector('.card-placeholder');
            
            imageToShow.classList.remove('is-hidden');
            imageToShow.classList.add('is-visible');

            placeholderToHide.classList.remove('is-visible');
            placeholderToHide.classList.add('is-hidden');

            awaitingChoice = false;
        } else {
            gameMessage.textContent = 'Грешка, опитай пак!';
        }
    }

    reloadButton.addEventListener('click', setupGame);

    // Първоначално зареждане на играта
    setupGame();
});
