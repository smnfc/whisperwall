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

// Função para adicionar uma história ao container
function addStoryToContainer(title, text) {
    const storyElement = createStoryElement(title, text);
    storiesContainer.insertBefore(storyElement, storiesContainer.firstChild);
}

// Evento para capturar o envio de uma nova história
submitButton.addEventListener('click', () => {
    const storyText = storyInput.value.trim(); // Remove espaços extras
    if (storyText) {
        addStoryToContainer('Nova História', storyText);
        storyInput.value = ''; // Limpa o campo de texto após enviar
    } else {
        alert('Por favor, escreva algo antes de enviar.');
    }
});

// Histórias de exemplo para preencher ao carregar o site
const sampleStories = [
    { title: 'História de exemplo 1', text: 'Esta é a primeira história para mostrar como funciona.' },
    { title: 'História de exemplo 2', text: 'Você pode adicionar suas próprias histórias agora mesmo!' }
];

// Função para carregar histórias iniciais
function loadSampleStories() {
    sampleStories.forEach(story => {
        addStoryToContainer(story.title, story.text);
    });
}

// Inicializar o site com histórias de exemplo
document.addEventListener('DOMContentLoaded', loadSampleStories);
