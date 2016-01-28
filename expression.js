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

var QUERYSTART = "%3Cquery%20name=%22%22%20model=%22genomic%22%20view=%22Gene.primaryIdentifier%20Gene.symbol%20Gene.RNASeqExpressions.score%20Gene.RNASeqExpressions.unit%20Gene.RNASeqExpressions.experiment.SRAaccession%20Gene.RNASeqExpressions.experiment.category%20Gene.RNASeqExpressions.experiment.title%22%20longDescription=%22%22%20sortOrder=%22Gene.primaryIdentifier%20asc%20Gene.RNASeqExpressions.experiment.SRAaccession%20asc%22%3E%20%3Cconstraint%20path=%22Gene.primaryIdentifier%22%20op=%22=%22%20value=%22"

var QUERYEND="%22/%3E%20%3C/query%3E";

var QUERY= BASEURL + QUERYSTART + queryId + QUERYEND;

var PORTAL = "portal.do?class=Gene&externalids=";

var svg = d3.select("#echart");

// not used
var colors = d3.scale.category20c();

// will be set according to range
var color = null;

// margins
var margin = {top: 40, right: 20, bottom: 30, left: 40}

// Original Width
var width = parseInt(svg.style("width"));

// Store our scale so that it's accessible by all:
var x= null;
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

  if (data.length > 0) {

  // preliminary setting
  var max = d3.max(data, function(d) { return +d[2];} );
  geneNr = d3.map(data, function(d){return d[0];}).size();
  sampleNr = data.length/geneNr;

  x = d3.scale.linear().range([0, width])
  y = d3.scale.linear().range([geneNr*barHeight, 0])
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
      .attr('height', 20)
      //.attr('fill', )
      .append("xhtml:body")
      .html('<h3 class="goog"> ' + sampleNr + ' Samples RNA Seq Expressions - source: Araport</h3>\
             <p> <p>');

  // Size our SVG tall enough so that it fits each bar.
  // Width was already defined when we loaded.
  svg.attr("height", margin.top + (barHeight * geneNr) + margin.bottom);
  cellWidth=((width - margin.right -margin.left)/sampleNr);
//  console.log("CW=" + cellWidth + "  max value=" + max);

  }

  // Coerce data to the appropriate types.
  data.forEach(function(d) {
    //~ d.sra = +d[2];
    //~ d.gene = +d[1];
    //~ d.tpm = +d[0];

    d.sra = +d[4];
    d.gene = +d[0];
    d.tpm = +d[2];

  });

  // Compute the scale domains.
  x.domain(d3.extent(data, function(d) { return d[4]; }));
  //y.domain(d3.extent(data, function(d) { return d[0]; }));
  z.domain([0, d3.max(data, function(d) { return d[2]; })]);
  y.domain(d3.map(data, function(d){return d[0];}).keys());

console.log("x: " + d3.extent(data, function(d) { return d[4]; }));
//console.log("y: " + d3.extent(data, function(d) { return d[0]; }));
console.log("z: " + d3.extent(data, function(d) { return d[2]; }));
console.log("genes: " + d3.map(data, function(d){return d[0];}).keys());
//console.log("genes: " + d3.map(data, function(d){return d[0];}).values());
console.log("genes: " + d3.map(data, function(d){return d[0];}).size());

  xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    ;

yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    ;

  // Draw our elements!!
  var bar = svg.selectAll("g")
      .data(data)

  // New bars:
  bar.enter().append("g")
      .attr("class", "proteinbar")
      .attr("transform", function(d, i) {
        //return "translate(" + x(d[0]) + "," + (margin.top + (i * barHeight)) + ")";
        //return "translate("+(margin.right + i*cellWidth) + "," + (margin.top + barHeight) + ")";
       // return "translate("+(margin.right + (i%113)*cellWidth) + "," + (margin.top + (i/113)*barHeight).toFixed(0) + ")";
         return "translate("+(margin.right + (i%sampleNr)*cellWidth) + "," + (margin.top + barHeight*Math.floor(i/sampleNr) ) + ")";
     });

  bar.append("a")
    .on("mouseover", function(d, i){
      d3.select(this)
          .attr({"xlink:href": mineUrl + PORTAL + d[0]})
          //.attr({"xlink:href": "http://www.betterthantv.co.uk"})
          .attr({"xlink:title": d[0] +" - " + d[4] + ": " + d[2]});

    })
    .append("rect")
    .attr("width", cellWidth)
    .attr("height", barHeight - 1)
    .style("fill", function(d, i) { return color(d[2])});

  bar.append("a")
    .on("mouseover", function(d){
      d3.select(this)
          .attr({"xlink:href": mineUrl + PORTAL + d[0]})
          .attr({"xlink:title": d[0]});
      })
    //~ .append("text")
    //~ // .attr("x", function(d) { return range(d) - 3; })
    //~ //.attr("x", function(i) { return "translate(" + cellWidth * i +");" })
    //~ // .attr("x", cellWidth )
    //~ .attr("y", barHeight / 2)
    //~ .attr("dy", ".05em")
    //~ .text(function(d) { return (d[2])})
    ;


  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", function(d, i) {
        return "translate( 0 " + "," + (margin.top + 3 * barHeight + 5 ) + ")"})
      .style("stroke", "gray")
      .style("stroke-width", 1)
      .style("shape-rendering", "crispEdges")
      .attr("ticks", 16)
      .call(xAxis)

    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .attr("text-anchor", "end")
      .text("SRA");

    svg.append("rect")
      .attr("class", "boundingbox")
      .attr("x", 0)
      .attr("y", (margin.top - 5))
      .attr("height", (20 + barHeight*geneNr))
      .attr("width", width)
      .style("stroke", "grey")
      .style("fill", "none")
      .style("stroke-width", 1);


  svg.append("g")
      .attr("class", "y axis")
      .attr("transform", function(d, i) {
        return "translate( 0 " + "," + (margin.top + 1.5 * barHeight ) + ")"})
        //~ return "translate( 0 " + ", " + 10 + ")"})
      .style("stroke", "gray")
      .style("stroke-width", 1)
      .style("shape-rendering", "crispEdges")
      .attr("ticks", 16)
      .call(yAxis)

    .append("text")
      .attr("class", "label")
      .attr("x", 0)
      .attr("y", 0)
      .attr("text-anchor", "beginning")
      .text("GENE");




}

var rescale = function() {

  // The new width of the SVG element
  var newwidth = parseInt(svg.style("width"));

  // Our input hasn't changed (domain) but our range has. Rescale it!
  x.range([0, newwidth]);
  cellWidth=((newwidth - margin.right -margin.left)/data.length);

  // Use our existing data:
  var bar = svg.selectAll(".proteinbar").data(data)

  bar.attr("transform", function(d, i) {
        return "translate("+(margin.right + i*cellWidth) + "," + (margin.top + barHeight) + ")";
      });

  // For each bar group, select the rect and reposition it using the new scale.
  bar.select("rect")
      .attr("width", cellWidth)
      .attr("height", barHeight - 1)
      .style("fill", function(d, i) { return color(d[0])});

  // Also reposition the bars using the new scales.
  bar.select("text")
      .attr("x", function(d,i) { return i*cellWidth; })
      .attr("y", barHeight / 2)
      .attr("dy", ".15em")
      .text(function(d) { return (d[2])});

  // resize the bounding box
  var bb = svg.select(".boundingbox").attr("width", newwidth);

  // resize the x axis
  xAxis.scale(x);
  svg.select(".x.axis").call(xAxis)
    //~ .append("text")
      //~ .attr("class", "label")
      //~ .attr("x", newwidth)
      //~ .attr("y", -6)
      //~ .attr("text-anchor", "end")
      //~ .style("stroke", "red")
      //~ .text("SRAuu")
      ;

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
