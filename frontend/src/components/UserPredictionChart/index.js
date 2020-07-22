import React, { Component } from 'react';
import * as d3 from 'd3';
import './UserPredictionChart.css';
import { getMostRecentPrediction, sortDictByDate, sortStringDates } from '../../utils/data';

class UserPredictionChart extends Component {
    constructor(props) {
        super(props);
        this.state = { category: "us_daily_deaths" };
        this.chartRef = React.createRef();
    }

    componentDidMount() {
        //console.log(this.props);
        this.renderChart();
    }
    renderChart() {
        const { forecast, orgs, userPrediction, confirmed, aggregate } = this.props;
        var predictionData = {};//where we will store formatted userPrediction
        const category = this.state.category;
        var compiledData = [];

        //format confirmedData, forecastData, and predictionData into a list of js objects, convert date from string to js date object
        var confirmedData = Object.keys(confirmed).map(key => ({
            date: d3.timeParse("%Y-%m-%d")(key),
            value: confirmed[key]
        }));

        //store userPrediction in predictionData if it exists; parse dates and store as d3 date objects
        if(Object.keys(userPrediction).length > 0) {
            Object.keys(userPrediction).map(p => {
                predictionData[p]= userPrediction[p].map(d => ({
                    date: d3.timeParse("%Y-%m-%d")((d.date).substring(0,10)),
                    value: d.value,
                    defined: d.defined
                }))
            })
        }
        predictionData = sortDictByDate(predictionData);
        console.log(predictionData)
        //get most recent prediction
        var dates = sortStringDates(Object.keys(userPrediction))
        const mostRecentPred = predictionData[dates[dates.length - 1]]
        console.log(mostRecentPred)
        //push to compiledData
        compiledData = [confirmedData, mostRecentPred]
        console.log(compiledData)

        //IMPORTANT BOUNDARIES// 
        const confirmedStartDate = d3.timeParse("%Y-%m-%d")("2020-02-01");
        const predEndDate = mostRecentPred[mostRecentPred.length - 1].date;
        const valueMax = 5000;
        

        /*dateList.map(d => {
            dates.push({
                date: d
            })
        })*/

        /////////////////////////////////////////////////DRAW CHART//////////////////////////////
        //set up margin, width, height of chart
        const legendWidth = 180;
        const toolTipHeight = 50; //to make sure there's room for the tooltip when the value is 0
        const contextHeight = 100;
        var margin = {top: 20, right: 30, bottom: 20, left: 60},
            width = 800 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;
        var svg = d3.select(this.chartRef.current)
                    .append("svg")
                        .attr("width", width + margin.left + margin.right + legendWidth)
                        .attr("height", height + margin.top + margin.bottom + toolTipHeight + contextHeight)
                    .append("g")
                        .attr("transform",
                        "translate(" + margin.left + "," + margin.top + ")");
        var x = d3
                    .scaleTime()
                    .domain([confirmedStartDate, predEndDate])
                    .range([0, width]);
        var xAxis = svg
                        .append("g")
                        .attr("transform", "translate(0," + height + ")")
                        .call(d3.axisBottom(x));
        var y = d3
                    .scaleLinear()
                    .domain([0, valueMax])
                    .range([height, 0]);
        var yAxis = svg
                        .append("g")
                        .call(d3.axisLeft(y));
        
        //DRAW LEGEND//
        const legendString = ["Daily Confirmed Deaths", "User Prediction"];
        const color = d3
                        .scaleOrdinal()
                        .domain(legendString)
                        .range(d3.schemeTableau10);
        const legend = svg
                            .append('g')
                            .attr("id", "legend");
        legend
                .selectAll("rect")
                .data(legendString)
                .enter()
                .append("circle")
                    .attr('cx', width + 30)
                    .attr("cy", function(d,i){ return 20 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
                    .attr("r", 6)
                    //.attr("width", size)
                    //.attr("height", size)
                    .style("fill", function(d){ return color(d)})
        legend
                .selectAll("labels")
                .data(legendString)
                .enter()
                .append("text")
                    .attr("x", width + 45)
                    .attr("y", function(d,i){ return 20 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
                    .style("fill", function(d){ return color(d)})
                    .text(function(d){ return d})
                        .attr("text-anchor", "left")
                        .style("alignment-baseline", "middle")
        
        //SET UP CLIP PATH//
        var mainClip = svg
                            .append("defs")
                            .append("svg:clipPath")
                                .attr("id", "main-clip")
                                .append("svg:rect")
                                    .attr("width", width )
                                    .attr("height", height )
                                    .attr("x", 0)
                                    .attr("y", 0);
        const mainArea = svg.append("g")
                            .attr("clip-path", "url(#main-clip)");
        
        //SET UP CURVES//
        const lineGenerator = d3.line()
                                .curve(d3.curveCatmullRom);
        const predLineGenerator = d3.line()
                                    .curve(d3.curveBasis);
        const line = lineGenerator
                        .x(function(d) { return x(d.date) })
                        .y(function(d) { return y(d.value) })
        const predLine = predLineGenerator
                            .defined(d => d.defined)
                            .x(function(d) { return x(d.date) })
                            .y(function(d) { return y(d.value) })
        //DRAW CURVES//
        var confirmedCurve = mainArea
                                    .append("path")
                                    .attr("id", "confirmed")
                                    .attr("class", "line")
                                    .datum(confirmedData)
                                    .attr("d", line)
                                    .attr("stroke", color(legendString[0]))
        var predCurve = mainArea
                                .append("path")
                                .attr("id", "prediction")
                                .attr("class", "line")
                                .datum(mostRecentPred.filter(predLine.defined()))
                                .attr("d", predLine)
                                .attr("stroke",  color(legendString[1]))
        
        //SET UP TOOLTIP//
        const tooltip = svg 
                            .append("g")
                            .attr("class", "tooltip")
        tooltip
                .append("path")
                .attr("id", "tooltip-line")
                .style("stroke", "black")
                .style("stroke-width", "0.5px")
                .style("opacity", "0");
        var mousePerLine = tooltip
                                    .selectAll(".mouse-per-line")
                                    .data(compiledData)
                                    .enter()
                                    .append("g")
                                    .attr("class", "mouse-per-line");
        mousePerLine.append("circle")
                    .attr("r", 2)
                    .style("stroke", function(d, index) {
                        console.log(index)
                        return color(legendString[index]);
                    })
                    .style("fill", "none")
                    .style("stroke-width", "1px")
                    .style("opacity", "0");
        mousePerLine.append("text")
                    .attr("transform", "translate(10,3)"); 
        
        svg
                .append("svg:rect")
                    .attr('width', width)
                    .attr('height', height)
                    .attr("id", "interactive-area")
                    .attr('fill', 'none')
                    .attr('pointer-events', 'all')
                    .style("cursor", "pointer")
                    .on('mouseout', function() { // on mouse out hide line, circles and text
                        d3.select("#tooltip-line")
                            .style("opacity", "0");
                        d3.selectAll(".mouse-per-line circle")
                            .style("opacity", "0");
                        d3.selectAll(".mouse-per-line text")
                            .style("opacity", "0")
                    })
                    .on('mouseover', function() { // on mouse in show line, circles and text
                        d3.select("#tooltip-line")
                            .style("opacity", "1");
                        d3.selectAll(".mouse-per-line circle")
                            .style("opacity", "1");
                        d3.selectAll(".mouse-per-line text")
                            .style("opacity", "1")
                    })
                    .on('mousemove', function() { // mouse moving over canvas
                        var mouse = d3.mouse(this);
                        var xCoord = mouse[0];
                        d3
                            .select("#tooltip-line")
                            .attr("d", function() {
                                var d = "M" + xCoord + "," + height;
                                d += " " + xCoord + "," + 0;
                                return d;
                            });
                        d3
                            .selectAll(".mouse-per-line")
                            .attr("transform", function(d, i) {
                                if (d.length == 0) {return;}
                                var date = x.invert(xCoord);
                                const index = d3.bisector(f => f.date).left(compiledData[i], date);
                                var a = null;
                                if (index > 0) {
                                    a = d[index - 1];
                                }
                                const b = d[index];
                                //d = the data object corresponding to date and value pointed by the cursors
                                var data = null;
                                if (!a) {
                                    data = b;
                                }
                                else if (!b) {
                                    data = a;
                                }
                                else {
                                    data = b && (date - a.date > b.date - date) ? b : a;
                                }
                                if (+d3.timeDay.floor(date) == +data.date || +d3.timeDay.ceil(date) == +data.date) {
                                    if (data.defined != 0) {
                                        var element = d3.select(this)
                                                        .select('text')
                                                            .style("opacity", "1")
                                                            .text(Math.round(data.value).toFixed(2));
                                        element.select("circle")
                                                .style("opacity", "1");
                                        return "translate(" + mouse[0] + "," + y(data.value)+")";
                                    }
                                }
                                var element = d3.select(this)
                                                .select("text")
                                                .style("opacity", "0")
                                element
                                        .select("circle")
                                        .style("opacity", "0");
                            });
                    })
                    .on("click", function() {
                        var date = x.invert(d3.mouse(this)[0])
                        const index = d3.bisectRight(dates, date);
                        console.log(dates)
                        console.log(date)
                        console.log(index)
                        if(predictionData[date]) {
                            console.log("exists")
                            svg
                                .select("#prediction")
                                .datum(predictionData[date].filter(predLine.defined()))
                                .attr("d", predLine)
                        }
                        else {
                            if (index == 0) {
                                svg
                                    .select("#prediction")
                                    .datum([])
                                    .attr("d", predLine)
                            }
                            else {
                                date = dates[index - 1];
                                svg
                                    .select("#prediction")
                                    .datum(predictionData[date].filter(predLine.defined()))
                                    .attr("d", predLine);
                            }
                        }
                    })
        
                
    }

    render() {
        return(<div ref={this.chartRef}></div>);
    }
}

export default UserPredictionChart;
