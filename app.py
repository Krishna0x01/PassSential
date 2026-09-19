from flask import Flask, render_template, request, jsonify
import re
import math

app = Flask(__name__)


def estimate_crack_time(password):
    """
    Rough brute-force estimate.

    Assumption: an attacker can try 10 billion guesses per second.
    Real cracking speed varies by password-hashing algorithm, hardware,
    attack method, and whether the password is common or predictable.
    """
    if not password:
        return "—"

    charset_size = 0

    if re.search(r"[a-z]", password):
        charset_size += 26
    if re.search(r"[A-Z]", password):
        charset_size += 26
    if re.search(r"[0-9]", password):
        charset_size += 10
    if re.search(r"[^A-Za-z0-9]", password):
        charset_size += 33

    # Average guesses needed is roughly half of the full search space.
    # Logarithms prevent overflow for very long passwords.
    log10_seconds = (
        len(password) * math.log10(charset_size)
        - math.log10(2)
        - math.log10(10_000_000_000)
    )

    if log10_seconds < math.log10(60):
        return "less than a minute"

    seconds = 10 ** log10_seconds

    if seconds < 3600:
        return f"about {seconds / 60:.0f} minutes"
    if seconds < 86400:
        return f"about {seconds / 3600:.1f} hours"
    if seconds < 31536000:
        return f"about {seconds / 86400:.1f} days"

    log10_years = log10_seconds - math.log10(31536000)
    # Keep the display simple once the estimate goes beyond one century.
    if log10_years <= 2:
        years = 10 ** log10_years
        return f"about {years:,.0f} years"
    return "over century"


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

    return jsonify({
        "strength": strength,
        "score": score,
        "crack_time": estimate_crack_time(password)
    })


if __name__ == "__main__":
    app.run(debug=True)