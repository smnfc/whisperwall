// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBItWx-Ly7KWA-PixHIvm2uHwgOh5-0NiA",
    authDomain: "whisperwall-f78d2.firebaseapp.com",
    databaseURL: "https://whisperwall-f78d2-default-rtdb.firebaseio.com",
    projectId: "whisperwall-f78d2",
    storageBucket: "whisperwall-f78d2.firebasestorage.app",
    messagingSenderId: "783148270853",
    appId: "1:783148270853:web:74ec6b14c3737660dee36c",
    measurementId: "G-D6CBGN57YK",
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Seleção dos elementos no DOM
const submitButton = document.getElementById('submitStory');
const storyInput = document.getElementById('storyInput');
const storiesContainer = document.getElementById('storiesContainer');

// Função para criar um elemento visual de história
function createStoryElement(title, text) {
    const storyDiv = document.createElement('div');
    storyDiv.classList.add('story');
    storyDiv.innerHTML = `
        <h3>${title}</h3>
        <p>${text}</p>
    `;
    return storyDiv;
}

// Função para carregar as histórias do Firebase
function loadStoriesFromFirebase() {
    const storiesRef = database.ref('stories');
    storiesRef.on('value', (snapshot) => {
        storiesContainer.innerHTML = ''; // Limpa o container
        const stories = snapshot.val();
        if (stories) {
            Object.values(stories).forEach((story) => {
                const storyElement = createStoryElement(story.title, story.text);
                storiesContainer.appendChild(storyElement);
            });
        }
    });
}

// Função para enviar uma nova história para o Firebase
submitButton.addEventListener('click', () => {
    const storyText = storyInput.value.trim();
    if (storyText) {
        const storiesRef = database.ref('stories');
        const newStory = {
            title: 'Nova História', // Título fixo, pode ser alterado mais tarde
            text: storyText
        };
        storiesRef.push(newStory); // Salva a história no Firebase
        storyInput.value = ''; // Limpa o campo de texto
    } else {
        alert('Por favor, escreva algo antes de enviar.');
    }
});

// Carregar as histórias quando a página for carregada
loadStoriesFromFirebase();
