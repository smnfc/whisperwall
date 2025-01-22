// Importar as funções necessárias do Firebase SDK
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue } from "firebase/database";

// Configuração do Firebase (substitua pelos seus dados fornecidos)
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
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Selecionar elementos do DOM
const submitButton = document.getElementById("submitStory");
const storyInput = document.getElementById("storyInput");
const storiesContainer = document.getElementById("storiesContainer");

// Função para criar um elemento visual de história
function createStoryElement(title, text) {
  const storyDiv = document.createElement("div");
  storyDiv.classList.add("story");
  storyDiv.innerHTML = `
    <h3>${title}</h3>
    <p>${text}</p>
  `;
  return storyDiv;
}

// Função para carregar histórias do Firebase
function loadStoriesFromFirebase() {
  const storiesRef = ref(database, "stories");
  onValue(storiesRef, (snapshot) => {
    storiesContainer.innerHTML = ""; // Limpa o container
    const stories = snapshot.val();
    if (stories) {
      Object.values(stories).forEach((story) => {
        const storyElement = createStoryElement(story.title, story.text);
        storiesContainer.appendChild(storyElement);
      });
    }
  });
}

// Evento para capturar o envio de uma nova história
submitButton.addEventListener("click", () => {
  const storyText = storyInput.value.trim();
  if (storyText) {
    const storiesRef = ref(database, "stories");
    const newStory = { title: "Nova História", text: storyText };
    push(storiesRef, newStory); // Salva a história no Firebase
    storyInput.value = ""; // Limpa o campo de texto
  } else {
    alert("Por favor, escreva algo antes de enviar.");
  }
});

// Carregar histórias ao inicializar
loadStoriesFromFirebase();

