import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBItWx-Ly7KWA-PixHIvm2uHwgOh5-0NiA",
    authDomain: "whisperwall-f78d2.firebaseapp.com",
    databaseURL: "https://whisperwall-f78d2-default-rtdb.firebaseio.com",
    projectId: "whisperwall-f78d2",
    storageBucket: "whisperwall-f78d2.firebaseapp.com",
    messagingSenderId: "783148270853",
    appId: "1:783148270853:web:74ec6b14c3737660dee36c",
    measurementId: "G-D6CBGN57YK"
};

// Inicializando Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// Referências do DOM
const storyInput = document.getElementById("storyInput");
const submitButton = document.getElementById("submitStory");
const storiesContainer = document.getElementById("storiesContainer");
const userNameInput = document.getElementById("userName");
const saveUserNameButton = document.getElementById("saveUserName");

// Variáveis de usuário
let currentUser = null;
let currentUserName = 'Anônimo';

// Autenticação
const authenticateUser = () => {
    signInAnonymously(auth)
        .then(() => console.log("Usuário autenticado"))
        .catch(error => console.error("Erro ao autenticar:", error));
};

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
    } else {
        authenticateUser();
    }
});

// Salvar nome do usuário
saveUserNameButton.addEventListener('click', () => {
    currentUserName = userNameInput.value.trim() || 'Anônimo';
    alert("Nome salvo!");
});

// Enviar história
submitButton.addEventListener("click", () => {
    if (!currentUser) {
        alert("Você precisa estar logado para enviar uma história.");
        return;
    }

    const storyText = storyInput.value.trim();
    if (storyText) {
        const storiesRef = ref(database, "stories");
        push(storiesRef, {
            text: storyText,
            createdBy: currentUser.uid,
            userName: currentUserName,
            timestamp: Date.now()
        })
        .then(() => {
            console.log("História enviada com sucesso.");
            storyInput.value = ""; // Limpar o campo
        })
        .catch(error => console.error("Erro ao enviar história:", error));
    }
});

// Exibir histórias
const storiesRef = ref(database, "stories");
onValue(storiesRef, (snapshot) => {
    storiesContainer.innerHTML = "";
    const stories = snapshot.val();

    if (stories) {
        Object.entries(stories).forEach(([id, story]) => {
            const storyDiv = document.createElement("div");
            storyDiv.className = "story";
            storyDiv.innerHTML = `
                <h3>${story.userName}</h3>
                <p>${story.text}</p>
                <button class="delete-btn" data-id="${id}">Apagar</button>
            `;
            storiesContainer.appendChild(storyDiv);

            // Apagar história
            document.querySelector(`.delete-btn[data-id="${id}"]`).addEventListener('click', () => {
                if (story.createdBy === currentUser.uid) {
                    const storyRef = ref(database, `stories/${id}`);
                    remove(storyRef)
                        .then(() => console.log("História apagada com sucesso"))
                        .catch(error => console.error("Erro ao apagar história:", error));
                }
            });
        });
    }
});
