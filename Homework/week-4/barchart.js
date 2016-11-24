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

var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;

var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
    y = d3.scaleLinear().rangeRound([height, 0]);

var g = svg.append("g")
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
	
	// get data domains
	x.domain(data.map(function(d) { return d.speciessex; }))  
	y.domain([0, d3.max(data, function(d) { return d.CL; })]);

	// x axis
	g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  	// y axis
  	g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y).ticks(5))
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Frequency");

  	g.selectAll(".bar")
    .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.speciessex); })
      .attr("y", function(d) { return y(d.CL); })
      .attr("width", x.bandwidth())
      .attr("height", function(d) { return height - y(d.CL); });
});
	