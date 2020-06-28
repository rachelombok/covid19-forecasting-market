class Navbar extends React.Component{
    render() {
        return (
            <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
                <a class="navbar-brand" href="#">Navbar</a>
                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
                <div class="navbar-nav">
                    <a class="nav-item nav-link active" href="#">Home <span class="sr-only">(current)</span></a>
                    <a class="nav-item nav-link" href="#">About</a>
                </div>
                </div>
            </nav>
        );
    }
}

class App extends React.Component {
  render () {
    return (
      <div>
        <Navbar/>
        <div>
          [Page content here]
        </div>
      </div>
    )
  }
}



ReactDOM.render(
    <App />,
    document.getElementById('app')
);

var forecasts;

$.get("/forecasts", function(data) {
  forecasts = $.parseJSON(data);
  console.log(forecasts);
  collectData(forecasts);
})


function collectData(data) {
  var orgs = Object.keys(data);
  for (var i = 0; i < orgs.length; i++) {
    var forecast = data[orgs[i]];
    var dates = forecast.target_end_date;
    var values = forecast.value;

    var result = {};
    dates.forEach((key, i) => result[key] = values[i]);
    console.log(result);
    //console.log(dates[0]);
    //console.log(values);

    var ctx = document.getElementById('chart' + (i+1).toString()).getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Estimated Cases',
                data: values,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    /*'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    /*'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'*/
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    }); 
  }

}


