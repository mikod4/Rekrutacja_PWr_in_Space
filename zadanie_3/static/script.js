let last_msg_id = -1;
let current_user = "";
let message_offset = 0;
let is_fetching = false;
let has_more_messages = true;
let stats_interval = null

const max_data_graph = 15;
let timestamps = Array(max_data_graph).fill('');
let energy_buffer = Array(max_data_graph).fill(null);
let pulse_buffer = Array(max_data_graph).fill(null)
let temperature_buffer = Array(max_data_graph).fill(null);
let energy_chart, pulse_chart, temperature_chart;
const chart_config = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    scales: {
        x: { ticks: { color: '#aaa' }, grid: { color: '#333' } },
        y: { ticks: { color: '#aaa' }, grid: { color: '#333' } }
    },
    plugins: { legend: { display: false } }
};

const socket = io();
const chat_history = document.getElementById("chat-history");
const chat_form = document.getElementById("msg-form");
const message_input = document.getElementById("msg-input");

function showSelectUserModal() {
    document.getElementById('login-modal').style.display = '';
}

function selectUser(user) {
    if (current_user !== null && user === current_user) {
        document.getElementById('login-modal').style.display = 'none';
        return;
    }

    socket.emit('join', { "user": user }, (response) => {
        if (!response.success) {
            alert(response.message);
            return;
        }

        clearSessionData();

        current_user = user;

        loadMessages();
        socket.emit('update_stats', current_user);

        switchTab('energy');
        chartsInit();

        stats_interval = setInterval(() => socket.emit('update_stats', current_user), 3000);

        document.getElementById('login-modal').style.display = 'none';
    });
}


function switchTab(tab) {
    document.getElementById('energy-canvas').style.display = 'none';
    document.getElementById('pulse-canvas').style.display = 'none';
    document.getElementById('temperature-canvas').style.display = 'none';

    document.getElementById(`${tab}-canvas`).style.display = '';

    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    const clicked_button = document.querySelector(`.tab-btn[onclick="switchTab('${tab}')"]`);
    if (clicked_button) clicked_button.classList.add('active');
}

function chartInit(canvas_id, dataset, line_color) {
    return new Chart(
        document.getElementById(canvas_id).getContext('2d'),
        {
            type: 'line',
            data: { labels: timestamps, datasets: [{ data: dataset, borderColor: line_color, tension: 0.3 }] },
            options: chart_config
        }
    );
}

function chartsInit() {
    energy_chart = chartInit('energy-canvas', energy_buffer, '#f1c40f');
    pulse_chart = chartInit('pulse-canvas', pulse_buffer, '#ff4d4d');
    temperature_chart = chartInit('temperature-canvas', temperature_buffer, '#007bff');
}

function clearSessionData() {
    last_msg_id = -1;
    current_user = "";
    message_offset = 0;
    is_fetching = false;
    has_more_messages = true;

    if (stats_interval !== null) {
        clearInterval(stats_interval);
        stats_interval = null;
    }

    if (energy_chart) energy_chart.destroy();
    if (pulse_chart) pulse_chart.destroy();
    if (temperature_chart) temperature_chart.destroy();

    timestamps = Array(max_data_graph).fill('');
    energy_buffer = Array(max_data_graph).fill(null);
    pulse_buffer = Array(max_data_graph).fill(null)
    temperature_buffer = Array(max_data_graph).fill(null);

    chat_history.innerHTML = "";
}

function addMessage(msg, prepend = false) {
    if (prepend || msg.id > last_msg_id) {
        const div = document.createElement("div");
        div.className = msg.sender === current_user ? 'msg-sent' : 'msg-received'

        div.innerHTML = `<strong>${msg.sender}: </strong>${msg.content}`;

        if (prepend) {
            chat_history.prepend(div)
        } else {
            chat_history.appendChild(div);

            last_msg_id = msg.id;

            setTimeout(() => chat_history.scrollTop = chat_history.scrollHeight, 10);
        }
    }
}

async function loadMessages() {
    is_fetching = true;

    const response = await fetch('/history');
    const messages = await response.json();

    messages.forEach(msg => addMessage(msg, false));

    message_offset = messages.length;

    if (messages.length < 10) {
        has_more_messages = false;
    }

    setTimeout(() => {
        chat_history.scrollTop = chat_history.scrollHeight;
        is_fetching = false;
    }, 10);
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

    older_messages.reverse().forEach(msg => addMessage(msg, true));

    setTimeout(() => chat_history.scrollTop = chat_history.scrollHeight - scroll_height, 10);

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

socket.on('new_message', (msg) => {
    addMessage(msg);
    message_offset++;
});

socket.on('status_update_data', (stats) => {
    document.getElementById("energy").innerHTML = `Poziom energii: ${stats.energy}%`;
    document.getElementById("pulse").innerHTML = `Tętno: ${stats.pulse}`;
    document.getElementById("temperature").innerHTML = `Temperatura: ${stats.temperature}`;
    document.getElementById("mood").innerHTML = `Nastrój: ${stats.mood}`;

    const now = new Date();
    const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    timestamps.push(timeString);
    energy_buffer.push(stats.energy);
    pulse_buffer.push(stats.pulse);
    temperature_buffer.push(stats.temperature);

    if (timestamps.length > max_data_graph) {
        timestamps.shift();
        energy_buffer.shift();
        pulse_buffer.shift();
        temperature_buffer.shift();
    }

    if (energy_chart) energy_chart.update();
    if (pulse_chart) pulse_chart.update();
    if (temperature_chart) temperature_chart.update();
});