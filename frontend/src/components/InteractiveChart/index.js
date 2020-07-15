import React, { Component } from 'react';
import * as d3 from 'd3'
import './InteractiveChart.css';
import { clamp, callout } from '../../utils/data';
import { elementType } from 'prop-types';
import { addDays, formatDate } from '../../utils/date';


class InteractiveChart extends Component {
    constructor(props) {
        super(props);
        this.state = { category: "us_daily_deaths" };
        this.chartRef = React.createRef();
    }
    componentDidMount() {
        //console.log(this.props);
        this.renderChart();
    }

    //move to utils
    savePrediction(data, category) {
        fetch('/update/',{
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({"data": data, "category": category}),
        });
    }

    renderChart() {
        const { forecast, orgs, userPrediction, confirmed } = this.props;
        var predictionData = [];//where we will store formatted userPrediction
        const savePrediction = this.savePrediction;
        const category = this.state.category;
        
        //set up margin, width, height of chart
        var legendWidth = 180;
        var toolTipHeight = 50; //to make sure there's room for the tooltip when the value is 0
        var margin = {top: 20, right: 30, bottom: 20, left: 60},
            width = 800 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;
        var svg = d3.select(this.chartRef.current)
                    .append("svg")
                        .attr("width", width + margin.left + margin.right + legendWidth)
                        .attr("height", height + margin.top + margin.bottom + toolTipHeight)
                    .append("g")
                        .attr("transform",
                        "translate(" + margin.left + "," + margin.top + ")");
        
        //format confirmedData, forecastData, and predictionData into a list of js objects, convert date from string to js date object
        var confirmedData = Object.keys(confirmed).map(key => ({
            date: d3.timeParse("%Y-%m-%d")(key),
            value: confirmed[key]
        }))
        var forecastData = forecast.map(f => {
            return Object.keys(f).map(key => ({
                date: d3.timeParse("%Y-%m-%d")(key),
                value: f[key]
            }))
        });
        if(userPrediction) {
            predictionData = userPrediction.map(p => ({
                date: d3.timeParse("%Y-%m-%d")((p.date).substring(0,10)),
                value: p.value,
                defined: p.defined
                })
            );
        }

        //set other dates
        var confirmedStartDate = d3.timeParse("%Y-%m-%d")("2020-02-01"); //date format: y-m-d
        var predStartDate = confirmedData[confirmedData.length - 1].date; //last date of confirmedData
        var predLength = 365;
        var predEndDateString = addDays(new Date(), predLength).toISOString().substring(0, 10);
        var predEndDate = d3.timeParse("%Y-%m-%d")(predEndDateString)
        
        //get confirmedData starting from confirmedStartDate
        confirmedData = confirmedData.filter(d => +d.date >= +confirmedStartDate);

        //draw x-axis        
        var x = d3.scaleTime()
            .domain([confirmedStartDate, predEndDate])
            .range([ 0, width ])
            //.nice(); //rounds up/down the max and mind of x axis
         svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));
        
        //find max val in confirmedData and forecastData to determine the max of y-axis
        var confirmedMax = d3.max(confirmedData, function(d) { return +d.value; });
        var forecastMax = 0;
        forecastData.map(f => {
            var currMax = d3.max(f, d => {return d.value;})
            forecastMax = currMax > forecastMax ? currMax : forecastMax;
        })
        var yAxisMax = Math.max(confirmedMax, forecastMax);
        //draw y-axis
        var y = d3.scaleLinear()
            .domain([0, yAxisMax])
            .range([ height, 0 ])
            .nice();
        svg.append("g")
            .call(d3.axisLeft(y));
   
        //list of data displayed in graph - for legend
        var legendString = orgs.concat(["Daily Confirmed Deaths", "User Prediction"]);
        //color function that assigns random colors to each data
        var color = d3
                        .scaleOrdinal()
                        .domain(legendString)
                        .range(d3.schemeSet2);

         //draw legend
        var legend = svg.append('g')
                        .attr("id", "legend")
        var size = 10;
        legend.selectAll("rect")
            .data(legendString)
            .enter()
            .append("circle")
                .attr('cx', width + 30)
                .attr("cy", function(d,i){ return 20 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
                .attr("r", 6)
                //.attr("width", size)
                //.attr("height", size)
                .style("fill", function(d){ return color(d)})
        legend.selectAll("labels")
            .data(legendString)
            .enter()
            .append("text")
                .attr("x", width + 45)
                .attr("y", function(d,i){ return 20 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
                .style("fill", function(d){ return color(d)})
                .text(function(d){ return d})
                    .attr("text-anchor", "left")
                    .style("alignment-baseline", "middle")

        //create line generator for confirmed/forecast data and prediction data
        var lineGenerator = d3.line()
            .curve(d3.curveCatmullRom)//curve that goes through all data points
        var predLineGenerator = d3.line()
            .curve(d3.curveBasis); //curve doesn't go through all data points (it's smoothed out)
            //d3.curveMonotoneX
            //d3.curveBasis
            //d3.curveCardinal
        
        //function that draws curve
        var line = lineGenerator
            .x(function(d) { return x(d.date) })
            .y(function(d) { return y(d.value) })
        
        //display confirmed data
        var confirmedLine = svg
            .append("path")
            .attr("id", "confirmed")    
            .datum(confirmedData)    
            .attr('d', line)
            .attr("stroke", color(legendString[legendString.length - 2]))
        
        //display forecast data
        forecastData.map((f, index) => {
            svg
                .append("path")
                    .attr("class", "forecast")
                    .attr("id", orgs[index])
                    .style("stroke", color(orgs[index]))
                .datum(f)
                    .attr("d", line);
        })
        
        //function that generates the prediction curve
        var predLine = predLineGenerator
            .defined(d => d.defined)
            .x(function(d) { return x(d.date) })
            .y(function(d) { return y(d.value) })

        //append path for prediction data
        var yourLine = svg.append("path")
                .attr("id", "your-line");
        
        //variables used to initialize user prediction data if it doesn't exist in the db
        var currDate = predStartDate;
        var defined = true;
        var value = confirmedData[confirmedData.length - 1].value;
        var confirmedLastVal = value; //used to make sure the first data point of prediction stays the same

        //check if userPrediction already exists in db
        if (userPrediction) {
            predictionData = predictionData.filter(d => (+d.date >= +predStartDate) && (+d.date <= +predEndDate));
            predictionData[0].value = value;
            defined = false;
            value = 0;
            currDate = addDays(predictionData[predictionData.length - 1].date, 1);
        }
        
        while (+currDate <= +predEndDate) {            
            predictionData.push({date: currDate, value: value, defined: defined});
            currDate = addDays(currDate, 1);
            defined = 0;
            value = 0;
        }
        var filteredData = null;
        var totalData = confirmedData.concat(predictionData);

        if(userPrediction) {
            filteredData = predictionData.filter(predLine.defined())
            yourLine.datum(filteredData)
                    .attr('d', predLine)
        }
    //append new rect  
        const mouseArea = svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "none")
            .style("pointer-events","visible");

        //append click area rect
        var confirmedAreaWidth = confirmedLine.node().getBoundingClientRect().width; //get width of path element containing confirmed data
        var clickAreaWidth = width - confirmedAreaWidth; //the remaining area
        svg.append("rect")
           .attr("id", "click-area")
           .attr("width", clickAreaWidth)
           .attr("height",height)
           .attr("transform", "translate (" + confirmedAreaWidth+" 0)")
           .attr("fill", "none")
           .style("pointer-events","visible");
        //var clickArea = d3.select("#click-area");

        //append draw your guess text
        if(!userPrediction) {
            svg.append("text")
                .attr("id", "draw-guess")
                .attr("x", confirmedAreaWidth + (clickAreaWidth / 2))             
                .attr("y", height - 60)
                .attr("text-anchor", "middle")  
                .style("font-size", "16px") 
                .text("Draw your guess");
        }

        var drag = d3.drag()
                     .on("drag", function() {
                        var pos = d3.mouse(this);
                        var date = clamp(predStartDate, predEndDate, x.invert(pos[0]));
                        var value = clamp(0, yAxisMax, y.invert(pos[1]));
                        //var date = x.invert(pos[0]);
                        //var value = y.invert(pos[1]);
                
                        predictionData.forEach(function(d){
                            if (+d3.timeDay.round(d.date) == +d3.timeDay.round(date)){
                                d.value = value;
                                d.defined = true
                            }
                            predictionData[0].value = confirmedLastVal;//make sure the prediction curve is always connected to the confirmed curve
                            //update totalData everytime predictionData is updated
                            totalData = confirmedData.concat(predictionData);
                            /*yourLine.datum(predictionData)
                                    .attr('d', predLine)*/
                            var filteredData = predictionData.filter(predLine.defined())

                            yourLine.datum(filteredData)
                                    .attr('d', predLine)

                        });
                    })
                    .on("end", function () {
                        savePrediction(predictionData, category);
                    });
        
        svg.call(drag)

        //finds the datapoint closest to the mouse (along x)
        /*var bisect = () => {
            const bisectDate = d3.bisector(d => d.date).left;
            return mx => {
                const date = x.invert(mx);
                const index = bisectDate(totalData, date, 1);
                const a = totalData[index - 1];
                const b = totalData[index];
                return b && (date - a.date > b.date - date) ? b : a;
            };
        }*/

        const tooltip = svg.append("g");

        svg.on("touchmove mousemove", function() {
            console.log("working");
            var date = x.invert(d3.mouse(this)[0]);
            const index = d3.bisector(d => d.date).left(totalData, date, 1);
            const a = totalData[index - 1];
            const b = totalData[index];
            //d = the data object corresponding to date and value pointed by the cursors
            var d = b && (date - a.date > b.date - date) ? b : a;
            date = d.date;
            var defined = d.defined;
            var value = Math.round(d.value);
            if (defined != 0) {
                tooltip
                    .attr("transform", `translate(${x(date)},${y(value)})`)
                    .call(callout, `${value}
                    ${formatDate(date)}`);
            }
        });

        svg.on("touchend mouseleave", () => tooltip.call(callout, null));
    }
        
    render() {
        return(<div ref={this.chartRef}></div>);
    }
}

export default InteractiveChart;