document.addEventListener('DOMContentLoaded', (event) => {
    $('#historyModal').on('show.bs.modal', function (event) {
        displayStoredWords();
    });

    $('#favoritesModal').on('show.bs.modal', function (event) {
        displayFavorites();
    });
});

async function searchWord() {
    const word = document.getElementById('wordInput').value;
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';

    if (!word) {
        resultDiv.innerHTML = '<div class="alert alert-danger">Please enter a word to search.</div>';
        return;
    }

    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        if (!response.ok) {
            throw new Error('Word not found');
        }
        const data = await response.json();
        displayResult(data[0]);
        storeWord(data[0]);
    } catch (error) {
        resultDiv.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    }
}

function displayResult(data) {
    const resultDiv = document.getElementById('result');
    const card = document.createElement('div');
    card.className = 'card';

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';

    const wordTitle = document.createElement('h5');
    wordTitle.className = 'card-title';
    wordTitle.textContent = data.word;
    cardBody.appendChild(wordTitle);

    const favButton = document.createElement('button');
    favButton.className = 'btn btn-warning';
    favButton.textContent = 'Add to Favorites';
    favButton.onclick = () => addToFavorites(data);
    cardBody.appendChild(favButton);

    if (data.phonetics && data.phonetics.length > 0) {
        const phoneticsDiv = document.createElement('div');
        phoneticsDiv.className = 'mb-3';

        data.phonetics.forEach(phonetic => {
            const phoneticText = document.createElement('span');
            phoneticText.textContent = phonetic.text || '';

            if (phonetic.audio) {
                const audioButton = document.createElement('button');
                audioButton.className = 'btn btn-link audio-button';
                audioButton.textContent = '🔊';
                audioButton.onclick = () => new Audio(phonetic.audio).play();
                phoneticText.appendChild(audioButton);
            }

            phoneticsDiv.appendChild(phoneticText);
            phoneticsDiv.appendChild(document.createElement('br'));
        });

        cardBody.appendChild(phoneticsDiv);
    }

    data.meanings.forEach(meaning => {
        const meaningDiv = document.createElement('div');
        meaningDiv.className = 'mb-3';

        const partOfSpeech = document.createElement('h6');
        partOfSpeech.textContent = meaning.partOfSpeech;
        meaningDiv.appendChild(partOfSpeech);

        meaning.definitions.forEach(definition => {
            const definitionText = document.createElement('p');
            definitionText.textContent = definition.definition;
            meaningDiv.appendChild(definitionText);

            if (definition.example) {
                const exampleText = document.createElement('p');
                exampleText.className = 'text-muted';
                exampleText.textContent = `Example: ${definition.example}`;
                meaningDiv.appendChild(exampleText);
            }
        });

        cardBody.appendChild(meaningDiv);
    });

    card.appendChild(cardBody);
    resultDiv.appendChild(card);
}

function storeWord(wordData) {
    let storedWords = JSON.parse(localStorage.getItem('storedWords')) || [];
    storedWords.push(wordData);
    localStorage.setItem('storedWords', JSON.stringify(storedWords));
}

function displayStoredWords() {
    const storedWords = JSON.parse(localStorage.getItem('storedWords')) || [];
    const storedWordsList = document.getElementById('storedWordsList');
    storedWordsList.innerHTML = '';

    storedWords.forEach(wordData => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item';
        listItem.textContent = wordData.word;
        storedWordsList.appendChild(listItem);
    });
}

function addToFavorites(wordData) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!favorites.some(favorite => favorite.word === wordData.word)) {
        favorites.push(wordData);
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }
}

function displayFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const favoritesList = document.getElementById('favoritesList');
    favoritesList.innerHTML = '';

    favorites.forEach(wordData => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item';
        listItem.textContent = wordData.word;
        listItem.onclick = () => displayFavoriteWord(wordData);
        listItem.style.cursor = 'pointer';
        listItem.onmouseover = () => listItem.style.backgroundColor = 'lightgreen';
        listItem.onmouseout = () => listItem.style.backgroundColor = '';
        favoritesList.appendChild(listItem);
    });
}

function displayFavoriteWord(wordData) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';
    displayResult(wordData);
}
