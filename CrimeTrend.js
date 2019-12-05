(function() {

  let data = "Crime_Data_2010_2017.csv";
  let svgContainer = ""; // keep SVG reference in global scope
  let map = "";
  let dataset = [];
 
//console.log(Object.keys(colors))
  // load data and make scatter plot after window loads
  window.onload = function() {
    svgContainer = d3.select('body')
      .append('svg')
      .attr('width', 900)
      .attr('height', 800);
    
      // d3.csv is basically fetch but it can be be passed a csv file as a parameter
   
    // d3.csv(data)
    //   .then((data) => this.console.log(data[0]));
    var crimesByYear = {}
    var crimes  = d3.csv(data, function(d){
      return {
        //date_occurred: d['Date Occurred'],
        date_reported: d['Date Reported'],
        one: d['One']
      };
    }).then(function(d){
      crimesByYear = d3.nest()
      .key(function(d){return d.date_reported.split('/')[2];})
      .rollup(function(v){ return d3.sum(v,function(d){ return d.one;});})
      .object(d);
      makeLinePlot(crimesByYear)
      makeArrayObj(crimesByYear)
      console.log(JSON.stringify(crimesByYear));
    })
    
    //console.log(crimes)
    //n = 8
    
    //var dataset = 
    //var dataset = d3.range(n).map(function(d) { return {"y": d3.randomUniform(1)() } })
    //var dataset = d3.range(n).map(function(d) { return {"year": d3.keys(crimesByYear)[n],"number":d3.values(crimesByYear)[n] } })
    //console.log(dataset)
    // var crimesByYear = d3.nest()
    // .key(function(d){return d['Date Occurred'].split('/')[2];})
    // .rollup(function(v){ return d3.sum(v,function(d){ return d['One'];});})
    // .object(crimes);
    //console.log(JSON.stringify(crimesByYear));
      // 2. Use the margin convention practice 


  }   
  function makeArrayObj(crimesByYear){
    //var dataset = []
    let year = d3.keys(crimesByYear)
    //console.log(year[0])
    var number = d3.values(crimesByYear)
    
    for (let i = 0; i < 8; i+=1){
      dic = {}
      dic['year'] = year[i]
      dic['number'] = number[i]
      dataset.push(dic)
    }
    //console.log(dataset)
    return dataset
  }
  //make scatter plot with trend line
  function makeLinePlot(crimesByYear) {
    dataset = makeArrayObj(crimesByYear)

    // get arrays of fertility rate data and life Expectancy data
    let year = dataset.map((row) => parseFloat(row["year"]));
    //let year = d3.keys(crimesByYear)
    //console.log(year)
    let numOfCrimes = dataset.map((row)=> parseFloat(row['number']))
    //let numOfCrimes = d3.values(crimesByYear)
    console.log(numOfCrimes)
    //let numOfCrimes = data.map((row) => parseFloat(row["Total"]));
    // find data limits
    let axesLimits = findMinMax(year, numOfCrimes);
    //console.log(axesLimits)
    // draw axes and return scaling + mapping functions
    map = drawAxes(axesLimits, "year", "number");
    //drawLines(axesLimits, "year", "number")
    // plot data as points and add tooltip functionality
    // debugger;
    plotData(dataset,axesLimits,"year","number");
    //console.log(dataset)
    // draw title and axes labels
    makeLabels();
  }


  // make title and axes labels
  function makeLabels() {
    svgContainer.append('text')
      .attr('x', 200)
      .attr('y', 20)
      .style('font-size', '14pt')
      .text("The Trend of The Number of Crimes in LA Along With Years");

    svgContainer.append('text')
      .attr('x', 400)
      .attr('y', 650)
      .style('font-size', '10pt')
      .text('Year');

    svgContainer.append('text')
      .attr('transform', 'translate(15, 300)rotate(-90)')
      .style('font-size', '10pt')
      .text('Number of Crimes');
  }

//   // legendary -> value of the legendary filter
//   // generation -> value of the generation filter
//   function filter(legendary, generation) {
//       let thisData = data.filter(function(d) {
//         if (legendary == "(all)" && generation == "(all)"){
//           return data
//         } else if (generation == "(all)" && legendary != "(all)"){
//           return d["Legendary"] == legendary
//         } else if (generation != "(all)" && legendary == "(all)") {
//           return d["Generation"] == generation
//         } else{
//           //console.log(legendary)
//           return d["Legendary"] == legendary && d["Generation"] == generation
//         }
//       })
  

//   plotData(thisData);
//   }
//   // plot all the data points on the SVG
//   // and add tooltip functionality
//   // thisData -> the data that we want to plot

function plotData(thisData,limits,x,y) {
    console.log(thisData)
    // mapping functions
    let xMap = map.x;
    let yMap = map.y;
    //console.log(map.y)
    // make tooltip
    // let div = d3.select("body").append("div")
    // .attr("class", "tooltip")
    // .style("opacity", 0);

    // append data to SVG and plot as points
    var dots = svgContainer.selectAll('.dot')
      .data(thisData)
      .enter()
      .append('circle')
        .attr('cx', xMap)
        .attr('cy', yMap)
        //.attr('r', (d) => pop_map_func(d["pop_mlns"]*2) )
        .attr('r',5)
        .attr('stroke', '#4286f4')
        .attr('stroke-width',1);
      
      line = drawLines(limits,x,y)
      var lines = svgContainer.append('path')
      .datum(thisData)
      .attr("class","line")
      .attr("d",line)
      .attr('stroke','#4286f4')
      .attr('stroke-width',1)
      .attr("id",function(d,i){return "line"+i})

      d3.selectAll("path").each(function(d, i) {
        let totalLength = d3.select("#line" + i).node().getTotalLength();
        d3.select("#line" + i).attr("stroke-dasharray", totalLength + " " + totalLength)
          .attr("stroke-dashoffset", totalLength)
          .transition()
          .duration(1200)
          .delay(700*i)
          .ease(d3.easeLinear)
          .attr("stroke-dashoffset", 0)
          .style("stroke-width", 3)
    })
    }
function drawLines(limits,x,y){
  let xValue = function(d) {console.log(d)
    return +d[x]; }
  let xScale = d3.scaleLinear()
      .domain([limits.xMin, limits.xMax]) // give domain buffer room
      .range([50, 850]);

      let yValue = function(d) {
        console.log("y",d[y])
         return +d[y]}
  let yScale = d3.scaleLinear()
      .domain([limits.yMax + 10000, limits.yMin - 10000]) // give domain buffer
      .range([50, 650]);
      var lines = d3.line()
        .x(function(d){return xScale(xValue(d));})
        .y(function(d){return yScale(yValue(d));})
        .curve(d3.curveMonotoneX)
        return lines
}
//     function makeFilters() {
//       var dropDownL = d3.select("#filterL").append("select")
//         .attr("name", "Legendary");
//       var dropDownG = d3.select("#filterG").append("select")
//         .attr("name", "Generation");

//       var optionsL = dropDownL.selectAll("option")
//         .data(d3.map(data, function(d) {return d['Legendary'];}).keys())
//         .enter()
//         .append("option")
//         .text(function(d) {return d;})
//         .attr('value', function(d) {return d;});
      
//       var defaultOptionL = dropDownL.append("option")
//         .data(data)
//         .text("(all)")
//         .attr("value","(all)")
//         .classed("default", true)
//         .enter();

//       //dropDownL.on('change',filter())
//       dropDownL.on("change", function() {
//         var selected = this.value // "this" -> array of objects representing data points
//         //console.log(this.value)
//         let generationFilter = document.querySelector("#filterG select");
//         let gen = generationFilter.options[generationFilter.selectedIndex].value;

//         filter(selected, gen);
//       });

//       var optionsG = dropDownG.selectAll("option")
//         .data(d3.map(data, function(d) {return d['Generation'];}).keys())
//         .enter()
//         .append("option")
//         .text(function(d) {return d;})
//         .attr('value', function(d) {return d;});
//       var defaultOptionG = dropDownG.append("option")
//         .data(data)
//         .text("(all)")
//         .attr("value","(all)")
//         .classed("default", true)
//         .enter();
//       dropDownG.on("change", function() {
//         //filter()
//         var selected = this.value; // "this" -> array of objects representing data points
//         let legendaryFilter = document.querySelector("#filterL select");
//         let leg = legendaryFilter.options[legendaryFilter.selectedIndex].value;

//         filter(leg, selected);
//       })
    
//     }
// }

//   // draw the axes and ticks
  function drawAxes(limits, x, y) {
    // return x value from a row of data
    let xValue = function(d) {console.log(d)
       return +d[x]; }
    // function to scale x value
    // let xScaleLine = d3.scaleLinear()
    // .domain([limits.xMin, limits.xMax])
    // .range([50,850])
    let xScale = d3.scaleLinear()
      .domain([limits.xMin, limits.xMax]) // give domain buffer room
      .range([50, 850]);
    
    // xMap returns a scaled x value from a row of data
    let xMap = function(d) { return xScale(xValue(d)); };

    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale);
    svgContainer.append("g")
      .attr('transform', 'translate(0, 650)')
      .call(xAxis.ticks(5));

    // return y value from a row of data
    let yValue = function(d) {
      console.log("y",d[y])
       return +d[y]}

    // function to scale y
    let yScale = d3.scaleLinear()
      .domain([limits.yMax + 10000, limits.yMin - 10000]) // give domain buffer
      .range([50, 650]);

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) { return yScale(yValue(d)); };

    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);
    svgContainer.append('g')
      .attr('transform', 'translate(50, 0)')
      .call(yAxis);

    // return mapping and scaling functions
    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale
    };
  }

  // find min and max for arrays of x and y
  function findMinMax(x, y) {

    // get min/max x values
    let xMin = d3.min(x);
    let xMax = d3.max(x);

    // get min/max y values
    let yMin = d3.min(y);
    let yMax = d3.max(y);

    // return formatted min/max data as an object
    return {
      xMin : xMin,
      xMax : xMax,
      yMin : yMin,
      yMax : yMax
    }
  }


  
//   // format numbers
//   function numberWithCommas(x) {
//     return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
//   }

})();
