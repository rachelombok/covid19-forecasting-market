import React from 'react';
import Chart from 'chart.js';
import 'chartjs-plugin-dragdata';
import 'chartjs-plugin-zoom';


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
      };
  
      var datasets = [];
      // Set colors for each organization
      var colors = {
        'Columbia': 'rgba(172, 204, 230, 0.2)',
        'Georgia Tech': 'rgba(179, 163, 105​, 0.2)',
        'UCLA': 'rgba(39, 116, 174, 0.2)',
        'IHME': 'rgba(87, 175, 85, 0.2)',
        'Youyang Gu': 'rgba(196, 129, 14, 0.2)'
      }
      for (var i = 0; i < data.length; i++) {
        // Add each models data to datasets
        datasets.push({
          label: orgs[i],
          data: Object.values(data[i]),
          borderColor: colors[orgs[i]],
          borderWidth: 4,
          fill: false,
          pointStyle: 'cross',
          rotation: 45,
          pointBorderWidth: 1
        })
      }
  
      // Create chart with all models
      this.myChart = new Chart(this.chartRef.current, {
        type: 'line',
        data: {
          labels: Object.keys(data[3]),
          datasets: datasets
        },
        options: options
      });
  
    }
  
    render() {
        const { data, orgs } = this.props;
        if (!data || !orgs) return 'Loading...';

        return (
            <div class="chart-container" style={{position: "relative", width: "80vw", margin: "0 10%"}}>
                <canvas ref={this.chartRef} />
            </div>
        );
    }
  }

  export default ModelsChart;