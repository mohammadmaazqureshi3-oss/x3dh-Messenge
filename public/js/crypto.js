const token = localStorage.getItem('token');
if (!token) window.location.href = '/login.html';

let selectedRecipientId = null;

async function loadContacts() {
    try {
        const res = await fetch('/api/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const users = await res.json();
        const list = document.getElementById('contacts-list');
        
        if (users.length === 0) {
            list.innerHTML = "<p style='padding:10px;'>No other users yet.</p>";
        } else {
            list.innerHTML = users.map(u => `
                <div class="contact-item" onclick="selectUser(${u.id}, '${u.username}')">
                    ${u.username}
                </div>
            `).join('');
        }
    } catch (err) { console.error("Error loading contacts"); }
}

function selectUser(id, name) {
    selectedRecipientId = id;
    document.getElementById('chat-title').innerText = `Chatting with ${name}`;
    
    // Highlight the active contact
    document.querySelectorAll('.contact-item').forEach(el => el.classList.remove('active'));
    event.target.classList.add('active');
    
    loadMessages(id);
}

// THE FIX: This function now correctly handles the Send button
async function sendMessage() {
    const input = document.getElementById('msg-input');
    const message = input.value.trim();

    if (!selectedRecipientId) {
        return alert("Please select a contact first!");
    }
    if (!message) return;

    try {
        const response = await fetch('/api/message', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
                recipientId: selectedRecipientId,
                ciphertext: message, // SEC-PRJ-9: Sends text to be stored in DB
                ephemeralKey: "X3DH_TEMP_KEY" // Placeholder for protocol handshake
            })
        });

        if (response.ok) {
            // Append the message to the UI immediately
            const chatBox = document.getElementById('chat-box');
            chatBox.innerHTML += `<div style="text-align:right; margin:5px;"><b>You:</b> ${message}</div>`;
            input.value = ""; // Clear the input box
            chatBox.scrollTop = chatBox.scrollHeight; // Scroll to bottom
        } else {
            alert("Failed to send message.");
        }
    } catch (err) {
        console.error("Send error:", err);
    }
}

// Optional: Load chat history when a contact is selected
async function loadMessages(recipientId) {
    const res = await fetch(`/api/messages/${recipientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const messages = await res.json();
    const chatBox = document.getElementById('chat-box');
    chatBox.innerHTML = messages.map(m => `
        <div style="text-align: ${m.sender_id == recipientId ? 'left' : 'right'}; margin:5px;">
            <b>${m.sender_name}:</b> ${m.ciphertext}
        </div>
    `).join('');
    chatBox.scrollTop = chatBox.scrollHeight;
}

loadContacts();