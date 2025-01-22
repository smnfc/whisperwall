import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onChildAdded } from "firebase/database";

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const submitButton = document.getElementById('submitStory');
const storyInput = document.getElementById('storyInput');
const storiesContainer = document.getElementById('storiesContainer');

// Enviar a história
submitButton.addEventListener('click', () => {
  const storyText = storyInput.value.trim();
  if (storyText) {
    const newStoryRef = ref(database, 'stories').push();
    set(newStoryRef, {
      text: storyText,
      timestamp: Date.now()
    })
    .then(() => {
      storyInput.value = '';
    })
    .catch(error => {
      console.error('Erro ao enviar a história:', error);
    });
  } else {
    alert('Por favor, escreva algo antes de enviar.');
  }
});

// Carregar histórias
onChildAdded(ref(database, 'stories'), (snapshot) => {
  const story = snapshot.val();
  const storyDiv = document.createElement('div');
  storyDiv.classList.add('story');
  storyDiv.innerHTML = `
    <h3>Nova História</h3>
    <p>${story.text}</p>
  `;
  storiesContainer.insertBefore(storyDiv, storiesContainer.firstChild);
});

