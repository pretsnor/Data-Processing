/*
* d3lineExtended.js
* 
* Misha Paauw
* 10054154
* Data Processing
* december 2016
*
* Draws a d3 based multiseries line graph showing min, max and avg wind speeds on two locations in the netherlands
* maastricht (inland) and hoek van holland (coastal)
*/ 


// canvas size and margins
var margin = {top: 20, right: 75, bottom: 75, left: 100},
    width = 1100 - margin.left - margin.right,
    height = 720 - margin.top - margin.bottom;

// date parser
var parseDate = d3.time.format("%Y%m%d").parse;

// axis domains
var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

// axis initialization
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(10);

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");


// initiate from hoek van holland line
var hvh_line = d3.svg.line()
    .x(function(d) { return x(d.YYYYMMDD); })
    .y(function(d) { return y(d.FG); });

// initiate from maastricht line
var maastricht_line = d3.svg.line()
    .x(function(d) { return x(d.YYYYMMDD); })
    .y(function(d) { return y(d.FG); });

// create svg
var svg = d3.select("svg")
	.attr("class", "weather_canvas")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// queue  and load json files
queue()
	.defer(d3.json, "hvh.json")
	.defer(d3.json, "maastricht.json")
	.await(drawLines);

// draws basic lines
function drawLines(error, hvh, maastricht) {
	
	// parse dates and force integers
	hvh.forEach(function(d) {
    d.YYYYMMDD = parseDate(d.YYYYMMDD);
    d.FG = + d.FG;
    d.FHN = + d.FHN;
    d.FHX = + d.FHX;
  });
    maastricht.forEach(function(d) {
    d.YYYYMMDD = parseDate(d.YYYYMMDD);
    d.FG = + d.FG;
    d.FHN = + d.FHN;
    d.FHX = + d.FHX;
   });


    // scale the data
    x.domain(d3.extent(hvh, function(d) { return d.YYYYMMDD; }));
    y.domain([0, d3.max(hvh, function(d) { return d.FG; })]);

    // draw line of avg wind speeds in hvh
    svg.append("path")
        .attr("class", "line")
        .attr("id", "hvh")
        .attr("d", hvh_line(hvh));

    svg.append("path")
        .attr("id", "maastricht")
        .attr("class", "line")
        .attr("d", maastricht_line(maastricht));

    // Add the X Axis
  	svg.append("g")
   		.attr("class", "x axis")
    	.attr("transform", "translate(0," + height + ")")
    	.call(xAxis)
  	.selectAll("text")
    	.attr("y", 0)
    	.attr("x", 9)
    	.attr("dy", ".7em")
    	.attr("transform", "rotate(45)")
    	.style("text-anchor", "start");

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    // Y axis label
    svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("y", 6)
        .attr("dy", "-3.5em")
        .attr("dx", "-10em")
        .attr("transform", "rotate(-90)")
        .text("gemiddelde windsnelheid (0.1 m/s)");

   	// crosshair stuff
	var bisectDate = d3.bisector(function(d) { return d.YYYYMMDD; }).left;

	var focus = svg.append("g")
	  .attr("class", "focus")
	  .style("display", "none");

	focus.append("circle")
	  .attr("r", 5);

	focus.append("text")
      .attr("x", 9)
      .attr("dy", ".35em");

	svg.append("rect")
	  .attr("class", "overlay")
	  .attr("width", width)
	  .attr("height", height)
	  .on("mouseover", function() { focus.style("display", null); })
	  .on("mouseout", function() { focus.style("display", "none"); })
	  .on("mousemove", mousemove);

	function mousemove() {

		var x0 = x.invert(d3.mouse(this)[0]),
		    i = bisectDate(hvh, x0, 1),
		    d0 = hvh[i - 1],
		    d1 = hvh[i],
		    d = x0 - d0.YYYYMMDD > d1.YYYYMMDD - x0 ? d1 : d0;
		focus.attr("transform", "translate(" + x(d.YYYYMMDD) + "," + y(d.FG) + ")");
		focus.select("text").text(d.FG);
	}
};
	
