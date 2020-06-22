from flask import Flask, render_template, request, redirect, url_for, flash
from flask_pymongo import PyMongo
from passlib.hash import pbkdf2_sha256

app = Flask(__name__)
app.secret_key = "super secret key"


# set up pymongo
app.config["MONGO_URI"] = "mongodb://localhost:27017/covid19-forecast"
mongo = PyMongo(app)
# mongo.db.users.insert_one({"username":"john"})

# methods for authentication and registration


def authenticate(username, password):
    user = mongo.db.users.find_one(
        {"username": username})

    if user:
        if pbkdf2_sha256.verify(password, user["password"]):
            return True
    return False


def register(name, username, password):
    # Check if user already exists
    user = mongo.db.users.find_one(
        {"username": username})
    if user:
        return False
    # add new user
    hashed = pbkdf2_sha256.hash(password)
    mongo.db.users.insert_one(
        {"name": name, "username": username, "password": hashed})
    return True


@app.route("/")
def template():
    return render_template("template.html")


@app.route("/home")
def home():
    return render_template("home.html")


@app.route("/about")
def about():
    return render_template("about.html")


@app.route("/signin", methods=["POST", "GET"])
def signin():
    if request.method == "POST":
        print(request.form["username"])
        username = request.form["username"]
        password = request.form["password"]
        print("done")
        if authenticate(username, password):
            return redirect(url_for("home"))
        else:
            flash("Invalid username or password. Please try again", "error")
            return redirect(url_for("signin"))
    else:
        return render_template("signin.html")


@app.route("/signup", methods=["POST", "GET"])
def signup():
    if request.method == "POST":
        name = request.form["name"]
        username = request.form["username"]
        password = request.form["password"]
        print(request.form["username"])
        if register(name, username, password):
            return redirect(url_for("home"))
        else:
            flash("Username is already taken")
            return redirect(url_for("signin"))
    else:
        return render_template("signin.html")


if __name__ == "__main__":
    app.run(debug=True)
