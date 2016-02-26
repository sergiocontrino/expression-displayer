/* script to be used by the report page of thalemine (report.jsp), if gene or transcript
//
// INPUT:   - the gene id (primaryIdentifier) or list name
//          - the mine url (if not present, defaults to araport)
//          - the id of the svg element (from the calling page)
//
// OUTPUT:  heat map
//          colouring is done using the log(level+1)
//          the mouse over displays the actual value of level
//
// TODO: - add x axis labels (tissue)
//       - add legend ?
//
*/

// to set the mine: could be done inside js with injection
// here using a parameter from jsp
//var DEFAULT_MINEURL = "https://apps.araport.org/thalemine/";
var DEFAULT_MINEURL = "http://intermine.modencode.org/thalemineval/";
var DEFAULT_ID = "AT3G24650";
var DEFAULT_SVG = "echart";

if(typeof mineUrl === 'undefined'){
   mineUrl = DEFAULT_MINEURL;
 };

if(typeof queryId === 'undefined'){
   queryId = DEFAULT_ID;
 };

if(typeof svgId === 'undefined'){
   svgId = DEFAULT_SVG;
 };

console.log(svgId +"--"+mineUrl+"|" + queryId);

var BASEURL = mineUrl + "/service/query/results?query=";

var QUERYSTART = "%3Cquery%20name=%22%22%20model=%22genomic%22%20view=%22Gene.primaryIdentifier%20Gene.symbol%20Gene.RNASeqExpressions.expressionLevel%20Gene.RNASeqExpressions.unit%20Gene.RNASeqExpressions.experiment.SRAaccession%20Gene.RNASeqExpressions.experiment.tissue%22%20longDescription=%22%22%20sortOrder=%22Gene.primaryIdentifier%20asc%20Gene.RNASeqExpressions.experiment.tissue%20asc%20Gene.RNASeqExpressions.experiment.SRAaccession%20asc%22%3E%20%3Cconstraint%20path=%22";

var IDS="Gene.primaryIdentifier%22%20op=%22=%22%20value=%22"

var LIST="Gene%22%20op=%22IN%22%20value=%22"

var qType=IDS;  // default query type: ids

var QUERYEND="%22/%3E%20%3C/query%3E";

if(typeof listName != 'undefined'){ // set only on a bagDetails page
    qType = LIST;
    queryId = listName;
 };

var query = BASEURL + QUERYSTART + qType + queryId + QUERYEND;

var GPORTAL = "portal.do?class=Gene&externalids=";
var EPORTAL = "portal.do?class=RnaseqExperiment&externalids=";

var svg = d3.select("#" + svgId);

//var colors = d3.scale.category20c();
// will be set according to range
var color = null;

// the display unit:
var barHeight = 20;
var cellWidth = 10;

// margins
var margin = {left: 4*barHeight, top: 3*barHeight, right: 3*barHeight, bottom: 4*barHeight};

// Original Width
var width = parseInt(svg.style("width"));

// Store our scale so that it's accessible by all:
var x = null;
var z = null;
var y = null;

var geneNr = null;
var tissueNr = null;
var sampleNr = null;

var xAxis = null;
var yAxis = null;
var linearLegend = null;
var legendLinear = null;

