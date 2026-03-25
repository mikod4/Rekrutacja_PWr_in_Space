const chat_history = document.getElementById("chat-history")
const chat_form = document.getElementById("msg-form")
const message_input = document.getElementById("msg-input")

async function loadMessages() {
    const response = await fetch('/api/history')
    const messages = await response.json()

    chat_history.innerHTML = ''

    messages.forEach(msg => {
        const div = document.createElement("div");

        div.innerHTML = `<strong>${msg.sender}: </strong>${msg.content}`;

        chat_history.appendChild(div)
    });

    chat_history.scrollTop = chat_history.scrollHeight;
}

chat_form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const message = message_input.value;

    if (!message) return;

    message_input.value = '';

    await fetch('/api/message', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ content: message })
    });

    loadMessages();
});

loadMessages();