/* script used by the report page of thalemine (report.jsp), if protein
//
// INPUT:   - the protein id (primaryIdentifier)
//          - the mine url (if not present, defaults to araport)
// OUTPUT:  bar chart displaying the various domains associated with the protein
//
*/

// to set the mine: could be done inside js with injection
// here using a parameter from jsp
//var DEFAULT_MINEURL = "https://apps.araport.org/thalemine/";
var DEFAULT_MINEURL = "http://intermine.modencode.org/thaleminedev/";
var DEFAULT_ID = "AT3G24650";

if(typeof mineUrl === 'undefined'){
   mineUrl = DEFAULT_MINEURL;
 };

if(typeof queryId === 'undefined'){
   queryId = DEFAULT_ID;
 };

var BASEURL = mineUrl + "/service/query/results?query=";

//var QUERYSTART = "%3Cquery%20name=%22%22%20model=%22genomic%22%20view=%22"+
//"RnaseqExpression.TPM%20RnaseqExpression.gene.primaryIdentifier%20"+
//"RnaseqExpression.study.SRAaccession%22%20longDescription=%22%22%20"+
//"sortOrder=%22RnaseqExpression.study.SRAaccession%20asc%22%3E%20%3"+
//"Cconstraint%20path=%22RnaseqExpression.gene.primaryIdentifier%22%20op=%22=%22%20value=%22";

//var QUERYSTART = "%3Cquery%20name=%22%22%20model=%22genomic%22%20view=%22Gene.primaryIdentifier%20Gene.symbol%20Gene.RNASeqExpressions.score%20Gene.RNASeqExpressions.unit%20Gene.RNASeqExpressions.experiment.SRAaccession%20Gene.RNASeqExpressions.experiment.category%20Gene.RNASeqExpressions.experiment.title%22%20longDescription=%22%22%20sortOrder=%22Gene.primaryIdentifier%20asc%20Gene.RNASeqExpressions.experiment.category%20asc%22%3E%20%3Cconstraint%20path=%22Gene.primaryIdentifier%22%20op=%22=%22%20value=%22"

// model v4
//var QUERYSTART = "%3Cquery%20name=%22%22%20model=%22genomic%22%20view=%22Gene.primaryIdentifier%20Gene.symbol%20Gene.RNASeqExpressions.expressionLevel%20Gene.RNASeqExpressions.unit%20Gene.RNASeqExpressions.experiment.SRAaccession%20Gene.RNASeqExpressions.experiment.tissue%20Gene.RNASeqExpressions.experiment.description%22%20longDescription=%22%22%20sortOrder=%22Gene.primaryIdentifier%20asc%20Gene.RNASeqExpressions.experiment.tissue%20asc%22%3E%20%3Cconstraint%20path=%22Gene.primaryIdentifier%22%20op=%22=%22%20value=%22"

// v4 no description
var QUERYSTART = "%3Cquery%20name=%22%22%20model=%22genomic%22%20view=%22Gene.primaryIdentifier%20Gene.symbol%20Gene.RNASeqExpressions.expressionLevel%20Gene.RNASeqExpressions.unit%20Gene.RNASeqExpressions.experiment.SRAaccession%20Gene.RNASeqExpressions.experiment.tissue%22%20longDescription=%22%22%20sortOrder=%22Gene.primaryIdentifier%20asc%20Gene.RNASeqExpressions.experiment.tissue%20asc%22%3E%20%3Cconstraint%20path=%22Gene.primaryIdentifier%22%20op=%22=%22%20value=%22"

var QUERYEND="%22/%3E%20%3C/query%3E";

var QUERY= BASEURL + QUERYSTART + queryId + QUERYEND;

var PORTAL = "portal.do?class=Gene&externalids=";

var svg = d3.select("#echart");

// not used
var colors = d3.scale.category20c();

// will be set according to range
var color = null;

// margins
var margin = {top: 60, right: 40, bottom: 30, left: 60}

// Original Width
var width = parseInt(svg.style("width"));

// Store our scale so that it's accessible by all:
var x=null;
var z=null;
var y=null;

var geneNr=null;
var sampleNr=null;

var xAxis = null;
var yAxis = null;

// Static bar type:
var barHeight = 20;
var cellWidth = 10;

var render = function() {

  // when no results don't display anything
  svg.attr("height", 0);

  if (data.length == 0) {return};

  // preliminary setting
  var max = d3.max(data, function(d) { return +d[2];} );
  geneNr = d3.map(data, function(d){return d[0];}).size();
  sampleNr = data.length/geneNr;

  x = d3.scale.linear().range([0, width])
  //y = d3.scale.quantile().range([0, geneNr*barHeight])
  z = d3.scale.linear().range("white", "blue"); //?

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

  //~ // Coerce data to the appropriate types. ??
  //~ data.forEach(function(d) {
    //~ d.sra = +d[4];
    //~ d.gene = +d[0];
    //~ d.tpm = +d[2];
    //~ d.cat = +d[5];
  //~ });

  // Compute the scale domains.
  x.domain(d3.extent(data, function(d) { return d[4]; }));
  z.domain([0, d3.max(data, function(d) { return d[2]; })]);
//  y.domain(d3.map(data, function(d){return d[0];}).keys());

  y= d3.scale.ordinal()
  .domain(d3.map(data, function(d){return d[0];}).keys())
//  .range([0, geneNr*barHeight])
  .rangeRoundBands([0, geneNr*barHeight], .1);
  ;

console.log("x: " + d3.extent(data, function(d) { return d[4]; }));
//console.log("y: " + d3.extent(data, function(d) { return d[0]; }));
console.log("z: " + d3.extent(data, function(d) { return d[2]; }));
//console.log("genes: " + d3.map(data, function(d){return d[0];}).keys());
//console.log("genes: " + d3.map(data, function(d){return d[0];}).values());
console.log("genes: " + d3.map(data, function(d){return d[0];}).size());

  xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    ;

  yAxis = d3.svg.axis()
    .scale(y)
//    .orient("left")
    .orient("left")
    ;

console.log("y= " + y.domain() + "--" + y.range());

// Draw our elements!!

// BOX
    svg.append("rect")
      .attr("class", "boundingbox")
      .attr("x", 0)
      .attr("y", (margin.top - barHeight))
      .attr("height", (margin.top + barHeight*geneNr))
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
         return "translate("+(margin.right + (i%sampleNr)*cellWidth) + "," + (margin.top + barHeight*Math.floor(i/sampleNr) ) + ")";
     });

  bar.append("a")
    .on("mouseover", function(d, i){
      d3.select(this)
          .attr({"xlink:href": mineUrl + PORTAL + d[0]})
          .attr({"xlink:title": d[0] +" - " + d[4] + " (" + d[5] + "): " + d[2]});
    })
    .append("rect")
    .attr("width", cellWidth)
    .attr("height", barHeight - 1)
    .style("fill", function(d) { return color(d[2])});

