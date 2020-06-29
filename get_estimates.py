import pandas as pd
from sklearn.metrics import mean_squared_error
import json
import requests
from datetime import date, datetime, timedelta


def get_forecasts():
    file = open('orgs.csv', 'r')
    orgs = []
    for line in file:
        orgs.append(line.strip())
    orgs = orgs[::-1]
    print(orgs)

    file = open('model-links.csv', 'r')
    models = dict()
    for line in file:
        df = pd.read_csv(line.strip())
        df = df.loc[df['location_name'] == 'US']
        df = df.loc[df['type'] == 'point']
        df = df.loc[df['target'].str.contains("cum")]
        df = df[['target_end_date', 'value']]
        df = df.sort_values('target_end_date')
        df = df.drop_duplicates()
        JSON = df.to_json()
        models[orgs.pop()] = df.to_dict('list')
    return json.dumps(models)


#pass in the df containing confirmed and predicted values
def get_mse(model_df):
    confirmed = model_df['confirmed']
    predicted = model_df['value']
    return mean_squared_error(confirmed, predicted)

def get_accuracy_for_all_models():
    errors = []
    start_date = '2020-05-01'
    end_date = '2020-05-09'
    #end_date = str(date.today() - timedelta(days=2)) #2 days prior
    confirmed = get_daily_confirmed_df(start_date, end_date)
    data = requests.get('http://localhost:5000/forecasts').json()
    for model in data:
        print(model)
        df = pd.DataFrame.from_records(data[model])
        df = df[df['target_end_date'] >= start_date]
        df = df[df['target_end_date'] <= end_date]
        #df = df[df['target_end_date'] <= str(date.today() - timedelta(days=2))]
        ls = []
        for index, row in df.iterrows():
            #fetch date from df and convert to date object
            d = datetime.strptime(row['target_end_date'], '%Y-%m-%d').date()
            #fetch confirmed cases for date d
            num_c = confirmed[confirmed['date'] == d]['confirmed']
            ls.append(num_c.item())
            #list.append(get_daily_confirmed(d))
        df['confirmed'] = ls
        error = get_mse(df)
        print(error)
        errors.append({'model': model, 'error':error})
    return json.dumps(errors)


# date format: y-m-d string, ex)06-28-2020
# return a dataframe containing confirmed cases from start_date to end_date (inclusive)
def get_daily_confirmed_df(start_date, end_date):
    dates = []
    confirmed = []
    curr_d = datetime.strptime(start_date, '%Y-%m-%d').date()
    end_d = datetime.strptime(end_date, '%Y-%m-%d').date()
    while curr_d <= end_d:
        #!!!should the date be a string?
        dates.append(curr_d)
        num_confirmed = get_daily_confirmed(curr_d)
        confirmed.append(num_confirmed)
        curr_d += timedelta(days=1)
    temp = {'date': dates, 'confirmed': confirmed}
    return pd.DataFrame(temp)


# pass in date object not string
def get_daily_confirmed(d):
    #convert date object to string in m-d-y format
    d = d.strftime('%m-%d-%Y')
    github_dir_path = 'https://github.com/CSSEGISandData/COVID-19/raw/master/csse_covid_19_data/csse_covid_19_daily_reports_us/'
    file_path = github_dir_path + d + '.csv'
    data = pd.read_csv(file_path)
    return data['Confirmed'].sum()
    # catch error!!


# assume the predictional model dataframes are cleaned+sorted by dates
'''def get_confirmed_cases():
    df = pd.read_csv(
        'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us.csv')
    df = df.set_index(df['date'])
    df = df.iloc[:, 1:2]
    df = df['2020-05-02':'2020-06-26']
    return df'''

#print(get_accuracy_for_all_models())
#print(get_daily_confirmed_df('2020-06-01', '2020-06-03'))
