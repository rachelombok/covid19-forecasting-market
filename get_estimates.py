import pandas as pd
import json


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
        JSON = df.to_json()
        models[orgs.pop()] = df.to_dict('list')
    return json.dumps(models)
