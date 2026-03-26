let last_msg_id = -1;
let current_user = "";
let message_offset = 0;
let is_fetching = false;
let has_more_messages = true;
let stats_interval = null

const socket = io();
const chat_history = document.getElementById("chat-history");
const chat_form = document.getElementById("msg-form");
const message_input = document.getElementById("msg-input");

function showSelectUserModal() {
    document.getElementById('login-modal').style.display = "";
}

function selectUser(user) {
    current_user = user;
    document.getElementById('login-modal').style.display = "none";

    socket.emit('join', { user: current_user });

    clearMessages();
    loadMessages();
    socket.emit('update_stats', current_user);

    if (stats_interval !== null) {
        clearInterval(stats_interval);
    }

    stats_interval = setInterval(() => socket.emit('update_stats', current_user), 3000);
}

function clearMessages() {
    last_msg_id = -1;
    message_offset = 0;
    is_fetching = false;
    has_more_messages = true;
    chat_history.innerHTML = "";
}

function add_message(msg, prepend = false) {
    if (prepend || msg.id > last_msg_id) {
        const div = document.createElement("div");
        div.className = msg.sender === current_user ? 'msg-sent' : 'msg-received'

        div.innerHTML = `<strong>${msg.sender}: </strong>${msg.content}`;

        if (prepend) {
            chat_history.prepend(div)
        } else {
            chat_history.appendChild(div);

            last_msg_id = msg.id;

            chat_history.scrollTop = chat_history.scrollHeight;
        }
    }
}

async function loadMessages() {
    const response = await fetch('/history');
    const messages = await response.json();

    messages.forEach(msg => add_message(msg, false));

    message_offset = messages.length;

    setTimeout(() => chat_history.scrollTop = chat_history.scrollHeight, 10);
}

async function loadOlderMessages() {
    if (is_fetching || !has_more_messages) {
        return;
    }

    is_fetching = true;

    const response = await fetch(`/history?offset=${message_offset}`);
    const older_messages = await response.json();

    if (older_messages.length === 0) {
        has_more_messages = false;
        is_fetching = false;
        return;
    }

    const scroll_height = chat_history.scrollHeight;

    older_messages.reverse().forEach(msg => add_message(msg, true));

    chat_history.scrollTop = chat_history.scrollHeight - scroll_height;

    message_offset += older_messages.length;
    is_fetching = false;
}

chat_history.addEventListener('scroll', () => {
    if (chat_history.scrollTop === 0) {
        loadOlderMessages();
    }
});

chat_form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const message = message_input.value;
    if (!message || !current_user) return;

    message_input.value = '';

    socket.emit('send_message', {
        sender: current_user,
        receiver: current_user === "Ziemia" ? "Krzyś" : "Ziemia",
        content: message
    });
});

socket.on('new_message', (msg) =>
    add_message(msg)
);

socket.on('status_update_data', (stats) => {
    document.getElementById("energy").innerHTML = `Poziom energii: ${stats.energy}%`;
    document.getElementById("pulse").innerHTML = `Tętno: ${stats.pulse}`;
    document.getElementById("temperature").innerHTML = `Temperatura: ${stats.temperature}`;
    document.getElementById("mood").innerHTML = `Nastrój: ${stats.mood}`;
});