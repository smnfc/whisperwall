// Configuração do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBItWx-Ly7KWA-PixHIvm2uHwgOh5-0NiA",
    authDomain: "whisperwall-f78d2.firebaseapp.com",
    databaseURL: "https://whisperwall-f78d2-default-rtdb.firebaseio.com",
    projectId: "whisperwall-f78d2",
    storageBucket: "whisperwall-f78d2.appspot.com",
    messagingSenderId: "783148270853",
    appId: "1:783148270853:web:74ec6b14c3737660dee36c",
    measurementId: "G-D6CBGN57YK"
};

// Inicialização do Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// Elementos do DOM
const storyInput = document.getElementById("storyInput");
const submitButton = document.getElementById("submitStory");
const storiesContainer = document.getElementById("storiesContainer");
const authStatus = document.getElementById("authStatus");

// Variável para o usuário autenticado
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

// Monitorar mudanças na autenticação
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        console.log("Usuário autenticado:", user.uid);
        authStatus.textContent = "Conectado!";
    } else {
        currentUser = null;
        authStatus.textContent = "Conectando...";
        authenticateUser();
    }
});

// Função para enviar histórias
submitButton.addEventListener("click", () => {
    console.log("Botão clicado!");

    if (!currentUser) {
        console.error("Usuário não autenticado!");
        alert("Você precisa estar logado para enviar uma mensagem.");
        return;
    }

    const storyText = storyInput.value.trim();
    console.log("Texto da história:", storyText);

    if (storyText) {
        const storiesRef = ref(database, "stories");
        push(storiesRef, {
            text: storyText,
            createdBy: currentUser.uid,
            timestamp: Date.now()
        })
            .then(() => {
                console.log("História enviada com sucesso!");
                storyInput.value = "";
            })
            .catch((error) => {
                console.error("Erro ao enviar história:", error);
            });
    } else {
        alert("Por favor, escreva uma história antes de enviar!");
    }
});

// Função para carregar histórias do banco de dados
const storiesRef = ref(database, "stories");
onValue(storiesRef, (snapshot) => {
    storiesContainer.innerHTML = ""; // Limpa o container
    const stories = snapshot.val();

    if (stories) {
        const sortedStories = Object.entries(stories).sort((a, b) => b[1].timestamp - a[1].timestamp);

        sortedStories.forEach(([id, story]) => {
            const storyDiv = document.createElement("div");
            storyDiv.className = "story";
            storyDiv.innerHTML = `
                <h3>Nova História</h3>
                <p>${story.text}</p>
                ${
                    story.createdBy === (currentUser ? currentUser.uid : "")
                        ? `<button class="delete-btn" data-id="${id}">Apagar</button>`
                        : ""
                }
            `;
            storiesContainer.appendChild(storyDiv);
        });

        // Adicionar eventos aos botões de apagar
        document.querySelectorAll(".delete-btn").forEach((button) => {
            button.addEventListener("click", (e) => {
                const storyId = e.target.getAttribute("data-id");
                deleteStory(storyId);
            });
        });
    }
});

// Função para apagar histórias
const deleteStory = (id) => {
    if (!currentUser) {
        alert("Você precisa estar logado para apagar mensagens.");
        return;
    }

    const storyRef = ref(database, `stories/${id}`);
    remove(storyRef)
        .then(() => {
            console.log("História apagada com sucesso.");
        })
        .catch((error) => {
            console.error("Erro ao apagar história:", error);
        });
};
