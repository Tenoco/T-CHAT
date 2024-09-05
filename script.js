let username = '';
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatSendButton = document.getElementById('chat-send');
const joinChatButton = document.getElementById('join-chat');
const userSection = document.getElementById('user-section');
const chatContainer = document.getElementById('chat-container');
const serverStatus = document.getElementById('server-status');
const SERVER_URL = 'http://10.55.153.175:8000'; // Update to your server's IP

// Function to display a message in the chat
function displayMessage(message, isSentByUser) {
    const messageElement = document.createElement('div');
    messageElement.className = `chat-bubble ${isSentByUser ? 'user' : 'other'}`;
    messageElement.textContent = message;

    const timestamp = document.createElement('span');
    timestamp.className = 'timestamp';
    const now = new Date();
    timestamp.textContent = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    messageElement.appendChild(timestamp);

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to send a message
function sendMessage() {
    const message = chatInput.value.trim();
    if (message !== '') {
        const data = {
            chatFileName: 'chat.txt',
            message: `${username}: ${message}`
        };

        console.log('Sending message:', data);

        fetch(`${SERVER_URL}/upload`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            displayMessage(`${username}: ${message}`, true);
            chatInput.value = '';
        })
        .catch(error => {
            console.error('Error:', error);
            alertServerStatus(false);
        });
    } else {
        alert('Please enter a message before sending.');
    }
}

// Function to join chat
function joinChat() {
    username = document.getElementById('username').value.trim();
    if (username) {
        userSection.style.display = 'none';
        chatContainer.style.display = 'block';
        fetchMessages();
        setInterval(fetchMessages, 3000);
    }
}

// Function to fetch messages
function fetchMessages() {
    fetch(`${SERVER_URL}/files/chat.txt`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
    })
    .then(messages => {
        chatMessages.innerHTML = '';
        messages.forEach(message => {
            const isSentByUser = message.startsWith(username);
            displayMessage(message, isSentByUser);
        });
    })
    .catch(error => {
        console.error('Error:', error);
        alertServerStatus(false);
    });
}

// Function to alert the user of server status
function alertServerStatus(isActive) {
    if (isActive) {
        serverStatus.textContent = 'Server Status: Active';
        serverStatus.className = 'status active';
    } else {
        serverStatus.textContent = 'Server Status: Inactive';
        serverStatus.className = 'status inactive';
    }
}

// Function to check server status
function checkServerStatus() {
    fetch(`${SERVER_URL}/files/chat.txt`)
    .then(response => {
        if (response.ok) {
            alertServerStatus(true);
        } else {
            alertServerStatus(false);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alertServerStatus(false);
    });
}

// Initial server status check
checkServerStatus();
setInterval(checkServerStatus, 5000);

// Event listeners
joinChatButton.addEventListener('click', joinChat);
chatSendButton.addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});