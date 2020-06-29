from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask_pymongo import PyMongo
from pymongo import MongoClient, DESCENDING
from passlib.hash import pbkdf2_sha256
from datetime import timedelta, date
from bson.json_util import dumps, loads
import json
#import json
#import pandas as pd
from get_estimates import get_forecasts, get_accuracy_for_all_models, get_daily_confirmed_df


app = Flask(__name__)
app.secret_key = "super secret key"
app.permanent_session_lifetime = timedelta(days=7)

# Get forecasts data when initially launching website
forecast_data = get_forecasts()
print(forecast_data)

#get confirmed numbers
#confirmed_data = get_daily_confirmed_df('2020-05-01', '2020-05-04')
#print('confirmed data processed')

#get model errors


# set up pymongo
#app.config["MONGO_URI"] = "mongodb://localhost:27017/covid19-forecast"
app.config['MONGO_URI'] = "mongodb+srv://test:test@cluster0-3qghj.mongodb.net/covid19-forecast?retryWrites=true&w=majority"
mongo = PyMongo(app)
# mongo.db.users.insert_one({"username":"john"})

# methods for authentication and registration


def store_session(id, name, username):
    session['id'] = str(id)
    session['name'] = name
    session['username'] = username

def authenticate(username, password):
    user = mongo.db.users.find_one(
        {"username": username})

    if user:
        if pbkdf2_sha256.verify(password, user["password"]):
            store_session((user['_id']), user['name'], user['username'])
            return True
    return False


def register(name, username, password):
    user = mongo.db.users.find_one(
        {"username": username})
    # user already exists
    if user:
        return False
    # add new user
    hashed = pbkdf2_sha256.hash(password)
    mongo.db.users.insert_one({
        'name': name,
        'username': username,
        'password': hashed,
        'score': 0
    })
    new_user = mongo.db.users.find_one({'username': username})
    store_session((new_user['_id']),
                  new_user['name'], new_user['username'],new_user['score'])
    return True

def add_vote(id, pred_model):
    vote = mongo.db.votes.find_one(
        {"user_id": id})
    # user already voted
    if vote:
        # edit old_vote
        vote['prediction_model'] = pred_model
        vote['date'] = date
    else: 
        mongo.db.votes.insert_one({
            'user_id': id,
            'prediction_model': pred_model,
            'date': date
        })

def fetch_votes(pred_model):
    #check if valid arg
    return mongo.db.votes.count({'prediction_model':pred_model})

def leaderboard():
    user_scores = mongo.db.score
    all_users = mongo.db.users.find({})
    
    for user in all_users:
        user_scores.insert({"username": user, "score":0})
        print(user)
    print(list(user_scores.find().sort("score",DESCENDING)))
    
ldbd = leaderboard()


@app.before_request
def make_session_permanent():
    session.permanent = True


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
        session.permanent = True
        username = request.form["username"]
        password = request.form["password"]
        if authenticate(username, password):
            return redirect(url_for("home"))
        else:
            flash("Invalid username or password. Please try again", "error")
            return redirect(url_for("signin"))
    else:
        if 'id' in session:
            return redirect(url_for('home'))
        return render_template("signin.html")


@app.route("/signup", methods=["POST", "GET"])
def signup():
    if request.method == "POST":
        name = request.form["name"]
        username = request.form["username"]
        password = request.form["password"]
        if register(name, username, password):
            return redirect(url_for("home"))
        else:
            flash("Username is already taken")
            return redirect(url_for("signin"))
    else:
        return render_template("signin.html")


@app.route("/logout")
def logout():
    if 'id' in session:
        session.pop('id')
        session.pop('name')
        session.pop('username')
    return redirect(url_for('signin'))


@app.route("/forecasts")
def forecasts():
    print(forecast_data)
    return forecast_data

@app.route("/mse")
def mse():
    return get_accuracy_for_all_models()
    print('errors calculated')

if __name__ == "__main__":
    app.run(debug=True)
