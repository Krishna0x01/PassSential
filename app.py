from flask import Flask, render_template, request, jsonify
import re
import math

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/check-password", methods=["POST"])
def check_password():

    password = request.json["password"]
    score = 0

    if len(password) >= 8:
        score += 1

    if re.search(r"[A-Z]", password):
        score += 1

    if re.search(r"[a-z]", password):
        score += 1

    if re.search(r"[0-9]", password):
        score += 1

    if re.search(r"[^A-Za-z0-9]", password):
        score += 1

    if score <= 2:
        strength = "Weak"

    elif score <= 4:
        strength = "Medium"

    else:
        strength = "Strong"

    # Educational estimate based on a simple offline brute-force model.
    # This is only an approximation; real cracking speed depends on the
    # hashing algorithm, hardware, salts, rate limits, and other factors.
    charset_size = 0

    if re.search(r"[a-z]", password):
        charset_size += 26

    if re.search(r"[A-Z]", password):
        charset_size += 26

    if re.search(r"[0-9]", password):
        charset_size += 10

    if re.search(r"[^A-Za-z0-9]", password):
        charset_size += 33

    if charset_size == 0:
        crack_time = "0"
    else:
        # Approximate 10 billion guesses per second.
        guesses = charset_size ** len(password)
        seconds = guesses / (10 ** 10 * 2)
        century = 100 * 365.25 * 24 * 60 * 60

        if seconds >= century:
            crack_time = "Over a century"
        elif seconds < 1:
            crack_time = "Less than a second"
        elif seconds < 60:
            crack_time = f"{seconds:.0f} seconds"
        elif seconds < 3600:
            crack_time = f"{seconds / 60:.0f} minutes"
        elif seconds < 86400:
            crack_time = f"{seconds / 3600:.1f} hours"
        elif seconds < 31557600:
            crack_time = f"{seconds / 86400:.1f} days"
        else:
            crack_time = f"{seconds / 31557600:.1f} years"

    return jsonify({
        "strength": strength,
        "score": score,
        "crack_time": crack_time
    })


if __name__ == "__main__":
    app.run(debug=True)