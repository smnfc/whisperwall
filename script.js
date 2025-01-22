import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getDatabase, ref, push, onValue, remove, set, get } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

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

// Variável para guardar o usuário autenticado
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
    const userName = userNameInput.value.trim() || "Anônimo";

    if (storyText) {
        const storiesRef = ref(database, "stories");
        push(storiesRef, {
            text: storyText,
            createdBy: currentUser.uid,
            userName: userName,
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
                <h3>${story.userName}</h3>
                <p>${story.text}</p>
                <div class="actions">
                    <button class="like-btn" data-id="${id}">${story.likes[currentUser?.uid] ? 'Descurtir' : 'Curtir'}</button>
                    <button class="comment-btn" data-id="${id}">Comentar</button>
                    <button class="delete-btn" data-id="${id}">Apagar</button>
                </div>
                <div class="comments" id="comments-${id}"></div>
            `;
            
            // Adicionar comentários
            const commentBtn = storyDiv.querySelector(".comment-btn");
            commentBtn.addEventListener("click", () => {
                const commentText = prompt("Escreva seu comentário:");
                if (commentText) {
                    const commentsRef = ref(database, `stories/${id}/comments`);
                    const newComment = push(commentsRef);
                    set(newComment, { text: commentText, createdBy: currentUser.uid });
                }
            });

            // Função para curtir
            const likeBtn = storyDiv.querySelector(".like-btn");
            likeBtn.addEventListener("click", () => {
                const likesRef = ref(database, `stories/${id}/likes`);
                const userLike = story.likes[currentUser?.uid] ? null : currentUser?.uid;
                set(ref(database, `stories/${id}/likes/${currentUser?.uid}`), userLike);
            });

            // Apagar história
            const deleteBtn = storyDiv.querySelector(".delete-btn");
            deleteBtn.addEventListener("click", () => {
                const storyRef = ref(database, `stories/${id}`);
                remove(storyRef);
            });

            storiesContainer.appendChild(storyDiv);

            // Carregar comentários
            const commentsContainer = document.getElementById(`comments-${id}`);
            if (story.comments) {
                Object.values(story.comments).forEach(comment => {
                    const commentDiv = document.createElement("div");
                    commentDiv.className = "comment";
                    commentDiv.textContent = comment.text;
                    commentsContainer.appendChild(commentDiv);
                });
            }
        });
    }
});
