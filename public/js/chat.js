const token = localStorage.getItem('token');
if (!token) window.location.href = '/login.html';

let selectedRecipientId = null;

async function loadContacts() {
    const res = await fetch('/api/users', { headers: { 'Authorization': `Bearer ${token}` } });
    const users = await res.json();
    document.getElementById('contacts-list').innerHTML = users.map(u => 
        `<div class="contact-item" onclick="selectUser(${u.id}, '${u.username}')">${u.username}</div>`
    ).join('');
}

async function selectUser(id, name) {
    selectedRecipientId = id;
    document.getElementById('chat-title').innerText = `Chatting with ${name}`;
    loadMessages(); // Show history immediately
}

async function loadMessages() {
    if (!selectedRecipientId) return;
    try {
        const res = await fetch(`/api/messages/${selectedRecipientId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const messages = await res.json();
        const chatBox = document.getElementById('chat-box');
        
        // REBUILD THE ENTIRE THREAD
        chatBox.innerHTML = messages.map(m => {
            const isMe = m.sender_id != selectedRecipientId;
            return `
                <div style="text-align: ${isMe ? 'right' : 'left'}; margin: 10px;">
                    <div style="display: inline-block; padding: 10px; border-radius: 10px; background: ${isMe ? '#764ba2' : '#eee'}; color: ${isMe ? 'white' : 'black'};">
                        <b>${isMe ? 'You' : (m.sender_name || 'Contact')}:</b> ${m.ciphertext}
                    </div>
                </div>`;
        }).join('');
        chatBox.scrollTop = chatBox.scrollHeight;
    } catch (e) { console.error("Update failed"); }
}

async function sendMessage() {
    const input = document.getElementById('msg-input');
    if (!selectedRecipientId || !input.value.trim()) return;

    const res = await fetch('/api/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ recipientId: selectedRecipientId, ciphertext: input.value, ephemeralKey: "X3DH" })
    });

    if (res.ok) { input.value = ""; loadMessages(); }
}

setInterval(loadMessages, 3000); // Poll for replies every 3 seconds
loadContacts();