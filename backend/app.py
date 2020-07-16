from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask_pymongo import PyMongo
from pymongo import MongoClient, DESCENDING
from passlib.hash import pbkdf2_sha256
from datetime import timedelta, date
from bson.json_util import dumps, loads
import json
from get_estimates import get_forecasts, get_accuracy_for_all_models, get_daily_confirmed_df, get_daily_forecasts
from confirmed import get_us_new_deaths, get_us_confirmed
from gaussian import get_gaussian_for_all

app = Flask(__name__)
app.secret_key = "super secret key"
app.permanent_session_lifetime = timedelta(days=7)

# Get forecasts data when initially launching website6
forecast_data = get_forecasts()

# Get confirmed cases in US
us_data = get_us_confirmed()

us_inc_forecasts = get_daily_forecasts()
us_inc_confirmed = get_us_new_deaths()

# set up pymongo
#app.config["MONGO_URI"] = "mongodb://localhost:27017/covid19-forecast"
app.config['MONGO_URI'] = "mongodb+srv://test:test@cluster0-3qghj.mongodb.net/covid19-forecast?retryWrites=true&w=majority"
mongo = PyMongo(app)
data = {}

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

def update_user_prediction(username, data, category, a=None, higher=False, index=None):
    #Get gaussian bump
    '''if category == "us_daily_deaths":
        print("get gaussian")
        print(data)
        data = get_gaussian_for_all(data, a, index, higher)
        print(data)'''
    pred = mongo.db.predictions.find_one({"username": username, "category": category})
    #print(pred)
    if pred:
        #print("already exists")
        mongo.db.predictions.update_one({"username": username, "category": category}, 
        {'$set': 
            { "prediction": data }
        })
    else:
        mongo.db.predictions.insert_one({"username": username, "category": category, "prediction": data})
       
    '''pred = mongo.db.predictions.find_one({"username": username, "model": model})
    if pred:
        mongo.db.predictions.update_one({"username": username, "model": model}, 
        {'$set': 
            { "prediction": data }
        })
    else:
        mongo.db.predictions.insert_one({"username": username, "model": model, "prediction": data})'''

def get_user_prediction(username, category):
    user_prediction = {}
    exists = mongo.db.predictions.find_one({"username": username, "category": category})
    if exists:
        user_prediction = exists['prediction']
    return user_prediction

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
    store_session((new_user['_id']), new_user['name'], new_user['username'])
    return True


@app.before_first_request
def make_session_permanent():
    session.permanent = True
    # Get forecasts data when initially launching website6
    data['us_cum_forecasts'] = get_forecasts()
    print("cum forecasts")
    # Get confirmed cases in US
    data['us_cum_confirmed'] = get_us_confirmed()
    print("cum confirmed")
    data['us_inc_forecasts'] = get_daily_forecasts()
    print("inc forecasts")
    # Get new deaths in US
    data['us_inc_confirmed'] = get_us_new_deaths()
    print("inc confirmed")


@app.route("/user-prediction", methods=['POST','GET'])
def home():
    pred_category = request.args.get('category')
    print(pred_category)
    print("done")
    user_prediction = get_user_prediction('testUsername', pred_category)
    return json.dumps(user_prediction)

@app.route("/us-cum-deaths-forecasts")
def us_cum_deaths_forecasts():
    return forecast_data
    #return data['us_cum_forecasts']

@app.route("/us-inc-deaths-forecasts")
def us_inc_deaths_forecasts():
    return us_inc_forecasts
    #return data['us_inc_forecasts']

@app.route("/us-cum-deaths-confirmed")
def us_cum_deaths_confirmed():
    return us_data
    #return data['us_cum_confirmed']

@app.route('/us-inc-deaths-confirmed')
def us_inc_deaths_confirmed():
    return us_inc_confirmed
    #return data['us_inc_confirmed']

@app.route('/update/', methods=['POST'])
def update():
    if request.method == 'POST':
        data = request.json
        print(data)
        update_user_prediction('testUsername', data['data'], data['category'])
        return "Success"
    return 'None'

@app.route('/login/', methods=['POST'])
def login():

    if request.method == 'POST':
        data = request.json
        username = data['username']
        password = data['password']
        #print(username, password)
        user = mongo.db.users.find_one(
        {"username": username})
        print(user)
        if authenticate(username, password):
            return 'Sucess'
        else:
            flash("Invalid username or password. Please try again", "error")
            
    else:
        if 'id' in session:
            print('flag5')
        return "Success"
    return 'None'
@app.route('/signup/', methods=['POST'])
def signup():
    if request.method == "POST":
        data = request.json
        name = data['name']
        username = data['username']
        password = data['password']
        print("here it is: ", name, username, password)
        if register(name, username, password):
            #return redirect(url_for("home"))
            return 'Sucess'
        else:
            flash("Username is already taken")
            #return redirect(url_for("signin"))
    else:
        print("hmmm")
        #return redirect(url_for("signin"))
    return 'None'


@app.route('/user-data')
def leaderboard():
    all_users = list(mongo.db.users.find({},{'name': 1, 'score': 1}).sort('score',-1))
    return dumps(all_users)

@app.route('/user')
def profile():
    user = mongo.db.users.find({'username': session['username']})
    return json.dumps(user)

@app.route('/action/', methods=["POST"])
def addbio():
    if request.method == 'POST':
        bio = request.values.get('bio')
        location = request.values.get('location')
    user = mongo.db.users.find({'username': session['username']})
    user.insert({'bio':bio, 'location':location})
    #redirect('/user')

@app.route("/total")
def total():
    results = {}
    for model in forecast_data:
        results[model] = fetch_votes(model)
    return json.dumps(results)

if __name__ == "__main__":
    app.run(debug=True)
