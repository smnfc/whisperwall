import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-database.js";

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const storyInput = document.getElementById('storyInput');
const submitButton = document.getElementById('submitStory');
const storiesContainer = document.getElementById('storiesContainer');

// Add story to Firebase
submitButton.addEventListener('click', () => {
    const storyText = storyInput.value.trim();
    if (storyText) {
        const storiesRef = ref(db, 'stories');
        push(storiesRef, { text: storyText, timestamp: Date.now() });
        storyInput.value = '';
    } else {
        alert('Please write a story before submitting.');
    }
});

// Fetch stories from Firebase
onValue(ref(db, 'stories'), (snapshot) => {
    storiesContainer.innerHTML = '';
    const data = snapshot.val();
    if (data) {
        const storiesArray = Object.values(data).sort((a, b) => b.timestamp - a.timestamp);
        storiesArray.forEach(story => {
            const storyDiv = document.createElement('div');
            storyDiv.className = 'story';
            storyDiv.innerHTML = `<h3>Anonymous</h3><p>${story.text}</p>`;
            storiesContainer.appendChild(storyDiv);
        });
    }
});

