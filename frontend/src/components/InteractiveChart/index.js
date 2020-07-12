import React, { Component } from 'react';
import * as d3 from 'd3'
import './InteractiveChart.css';
import { cleanConfirmedData, clamp } from '../../utils/data';
import { elementType } from 'prop-types';
import { addDays } from '../../utils/date';


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
        var confirmedData = Object.keys(confirmed).map(key => ({
            date: d3.timeParse("%Y-%m-%d")(key),
            value: confirmed[key]
        }))

        //get data starting 2020-02-01
        confirmedData = confirmedData.filter(d => +d.date >= +new Date("2020-02-01"));

        //draw x-axis
        var predStartDate = confirmedData[0].date;
        var predLength = 63;
        var endDate = addDays(new Date(), predLength);
        var x = d3.scaleTime()
            .domain([predStartDate, endDate])
            .range([ 0, width ])
            .nice();
         svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));
      // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, d3.max(confirmedData, function(d) { return +d.value; })])
            .range([ height, 0 ])
            .nice();
        svg.append("g")
            .call(d3.axisLeft(y));
        
        var lineGenerator = d3.line()
            .curve(d3.curveCatmullRom)
            
        var predLineGenerator = d3.line()
            .curve(d3.curveBasis);
            //d3.curveMonotoneX
            //d3.curveBasis
            //d3.curveCardinal
        var line = lineGenerator
            .x(function(d) { return x(d.date) })
            .y(function(d) { return y(d.value) })
        
        var path = svg
            .append("path")
            .attr("id", "confirmed")    
            .datum(confirmedData)    
            .attr('d', line);

        var predictionData = [];
        var currDate = confirmedData[confirmedData.length - 1].date;
        var defined = true;
        var value = confirmedData[confirmedData.length - 1].value;
        var confirmedLastVal = value;
        for (var i = 0; i < predLength; i++) {            
            predictionData.push({date: currDate, value: value, defined: defined});
            currDate = addDays(currDate, 1);
            defined = 0;
            value = 0;
        }

        //append click area rect
        var confirmedAreaWidth = path.node().getBoundingClientRect().width;
        var clickAreaWidth = width - confirmedAreaWidth;
        console.log(path.node().getBoundingClientRect().left);
        svg.append("rect")
           .attr("id", "click-area")
           .attr("width", clickAreaWidth)
           .attr("height",height)
           .attr("transform", "translate (" + confirmedAreaWidth+" 0)")
           .attr("fill", "none")
           .style("pointer-events","visible");
        var clickArea = d3.select("#click-area");
        
        var predLine = predLineGenerator
                    .defined(d => d.defined)
                    .x(function(d) { return x(d.date) })
                    .y(function(d) { return y(d.value) })
       
        var yourLine = svg.append("path")
                      .attr("id", "your-line");
        /*var gapLine = svg.append("path")
                            .attr("id", "gap-line");*/

        var drag = d3.drag()
                     .on("drag", function() {
                        var pos = d3.mouse(this);
                        var date = clamp(predStartDate, endDate, x.invert(pos[0]));
                        var value = clamp(0, 5000, y.invert(pos[1]));
                        //var date = x.invert(pos[0]);
                        //var value = y.invert(pos[1]);
                        console.log(value);
                
                        predictionData.forEach(function(d){
                            if (+d3.timeDay.round(d.date) == +d3.timeDay.round(date) && (+d3.timeDay.round(d.date) != +predStartDate)){
                                d.value = value;
                                d.defined = true
                            }
                            predictionData[0].value = confirmedLastVal;
                            
                            /*yourLine.datum(predictionData)
                                    .attr('d', predLine)*/
                            var filteredData = predictionData.filter(predLine.defined())

                            yourLine.datum(filteredData)
                                    .attr('d', predLine)
                            
                            /*gapLine.datum(filteredData)
                                    .attr('d', predLine(filteredData));*/
                        });
                    })
        
        svg.call(drag)
        
    }
        
    render() {
        return(<div ref={this.chartRef}></div>);
    }
}

export default InteractiveChart;