import React, { Component } from 'react';
import * as d3 from 'd3'
import './InteractiveChart.css';
import { cleanConfirmedData, clamp } from '../../utils/data';
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
        const model = orgs;
        //console.log(model);
        const confirmedResult = cleanConfirmedData(confirmed, Object.keys(forecast));
        const savePrediction = this.savePrediction;
        const category = this.state.category;
        
        //set up margin, width, height of chart
        var legendWidth = 180;
        var toolTipHeight = 50;
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
        var forecastData = forecast.map(f => {
            return Object.keys(f).map(key => ({
                date: d3.timeParse("%Y-%m-%d")(key),
                value: f[key]
            }))
        });
        console.log(userPrediction)
        var predictionData = [];
        if(userPrediction) {
            predictionData = userPrediction.map(p => ({
                date: d3.timeParse("%Y-%m-%d")((p.date).substring(0,10)),
                value: p.value,
                defined: p.defined
                })
            );
        }
        console.log(predictionData)


        //get data starting 2020-02-01
        confirmedData = confirmedData.filter(d => +d.date >= +new Date("2020-02-01"));

        //draw x-axis
        var startDate = confirmedData[0].date; //confirmed data start day
        var predStartDate = confirmedData[confirmedData.length - 1].date; //prediction start day
        var predLength = 63;
        var predEndDate = addDays(new Date(), predLength);
        var x = d3.scaleTime()
            .domain([startDate, predEndDate])
            .range([ 0, width ])
            .nice();
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
        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, yAxisMax])
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

        var legendString = orgs.concat(["Daily Confirmed Deaths", "User Prediction"]);

        var color = d3
                        .scaleOrdinal()
                        .domain(legendString)
                        .range(d3.schemeSet2);
        var confirmedLine = svg
            .append("path")
            .attr("id", "confirmed")    
            .datum(confirmedData)    
            .attr('d', line)
            .attr("stroke", color(legendString[legendString.length - 2]))
        
        //draw forecasts

        forecastData.map((f, index) => {
            svg
                .append("path")
                    .attr("class", "forecast")
                    .attr("id", orgs[index])
                    .style("stroke", color(orgs[index]))
                .datum(f)
                    .attr("d", line);
        })
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

        var currDate = predStartDate;
        var defined = true;
        var value = confirmedData[confirmedData.length - 1].value;
        var confirmedLastVal = value; //used to make sure the first data point of prediction stays the same

        //check if userPrediction already exists in db
        console.log(predStartDate, predEndDate);
        console.log(predictionData)

        var predLine = predLineGenerator
                    .defined(d => d.defined)
                    .x(function(d) { return x(d.date) })
                    .y(function(d) { return y(d.value) })
       
        var yourLine = svg.append("path")
                      .attr("id", "your-line");

        if (userPrediction) {
            predictionData = predictionData.filter(d => (+d.date >= +predStartDate) && (+d.date <= +predEndDate));
            predictionData[0].value = value;
            defined = false;
            value = 0;
            currDate = addDays(predictionData[predictionData.length - 1].date, 1);
            console.log(predictionData)
        }
        
        while (+currDate <= +predEndDate) {            
            predictionData.push({date: currDate, value: value, defined: defined});
            currDate = addDays(currDate, 1);
            defined = 0;
            value = 0;
        }
        console.log(predictionData)
        var filteredData = null;
        
        var totalData = confirmedData.concat(predictionData);

        if(userPrediction) {
            filteredData = predictionData.filter(predLine.defined())
            yourLine.datum(filteredData)
                    .attr('d', predLine)
        }


        //append click area rect
        var confirmedAreaWidth = confirmedLine.node().getBoundingClientRect().width;
        var clickAreaWidth = width - confirmedAreaWidth;
        //console.log(confirmedLine.node().getBoundingClientRect().left);
        svg.append("rect")
           .attr("id", "click-area")
           .attr("width", clickAreaWidth)
           .attr("height",height)
           .attr("transform", "translate (" + confirmedAreaWidth+" 0)")
           .attr("fill", "none")
           .style("pointer-events","visible");
        var clickArea = d3.select("#click-area");
        
        /*var gapLine = svg.append("path")
                            .attr("id", "gap-line");*/
        
        var drag = d3.drag()
                     .on("drag", function() {
                        var pos = d3.mouse(this);
                        var date = clamp(predStartDate, predEndDate, x.invert(pos[0]));
                        var value = clamp(0, yAxisMax, y.invert(pos[1]));
                        //var date = x.invert(pos[0]);
                        //var value = y.invert(pos[1]);
                        console.log(value);
                
                        predictionData.forEach(function(d){
                            if (+d3.timeDay.round(d.date) == +d3.timeDay.round(date) && (+d3.timeDay.round(d.date) != +predStartDate)){
                                d.value = value;
                                d.defined = true
                            }
                            predictionData[0].value = confirmedLastVal;
                            //save prediction data
                            //update totalData everytime predictionData is updated
                            totalData = confirmedData.concat(predictionData);
                            /*yourLine.datum(predictionData)
                                    .attr('d', predLine)*/
                            var filteredData = predictionData.filter(predLine.defined())

                            yourLine.datum(filteredData)
                                    .attr('d', predLine)
                            
                            /*gapLine.datum(filteredData)
                                    .attr('d', predLine(filteredData));*/
                        });
                    })
                    .on("end", function () {
                        savePrediction(predictionData, category);
                    });
        
        svg.call(drag)

        //finds the datapoint closest to the mouse (along x)
        var bisect = () => {
            const bisectDate = d3.bisector(d => d.date).left;
            return mx => {
                const date = x.invert(mx);
                const index = bisectDate(totalData, date, 1);
                const a = totalData[index - 1];
                const b = totalData[index];
                return b && (date - a.date > b.date - date) ? b : a;
            };
        }
        var callout = (g, value) => {
            if (!value) return g.style("display", "none");
          
            g
                .style("display", null)
                .style("pointer-events", "none")
                .style("font", "10px sans-serif");
          
            const path = g.selectAll("path")
              .data([null])
              .join("path")
                .attr("fill", "white")
                .attr("stroke", "black");
          
            const text = g.selectAll("text")
              .data([null])
              .join("text")
              .call(text => text
                .selectAll("tspan")
                .data((value + "").split(/\n/))
                .join("tspan")
                  .attr("x", 0)
                  .attr("y", (d, i) => `${i * 1.1}em`)
                  .style("font-weight", (_, i) => i ? null : "bold")
                  .text(d => d));
          
            const {x, y, width: w, height: h} = text.node().getBBox();
          
            text.attr("transform", `translate(${-w / 2},${15 - y})`);
            path.attr("d", `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`);
        }
        const tooltip = svg.append("g");
        const mouseArea = svg.append("rect")
                            .attr("width", width)
                            .attr("height", height)
                            .attr("fill", "none")
                            .style("pointer-events","visible");


        svg.on("touchmove mousemove", function() {
            console.log("yep");
            var date = x.invert(d3.mouse(this)[0]);
            const index = d3.bisector(d => d.date).left(totalData, date, 1);
            const a = totalData[index - 1];
            const b = totalData[index];
            //d = the data object corresponding to date and value pointed by the cursors
            var d = b && (date - a.date > b.date - date) ? b : a;
            date = d.date;
            var value = Math.round(d.value);
            //if (value != 0) {
            tooltip
                .attr("transform", `translate(${x(date)},${y(value)})`)
                .call(callout, `${value}
                ${formatDate(date)}`);

            //}
        });

        svg.on("touchend mouseleave", () => tooltip.call(callout, null));
    }
        
    render() {
        return(<div ref={this.chartRef}></div>);
    }
}

export default InteractiveChart;