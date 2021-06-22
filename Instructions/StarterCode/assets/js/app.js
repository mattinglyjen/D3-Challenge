let svgWidth = 960;
let svgHeight = 620;

// borders
let margin = {
    top: 20,
    right: 40,
    bottom: 200,
    left: 100,
};

// calculate height and width
let width = svgWidth - margin.right - margin.left;
let height = svgHeight - margin.top - margin.bottom;

// append div class to scatter element
let chart = d3.select('#scatter')
    .append('div')
    .classed('chart', true);

let svg = chart.append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight);

let chartGroup = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

let chosenX_Axis = 'poverty';
let chosenY_Axis = 'healthcare';



// update xscale 
function xScale(censusData, chosenX_Axis) {

    let xLinear_Scale = d3.scaleLinear()
      .domain([d3.min(censusData, d => d[chosenX_Axis]) * 0.8,
        d3.max(censusData, d => d[chosenX_Axis]) * 1.2])
      .range([0, width]);

    return xLinear_Scale;
}

// update yscale 
function yScale(censusData, chosenY_Axis) {

    let yLinear_Scale = d3.scaleLinear()
      .domain([d3.min(censusData, d => d[chosenY_Axis]) * 0.8,
        d3.max(censusData, d => d[chosenY_Axis]) * 1.2])
      .range([height, 0]);
  
    return yLinear_Scale;
  }

// update x-Axis on click
function renderXAxis(newXScale, xAxis) {
    let bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(2000)
      .call(bottomAxis);
  
    return xAxis;
  }

// update y-Axis on click
function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(2000)
      .call(leftAxis);
  
    return yAxis;
  }

//render circles appropriately
function renderCircles(circlesGroup, newXScale, chosenX_Axis, newYScale, chosenY_Axis) {

    circlesGroup.transition()
      .duration(2000)
      .attr('cx', data => newXScale(data[chosenX_Axis]))
      .attr('cy', data => newYScale(data[chosenY_Axis]))

    return circlesGroup;
}

//figure out labels
function renderText(textGroup, newXScale, chosenX_Axis, newYScale, chosenY_Axis) {

    textGroup.transition()
      .duration(2000)
      .attr('x', d => newXScale(d[chosenX_Axis]))
      .attr('y', d => newYScale(d[chosenY_Axis]));

    return textGroup
}

//set up functions
function styleX(value, chosenX_Axis) {

    if (chosenX_Axis === 'poverty') {
        return `${value}%`;
    }
    else if (chosenX_Axis === 'income') {
        return `${value}`;
    }
    else {
      return `${value}`;
    }
}


function updateToolTip(chosenX_Axis, chosenY_Axis, circlesGroup) {


    if (chosenX_Axis === 'poverty') {
      var xLabel = 'Poverty:';
    }
    else if (chosenX_Axis === 'income'){
      var xLabel = 'Median Income:';
    }
    else {
      var xLabel = 'Age:';
    }
  if (chosenY_Axis ==='healthcare') {
    var yLabel = "No Healthcare:"
  }
  else if(chosenY_Axis === 'obesity') {
    var yLabel = 'Obesity:';
  }
  else{
    var yLabel = 'Smokers:';
  }

  var toolTip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-8, 0])
    .html(function(d) {
        return (`${d.state}<br>${xLabel} ${styleX(d[chosenX_Axis], chosenX_Axis)}<br>${yLabel} ${d[chosenY_Axis]}%`);
  });

  circlesGroup.call(toolTip);

  circlesGroup.on('mouseover', toolTip.show)
    .on('mouseout', toolTip.hide);

    return circlesGroup;
}


