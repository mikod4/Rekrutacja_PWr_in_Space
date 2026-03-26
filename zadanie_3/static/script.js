let last_msg_id = 0;
let current_user = "";

const socket = io();
const chat_history = document.getElementById("chat-history");
const chat_form = document.getElementById("msg-form");
const message_input = document.getElementById("msg-input");


function selectUser(user) {
    current_user = user
    document.getElementById('login-modal').style.display = "none";

    socket.emit('join', { user: current_user });

    loadMessages();
}

function add_message(msg) {
    if (msg.id > last_msg_id) {
        const div = document.createElement("div");
        div.className = msg.sender === current_user ? 'msg-sent' : 'msg-received'

        div.innerHTML = `<strong>${msg.sender}: </strong>${msg.content}`;

        chat_history.appendChild(div);

        last_msg_id = msg.id;

        chat_history.scrollTop = chat_history.scrollHeight;
    }
}

async function loadMessages() {
    const response = await fetch('/history');
    const messages = await response.json();

    messages.forEach(add_message);

    chat_history.scrollTop = chat_history.scrollHeight;
}

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