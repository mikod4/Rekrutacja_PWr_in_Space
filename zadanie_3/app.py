from flask import Flask, render_template, request, jsonify
from markupsafe import escape
import database
import random

app = Flask(__name__)
database.databse_init()


@app.route("/api/history", methods=["GET"])
def get_history():
    rows = database.get_recent_messages(10)

    messages = []
    for row in rows:
        messages.append({
            "id": row["id"],
            "sender": row["sender"],
            "content": row["content"],
            "created_at": row["created_at"]
        })

    return jsonify(messages)


@app.route("/api/message", methods=["POST"])
def send_message():
    data = request.get_json()
    message = data["content"]

    if message:
        database.add_message("Ziemia", "Krzyś", message)

        responses = [
            "Krzysiu czuje się świetnie!",
            "Tętno w normie, misja trwa.",
            "Git"
        ]

        random_resp = random.choice(responses)

        database.add_message("Krzyś", "Ziemia", random_resp)

        return jsonify({"status": "sukces"}), 200

    return jsonify({"status": "error: no text"}), 400


@app.route("/")
def index():
    return render_template("index.html")
