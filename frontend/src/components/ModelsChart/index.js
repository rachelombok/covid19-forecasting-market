import React from 'react';
import Chart from 'chart.js';
import 'chartjs-plugin-dragdata';
import 'chartjs-plugin-zoom';
import { getDates } from '../../utils/data'


class ModelsChart extends React.Component {
    constructor(props) {
      super(props);
      this.chartRef = React.createRef();
    }

    componentDidMount() {
        this.renderChart();
    }
  
    renderChart() {
      const { data, orgs } = this.props;

      var options = {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }],
        },
        title: {
          display: true,
          text: 'All Model Forecasts',
          fontSize: 30
        },
        spanGaps: true
      };

      const dates = getDates();  
      var datasets = [];
      // Set colors for each organization
      var colors = {
        'Columbia': 'rgb(172, 204, 230)',
        'Georgia Tech': 'rgb(179, 163, 105)',
        'UCLA': 'rgb(39, 116, 174)',
        'IHME': 'rgb(87, 175, 85)',
        'Youyang Gu': 'rgb(196, 129, 14)'
      }

      for (var i = 0; i < data.length; i++) {
        const modelDates = Object.keys(data[i]);
        for (var j = 0; j < dates.length; j++) {
            if (modelDates.includes(dates[j]) == false) {
                data[i][dates[j]] = null;
            }
        }

        // Sort key-value pairs by key (dates)
        var keys = Object.keys(data[i]);
        var newDict = {}; 
        keys.sort(); 
        for (var k = 0; k < keys.length; k++) {
            var key = keys[k];
            var value = data[i][key];
            newDict[key] = value;
        } 
        data[i] = newDict;

        // Add each models data to datasets
        datasets.push({
          label: orgs[i],
          data: Object.values(data[i]),
          borderColor: colors[orgs[i]],
          borderWidth: 3,
          fill: false,
          rotation: 45,
          pointBackgroundColor: colors[orgs[i]],
          pointRadius: 4,
          pointBorderWidth: 1,
          pointHoverRadius: 7,
          pointHoverBorderColor: 'black'
        })
      }
  
      // Create chart with all models
      this.myChart = new Chart(this.chartRef.current, {
        type: 'line',
        data: {
          labels: dates,
          datasets: datasets
        },
        options: options
      });
  
    }
  
    render() {
        const { data, orgs } = this.props;
        if (!data || !orgs) return 'Loading...';

        return (
            <div className="chart-container" style={{position: "relative", width: "80vw", margin: "0 10%"}}>
                <canvas ref={this.chartRef} />
            </div>
        );
    }
  }

  export default ModelsChart;