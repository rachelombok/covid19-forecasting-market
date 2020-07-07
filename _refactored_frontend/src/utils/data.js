export const cleanConfirmedData = (data) => {
  var result = {};
  for (var i = 0; i < data.length; i++) {
    var date = data[i];
    result[date] = data[date];
  }
  return result;
};

export const organizeData = (data) => {
  var orgs = Object.keys(data);
  var results = [];
  var confirmed = [];
  for (var i = 0; i < orgs.length; i++) {
    var forecast = data[orgs[i]];
    var dates = forecast.target_end_date;
    var values = forecast.value;

    var result = {};
    dates.forEach((key, i) => result[key] = values[i]);
    console.log(result)
    results.push(result);
  }

  return [results, orgs];
}
