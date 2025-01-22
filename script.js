import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBItWx-Ly7KWA-PixHIvm2uHwgOh5-0NiA",
    authDomain: "whisperwall-f78d2.firebaseapp.com",
    databaseURL: "https://whisperwall-f78d2-default-rtdb.firebaseio.com",
    projectId: "whisperwall-f78d2",
    storageBucket: "whisperwall-f78d2.firebasestorage.app",
    messagingSenderId: "783148270853",
    appId: "1:783148270853:web:74ec6b14c3737660dee36c",
    measurementId: "G-D6CBGN57YK"
};

// Inicializando Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// Elementos do DOM
const storyInput = document.getElementById("storyInput");
const submitButton = document.getElementById("submitStory");
const storiesContainer = document.getElementById("storiesContainer");

// Estado do usuário autenticado
let currentUser = null;

// Função para autenticar anonimamente
const authenticateUser = () => {
    signInAnonymously(auth)
        .then(() => {
            console.log("Usuário autenticado anonimamente.");
        })
        .catch((error) => {
            console.error("Erro ao autenticar:", error);
        });
};

// Monitorar mudanças no estado de autenticação
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        console.log("Usuário autenticado:", user.uid);
    } else {
        currentUser = null;
        authenticateUser();
    }
});

// Função para adicionar história ao banco de dados
submitButton.addEventListener("click", () => {
    if (!currentUser) {
        alert("Você precisa estar logado para enviar uma mensagem.");
        return;
    }

    const storyText = storyInput.value.trim();

    if (storyText) {
        const storiesRef = ref(database, "stories");
        push(storiesRef, {
            text: storyText,
            createdBy: currentUser.uid,
            timestamp: Date.now()
        });

        storyInput.value = "";
    } else {
        alert("Por favor, escreva uma história antes de enviar!");
    }
});

// Função para carregar histórias do banco de dados
const storiesRef = ref(database, "stories");
onValue(storiesRef, (snapshot) => {
    storiesContainer.innerHTML = ""; // Limpa o container antes de carregar as histórias
    const stories = snapshot.val();

    if (stories) {
        const sortedStories = Object.entries(stories).sort((a, b) => b[1].timestamp - a[1].timestamp);

        sortedStories.forEach(([id, story]) => {
            const storyDiv = document.createElement("div");
            storyDiv.className = "story";
            storyDiv.innerHTML = `
                <h3>Story</h3>
                <p>${story.text}</p>
                ${story.createdBy === (currentUser ? currentUser.uid : "") ? `<button onclick="deleteStory('${id}')">Apagar</button>` : ""}
            `;
            storiesContainer.appendChild(storyDiv);
        });
    }
});

// Função para apagar uma história (somente pelo autor)
window.deleteStory = (id) => {
    if (!currentUser) {
        alert("Você precisa estar logado para apagar mensagens.");
        return;
    }

    const storyRef = ref(database, `stories/${id}`);
    storyRef.remove()
        .then(() => {
            console.log("História apagada com sucesso.");
        })
        .catch((error) => {
            console.error("Erro ao apagar história:", error);
        });
};


