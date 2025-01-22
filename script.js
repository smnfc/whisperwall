import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getDatabase, ref, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

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

// Elementos do DOM
const storyInput = document.getElementById("storyInput");
const submitButton = document.getElementById("submitStory");
const storiesContainer = document.getElementById("storiesContainer");
const userNameInput = document.getElementById("userName");
const saveUserNameButton = document.getElementById("saveUserName");

// Variáveis
let currentUser = null;
let currentUserName = 'Anônimo';

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

// Salvar nome do usuário
saveUserNameButton.addEventListener('click', () => {
    currentUserName = userNameInput.value.trim() || 'Anônimo';
    alert("Nome salvo!");
});

// Função para enviar histórias
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
            userName: currentUserName,
            timestamp: Date.now(),
            likes: {},
            comments: {}
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

// Função para carregar histórias
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
                <h3>${story.userName}</h3>
                <p>${story.text}</p>
                <button class="like-btn" data-id="${id}">Curtir</button>
                <button class="comment-btn" data-id="${id}">Comentar</button>
                ${story.createdBy === currentUser.uid ? `<button class="delete-btn" data-id="${id}">Apagar</button>` : ""}
            `;
            storiesContainer.appendChild(storyDiv);

            // Curtir
            document.querySelector(`.like-btn[data-id="${id}"]`).addEventListener('click', () => {
                const likesRef = ref(database, `stories/${id}/likes/${currentUser.uid}`);
                update(likesRef, { liked: true });
            });

            // Comentar
            document.querySelector(`.comment-btn[data-id="${id}"]`).addEventListener('click', () => {
                const comment = prompt("Escreva seu comentário:");
                if (comment) {
                    const commentsRef = ref(database, `stories/${id}/comments`);
                    push(commentsRef, { comment, user: currentUserName, timestamp: Date.now() });
                }
            });

            // Apagar história
            if (story.createdBy === currentUser.uid) {
                document.querySelector(`.delete-btn[data-id="${id}"]`).addEventListener('click', () => {
                    const storyRef = ref(database, `stories/${id}`);
                    remove(storyRef).then(() => {
                        console.log("História apagada com sucesso.");
                    });
                });
            }
        });
    }
});
