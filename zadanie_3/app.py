from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO, join_room
from time import sleep
import database
import stats_generator

app = Flask(__name__)
socketio = SocketIO(app, async_mode=None)
database.databse_init()

stats = stats_generator.Stats()


@app.route("/history", methods=["GET"])
def get_recent_history():
    offset = request.args.get('offset', default=0, type=int)

    rows = database.get_recent_messages(limit=10, offset=offset)

    messages = []
    for row in rows:
        messages.append({
            "id": row["id"],
            "sender": row["sender"],
            "content": row["content"],
            "created_at": row["created_at"]
        })

    return jsonify(messages)


@socketio.on("send_message")
def handle_send_message(data):
    content = data["content"]
    sender = data["sender"]
    receiver = data["receiver"]

    if content and sender and receiver:
        msg_id = database.add_message(sender, receiver, content)

        broadcast_data = {
            "id": msg_id,
            "sender": sender,
            "content": content
        }

        socketio.emit("new_message", broadcast_data, to=receiver)
        socketio.emit("new_message", broadcast_data, to=sender)


@socketio.on('update_stats')
def update_stats(sender):
    stats.update_stats()
    data = stats.get_stats()

    socketio.emit('status_update_data', data, to=sender)


@socketio.on('join')
def handle_join(data):
    user = data.get('user')

    if user:
        join_room(user)


@app.route("/")
def index():
    return render_template("index.html")


if __name__ == "__main__":
    socketio.run(app, debug=True, host='127.0.0.1', port='5001')
