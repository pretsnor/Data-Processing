/*********
main1.js

Misha Paauw
10054154

Data Processing 
Minor Programmeren
Universiteit van Amsterdam
16 - 11 - 2016

main js file changing the color of some countries
*******/


/* use this to test out your function */
window.onload = function() {
	changeColor(by, "2b2b2b");
	changeColor(rs, "123456");
	changeColor(de, "654321");
	changeColor(fr, "abcdef");
}

/* changeColor takes a path ID and a color (hex value)
   and changes that path's fill color */
function changeColor(id, color) {
	d3.select(id).style("fill", color);    
}