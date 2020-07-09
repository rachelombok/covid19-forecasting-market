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

def update_user_prediction(username, model, data):
    pred = mongo.db.predictions.find_one({"username": username, "model": model})
    if pred:
        mongo.db.predictions.update_one({"username": username, "model": model}, 
        {'$set': 
            { "prediction": data }
        })
    else:
        mongo.db.predictions.insert_one({"username": username, "model": model, "prediction": data})

def get_user_prediction(username):
    user_prediction = {}
    for model in data['us_cum_forecasts']:
        exists = mongo.db.predictions.find_one({"username": username, "model": model})
        if exists:
            user_prediction[model] = exists['prediction']
        else:
            user_prediction[model] = data['us_cum_forecasts'][model]
    return user_prediction


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
    user_prediction = get_user_prediction('testUsername')
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
        update_user_prediction('testUsername', data['model'], data['data'])
        return "Success"
    return 'None'

@app.route('/leaderboard-data')
def leaderboard():
    all_users = list(mongo.db.users.find({},{'name': 1, 'score': 1}).sort('score',-1))
    return dumps(all_users)

if __name__ == "__main__":
    app.run(debug=True)
