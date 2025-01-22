import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

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

// Função para adicionar história ao banco de dados
submitButton.addEventListener("click", () => {
    const storyText = storyInput.value.trim();
    const currentUser = auth.currentUser;

    if (!currentUser) {
        alert("Você precisa estar logado para enviar uma história.");
        return;
    }

    if (storyText) {
        const storiesRef = ref(database, "stories");
        push(storiesRef, {
            text: storyText,
            createdBy: currentUser.uid,
            timestamp: Date.now()
        });

        storyInput.value = "";
    } else {
        alert("Por favor, escreva algo antes de enviar!");
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
                <h3>História</h3>
                <p>${story.text}</p>
                ${
                    auth.currentUser && auth.currentUser.uid === story.createdBy
                        ? `<button class="delete-button" data-id="${id}">Apagar</button>`
                        : ""
                }
            `;

            storiesContainer.appendChild(storyDiv);
        });

        // Adicionar evento de exclusão para os botões
        const deleteButtons = document.querySelectorAll(".delete-button");
        deleteButtons.forEach((button) => {
            button.addEventListener("click", (e) => {
                const storyId = e.target.getAttribute("data-id");
                deleteStory(storyId);
            });
        });
    }
});

// Função para apagar uma história
function deleteStory(storyId) {
    const storyRef = ref(database, `stories/${storyId}`);
    remove(storyRef)
        .then(() => {
            alert("História apagada com sucesso!");
        })
        .catch((error) => {
            console.error("Erro ao apagar a história:", error);
        });
}

// Verifica mudanças no estado de autenticação
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Usuário logado:", user.uid);
    } else {
        console.log("Nenhum usuário logado.");
    }
});


