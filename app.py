from flask import Flask, render_template, request, jsonify
import re
import hashlib
import math
import urllib.request
import urllib.error

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


# =========================
# PASSWORD STRENGTH CHECK
# =========================

@app.route("/check-password", methods=["POST"])
def check_password():

    data = request.get_json(silent=True) or {}
    password = data.get("password", "")
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
        # Approximate 10 billion guesses per second and assume
        # an average of half the search space must be tried.
        # Use logarithms so extremely long passwords cannot overflow.
        log10_seconds = (
            len(password) * math.log10(charset_size)
            - math.log10(2 * 10**10)
        )

        century = 100 * 365.25 * 24 * 60 * 60
        log10_century = math.log10(century)

        if log10_seconds >= log10_century:
            crack_time = "Over a century"

        else:
            seconds = 10 ** log10_seconds

            if seconds < 1:
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


# =========================
# BREACH CHECK
# =========================

@app.route("/check-breach", methods=["POST"])
def check_breach():

    data = request.get_json(silent=True) or {}
    password = data.get("password", "")

    # Do not check an empty password.
    if not password:
        return jsonify({
            "breached": False,
            "count": 0
        })

    try:

        # Create SHA-1 hash locally.
        # The actual password is NEVER sent to HIBP.
        password_hash = hashlib.sha1(
            password.encode("utf-8")
        ).hexdigest().upper()

        # Split the hash into:
        # First 5 characters = prefix
        # Remaining 35 characters = suffix
        prefix = password_hash[:5]
        suffix = password_hash[5:]

        # Ask HIBP only for hashes beginning with this prefix.
        url = f"https://api.pwnedpasswords.com/range/{prefix}"

        request_obj = urllib.request.Request(
            url,
            headers={
                "User-Agent": "PassSentinel-Password-Security-Checker/1.0",
                "Add-Padding": "true"
            }
        )

        with urllib.request.urlopen(request_obj, timeout=10) as response:

            result = response.read().decode("utf-8")

        # Search the returned hash suffixes locally.
        for line in result.splitlines():

            parts = line.split(":")

            if len(parts) != 2:
                continue

            returned_suffix = parts[0].strip()
            count = int(parts[1].strip())

            if returned_suffix.upper() == suffix:

                return jsonify({
                    "breached": True,
                    "count": count
                })

        # Full hash was not found.
        return jsonify({
            "breached": False,
            "count": 0
        })

    except urllib.error.HTTPError as error:

        print("HIBP HTTP error:", error.code)

        if error.code == 429:
            message = "Breach service rate limit reached. Please try again shortly."
        else:
            message = "Breach service temporarily unavailable."

        return jsonify({
            "breached": False,
            "count": 0,
            "error": message
        }), 502

    except urllib.error.URLError as error:

        print("HIBP connection error:", error.reason)

        return jsonify({
            "breached": False,
            "count": 0,
            "error": "Could not connect to breach service."
        }), 502

    except Exception as error:

        print("Breach check error:", error)

        return jsonify({
            "breached": False,
            "count": 0,
            "error": "Breach check failed."
        }), 500


if __name__ == "__main__":
    app.run()

