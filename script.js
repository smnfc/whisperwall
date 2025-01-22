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

// Função para enviar histórias com animação
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
        })
            .then(() => {
                storyInput.value = "";

                // Animação de confirmação
                submitButton.style.transform = "scale(1.1)";
                setTimeout(() => {
                    submitButton.style.transform = "scale(1)";
                }, 200);
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

// Função para apagar histórias com animação
const deleteStory = (id) => {
    if (!currentUser) {
        alert("Você precisa estar logado para apagar mensagens.");
        return;
    }

    const storyRef = ref(database, `stories/${id}`);
    remove(storyRef)
        .then(() => {
            const storyElement = document.querySelector(`button[data-id="${id}"]`).parentElement;
            storyElement.style.transition = "opacity 0.3s ease, transform 0.3s ease";
            storyElement.style.opacity = "0";
            storyElement.style.transform = "translateY(-10px)";
            setTimeout(() => {
                storyElement.remove();
            }, 300);
        })
        .catch((error) => {
            console.error("Erro ao apagar história:", error);
        });
};
