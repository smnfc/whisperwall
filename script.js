import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getDatabase, ref, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBItWx-Ly7KWA-PixHIvm2uHwgOh5-0NiA",
    authDomain: "whisperwall-f78d2.firebaseapp.com",
    databaseURL: "https://whisperwall-f78d2-default-rtdb.firebaseio.com",
    projectId: "whisperwall-f78d2",
    storageBucket: "whisperwall-f78d2.firebase.storage.app",
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
const userNameInput = document.getElementById("userName");

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
    const userName = userNameInput.value.trim();

    if (storyText) {
        const storiesRef = ref(database, "stories");
        push(storiesRef, {
            text: storyText,
            createdBy: currentUser.uid,
            createdByName: userName || "Anônimo",
            timestamp: Date.now(),
            likes: 0,
            comments: []
        })
        .then(() => {
            console.log("História enviada com sucesso.");
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
    storiesContainer.innerHTML = "";
    const stories = snapshot.val();

    if (stories) {
        const sortedStories = Object.entries(stories).sort((a, b) => b[1].timestamp - a[1].timestamp);

        sortedStories.forEach(([id, story]) => {
            const storyDiv = document.createElement("div");
            storyDiv.className = "story";
            storyDiv.innerHTML = `
                <h3>${story.createdByName || "Anônimo"}</h3>
                <p>${story.text}</p>
                <p><strong>${story.likes} Curtidas</strong></p>
                <button class="like-btn" data-id="${id}">Curtir</button>
                <button class="comment-btn" data-id="${id}">Comentar</button>
                ${story.createdBy === currentUser.uid ? `<button class="delete-btn" data-id="${id}">Apagar</button>` : ""}
            `;
            storiesContainer.appendChild(storyDiv);
        });

        // Adicionar evento de clique para os botões de curtir
        document.querySelectorAll(".like-btn").forEach((button) => {
            button.addEventListener("click", (e) => {
                const storyId = e.target.getAttribute("data-id");
                likeStory(storyId);
            });
        });

        // Adicionar evento de clique para os botões de apagar
        document.querySelectorAll(".delete-btn").forEach((button) => {
            button.addEventListener("click", (e) => {
                const storyId = e.target.getAttribute("data-id");
                deleteStory(storyId);
            });
        });
    }
});

// Função para curtir história
const likeStory = (id) => {
    const storyRef = ref(database, `stories/${id}`);
    update(storyRef, {
        likes: firebase.database.ServerValue.increment(1)
    });
};

// Função para apagar história
const deleteStory = (id) => {
    const storyRef = ref(database, `stories/${id}`);
    remove(storyRef)
        .then(() => {
            console.log("História apagada com sucesso.");
        })
        .catch((error) => {
            console.error("Erro ao apagar história:", error);
        });
};
