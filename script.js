// Firebase configuration (substitua pelos dados do seu projeto)
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_DOMÍNIO.firebaseapp.com",
    databaseURL: "https://SEU_DATABASE_URL.firebaseio.com",
    projectId: "SEU_PROJETO_ID",
    storageBucket: "SEU_STORAGE_BUCKET.appspot.com",
    messagingSenderId: "SEU_MESSAGING_ID",
    appId: "SEU_APP_ID"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Selecionar elementos do DOM
const submitButton = document.getElementById('submitStory');
const storyInput = document.getElementById('storyInput');
const storiesContainer = document.getElementById('storiesContainer');

// Função para criar um elemento de história
function createStoryElement(title, text) {
    const storyDiv = document.createElement('div');
    storyDiv.classList.add('story');
    storyDiv.innerHTML = `
        <h3>${title}</h3>
        <p>${text}</p>
    `;
    return storyDiv;
}

// Função para carregar histórias do Firebase
function loadStoriesFromFirebase() {
    database.ref('stories').on('value', (snapshot) => {
        storiesContainer.innerHTML = ''; // Limpa o container
        const stories = snapshot.val();
        for (let id in stories) {
            const story = stories[id];
            const storyElement = createStoryElement(story.title, story.text);
            storiesContainer.appendChild(storyElement);
        }
    });
}

// Evento para capturar o envio de uma nova história
submitButton.addEventListener('click', () => {
    const storyText = storyInput.value.trim();
    if (storyText) {
        const newStory = { title: 'Nova História', text: storyText };
        database.ref('stories').push(newStory); // Salva no Firebase
        storyInput.value = ''; // Limpa o campo
    } else {
        alert('Por favor, escreva algo antes de enviar.');
    }
});

// Carregar histórias ao iniciar
loadStoriesFromFirebase();
