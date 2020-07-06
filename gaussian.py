from math import exp, pow



#x = number predicted by forecasts
#a = height of bump
#b = number predicted by users
#c = width of bump
def get_gaussian(x, a, b, c):
    return a * exp(-pow(x - b,2)/(2 * pow(c,2)))


def get_gaussian_for_all(data, b):
    new_data = []
    a = 1000
    c = 10000
    for x in data['new_deaths']:
        gaussian = a * exp(-pow(x - b,2)/(2 * pow(c,2)))
        new_data.append(gaussian)
    return new_data

#print(gaussian(108507,1000,119733,10000))
#print(get_gaussian(108179,119733))

#11226

