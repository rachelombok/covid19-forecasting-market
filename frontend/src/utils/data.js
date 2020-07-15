export const cleanConfirmedData = (data, dates) => {
  var result = {};
  for (var i = 0; i < dates.length; i++) {
    result[dates[i]] = data[dates[i]];
  }
  return result;
};

export const organizeData = (data) => {
  var orgs = Object.keys(data);
  var results = [];
  for (var i = 0; i < orgs.length; i++) {
    var forecast = data[orgs[i]];
    var dates = forecast.target_end_date;
    var values = forecast.value;

    var result = {};
    dates.forEach((key, i) => result[key] = values[i]);
    results.push(result);
  }

  return [results, orgs];
}


function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}


export const getDates = () => {
  var current = new Date(2020, 2, 28);
  var end = new Date();
  var dateArray = [];
  while (current <= end) {
      dateArray.push(new Date(current).toISOString().slice(0,10));
      current = addDays(current, 1);
  }
  return dateArray;
}

export const clamp = (a, b, c) => { 
  return Math.max(a, Math.min(b, c)) 
}

export const formatValue = (value) => {
  return value.toLocaleString("en", {
    style: "currency",
    currency: "USD"
  });
}
export const callout = (g, value) => {
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