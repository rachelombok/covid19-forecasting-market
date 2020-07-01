function collectData() {
  var data = null;
  $.ajax({
    url: '/forecasts',
    type: 'get',
    dataType: 'html',
    async: false,
    success: function(response) {
        data = $.parseJSON(response);
    } 
  });
  var orgs = Object.keys(data);
  
  var results = [];
  var confirmed = [];
  for (var i = 0; i < orgs.length; i++) {
    var forecast = data[orgs[i]];
    var dates = forecast.target_end_date;
    var values = forecast.value;

    var cases = getConfirmed(dates);
    confirmed.push(cases);

    var result = {};
    dates.forEach((key, i) => result[key] = values[i]);
    results.push(result);
  }

  return [results, orgs, confirmed];
}


function getConfirmed(input) {
  var data = null;
  $.ajax({
    url: '/us_confirmed',
    type: 'get',
    dataType: 'html',
    async: false,
    success: function(response) {
        data = $.parseJSON(response);
    } 
  });

  var result = {};
  for (var i = 0; i < input.length; i++) {
    var date = input[i];
    result[date] = data[date];
  }
  return result;
}


class Navbar extends React.Component {
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


class LineChart extends React.Component {
  constructor(props) {
    super(props);
    this.chartRef = React.createRef();
  }

  componentDidMount() {
    this.myChart = new Chart(this.chartRef.current, {
      type: 'line',
      data: {
          labels: Object.keys(this.props.data),
          datasets: [{
              label: 'Estimated Deaths',
              data: Object.values(this.props.data),
              backgroundColor: [
                  'rgba(255, 99, 130, 0.2)',
              ],
              borderWidth: 1,
              dragData: true,
          }, {
              label: 'Confirmed Deaths',
              data: Object.values(this.props.confirmed),
              backgroundColor: [
                'rgba(130, 99, 255, 0.2)',
              ],
              borderWidth: 1,
              dragData: false,
          }]
      },
      options: {
          scales: {
              yAxes: [{
                  ticks: {
                      beginAtZero: true
                  }
              }]
          },
          title: {
            display: true,
            text: this.props.org,
            fontSize: 30
          },
          dragData: true,
          dragDataRound: 1,
          dragOptions: {
            showTooltip: true
          },
          onDragStart: function(e) {
            // console.log(e)
          },
          onDrag: function(e, datasetIndex, index, value) {
            e.target.style.cursor = 'grabbing'
          },
          onDragEnd: function(e, datasetIndex, index, value) {
            e.target.style.cursor = 'default' 
          },
          hover: {
            onHover: function(e) {
              const point = this.getElementAtEvent(e)
              if (point.length) e.target.style.cursor = 'grab'
              else e.target.style.cursor = 'default'
            }
          }
      }
    });
  }

  render() {
    return <canvas ref={this.chartRef} />;
  }
}


class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: collectData()[0],
      orgs: collectData()[1],
      confirmed: collectData()[2]
    };
  }

  render() {
    return (
      <div>
        <Navbar/>
        <div>
          [Page content here]
        </div>
        <LineChart data={this.state.data[0]} org={this.state.orgs[0]} confirmed={this.state.confirmed[0]} />
        <br></br>
        <LineChart data={this.state.data[1]} org={this.state.orgs[1]} confirmed={this.state.confirmed[1]} />
        <br></br>
        <LineChart data={this.state.data[2]} org={this.state.orgs[2]} confirmed={this.state.confirmed[2]} />
        <br></br>
        <LineChart data={this.state.data[3]} org={this.state.orgs[3]} confirmed={this.state.confirmed[3]} />
        <br></br>
        <LineChart data={this.state.data[4]} org={this.state.orgs[4]} confirmed={this.state.confirmed[4]} />
        <br></br>
      </div>
    )
  }
}

ReactDOM.render(
    <App />,
    document.getElementById('app')
);




