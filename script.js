let username = '';
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatSendButton = document.getElementById('chat-send');
const loginButton = document.getElementById('login-button');
const registerButton = document.getElementById('register-button');
const loginSection = document.getElementById('login-section');
const registrationSection = document.getElementById('registration-section');
const appContainer = document.getElementById('app-container');
const serverStatus = document.getElementById('server-status');
const onlineCount = document.getElementById('online-count');
const SERVER_URL = 'http://127.0.0.1:8000'; // Update to your server's IP

// Tab section functionality
const chatTab = document.getElementById('chat-tab');
const accountTab = document.getElementById('account-tab');
const accountSection = document.getElementById('account-section');

chatTab.addEventListener('click', () => {
    chatTab.classList.add('active');
    accountTab.classList.remove('active');
    accountSection.style.display = 'none';
    chatMessages.style.display = 'block'; // Show chat messages
});

accountTab.addEventListener('click', () => {
    accountTab.classList.add('active');
    chatTab.classList.remove('active');
    accountSection.style.display = 'block';
    chatMessages.style.display = 'none'; // Hide chat messages
    
    // Display account details
    document.getElementById('account-username').textContent = username;
    document.getElementById('account-email').textContent = getCookie('email');
});

// Edit account functionality
const editAccountButton = document.getElementById('edit-account');
const editAccountForm = document.getElementById('edit-account-form');
const editUsernameInput = document.getElementById('edit-username');
const editPasswordInput = document.getElementById('edit-password');
const saveAccountButton = document.getElementById('save-account');

editAccountButton.addEventListener('click', () => {
    editAccountForm.style.display = 'block';
});

saveAccountButton.addEventListener('click', () => {
    const newUsername = editUsernameInput.value.trim();
    const newPassword = editPasswordInput.value.trim();

    // Update user data on the server
    updateUserData(newUsername, newPassword)
        .then(() => {
            // Update local storage, cookies, and display
            localStorage.setItem('username', newUsername);
            setCookie('username', newUsername, 30);
            document.getElementById('account-username').textContent = newUsername;
            editAccountForm.style.display = 'none';
            alert('Account updated successfully!');
        })
        .catch(error => {
            console.error('Error updating account:', error);
            alert('Failed to update account. Please try again later.');
        });
});

// Function to display a message in the chat
function displayMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message'; // Use a simple class for styling
    messageElement.textContent = message;

    // Create a separator line
    const separator = document.createElement('div');
    separator.className = 'message-separator';

    chatMessages.appendChild(messageElement);
    chatMessages.appendChild(separator); // Add the separator after each message
    chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll to the bottom
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
            displayMessage(`${username}: ${message}`); // Display plain message
            chatInput.value = ''; // Clear the input field
        })
        .catch(error => {
            console.error('Error:', error);
            alertServerStatus(false);
        });
    } else {
        alert('Please enter a message before sending.');
    }
}

// Function to register a new user
function registerUser() {
    const regUsername = document.getElementById('reg-username').value.trim();
    const regEmail = document.getElementById('reg-email').value.trim();
    const regPassword = document.getElementById('reg-password').value.trim();

    const data = {
        username: regUsername,
        email: regEmail,
        password: regPassword
    };

    fetch(`${SERVER_URL}/register`, {
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
        alert('Registration successful! You can now log in.');
        document.getElementById('reg-username').value = '';
        document.getElementById('reg-email').value = '';
        document.getElementById('reg-password').value = '';
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Registration failed: ' + error.message);
    });
}

// Function to login and join chat
function loginAndJoinChat() {
    username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    const data = {
        username: username,
        email: email,
        password: password
    };

    fetch(`${SERVER_URL}/login`, {
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
        // Save user data to local storage and cookies
        localStorage.setItem('username', username);
        setCookie('username', username, 30);
        setCookie('email', email, 30);
        setCookie('password', password, 30);

        loginSection.style.display = 'none';
        registrationSection.style.display = 'none';
        appContainer.style.display = 'block'; // Show the app container
        fetchMessages();
        setInterval(fetchMessages, 3000); // Fetch messages every 3 seconds
        updateOnlineUsers(); // Update online users count
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Invalid username or password.');
    });
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
        chatMessages.innerHTML = ''; // Clear existing messages
        messages.forEach(message => {
            displayMessage(message); // Display plain message
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

// Function to update user data on the server
function updateUserData(newUsername, newPassword) {
    return fetch(`${SERVER_URL}/update`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: newUsername,
            password: newPassword
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
    });
}

// Function to update online users count
function updateOnlineUsers() {
    fetch(`${SERVER_URL}/online-users`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        onlineCount.textContent = data.onlineCount; // Update online users count
    })
    .catch(error => {
        console.error('Error fetching online users:', error);
    });
}

// Function to set a cookie
function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + value + '; expires=' + expires;
}

// Function to get a cookie
function getCookie(name) {
    return document.cookie.replace(new RegExp('(?:(?:^|.*;\\s*)' + name + '\\s*\\=\\s*([^;]*).*$)|^.*$'), "$1");
}

// Initial server status check
checkServerStatus();
setInterval(checkServerStatus, 5000); // Check server status every 5 seconds

// Auto-login if user data is available in local storage or cookies
window.addEventListener('load', () => {
    const storedUsername = localStorage.getItem('username') || getCookie('username');
    const storedEmail = getCookie('email');
    const storedPassword = getCookie('password');

    if (storedUsername && storedEmail && storedPassword) {
        document.getElementById('username').value = storedUsername;
        document.getElementById('email').value = storedEmail;
        document.getElementById('password').value = storedPassword;
        loginAndJoinChat(); // Auto-login
    }
});

// Event listeners for buttons
loginButton.addEventListener('click', loginAndJoinChat);
registerButton.addEventListener('click', registerUser);
chatSendButton.addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        sendMessage(); // Send message on Enter key
    }
});