var render = function() {

  // when no results don't display anything
  svg.attr("height", 0);

  if (data.length == 0) {return};

  // preliminary setting
  var maxE = d3.max(data, function(d) { return +d[2];} );
  var max = d3.max(data, function(d) { return Math.log2(d[2]+1);} );
  geneNr = d3.map(data, function(d){return d[0];}).size();
  tissueNr = d3.map(data, function(d){return d[5];}).size();
  sampleNr = data.length/geneNr;
  xNr = d3.map(data, function(d){return d[4];}).size();

console.log("s:" + sampleNr + " t:" + tissueNr + " g:" + geneNr + " x:" + xNr + " Max:" + maxE + " log:" + max);

  if (geneNr == 1 ) {
    margin.left = barHeight;
    margin.right = 2*barHeight;
  }

  var color = d3.scale.linear()
    .domain([0, max])
    //.range(["lightgray", "green"]);
    .range(["palegreen", "red"]);

  // Build the report header
    head = svg.append('foreignObject')
      .attr("class", "myheader")
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', barHeight)
      //.attr('fill', )
      .append("xhtml:body")
      .html('<h3 class="goog"> ' + sampleNr + ' Samples RNA Seq Expressions - source: Araport</h3>\
             <p> <p>');

  // Size our SVG tall enough so that it fits each bar.
  // Width was already defined when we loaded.
  svg.attr("height", margin.top + (barHeight * geneNr) + margin.bottom + barHeight);
  cellWidth=((width - margin.right -margin.left)/sampleNr);

  // Coerce data to the appropriate types. NOT USED
  data.forEach(function(d) {
    d.sra = +d[4];
    d.gene = +d[0];
    d.level = +d[2];
    d.tissue = +d[5];
  });

 // Compute the scale domains and set the ranges

 // x = d3.scale.linear().range([0, width]);
  z = d3.scale.linear().range("white", "blue"); //?

  //x.domain(d3.extent(data, function(d) { return d[4]; }));
  z.domain([0, d3.max(data, function(d) { return Math.log2(d[2]+1); })]);

// Hardcoded for the tissues!!
  x = d3.scale.ordinal()
    .domain(d3.map(data, function(d){return d[5]}).keys())
    .range([0, 7*cellWidth, 9*cellWidth, 16*cellWidth, 40*cellWidth, 85*cellWidth, 87*cellWidth, 96*cellWidth, 103*cellWidth, 106*cellWidth, 110*cellWidth, sampleNr*cellWidth])
  ;

/* old version with the sample id
  x = d3.scale.ordinal()
   .domain(d3.map(data, function(d){return d[4]}).keys())
   .rangeBands([0, sampleNr*cellWidth]);
*/

  y = d3.scale.ordinal()
   .domain(d3.map(data, function(d){return d[0];}).keys())
   .rangeRoundBands([0, geneNr*barHeight]);
  ;

//console.log("x: " + d3.extent(data, function(d) { return d[4]; }));
//console.log("y: " + d3.extent(data, function(d) { return d[0]; }));
//console.log("z: " + d3.extent(data, function(d) { return Math.log2(d[2]+1); }));

  xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    ;

  yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    ;

// Draw our elements!!

// BOX
    svg.append("rect")
      .attr("class", "boundingbox")
      .attr("x", 0)
      .attr("y", (margin.top - barHeight))
      .attr("height", (margin.top + barHeight*geneNr + margin.bottom))
      .attr("width", width - 2*cellWidth)
      .style("stroke", "grey")
      .style("fill", "none")
      //.style("stroke-width", 1)
      ;

  var bar = svg.selectAll("g")
      .data(data)

  // New bars:
  bar.enter().append("g")
      .attr("class", "proteinbar")
      .attr("transform", function(d, i) {
         return "translate("+(margin.left + (i%sampleNr)*cellWidth) + "," + (margin.top + barHeight*Math.floor(i/sampleNr) ) + ")";
     });

  bar.append("a")
    .on("mouseover", function(d, i){
      d3.select(this)
          .attr({"xlink:href": mineUrl + EPORTAL + d[4]})
          .attr({"xlink:title": d[0] +" - " + d[4] + " (" + d[5] + "): " + d[2]});
    })
    .append("rect")
    .attr("width", cellWidth)
    .attr("height", barHeight - 1)
    //.style("fill", function(d) { return color(d[2])});
    .style("fill", function(d) { return color(Math.log2(d[2]+1))});

// X AXIS
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", function() {
      return "translate( " + margin.left + "," + (margin.top + geneNr*barHeight) + ")"})
      .style("shape-rendering", "crispEdges")
      //.attr("ticks", tissueNr)
      .call(xAxis)

    .selectAll("text")
      .attr("class", "xticks")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)" )
    // to link from axis labels
    // removed because we are displaying an attribute (tissue)
    //
    //  .filter(function(d){ return typeof(d) == "string"; })
    //  .style("cursor", "pointer")
    //  .on("click", function(d){
    //    document.location.href = mineUrl + EPORTAL + d;
    //  })
   ;
/* not working, to add bars
var xAxisGrid = xAxis.ticks(tissueNr)
    .tickSize(-geneNr*barHeight, 0)
    .tickFormat("")
    //.stroke("blue")
    //.stroke-width("3px")
    .orient("top")
    ;

svg.append("g")
    .classed('x', true)
    .classed('grid', true)
    .call(xAxisGrid)
    ;
*/

 if (geneNr > 1 ) { // don't display if only 1 row

  // Y AXIS
  svg.append("g")
     .attr("class", "y axis")
     .attr("transform", function() {
        return "translate(" + margin.left + "," + margin.right  + ")"})
     .call(d3.svg.axis().scale(y).orient("left"))
     .call(yAxis)
     .selectAll("text")
      .filter(function(d){ return typeof(d) == "string"; })
      .style("cursor", "pointer")
      .on("click", function(d){ document.location.href = mineUrl + GPORTAL + d; })
      ;
}

