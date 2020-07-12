export const cleanConfirmedData = (data, dates) => {
  var result = {};
  for (var i = 0; i < dates.length; i++) {
    result[dates[i]] = data[dates[i]];
  }
  return result;
};

export const organizeData = (data) => {
  var orgs = Object.keys(data);
  var results = [];
  for (var i = 0; i < orgs.length; i++) {
    var forecast = data[orgs[i]];
    var dates = forecast.target_end_date;
    var values = forecast.value;

    var result = {};
    dates.forEach((key, i) => result[key] = values[i]);
    results.push(result);
  }

  return [results, orgs];
}


function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}


export const getDates = () => {
  var current = new Date(2020, 2, 28);
  var end = new Date();
  var dateArray = [];
  while (current <= end) {
      dateArray.push(new Date(current).toISOString().slice(0,10));
      current = addDays(current, 1);
  }
  return dateArray;
}

export const clamp = (a, b, c) => { 
  return Math.max(a, Math.min(b, c)) 
}