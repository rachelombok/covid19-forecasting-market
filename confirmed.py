import pandas as pd
import json
import requests
from datetime import date, datetime, timedelta

#return dataframe containing confirmed data for US
def get_us_data():
    df = pd.read_csv('https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/owid-covid-data.csv')
    df = df[df['location'] == 'United States']
    return df

def get_us_new_deaths():
    df = get_us_data()
    df = df[['date', 'new_deaths']]
    df.reset_index(drop=True, inplace=True)
    return json.dumps(pd.Series(df.new_deaths.values,index=df.date).to_dict())

#print(get_us_new_deaths('2020-06-01', '2020-07-03'))
