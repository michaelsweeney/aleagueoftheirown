
function createScatter(container, data) {

  let duration = 0;
  let transition = 0;
  let ease = d3.easeLinear


  let body = container
  body.append('svg').attr('class', 'plot')



  let selectcontainer = body.append('div').attr('class', 'top-bottom-container')
  let select_top =  selectcontainer.append('div').attr('class', 'topselect')
  let select_bottom =  selectcontainer.append('div').attr('class', 'bottomselect')


  addSelect(select_top, 'scatter-select-x', data, multiple = false, placeholder = 'Select X Variable')
  addSelect(select_bottom, 'scatter-select-y', data, multiple = false, placeholder = 'Select Y Variable')
  addSelect(select_top, 'scatter-select-z', data, multiple = false, placeholder = 'Select Z (color) Variable')
  addColorSelect(select_bottom, colorscales)

  let hover = body.append('div').append('p')
    .attr('class', 'scatter-hover hover-container')
    .style('opacity', 0)
    .style('margin-top', '10px')


  let x_select = container.select('.scatter-select-x')
  let y_select = container.select('.scatter-select-y')
  let z_select = container.select('.scatter-select-z')
  let clr_select = container.select('.color-select')

  let margin = { top: 50, right: 250, bottom: 100, left: 100 },
    canvas_width = 1000,
    canvas_height = 600,
    plot_width = canvas_width - margin.right - margin.left,
    plot_height = canvas_height - margin.top - margin.bottom


  let svg = body.select('svg')
    .attr('height', plot_height + margin.top + margin.bottom)
    .attr('width', plot_width + margin.left + margin.right)
    .attr("transform", translate(margin.left, margin.top))

  let xScale = d3.scaleLinear().nice()
    .range([0, plot_width])

  let yScale = d3.scaleLinear().nice()
    .range([plot_height, 0])

  let xAxis = d3.axisBottom()
    .scale(xScale)
    .ticks(10)


  let yAxis = d3.axisLeft()
    .scale(yScale)
    .ticks(10)

  niceTicks(yScale, yAxis)
  niceTicks(xScale, xAxis)

  let brush = d3.brush().extent([[0, 0], [plot_width, plot_height]]).on("end", brushended),
    idleTimeout,
    idleDelay = 350;



  let clip = svg.append("defs").append("svg:clipPath")
    .attr("id", "clip")
    .append("svg:rect")
    .attr("width", plot_width)
    .attr("height", plot_height)
    .attr("x", 0)
    .attr("y", 0);


  xScale.domain(d3.extent(data, (d) => { return d.x; })).nice();
  yScale.domain(d3.extent(data, (d) => { return d.y; })).nice();
















  let clr_legend_height = 200;
  let clrpos_x = plot_width + margin.left + 50
  let clrpos_y = margin.top + plot_height / 3
  let clrScale = d3.scaleLinear().nice()
    .range([clr_legend_height, 0])

  let clrAxis = d3.axisLeft()
    .scale(clrScale)
    .ticks(5);



  let legend = svg.append('g').append('defs')
    .attr('class', 'color-gradient')
    .append("svg:linearGradient")
    .attr("id", "scatter_gradient")
    .attr("y1", "0%")
    .attr("x1", "100%")
    .attr("y2", "100%")
    .attr("x2", "100%")
    .attr("spreadMethod", "pad");

  legend.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#f7fcf0")
    .attr('class', 'stop0')
    .attr("stop-opacity", 1);

  legend.append("stop")
    .attr("offset", "33%")
    .attr("stop-color", "#bae4bc")
    .attr('class', 'stop33')
    .attr("stop-opacity", 1);

  legend.append("stop")
    .attr("offset", "66%")
    .attr("stop-color", "#7bccc4")
    .attr('class', 'stop66')
    .attr("stop-opacity", 1);

  legend.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#084081")
    .attr('class', 'stop100')
    .attr("stop-opacity", 1);




  let clr_legend = svg.append("g")

  clr_legend
    .attr("class", "axis clrAxis")
    .attr("transform", translate(clrpos_x, clrpos_y))
    .call(clrAxis)

  clr_legend
    .append("text")
    .attr('class', 'axislabel')
    .attr('font-size', '12px')
    .attr('fill', 'black')
    .attr("transform", "rotate(-90) " + translate(-clr_legend_height / 2, 50))
    .style("text-anchor", "middle")
    .text("");

  clr_legend
    .append("rect")
    .attr("width", 30)
    .attr("height", clr_legend_height)
    .style("fill", "url(#scatter_gradient)")
    .attr("transform", translate(1, 0))


  clr_legend.attr('display', 'none')

  svg.append('g')
    .attr('class', 'axis xAxis')
    .attr("transform", translate(margin.left, margin.top + plot_height))
    .call(xAxis)
    .append('text')
    .attr('class', 'axislabel')
    .attr('fill', 'black')
    .attr('font-size', '12px')
    .attr("transform", translate(plot_width / 2, 40))
    .style("text-anchor", "middle")
    .text("");

  svg.append('g')
    .attr('class', 'axis yAxis')
    .attr("transform", translate(margin.left, margin.top))
    .call(yAxis)
    .append("text")
    .attr('class', 'axislabel')
    .attr('font-size', '12px')
    .attr('fill', 'black')
    .attr("transform", "rotate(-90) " + translate(-plot_height / 2, -50))
    .style("text-anchor", "middle")
    .text("");


  let scatter = svg.append('g')
    .attr('class', 'plot_data')
    .attr("transform", translate(margin.left, margin.top))
    .attr("clip-path", "url(#clip)");


  scatter.append("g")
    .attr("class", "brush")
    .call(brush);


  svg.append('text')
    .attr('class', 'title')
    .attr('font-size', '16px')
    .attr('fill', 'black')
    .attr("transform", translate(margin.left + (plot_width / 2), margin.top * .8))
    .style("text-anchor", "middle")
    .text("")







  // callers
  x_select
    .on('change', () => {
      xChange(data)
      updateTitle()

    })

  y_select
    .on('change', () => {
      yChange(data)
      updateTitle()
    })

  z_select
    .on('change', () => {
      legendChange(data)
      clrChange(data)
      updateTitle()

    })

  clr_select
    .on('change', () => {
      clrChange(data)
      legendChange(data)

    })





  function updateTitle() {

    let y_select_val = y_select.select(".filter-option-inner-inner").node().textContent
    let x_select_val = x_select.select(".filter-option-inner-inner").node().textContent
    let z_select_val = z_select.select(".filter-option-inner-inner").node().textContent

    if (x_select_val != 'Select X Variable' && y_select_val != 'Select Y Variable') {
      if (z_select_val == 'Select Z (color) Variable') {
        text = x_select_val + " vs. " + y_select_val
      }
      else {
        text = x_select_val + " vs. " + y_select_val + ", colored by " + z_select_val
      }
      let title = body.select('.title').text(text)
    }
  }




  function yChange(data) {
    let y_select_val = y_select.select(".filter-option-inner-inner").node().textContent

    body.select('.yAxis').select('.axislabel').text(y_select_val)


    yScale.domain([
      d3.min([
        0, d3.min(data, (d) => {
          return d[y_select_val]
        })]),
      d3.max([0, d3.max(data, (d) => { return d[y_select_val] * 1.2 })])
    ])



    niceTicks(yScale, yAxis)



    body.select('.yAxis')
      .transition(transition).duration(duration)
      .call(yAxis)


    let selection = body.select(".plot_data").selectAll('circle').data(data)
    selection
      .transition(transition).ease(ease).duration(duration)
      .attr('cy', (d) => { return yScale(d[y_select_val]) })
      
    selection
      .enter()
      .append('circle')
      .attr('r', 2)
      .on('mouseover', mouseOver)
      .on('mouseout', mouseOut)
      .transition(transition).ease(ease).duration(duration)
      .attr('cy', (d) => {
        return yScale(d[y_select_val])
      })



    selection
      .exit().remove();
  }



  function xChange(data) {
    let x_select_val = x_select.select(".filter-option-inner-inner").node().textContent

    body.select('.xAxis').select('.axislabel').text(x_select_val)


    xScale.domain([
      d3.min([
        0, d3.min(data, (d) => {
          return d[x_select_val]
        })]),
      d3.max([0, d3.max(data, (d) => { return d[x_select_val] * 1.2 })])
    ])

    
    niceTicks(xScale, xAxis)


    body.select('.xAxis')
      .transition(transition).duration(duration)
      .call(xAxis)


    let selection = body.select(".plot_data").selectAll('circle').data(data)

    selection
      .transition(transition).ease(ease).duration(duration)
      .attr('cx', (d) => { return xScale(d[x_select_val]) })

    selection
      .enter()
      .append('circle')
      .attr('r', 2)
      .on('mouseover', mouseOver)
      .on('mouseout', mouseOut)
      .transition(transition).ease(ease).duration(duration)
      .attr('cx', (d) => {
        return xScale(d[x_select_val])
      })

    selection
      .exit().remove();
  }



  function legendChange(data) {
    let z_select_val = z_select.select(".filter-option-inner-inner").node().textContent
    let selectedcolor = clr_select.select(".filter-option-inner-inner").node().textContent
    body.select('.clrAxis').select('.axislabel').text(z_select_val)

    clrScale
      .domain([
        d3.min([
          0, d3.min(data, (d) => {
            return d[z_select_val]
          })]),
        d3.max([0, d3.max(data, (d) => { return d[z_select_val] })])
      ])

    if (clrScale.domain()[1] > 1000000) {
      clrAxis.scale(clrScale)
        .tickFormat(d3.formatPrefix(".1", 1e6));

    }
    else {
      clrAxis.scale(clrScale)
        .tickFormat(d3.format(",.2r"));
    }


    clrAxis.scale(clrScale)
    body.select('.clrAxis')
      .transition(transition).duration(duration)
      .call(clrAxis)




    function fill_color(value, selectedcolor) {
      let colorfunc = colorscales[selectedcolor]
      return colorfunc(clrScale(value))
    }
    let legend = svg.select('g').select('defs')

    let stops = legend.selectAll('stop')

    let stop_0_color = fill_color(clrScale.invert(1), selectedcolor)
    let stop_33_color = fill_color(clrScale.invert(.66), selectedcolor)
    let stop_66_color = fill_color(clrScale.invert(0.33), selectedcolor)
    let stop_100_color = fill_color(clrScale.invert(0), selectedcolor)


    legend.select(".stop0")
      .transition(transition).duration(duration)
      .attr("stop-color", stop_0_color)


    legend.select(".stop33")
      .transition(transition).duration(duration)
      .attr("stop-color", stop_33_color)


    legend.select(".stop66")
      .transition(transition).duration(duration)
      .attr("stop-color", stop_66_color)

    legend.select(".stop100")
      .transition(transition).duration(duration)
      .attr("stop-color", stop_100_color)


  }



  function clrChange() {
    body.select('.clrAxis').style('display', 'inline-block')

    let z_select_val = z_select.select(".filter-option-inner-inner").node().textContent
    let selectedcolor = clr_select.select(".filter-option-inner-inner").node().textContent

    let clrScale = d3.scaleLinear().nice()
      .domain([
        d3.min([
          0, d3.min(data, (d) => {
            return d[z_select_val]
          })]),
        d3.max([0, d3.max(data, (d) => { return d[z_select_val] })])
      ])


    function fill_color(value, selectedcolor) {
      let colorfunc = colorscales[selectedcolor]
      return colorfunc(clrScale(value))
    }

    let selection = body.select(".plot_data").selectAll('circle')
      .data(data)

    selection
      .transition(transition).duration(duration)
      .attr('fill', (d) => { return fill_color(d[z_select_val], selectedcolor) })

    selection
      .enter()
      .append('circle')
      .attr('r', 2)
      .transition(transition).duration(duration)
      .attr('color', (d) => { return clrScale(d[z_select_val]) })
    selection
      .exit().remove();

  }
  
  function mouseOver(d) {

    d3.select(this)
    .transition(transition).duration(duration)
    .attr('r', 5)
    .attr('z-index', 9999)
    .attr('stroke', 'gray')

    let y_select_val = y_select.select(".filter-option-inner-inner").node().textContent
    let x_select_val = x_select.select(".filter-option-inner-inner").node().textContent
    let z_select_val = z_select.select(".filter-option-inner-inner").node().textContent

    let x_val = d[x_select_val]
    let y_val = d[y_select_val]
    let z_val = d[z_select_val]

    let hover = body.select('.scatter-hover')

    hover
    .attr('position', 'absolute')
    .attr('left', margin.left )
    .attr('top', margin.top )
      .html(() => {
        return x_select_val +
          ': ' +
          numFormat(x_val) +
          '<br />' +
          y_select_val +
          ': ' +
          numFormat(y_val) +
          '<br />' +
          z_select_val +
          ': ' + numFormat(z_val) +
          '<br />' +
          'Time: ' +
          timeFormat(d['Time'])
      })
      .transition(100).duration(100)
      .style('opacity', 1.0)

  }


function mouseOut(d) {
  let hover = body.select('.scatter-hover')
  hover.style('opacity', 0)
  d3.select(this)
  .attr('r', 2)
  .attr('stroke', 'none')  
}



  function brushended() {
    let y_select_val = y_select.select(".filter-option-inner-inner").node().textContent
    let x_select_val = x_select.select(".filter-option-inner-inner").node().textContent

    let s = d3.event.selection;
    if (!s) {
      if (!idleTimeout) return idleTimeout = setTimeout(idled, idleDelay);
      xScale.domain(d3.extent(data, (d) => { return d[x_select_val]; })).nice();
      yScale.domain(d3.extent(data, (d) => { return d[y_select_val]; })).nice();
    } else {
      xScale.domain([s[0][0], s[1][0]].map(xScale.invert, xScale));
      yScale.domain([s[1][1], s[0][1]].map(yScale.invert, yScale));
      scatter.select(".brush").call(brush.move, null);
    }
    zoom();
  }

  function idled() {
    idleTimeout = null;
  }

  function zoom() {
    let y_select_val = y_select.select(".filter-option-inner-inner").node().textContent
    let x_select_val = x_select.select(".filter-option-inner-inner").node().textContent

    let t = svg.transition().duration(0);
    svg.select(".xAxis").transition(t).call(xAxis);
    svg.select(".yAxis").transition(t).call(yAxis);
    svg.selectAll("circle").transition(t)
      .attr("cx", (d) => {
        return xScale(d[x_select_val]);
      })

      .attr("cy", (d) => {
        return yScale(d[y_select_val]);
      });
  }
}






