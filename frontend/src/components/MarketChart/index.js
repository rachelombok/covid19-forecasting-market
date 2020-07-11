import React from 'react';
import Chart from 'chart.js';


class MarketChart extends React.Component {
    constructor(props) {
        super(props);
        this.chartRef = React.createRef();
        this.state = {
            data: null,
            orgs: null,
        };
    }

    componentDidMount() {
        fetch('/total').then(res => res.json()).then(data => {
            this.setState({data: Object.values(data), orgs: Object.keys(data)});
            this.renderChart();
        });
    }

    renderChart() {
        var data = {
            datasets: [{
                data: this.state.data
            }],
            labels: this.state.orgs
        };

        this.myChart = new Chart(this.chartRef.current, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true
            }
        })
    }

    render() {
        const { data, orgs } = this.state;
        if (!data || !orgs) return 'Loading...';

        return (
            <div>
                <canvas ref={this.chartRef} />
            </div>
        );
    }
}

export default MarketChart;