// USING d3-legend

  linearLegend = d3.scale.linear()
    .domain([0,maxE])
    //.range(["rgb(46, 73, 123)", "rgb(71, 187, 94)"]);
    .range(["palegreen", "red"]);

  svg.append("g")
    .attr("class", "legendLinear")
    .attr("transform", "translate(" + (margin.left + 40*cellWidth) +","+ (barHeight*geneNr + 2*margin.top) +")");

  legendLinear = d3.legend.color()
    .shapeWidth(4*cellWidth)
    .shapeHeight(10)
    .cells(10)
    .orient('horizontal')
    .labelFormat(d3.format("f"))  // no decimal
    .scale(linearLegend);

  svg.select(".legendLinear")
    .call(legendLinear);


/* works, just min and max
 var legendRectSize = barHeight/2
 var legendSpacing = legendRectSize/2;

 var legend = svg.selectAll('.legend')
    .data(color.domain())
    .enter()
    .append('g')
    .attr('class', 'legend')
    .attr('transform', function(d, i) {
        var h = barHeight + i * 3 * barHeight ;
        var v = barHeight*geneNr + margin.top + margin.bottom;
        return 'translate(' + h + ',' + v + ')';
     });

  legend.append('rect')
    .attr('width', legendRectSize)
    .attr('height', legendRectSize)
    .style('fill', color)
    .style('stroke', color);

  legend.append('text')
    .attr('x', legendRectSize + legendSpacing)
    .attr('y', legendRectSize )
    .style("font-size","14px")
    .text(function(d) { return (Math.pow(2, d) -1).toFixed(2); });

// legend box
    svg.append("rect")
      .attr("class", "legendbox")
      .attr("x", legendRectSize)
      .attr("y", barHeight*geneNr + 2*margin.top +barHeight/2)
      .attr("height", 1.5*barHeight)
      .attr("width", 7*barHeight)
      .style("stroke", "grey")
      .style("fill", "none")
      //.style("stroke-width", 1)
      ;
*/

}

var rescale = function() {

  // The new width of the SVG element
  var newwidth = parseInt(svg.style("width"));

 // Our input hasn't changed (domain) but our range has. Rescale it!
  //x.range([0, newwidth]);
  cellWidth=((newwidth - margin.right - margin.left)/sampleNr);
  x.rangeBands([0,sampleNr*cellWidth]);

  // Use our existing data:
  var bar = svg.selectAll(".proteinbar").data(data)

  bar.attr("transform", function(d,i) {
        return "translate("+(margin.left + (i%sampleNr)*cellWidth) + "," + (margin.top + barHeight*Math.floor(i/sampleNr) ) + ")";
      });

  // For each bar group, select the rect and reposition it using the new scale.
  bar.select("rect")
      .attr("width", cellWidth)
      .attr("height", barHeight - 1)
      ;

  // Also reposition the bars using the new scales.
  //~ bar.select("text")
      //~ .attr("x", function(d,i) { return i*cellWidth; })
      //~ .attr("y", barHeight / 2)
      //~ .attr("dy", ".15em")
      //~ .text(function(d) { return (d[2])});

  // resize the bounding box
  var bb = svg.select(".boundingbox").attr("width", (newwidth -2*cellWidth));

  // resize the x axis
  xAxis.scale(x);
  x.range([0, 7*cellWidth, 9*cellWidth, 16*cellWidth, 40*cellWidth, 85*cellWidth, 87*cellWidth, 96*cellWidth, 103*cellWidth, 106*cellWidth, 110*cellWidth, sampleNr*cellWidth])
  ;
  svg.select(".x.axis")
    .attr("transform", function() {
      return "translate( " + margin.left + "," + (margin.top + geneNr*barHeight) + ")"})
    .call(xAxis)
    .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)")

      .filter(function(d){ return typeof(d) == "string"; })
       .style("cursor", "pointer")
       .on("click", function(d){
        document.location.href = mineUrl + EPORTAL + d;
    })
;

// resize legend

svg.select(".legendLinear")
   .attr("transform", "translate(" + (margin.left + 40*cellWidth) +","+ (barHeight*geneNr + 2*margin.top) +")")
   .call(
     d3.legend.color()
      .shapeWidth(4*cellWidth)
      .shapeHeight(10)
      .cells(10)
      .orient('horizontal')
      .labelFormat(d3.format("f"))  // no decimal
      .scale(linearLegend)
   );

  // resize the header
  head = svg.select(".myheader").attr("width",newwidth);

}

// Fetch our JSON and feed it to the draw function

// d3.json("data.json", function(returned) {
//   data = returned.results;
//   render();
// });

d3.json(query, function(returned) {
  data = returned.results;
  render();
});


// Rescale it when the window resizes:
d3.select(window).on("resize", rescale);
