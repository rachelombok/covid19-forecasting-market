import React, { Component } from 'react';
import * as d3 from 'd3'
import './InteractiveChart.css';
import { cleanConfirmedData } from '../../utils/data';
import { elementType } from 'prop-types';


class InteractiveChart extends Component {
    constructor(props) {
        super(props);
        this.state = { userPrediction: null };
        this.chartRef = React.createRef();
    }
    componentDidMount() {
        //console.log(this.props);
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
        const { forecast, org, userPrediction, confirmed } = this.props;
        console.log(confirmed);
        const model = org;
        //console.log(model);
        const confirmedResult = cleanConfirmedData(confirmed, Object.keys(forecast));
        const savePrediction = this.savePrediction;
        
        //set up margin, width, height of chart
        var margin = {top: 20, right: 30, bottom: 20, left: 60},
            width = 800 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;
        var svg = d3.select(this.chartRef.current)
                    .append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                        .attr("transform",
                        "translate(" + margin.left + "," + margin.top + ")")
        //console.log(svg);

        //line function        
        /*var drawLine = d3.line()
            .x(function(d) { return x(d.year) })
            .y(function(d) { return y(d.debt) })*/
        //process data
        var data = Object.keys(confirmed).map(key => ({
            date: d3.timeParse("%Y-%m-%d")(key),
            value: confirmed[key]
        }))

        //get data starting 2020-02-01
        data = data.filter(d => +d.date >= +new Date("2020-02-01"));

        //draw x-axis
        var x = d3.scaleTime()
            .domain(d3.extent(data, function(d) { return d.date; }))
            .range([ 0, width ])
            .nice();
         svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));
      // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, d3.max(data, function(d) { return +d.value; })])
            .range([ height, 0 ])
            .nice();
         svg.append("g")
            .call(d3.axisLeft(y));
        
        var line = d3.line()
            .x(function(d) { return x(d.date) })
            .y(function(d) { return y(d.value) })
        
        var path = svg
            .append("path")
            .attr("id", "confirmed")    
            .datum(data)    
            .attr('d', line)
        }

        
    render() {
        return(<div ref={this.chartRef}></div>);
    }
}

export default InteractiveChart;