from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask_pymongo import PyMongo
from pymongo import MongoClient, DESCENDING
from passlib.hash import pbkdf2_sha256
from datetime import timedelta, date
from bson.json_util import dumps, loads
import json
#import json
#import pandas as pd
from get_estimates import get_forecasts, get_accuracy_for_all_models, get_daily_confirmed_df, get_us_confirmed
from confirmed import get_us_new_deaths


app = Flask(__name__)
app.secret_key = "super secret key"
app.permanent_session_lifetime = timedelta(days=7)


# set up pymongo
#app.config["MONGO_URI"] = "mongodb://localhost:27017/covid19-forecast"
app.config['MONGO_URI'] = "mongodb+srv://test:test@cluster0-3qghj.mongodb.net/covid19-forecast?retryWrites=true&w=majority"
mongo = PyMongo(app)

data = {}

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
                  new_user['name'], new_user['username'])
    return True

def add_vote(id, pred_model):
    vote = mongo.db.votes.find_one(
        {"user_id": id})
    # user already voted
    if vote:
        #print(vote)
        # edit old_vote
        mongo.db.votes.update_one({"user_id": id}, 
        {'$set': 
            { "prediction_model": pred_model, "date":str(date.today()) }
        })
        #vote['prediction_model'] = pred_model
        #vote['date'] = str(date.today())
    else: 
        mongo.db.votes.insert_one({
            'user_id': id,
            'prediction_model': pred_model,
            'date': str(date.today())
        })

def fetch_votes(pred_model):
    #check if valid arg
    return mongo.db.votes.count({'prediction_model':pred_model})

def get_score(pred_model):
    #(pred_model)
    if pred_model == "Columbia":
        #print('correct')
        return 50
    else:
        #print('incorrect')
        return 0

def update_score(username, score):
    mongo.db.users.update_one({"username": username}, 
        {'$inc': 
            { "score": score }
        })
    #print("score updated")

#data: a list containing predicted number of deaths
def update_user_prediction(username, model, data):
    pred = mongo.db.predictions.find_one({"username": username, "model": model})
    #print(pred)
    if pred:
        #print("already exists")
        mongo.db.predictions.update_one({"username": username, "model": model}, 
        {'$set': 
            { "prediction": data }
        })
    else:
        mongo.db.predictions.insert_one({"username": username, "model": model, "prediction": data})
        #print("added new")

def get_user_prediction(username):
    user_prediction = {}
    for model in data['forecast_data']:
        exists = mongo.db.predictions.find_one({"username": username, "model": model})
        if exists:
            #print('exists')
            user_prediction[model] = exists['prediction']
        else:
            #print("doesn't exist")
            user_prediction[model] = data['forecast_data'][model]
    #print(json.dumps(user_prediction['UCLA']))
    return user_prediction


@app.before_first_request
def make_session_permanent():
    session.permanent = True
    # Get forecasts data when initially launching website6
    data['forecast_data'] = get_forecasts()
    # Get confirmed cases in US
    data['us_cum_deaths'] = get_us_confirmed()
    # Get new deaths in US
    data['us_new_deaths'] = get_us_new_deaths('2020-05-01','2020-07-03')

@app.route("/")
def template():
    return render_template("template.html")


@app.route("/home", methods=['POST','GET'])
def home():
    if request.method == 'POST':
        model = request.form['models'].strip()
        #print(model)
        #print('model printed')
        add_vote(session['id'], model)
        gained = get_score(model)
        #print(gained)
        update_score(session['username'], gained)
        return redirect(url_for('results'))
    else:
        if 'username' in session:
            user_prediction = get_user_prediction(session['username'])
            return render_template("home.html", user_prediction=user_prediction)
        else:
            return redirect(url_for('signin'))

@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/mapportal")
def mapportal():
    return render_template("mapportal.html")

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
    return data['forecast_data']

@app.route("/us-cum-deaths")
def us_confirmed():
    return data['us_cum_deaths']

@app.route('/us-new-deaths-raw')
def new_deaths():
    return data['us_new_deaths']

@app.route('/us-new-deaths')
def display_us_new_deaths():
    return render_template('new-deaths.html')
    print('new deaths done')

@app.route("/mse")
def mse():
    return get_accuracy_for_all_models()
    #print('errors calculated')

@app.route("/results", methods=["POST", "GET"])
def results():
    vote = mongo.db.votes.find_one({'user_id': session['id']})
    user = mongo.db.users.find_one({'username': session['username']})
    return "You voted for " + vote['prediction_model'] +". You now have " + str(user['score']) + " points."

@app.route("/total")
def total():
    results = {}
    for model in data['forecast_data']:
        results[model] = fetch_votes(model)
    return json.dumps(results)

@app.route('/market')
def market():
    return render_template("market.html")
    
@app.route('/leaderboard')
def leaderboard():
    all_users = list(mongo.db.users.find({},{'name': 1, 'score': 1}).sort('score',-1))
    return render_template("leaderboard.html", all_users=all_users)

@app.route("/profile", methods=["GET","POST"])
def profile():
    user = mongo.db.users.find({'username': session['username']})
    return render_template("profile.html", user=user)

@app.route('/update/', methods=['POST'])
def update():
    if request.method == 'POST':
        data = request.json
        #print(data['model'])
        update_user_prediction(session['username'], data['model'], data['data'])
        return "Success"
    return 'None'

if __name__ == "__main__":
    app.run(debug=True)
