import React from 'react';
import Chart from 'chart.js';
import 'chartjs-plugin-dragdata';
import PropTypes from 'prop-types';
import { cleanConfirmedData } from '../../utils/data';

class LineChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = { userPrediction: null };
    this.chartRef = React.createRef(); // create reference for chart in class
  }

  componentDidMount() {
    this.renderChart();
  }

  savePrediction(model, data) {
    fetch('/update/',{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({"model": model, "data": data}),
    });
  }

  renderChart() {
    const { data, org, userPrediction, confirmed } = this.props;
    const model = org;
    const confirmedResult = cleanConfirmedData(confirmed, Object.keys(data));
    const savePrediction = this.savePrediction;
    
    this.myChart = new Chart(this.chartRef.current, {
      type: 'line',
      data: {
        labels: Object.keys(data),
        datasets: [ // Settings for user prediction graph
          {
              label: "User's Prediciton",
              data: userPrediction[model].value,
              backgroundColor: [
                'rgba(64, 64, 64, 0.2)',
              ],
              borderWidth: 1,
              dragData: true, // User's predictions are draggable
          },
          // Settings for graph of forecasted deaths
          {
              label: 'Estimated Deaths',
              data: Object.values(data),
              backgroundColor: [
                  'rgba(255, 99, 130, 0.2)',
              ],
              borderWidth: 1,
              dragData: false,
          }, 
          // Settings for graph of confirmed deaths
          {
              label: 'Confirmed Deaths',
              data: Object.values(confirmedResult),
              backgroundColor: [
                'rgba(130, 99, 255, 0.2)',
              ],
              borderWidth: 1,
              dragData: false,
          }
        ]
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
            e.target.style.cursor = 'default';
            savePrediction(model, userPrediction[model]);
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

LineChart.propTypes = {
  data: PropTypes.object.isRequired,
  org: PropTypes.string.isRequired,
  userPrediction: PropTypes.object.isRequired,
  confirmed: PropTypes.object.isRequired,
};

export default LineChart;
