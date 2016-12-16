/*********
d3linked.js

Misha Paauw
10054154

Data Processing 
Minor Programmeren
Universiteit van Amsterdam
14 - 12 - 2016

js file for an interactive d3 world map with a linked view
*******/

/* 
* Preparations for scatterplot
*/

// margins and plot size
var margin = {top: 30, right: 20, bottom: 30, left: 60},
    width = 1100- margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// scaling
var x = d3.scale.linear()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

// axis setup
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(10);

// create SVG in correct container div
var svg = d3.select("#scatter").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("class", "scatter")
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


/* 
* Draw map and scatter plot
*/

// initialize new object to store data used for map
var mapData = [];

// Prototype
var getExplained;

// Load data and construct map
d3.json("data.json", function(error, data) {
    // error
    if (error) throw error;

    // match country names to find country codes
    data.forEach(function(d) {
        for (var i = 0; i < countryCodes.length; i++) {
            if (d.Country == countryCodes[i][2]){
                // fill mapData array
                mapData[countryCodes[i][1]] = {fillKey: determineColor(+d.Wellbeing),
                                            wellbeing: +d.Wellbeing
                                        }
                // also add country code to main data file                             
                d.code = countryCodes[i][1]  
            }
            
        }
  }); 

    // generate map
    var map = new Datamap({
      element: document.getElementById("container"),
      projection: 'mercator',
      geographyConfig: {
        // Pop up 
        popupTemplate: function(geography, data) {
          return '<div class="hoverinfo"> <strong>' + geography.properties.name + '</strong> <br> Wellbeing: ' +  data.wellbeing + '</div>'
        },
        // highlighting
        highlightBorderColor: '#bada55',
        highlightBorderWidth: 2,
        highlightFillColor: "#E5E5aa",
      },
      fills: fills,
      data: mapData
    });

    // call default scatterplot
    drawScatter(data, "GDP");

    // get new explainer and update scatter plot
    getExplained = function getExplainer(sel) {
        updateScatter(data, sel.value);
    };
});

// color categories
var fills = {
    veryLow: "#f1eef6",
    low: "#bdc9e1",
    medium: "#74a9cf",
    high: "0570b0",
}

// gives fillKey values according to value
function determineColor(value) {
    if (value >= 0 && value <= 2.5) {
        return "veryLow"
    } else if (value > 2.5 && value <= 5) {
        return "low"
    } else if (value > 5 && value <= 7) {
        return "medium"
    } else {
        return "high"
    }
}


// Draw scatterplot function
function drawScatter(data, explainer) {

    // get domains
    x.domain(d3.extent(data, function(d) { return +d[explainer];}))
    y.domain([0,10]);

    // X axis
    svg.append("g")
      .attr("class", "axis")
      .attr("id", "xaxis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("id", "xlabel")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text(explainer);

    // Y axixs
    svg.append("g")
      .attr("class", "axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("wellbeing index")

    // add dots  
    svg.selectAll(".dot")
      .data(data)
    .enter().append("circle")
       .transition()    
          .attr("class", "dot")
          .attr("fill", "steelblue")
          .attr("id", function(d) { return d.code})
          .attr("r", 3.5)
          .attr("cx", function(d) { return x(+d[explainer]); })
          .attr("cy", function(d) { return y(+d.Wellbeing); })
}

// remember clicked and last clicked countries
var clickedID;
var remember;

// highlight clicked country in scatter plot
document.addEventListener('click', function(e) {
    // get clicked country ID
    clickedID = e.target.__data__.id;

   // highlicht clicked country ID
    d3.select("#"+ clickedID)
        .transition() 
            .duration(500) 
            .attr("r", 7)
            .attr("fill", "red")
            .attr("class", "selectedDot")

    // un highlist country clicked before
    d3.select("#" + remember)
        .transition() 
            .duration(500) 
            .attr("r", 3.5)
            .attr("fill", "steelblue")
            .attr("class", "dot") 

    // remember
    remember = clickedID
}, false);

// update scatterplot with new data
function updateScatter(data, explainer) {
    // get new domain
    x.domain(d3.extent(data, function(d) { return +d[explainer];}))
    
    // Update X Axis
    svg.select("#xaxis")
        .transition()
        .duration(250)
        .call(xAxis);
    
    svg.select("#xlabel")
        .transition()
        .duration(250)
        .text(explainer)

    // move dots  
    svg.selectAll(".dot, .selectedDot")
      .data(data)
        .transition()
        .duration(1000)   
        // resize all dots
        .each("start", function() {  
            d3.select(this)  
                .attr("r", 1);  
        })
        // interesting delay effect
        .delay(function(d, i) {
            return i / 10 * 50;  
        })
        // new x variable data
        .attr("cx", function(d) { return x(+d[explainer]); })
        // back to original shape
        .each("end", function() {  
            d3.select(this)  
                .transition()
                .duration(500)
                .attr("r", 3.5);  
        }); 

    // resize selected dot 
    svg.selectAll(".selectedDot")
        .transition()
        .duration(1000)   
        .each("start", function() {  
            d3.select(this)  
                .attr("r", 1);  
        })
        .delay(function(d, i) {
            return i / 10 * 50;  
        })
        // new x variable data
        .attr("cx", function(d) { return x(+d[explainer]); })
        // back to original shape
        .each("end", function() {  
            d3.select(this)  
                .transition()
                .duration(500)
                .attr("r", 7);  
        }); 
    
}