d3.csv('./assets/data/data.csv').then(function(censusData) {

    console.log(censusData);
    
    censusData.forEach(function(data){
        data.obesity = +data.obesity;
        data.income = +data.income;
        data.smokes = +data.smokes;
        data.age = +data.age;
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
    });

    var xLinear_Scale = xScale(censusData, chosenX_Axis);
    var yLinear_Scale = yScale(censusData, chosenY_Axis);

    var bottomAxis = d3.axisBottom(xLinear_Scale);
    var leftAxis = d3.axisLeft(yLinear_Scale);

    var xAxis = chartGroup.append('g')
      .classed('x-axis', true)
      .attr('transform', `translate(0, ${height})`)
      .call(bottomAxis);

    var yAxis = chartGroup.append('g')
      .classed('y-axis', true)
      //.attr
      .call(leftAxis);
    
    //append Circles
    var circlesGroup = chartGroup.selectAll('circle')
      .data(censusData)
      .enter()
      .append('circle')
      .classed('stateCircle', true)
      .attr('cx', d => xLinear_Scale(d[chosenX_Axis]))
      .attr('cy', d => yLinear_Scale(d[chosenY_Axis]))
      .attr('r', 14)
      .attr('opacity', '.5');

    var textGroup = chartGroup.selectAll('.stateText')
      .data(censusData)
      .enter()
      .append('text')
      .classed('stateText', true)
      .attr('x', d => xLinear_Scale(d[chosenX_Axis]))
      .attr('y', d => yLinear_Scale(d[chosenY_Axis]))
      .attr('dy', 3)
      .attr('font-size', '10px')
      .text(function(d){return d.abbr});

    //create a group 
    var xLabelsGroup = chartGroup.append('g')
      .attr('transform', `translate(${width / 2}, ${height + 10 + margin.top})`);

    var povertyLabel = xLabelsGroup.append('text')
      .classed('aText', true)
      .classed('active', true)
      .attr('x', 0)
      .attr('y', 20)
      .attr('value', 'poverty')
      .text('In Poverty (%)');
      
    var ageLabel = xLabelsGroup.append('text')
      .classed('aText', true)
      .classed('inactive', true)
      .attr('x', 0)
      .attr('y', 40)
      .attr('value', 'age')
      .text('Age (Median)');  

    var incomeLabel = xLabelsGroup.append('text')
      .classed('aText', true)
      .classed('inactive', true)
      .attr('x', 0)
      .attr('y', 60)
      .attr('value', 'income')
      .text('Household Income (Median)')

    //create a group 
    var yLabelsGroup = chartGroup.append('g')
      .attr('transform', `translate(${0 - margin.left/4}, ${height/2})`);

    var healthcareLabel = yLabelsGroup.append('text')
      .classed('aText', true)
      .classed('active', true)
      .attr('x', 0)
      .attr('y', 0 - 20)
      .attr('dy', '1em')
      .attr('transform', 'rotate(-90)')
      .attr('value', 'healthcare')
      .text('Without Healthcare (%)');
    
    var smokesLabel = yLabelsGroup.append('text')
      .classed('aText', true)
      .classed('inactive', true)
      .attr('x', 0)
      .attr('y', 0 - 40)
      .attr('dy', '1em')
      .attr('transform', 'rotate(-90)')
      .attr('value', 'smokes')
      .text('Smoker (%)');
    
    var obesityLabel = yLabelsGroup.append('text')
      .classed('aText', true)
      .classed('inactive', true)
      .attr('x', 0)
      .attr('y', 0 - 60)
      .attr('dy', '1em')
      .attr('transform', 'rotate(-90)')
      .attr('value', 'obesity')
      .text('Obese (%)');
    
    //update toolTip
    var circlesGroup = updateToolTip(chosenX_Axis, chosenY_Axis, circlesGroup);

    //x axis event listener
    xLabelsGroup.selectAll('text')
      .on('click', function() {
        var value = d3.select(this).attr('value');

        if (value != chosenX_Axis) {

          //replace chosen x with a value
          chosenX_Axis = value; 

          //update x for new data
          xLinear_Scale = xScale(censusData, chosenX_Axis);

          //update x 
          xAxis = renderXAxis(xLinear_Scale, xAxis);

          //upate circles with a new x value
          circlesGroup = renderCircles(circlesGroup, xLinear_Scale, chosenX_Axis, yLinear_Scale, chosenY_Axis);

          //update text 
          textGroup = renderText(textGroup, xLinear_Scale, chosenX_Axis, yLinear_Scale, chosenY_Axis);

          //update tooltip
          circlesGroup = updateToolTip(chosenX_Axis, chosenY_Axis, circlesGroup);

          //change of classes changes text
          if (chosenX_Axis === 'poverty') {
            povertyLabel.classed('active', true).classed('inactive', false);
            ageLabel.classed('active', false).classed('inactive', true);
            incomeLabel.classed('active', false).classed('inactive', true);
          }
          else if (chosenX_Axis === 'age') {
            povertyLabel.classed('active', false).classed('inactive', true);
            ageLabel.classed('active', true).classed('inactive', false);
            incomeLabel.classed('active', false).classed('inactive', true);
          }
          else {
            povertyLabel.classed('active', false).classed('inactive', true);
            ageLabel.classed('active', false).classed('inactive', true);
            incomeLabel.classed('active', true).classed('inactive', false);
          }
        }
      });
    //y axis lables event listener
    yLabelsGroup.selectAll('text')
      .on('click', function() {
        var value = d3.select(this).attr('value');

        if(value !=chosenY_Axis) {
            //replace Y with value  
            chosenY_Axis = value;

            //update Y scale
            yLinear_Scale = yScale(censusData, chosenY_Axis);

            //update Y axis 
            yAxis = renderYAxis(yLinear_Scale, yAxis);

            //Udate CIRCLES
            circlesGroup = renderCircles(circlesGroup, xLinear_Scale, chosenX_Axis, yLinear_Scale, chosenY_Axis);

            //update TEXT Y values
            textGroup = renderText(textGroup, xLinear_Scale, chosenX_Axis, yLinear_Scale, chosenY_Axis);

            
            circlesGroup = updateToolTip(chosenX_Axis, chosenY_Axis, circlesGroup);

            //Change text
            if (chosenY_Axis === 'obesity') {
              obesityLabel.classed('active', true).classed('inactive', false);
              smokesLabel.classed('active', false).classed('inactive', true);
              healthcareLabel.classed('active', false).classed('inactive', true);
            }
            else if (chosenY_Axis === 'smokes') {
              obesityLabel.classed('active', false).classed('inactive', true);
              smokesLabel.classed('active', true).classed('inactive', false);
              healthcareLabel.classed('active', false).classed('inactive', true);
            }
            else {
              obesityLabel.classed('active', false).classed('inactive', true);
              smokesLabel.classed('active', false).classed('inactive', true);
              healthcareLabel.classed('active', true).classed('inactive', false);
            }
          }
        });
});