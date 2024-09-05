let username = '';
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatSendButton = document.getElementById('chat-send');
const joinChatButton = document.getElementById('join-chat');
const userSection = document.getElementById('user-section');
const chatContainer = document.getElementById('chat-container');
const serverStatus = document.getElementById('server-status');

// Function to display a message in the chat
function displayMessage(message, isSentByUser) {
    const messageElement = document.createElement('div');
    messageElement.className = `chat-bubble ${isSentByUser ? 'user' : 'other'}`; // Assign class based on sender
    messageElement.textContent = message;

    // Create and append timestamp
    const timestamp = document.createElement('span');
    timestamp.className = 'timestamp';
    const now = new Date();
    timestamp.textContent = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`; // Format time
    messageElement.appendChild(timestamp);

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to bottom
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

        // Check if fetch is supported
        if (window.fetch) {
            fetch('http://10.104.224.118:8000/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                displayMessage(`${username}: ${message}`, true); // Pass true for user's message
                chatInput.value = '';
            })
            .catch(error => {
                console.error('Error:', error);
                alertServerStatus(false); // Alert user of server issue
            });
        } else {
            // Fallback to XMLHttpRequest
            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'http://10.104.224.118:8000/upload', true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    displayMessage(`${username}: ${message}`, true); // Pass true for user's message
                    chatInput.value = '';
                } else if (xhr.readyState === 4) {
                    console.error('Error:', xhr.statusText);
                    alertServerStatus(false); // Alert user of server issue
                }
            };
            xhr.send(JSON.stringify(data));
        }
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
        fetchMessages(); // Fetch previous messages
        setInterval(fetchMessages, 3000); // Poll for new messages every 3 seconds
    }
}

// Function to fetch messages
function fetchMessages() {
    fetch('http://10.104.224.118:8000/files/chat.txt')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(messages => {
        chatMessages.innerHTML = ''; // Clear previous messages
        messages.forEach(message => {
            const isSentByUser = message.startsWith(username); // Check if message is from the user
            displayMessage(message, isSentByUser);
        });
    })
    .catch(error => {
        console.error('Error:', error);
        alertServerStatus(false); // Alert user of server issue
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
    fetch('http://10.104.224.118:8000/files/chat.txt') // Check a specific endpoint
    .then(response => {
        if (response.ok) {
            alertServerStatus(true); // Server is active
        } else {
            alertServerStatus(false); // Server is inactive
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alertServerStatus(false); // Server is inactive
    });
}

// Initial server status check
checkServerStatus();
setInterval(checkServerStatus, 5000); // Check server status every 5 seconds

// Event listeners
joinChatButton.addEventListener('click', joinChat);
chatSendButton.addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});