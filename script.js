// ... (началото на файла е същото) ...

    function renderAllPics() {
        allPicsEl.innerHTML = '';
        gameState.currentThemeData.forEach(item => {
            const img = document.createElement('img');
            img.src = item.image; // ПРОМЯНА: Директно използваме пълния път
            img.dataset.image = item.image;
            img.alt = item.name || item.image.replace('.jpg', '');
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
            img.src = item.image; // ПРОМЯНА: Директно използваме пълния път
            img.dataset.idx = idx;
            img.dataset.image = item.image;
            img.alt = item.name || item.image.replace('.jpg', '');
            gamePicsEl.appendChild(img);
        });
    }
    
    // ...

    function chooseHandler(e) {
        // ... (началото е същото) ...

        if (chosenImageName === hiddenImageName) {
            restoreHiddenImage();
            
            const itemSound = new Audio(gameState.hiddenItem.sound); // ПРОМЯНА: Директно използваме пълния път
            itemSound.play().catch(e => { console.error("Грешка при пускане на звука на картинката:", e); });
            
            itemSound.onended = () => {
                bravoAudio.currentTime = 0; 
                bravoAudio.play().catch(e => console.error("Грешка при пускане на 'Браво':", e));
            };
            
            // ... (останалото е същото) ...
        } else {
            // ...
        }
    }

    function restoreHiddenImage() {
        if (gameState.hiddenItem && gameState.hiddenItem.element) {
            const el = gameState.hiddenItem.element;
            el.src = gameState.hiddenItem.image; // ПРОМЯНА: Директно използваме пълния път
            el.dataset.image = gameState.hiddenItem.image;
            el.alt = gameState.hiddenItem.name || gameState.hiddenItem.image.replace('.jpg', '');
        }
    }

// ... (останалият код е същият) ...
