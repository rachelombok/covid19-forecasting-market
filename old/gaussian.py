from math import exp, pow



#x = number predicted by forecasts
#a = height of bump
#b = number predicted by users
#c = width of bump
def get_gaussian(x, a, b, c):
    return a * exp(-pow(x - b,2)/(2 * pow(c,2)))

#print(gaussian(108507,1000,119733,10000))
print(get_gaussian(108179,1000,119733,10000))

#11226

