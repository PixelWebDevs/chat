import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCxPKZYqiBdlHTr6vUbIVIEvzwxpkeTOEQ",
  authDomain: "turtle-chat-a93fb.firebaseapp.com",
  databaseURL: "https://turtle-chat-a93fb-default-rtdb.firebaseio.com",
  projectId: "turtle-chat-a93fb",
  storageBucket: "turtle-chat-a93fb.appspot.com",
  messagingSenderId: "338945234611",
  appId: "1:338945234611:web:4abe6a3107bdee88b3c2c6",
  measurementId: "G-3WPR9KEVXN"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const messagesRef = ref(db, "messages");

// Invia un messaggio
function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;
  push(messagesRef, {
    user: currentUser,
    text: text,
    timestamp: Date.now()
  });
  messageInput.value = '';
}

// Mostra i messaggi in tempo reale
onValue(messagesRef, snapshot => {
  const data = snapshot.val();
  chatArea.innerHTML = '';
  for (let id in data) {
    const msg = data[id];
    chatArea.appendChild(createMessage(msg, id));
  }
  chatArea.scrollTop = chatArea.scrollHeight;
});

function createMessage(msg, id) {
    const div = document.createElement('div');
    div.className = 'message ' + (msg.user === currentUser ? 'self' : 'other');
  
    // Contenuto messaggio
    const messageText = document.createElement('span');
    
    // Handle different message types
    if (msg.type === 'file' && msg.fileData && msg.fileName) {
      const fileLink = document.createElement('a');
      fileLink.href = msg.fileData;
      fileLink.download = msg.fileName;
      fileLink.textContent = `📎 ${msg.fileName}`;
      fileLink.style.color = 'lightyellow';
      fileLink.style.textDecoration = 'underline';
      messageText.innerHTML = `<strong>${msg.user}</strong>: `;
      messageText.appendChild(fileLink);
    } else if (msg.type === 'audio' && msg.audioData) {
      messageText.innerHTML = `<strong>${msg.user}</strong>: `;
      const audioPlayer = document.createElement('audio');
      audioPlayer.controls = true;
      audioPlayer.style.width = '100%';
      audioPlayer.style.marginTop = '8px';
      const audioSource = document.createElement('source');
      audioSource.src = msg.audioData;
      audioSource.type = 'audio/webm';
      audioPlayer.appendChild(audioSource);
      div.appendChild(messageText);
      div.appendChild(audioPlayer);
    } else {
      messageText.innerHTML = `<strong>${msg.user}</strong>: ${msg.text || ''}`;
      div.appendChild(messageText);
    }
    
    if (msg.type !== 'audio') {
      div.appendChild(messageText);
    }
  
    // Pulsante elimina (solo per Owner o autore del messaggio)
    if (isOwner || msg.user === currentUser) {
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '✖';
      deleteBtn.className = 'delete-btn';
      deleteBtn.onclick = () => {
        deleteMessage(id);
      };
      div.appendChild(deleteBtn);
    }
  
    return div;
  }
  

// Send file message
function sendFile() {
  const fileInput = document.getElementById('fileInput');
  const files = fileInput.files;
  
  if (files.length === 0) return;
  
  for (let file of files) {
    const reader = new FileReader();
    reader.onload = (e) => {
      push(messagesRef, {
        user: currentUser,
        type: 'file',
        fileName: file.name,
        fileData: e.target.result,
        timestamp: Date.now()
      });
    };
    reader.readAsDataURL(file);
  }
  
  fileInput.value = '';
  document.getElementById('maskFile').style.display = 'none';
}

// Audio recording
let mediaRecorder;
let audioChunks = [];
let recordedBlob;

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];
    
    mediaRecorder.ondataavailable = (e) => {
      audioChunks.push(e.data);
    };
    
    mediaRecorder.onstop = () => {
      recordedBlob = new Blob(audioChunks, { type: 'audio/webm' });
      const audioUrl = URL.createObjectURL(recordedBlob);
      document.getElementById('audioPreview').src = audioUrl;
      document.getElementById('audioPreview').style.display = 'block';
      document.getElementById('btnSendAudio').disabled = false;
    };
    
    mediaRecorder.start();
    document.getElementById('startRec').disabled = true;
    document.getElementById('stopRec').disabled = false;
  } catch (err) {
    alert('Unable to access microphone: ' + err.message);
  }
}

function stopRecording() {
  mediaRecorder.stop();
  document.getElementById('startRec').disabled = false;
  document.getElementById('stopRec').disabled = true;
}

function sendAudio() {
  if (!recordedBlob) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    push(messagesRef, {
      user: currentUser,
      type: 'audio',
      audioData: e.target.result,
      timestamp: Date.now()
    });
  };
  reader.readAsDataURL(recordedBlob);
  
  // Reset audio recorder
  recordedBlob = null;
  audioChunks = [];
  document.getElementById('audioPreview').style.display = 'none';
  document.getElementById('audioPreview').src = '';
  document.getElementById('btnSendAudio').disabled = true;
  document.getElementById('startRec').disabled = false;
  document.getElementById('maskAudio').style.display = 'none';
}

  function deleteMessage(id) {
    const messageRef = ref(db, 'messages/' + id);
    remove(messageRef);
  }

// Event listeners for file and audio
document.addEventListener('DOMContentLoaded', () => {
  const btnFile = document.getElementById('btnFile');
  const btnAudio = document.getElementById('btnAudio');
  const btnSendFile = document.getElementById('btnSendFile');
  const btnSendAudio = document.getElementById('btnSendAudio');
  const startRec = document.getElementById('startRec');
  const stopRec = document.getElementById('stopRec');
  
  if (btnFile) {
    btnFile.addEventListener('click', () => {
      document.getElementById('maskFile').style.display = 'flex';
    });
  }
  
  if (btnAudio) {
    btnAudio.addEventListener('click', () => {
      document.getElementById('maskAudio').style.display = 'flex';
    });
  }
  
  if (btnSendFile) {
    btnSendFile.addEventListener('click', sendFile);
  }
  
  if (btnSendAudio) {
    btnSendAudio.addEventListener('click', sendAudio);
  }
  
  if (startRec) {
    startRec.addEventListener('click', startRecording);
  }
  
  if (stopRec) {
    stopRec.addEventListener('click', stopRecording);
  }
  
  // Close modal buttons
  document.querySelectorAll('.closeModal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.target.getAttribute('data-target');
      const modal = document.getElementById(target);
      if (modal) {
        modal.style.display = 'none';
      }
    });
  });
});
  
