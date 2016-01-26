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
var DEFAULT_MINEURL = "http://intermine.modencode.org/thaleminebuild/";
var DEFAULT_ID = "AT3G24650";

if(typeof mineUrl === 'undefined'){
   mineUrl = DEFAULT_MINEURL;
 };

if(typeof queryId === 'undefined'){
   queryId = DEFAULT_MINEURL;
 };

var BASEURL = mineUrl + "/service/query/results?query=";

var QUERYSTART = "%3Cquery%20name=%22%22%20model=%22genomic%22%20view=%22"+
"RnaseqExpression.TPM%20RnaseqExpression.gene.primaryIdentifier%20"+
"RnaseqExpression.study.SRAaccession%22%20longDescription=%22%22%20"+
"sortOrder=%22RnaseqExpression.study.SRAaccession%20asc%22%3E%20%3"+
"Cconstraint%20path=%22RnaseqExpression.gene.primaryIdentifier%22%20op=%22=%22%20value=%22";

var QUERYEND="%22/%3E%20%3C/query%3E";


var QUERY= BASEURL + QUERYSTART + queryId + QUERYEND;
// TODO update
var PORTAL = "portal.do?class=ProteinDomain&externalids=";

var svg = d3.select("#echart");

var colors = d3.scale.category20c();
//var colors = d3.scale.category10();

var color = d3.scale.linear()
    .domain([0, 10])
    //.range(["lightgray", "green"]);
    .range(["palegreen", "red"]);

// Will hold our data
//var alldata = null

// margins
var margin = {top: 40, right: 20, bottom: 30, left: 40}

// Original Width
var width = parseInt(svg.style("width"));

// Store our scale so that it's accessible by all:
var x= null;
var xAxis = null;

var z=null;
var y=null;

// Static bar type:
var barHeight = 20;
var cellWidth = 10;

var render = function() {

  var max = d3.max(data, function(d) { return +d[0];} );



  // when no results don't display anything
  svg.attr("height", 0);

  x = d3.scale.linear().range([0, width])
  y = d3.scale.linear().range([barHeight, 0])
//  z = d3.scale.linear().range(colorbrewer.RdBu[9]);
  z = d3.scale.linear().range("white", "blue");

  if (data.length > 0) {

  // Build the report header
    head = svg.append('foreignObject')
      .attr("class", "myheader")
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', 20)
      //.attr('fill', )
      .append("xhtml:body")
      .html('<h3 class="goog"> ' + data.length + ' RNA Seq Expressions - source: Araport</h3>\
             <p> <p>');

  // Size our SVG tall enough so that it fits each bar.
  // Width was already defined when we loaded.
  //svg.attr("height", margin.top + (barHeight * data.length) + margin.bottom);
  svg.attr("height", margin.top + (barHeight * 4) + margin.bottom);

  cellWidth=((width - margin.right -margin.left)/data.length);
  console.log("CW=" + cellWidth + "  max value=" + max);

  }

  // Coerce data to the appropriate types.
  data.forEach(function(d) {
    d.sra = +d[2];
    d.gene = +d[1];
    d.tpm = +d[0];
  });

  // Compute the scale domains.
  x.domain(d3.extent(data, function(d) { return d.sra; }));
  y.domain(d3.extent(data, function(d) { return d.gene; }));
  z.domain([0, d3.max(data, function(d) { return d.tpm; })]);

  xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    ;


  // Draw our elements!!
  var bar = svg.selectAll("g")
      .data(data)
    //~ .enter().append("rect")
      //~ .attr("class", "tile")
      //~ .attr("x", function(d) { return x(d.sra); })
      //~ .attr("y", barHeight)
      //~ //.attr("width", x(xStep) - x(0))
      //~ //.attr("height",  y(0) - y(barHeight))
      //~ .style("fill", function(d) { return z(d.tpm); });

  // New bars:
  bar.enter().append("g")
      .attr("class", "proteinbar")
      .attr("transform", function(d, i) {
        //~ return "translate(" + x(d[0]) + "," + (margin.top + (i * barHeight)) + ")";
        return "translate("+(margin.right + i*cellWidth) + "," + (margin.top + barHeight) + ")";
      });

  bar.append("a")
    .on("mouseover", function(d, i){
      d3.select(this)
//          .attr({"xlink:href": mineUrl + PORTAL + d[5]});
          .attr({"xlink:href": "http://www.betterthantv.co.uk"})
          .attr({"xlink:title": d[2] + ": " + d[0]});

    })
    .append("rect")
    .attr("width", cellWidth)
    .attr("height", barHeight - 1)
    .style("fill", function(d, i) { return color(d[0])});
    //~ .style("fill", function(d, i) { return z(d.tpm)});

  bar.append("a")
    .on("mouseover", function(d){
      d3.select(this)
          .attr({"xlink:href": "http://www.betterthantv.co.uk"})
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
      //~ .attr("height", (10 + barHeight * data.length))
      .attr("height", (20 + barHeight*3))
      .attr("width", width)
      .style("stroke", "grey")
      .style("fill", "none")
      .style("stroke-width", 1);

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