// X AXIS
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", function() {
        return "translate( 0 " + "," + (geneNr*barHeight) + ")"})
      //~ .style("stroke", "gray")
      //~ .style("stroke-width", 1)
      .style("shape-rendering", "crispEdges")
      .attr("ticks", 5)
      .call(xAxis)

    .append("text")
      .attr("class", "xlabel")
      .attr("x", margin.right + sampleNr*cellWidth)
      .attr("y", margin.top + barHeight)
      .attr("text-anchor", "end")
      .text("SRA (by tissue)");

if (geneNr > 1 ) {

  // Y AXIS
  svg.append("g")
      .attr("class", "y axis")
      .style("shape-rendering", "crispEdges")
      //.attr("ticks", 5)
       //~ .attr("transform", function() {
        //~ return "translate( 0 " + "," + (margin.top + barHeight/2 ) + ")"})
       .attr("transform", function() {
//        return "translate( 0 " + "," + (margin.top + barHeight/2 ) + ")"})
//        return "translate(" + margin.right + "," + (geneNr*barHeight + margin.top)  + ")"})
        return "translate(" + margin.right + "," + margin.left  + ")"})
      .call(d3.svg.axis().scale(y).orient("left"))
      .call(yAxis)
  // label
    //~ .append("text")
      //~ .attr("class", "ylabel")
      //~ .attr("x", margin.right)
      //~ .attr("y", margin.top )
      //~ // .attr("y", function(d, i) { return (2*margin.top + barHeight*Math.floor(i/sampleNr))})
      //~ .attr("text-anchor", "beginning")
      //~ .text("GENE")
      ;
}


  //~ bar.append("a")
    //~ .on("mouseover", function(d){
      //~ d3.select(this)
          //~ .attr({"xlink:href": mineUrl + PORTAL + d[0]})
          //~ .attr({"xlink:title": d[0]});
      //~ })
    //~ .append("text")
    //~ // .attr("x", function(d) { return range(d) - 3; })
    //~ //.attr("x", function(i) { return "translate(" + cellWidth * i +");" })
    //~ // .attr("x", cellWidth )
    //~ .attr("y", barHeight / 2)
    //~ .attr("dy", ".05em")
    //~ .text(function(d) { return (d[2])})
    ;



/*
// Add a legend for the color values.
  var legend = svg.selectAll(".legend")
      .data(z.ticks(5).slice(1).reverse())
    .enter().append("g")
      .attr("class", "legend")
      //~ .attr("transform", function(d, i) { return "translate(" + (20 + i * 20) + "," + (barHeight*geneNr + 44) + ")"; });
      .attr("transform", function(d, i) { return "translate(" + 0 + "," + (20 + i * 20) + ")"; })
      ;

  legend.append("rect")
      .attr("width", cellWidth*2)
      .attr("height", 10)
      //.style("fill", function(d) { return color(d[2])})
      .style("fill", "red")
      ;

  legend.append("text")
      .attr("x", 66)
      .attr("y", barHeight*geneNr + margin.top + barHeight)
      .attr("dy", ".35em")
      .text(String);

  svg.append("text")
      .attr("class", "label")
      .attr("x", 0)
      .attr("y", barHeight*geneNr + margin.top + barHeight)
      .attr("dy", ".35em")
      .text("Count");
*/

}

var rescale = function() {

  // The new width of the SVG element
  var newwidth = parseInt(svg.style("width"));

 // Our input hasn't changed (domain) but our range has. Rescale it!
  x.range([0, newwidth]);
  cellWidth=((newwidth - margin.right -margin.left)/sampleNr);

  // Use our existing data:
  var bar = svg.selectAll(".proteinbar").data(data)

  bar.attr("transform", function(d,i) {
        return "translate("+(margin.right + (i%sampleNr)*cellWidth) + "," + (margin.top + barHeight*Math.floor(i/sampleNr) ) + ")";
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
  var bb = svg.select(".boundingbox").attr("width", (newwidth -15));

  // resize the x axis
  xAxis.scale(x);
  svg.select(".x.axis").call(xAxis)
  ;

// re position the label
svg.select(".xlabel")
    .attr("x", margin.right + sampleNr*cellWidth)
    .text("SRA (by tissue)");

  // resize the header
  head = svg.select(".myheader").attr("width",newwidth);

}

// Fetch our JSON and feed it to the draw function

// d3.json("data.json", function(returned) {
//   data = returned.results;
//   render();
// });

d3.json(QUERY, function(returned) {
  data = returned.results;
  render();
});


// Rescale it when the window resizes:
d3.select(window).on("resize", rescale);
