/*********
barchart.js

Misha Paauw
10054154

Data Processing 
Minor Programmeren
Universiteit van Amsterdam
23 - 11 - 2016

d3 implementation for a barchart
data is crab measurements

reference paper crabs: http://duch.mimuw.edu.pl/~pokar/StatystykaII/DANE/CampbellMahon.pdf
*******/

var margin = {top: 20, right: 30, bottom: 30, left: 70},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(10);

var chart = d3.select(".chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Load data and construct graph
d3.json("crabs.json", function(data) {
	
	// force strings to numbers
	for (var i = 0; i < data.length; i++) {
		data[i].CL = +data[i].CL;
		data[i].BD = +data[i].BD;
		data[i].CW = +data[i].CW;
		data[i].RW = +data[i].RW;
	}

	console.log(data)
	
	// get data domains, max height gets some extra margin
	var extraMargin = 5;
	x.domain(data.map(function(d) { return d.crabpiece; }))  
	y.domain([0, d3.max(data, function(d) { return d.length; }) + extraMargin]);

	chart.append("g")
      	.attr("class", "x axis")
      	.attr("transform", "translate(0," + height + ")")
      	.call(xAxis);

  	chart.append("g")
      	.attr("class", "y axis")
      	.call(yAxis)
      .append("text")
	    .attr("transform", "rotate(-90)")
	    .attr("y", -60)
	    .attr("dy", ".71em")
	    .style("text-anchor", "begin")
	    .attr("dx", -250)
	    .text("Size (mm)");

  	chart.selectAll(".bar")
    	.data(data)
      .enter().append("rect")
      	.attr("class", "bar")
      	.attr("x", function(d) { return x(d.crabpiece); })
     	.attr("y", function(d) { return y(d.length); })
      	.attr("height", function(d) { return height - y(d.length); })
      	.attr("width", x.rangeBand())
      	// mouse over color change
     	.on("mouseover", function(d) {
      		d3.select(this).transition()
      			.ease("elastic")
      			.duration(3000)
      			.style("fill", "#96C0CE");
      	})
      	// mouseout color change
      	.on("mouseout", function(d){
      		d3.select(this).transition()
      			.ease("elastic")
      			.duration(2500)
      			.style("fill", "orange")
      	});

});
	
