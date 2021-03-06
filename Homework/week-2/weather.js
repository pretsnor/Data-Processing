/*
* weather.js
* 
* Misha Paauw
* Data Processing
* november 2016
*
* Draws a line graph based on recent weather data from the KNMI
*/ 

// get raw weather data from html text box
var weatherData = document.getElementById("rawdata").value;

// split by new lines
weatherData = weatherData.split(/\n/);

// initialization
var dates = [];
var temps = []; 
var tempDomain = [100, -100];

// split data by commas, store dates and temps in array
for (i = 0, len = weatherData.length; i < len; i++) {
	oneLine = weatherData[i].split(",");
	dates[i] = new Date(oneLine[0].replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"));
	temps[i] = parseInt(oneLine[1]);
	
	// get min and max temp
	if (temps[i] < tempDomain[0]) {
		tempDomain[0] = temps[i];
	}
	if (temps[i] > tempDomain[1]) {
		tempDomain[1] = temps[i];
	}
}

// transformation of raw data to canvas locations
function createTransform(domain, range){
 	var alpha = (range[1] - range[0]) / (domain[1] - domain[0]);
	var beta = range[1] - (alpha * domain[1]);
	
	return function(x){
		return alpha * x + beta;
	};
}

// ranges (takes offset into account)
var offset = 100;
var width = 800;
var height = 500;
var xRange = [0 + offset, width - offset];
var yRange = [height - offset, 0 + offset];

// transform temperatures
var transformTemperatures = createTransform(tempDomain, yRange);
var tempsTransformed = [];

for (i = 0, len = temps.length; i < len; i++) {
	tempsTransformed[i] = transformTemperatures(temps[i]);
}


// transform dates to number of days after start date
var datesDaysAfter = [];
var MSinOneDay = 86400000;

for (i = 0, len = dates.length; i < len; i++) {
	datesDaysAfter[i] = (dates[i].getTime() - dates[0].getTime()) / MSinOneDay;
}

// transform dates to canvas coordinates
var dateDomain = [0, datesDaysAfter.length];
var transformDates = createTransform(dateDomain, xRange);
var datesTransformed = [];

for (i = 0, len = temps.length; i < len; i++) {
	datesTransformed[i] = transformDates(datesDaysAfter[i]);
}

// drawing stuff on the canvas
var canvas = document.getElementById("weather_canvas");
var ctx = canvas.getContext("2d");

// draw line graph
for (i = 1, len = tempsTransformed.length; i < len; i++) {
	ctx.beginPath();
		ctx.moveTo(datesTransformed[i - 1], tempsTransformed[i - 1]);
		ctx.lineTo(datesTransformed[i], tempsTransformed[i]);
		ctx.stroke();
}



// draw y axis 
var yTickInterval = 50;
var begin_y = tempDomain[0] - (tempDomain[0] % yTickInterval) - yTickInterval;
var end_y 	= tempDomain[1] - (tempDomain[1] % yTickInterval) + yTickInterval;

ctx.beginPath();
	ctx.moveTo(offset, transformTemperatures(begin_y));
	ctx.lineTo(offset, transformTemperatures(end_y));
	ctx.stroke();

// axis name
var yAxisTitle = "Gemiddelde etmaaltemperatuur (0.1 graden Celcius)";
ctx.font = "15px sans-serif";
var textMetric = ctx.measureText(yAxisTitle);

// save current canvas rotation settings 
ctx.save();
ctx.rotate(- 90 * Math.PI/180);
ctx.fillText(yAxisTitle, -430 , transformTemperatures(tempDomain[1])- 50 );

// restore old settings to make sure that the new drawings are not rotated
ctx.restore();

// draw ticks
var tickSize = 8; 

for (i = begin_y; i <= end_y; i = i + yTickInterval) {
		
	ctx.beginPath();
		ctx.strokeStyle = 'black';
		ctx.moveTo(offset, transformTemperatures(i));
		ctx.lineTo(offset - tickSize, transformTemperatures(i));
		ctx.stroke();
		ctx.font = "10px sans-serif";
		ctx.fillText(i, (offset/1.5), transformTemperatures(i));
}

// draw x axis
ctx.beginPath();
	ctx.moveTo(offset, transformTemperatures(begin_y));
	ctx.lineTo(width - offset, transformTemperatures(begin_y));
	ctx.stroke();
	ctx.font = "20px sans-serif";
	ctx.fillText("Maand", transformDates(dateDomain[1])/2, transformTemperatures(begin_y) + 50);

// x ticks
var months = ["november", "december", "januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november"];

for (i = 0; i < dateDomain[1]; i = i + 30) {
	ctx.beginPath();
		ctx.strokeStyle = 'black';
		ctx.moveTo(transformDates(i), transformTemperatures(begin_y));
		ctx.lineTo(transformDates(i), transformTemperatures(begin_y) + tickSize);
		ctx.stroke();
		ctx.font ="10px sans-serif";
		ctx.fillText(months[(i)/30], transformDates(i + 2), transformTemperatures(begin_y) + 2 * tickSize);
}
	
console.log(datesTransformed, tempsTransformed);


// draw dashed 0 degree line
var zeroDegrees = transformTemperatures(0)
ctx.beginPath();
	ctx.setLineDash([3,10]);
	ctx.moveTo(offset,zeroDegrees);
	ctx.lineTo(width - offset, zeroDegrees);
	ctx.stroke();



/////  CROSSHAIR STUFF
var crossCanvas = document.getElementById("crosshair");
var cross = crossCanvas.getContext("2d");

crossCanvas.addEventListener("mousemove", function(event){
	// get mouse coordinates
	var x = event.pageX - crossCanvas.offsetLeft;

    // reverse transform to get the day instead of canvas coordinates
    var backTransform = createTransform(xRange, dateDomain);
    var day = parseInt(backTransform(x));
    
    // get temp on that day and transform to canvas  y coord
	var tempOnDay = temps[day - 1];
	var y = transformTemperatures(tempOnDay);
    
    // clear last cross
    cross.clearRect(0, 0, crossCanvas.width, crossCanvas.height);       
    
    // draw cross and circle if mouse is in graph area
    if (x > offset && y < transformTemperatures(begin_y)) {
    	
    	// cross
    	cross.beginPath();
	    cross.moveTo(offset,y);
	    cross.lineTo(width,y);
	    cross.moveTo(x -1,0);
	    cross.lineTo(x -1,transformTemperatures(begin_y));
	    cross.strokeStyle = "black";
	    cross.lineWidth = 1;
	    cross.stroke();   
	    cross.closePath();

	    // circle
	    cross.beginPath();
	    cross.arc(x - 1,y,5,2 * Math.PI, false);
	    cross.lineWidth = 2;
	    cross.stroke();
	    cross.closePath(); 

	    // get current temperature as text
	    var txt = tempOnDay/10 + " \xB0C";
	    var textWidth = cross.measureText(txt).width;
	    
	    
	    // draw rectangle 
	    var rectWidth = textWidth + 10;
	    var rectHeight = 23;
	    cross.fillStyle = "black";
	    cross.fillRect((x/2) - 5, y , rectWidth, - rectHeight);
	    cross.stroke();

	    // display temperature text
	    var displayTempOffset = 5;
	    cross.fillStyle = "white";
	    cross.font = "15px sans-serif"
	    cross.fillText(txt, x / 2, y - displayTempOffset);

	    // get current date as text
	    var currentDate = new Date(dates[day - 1]);
	    var dateTxt = currentDate.getDate() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getFullYear();
	    
	    var textWidth = cross.measureText(dateTxt).width;

	    // draw rectangle 
	    var boxPadding = 5;
	    rectWidth = textWidth + (2*boxPadding);
	    rectHeight = 15 + boxPadding;
	    cross.fillStyle = "black";
	    cross.fillRect(x - (textWidth / 2) - boxPadding, transformTemperatures(begin_y), rectWidth, - rectHeight);
	    cross.stroke();

	    // display temperature text
	   
	    cross.fillStyle = "white";
	    cross.font = "15px sans-serif"
	    cross.fillText(dateTxt, x - (textWidth / 2), transformTemperatures(begin_y) - boxPadding);
    }
    

    
})



