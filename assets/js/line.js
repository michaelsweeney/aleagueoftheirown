
function createLine(container, data) {

  let duration = 250;
  let transition = 250;
  let ease = d3.easeLinear

  let body = container
  body.append('svg').attr('class', 'plot')


  let canvas_width = 1250,
    canvas_height = 650,
    margin = { top: 50, right: 250, bottom: 125, left: 100 },
    brush_margin = { top: canvas_height - 75, right: 250, bottom: 30, left: 100 },
    plot_width = canvas_width - margin.right - margin.left,
    plot_height = canvas_height - margin.top - margin.bottom,
    brush_height = canvas_height - brush_margin.top - brush_margin.bottom;


  let svg = body.select('svg')
    .attr('height', plot_height + margin.top + margin.bottom)
    .attr('width', plot_width + margin.left + margin.right)
    .attr("transform", translate(margin.left, margin.top))


  let xScale = d3.scaleTime()
    .range([0, plot_width])
    .domain([new Date('1/1/2019 1:00'), new Date('1/1/2020 0:00')])



  let yScale = d3.scaleLinear()
    .range([plot_height, 0])


  let xAxis = d3.axisBottom(xScale)
  let yAxis = d3.axisLeft(yScale)


  let xAxis_container = svg.append('g')
    .attr('id', 'xaxis')
    .attr('class', 'xaxis')
    .attr("transform", "translate(" + margin.left + "," + (margin.top + plot_height) + ")")
    .call(xAxis)

  xAxis_container
    .append('text')
    .attr('class', 'axislabel')
    .attr('fill', 'black')
    .attr('font-size', '12px')
    .attr("transform", translate(plot_width / 2, 40))
    .style("text-anchor", "middle")
    .text("Date/Time");




  let yAxis_container = svg.append('g')
    .attr('id', 'yaxis')
    .attr('class', 'yaxis')
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .call(yAxis)

  yAxis_container
    .append("text")
    .attr('class', 'axislabel')
    .attr('font-size', '12px')
    .attr('fill', 'black')
    .attr("transform", "rotate(-90) " + translate(-plot_height / 2, -50))
    .style("text-anchor", "middle")
    .text("");

  let line = d3.line()
    .x((d) => { return xScale(d.x); })
    .y((d) => { return yScale(d.y); })

  let brush_line = d3.line()
    .x((d) => { return xScale_brush(d.x); })
    .y((d) => { return yScale_brush(d.y); })

  let brush = d3.brushX()
    .extent([[0, 0], [plot_width, brush_height]])
    .on("brush end", brushed)

  let zoom = d3.zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([[0, 0], [plot_width, plot_height]])
    .extent([[0, 0], [plot_width, plot_height]])
    .on("zoom", zoomed);

  let xScale_brush = d3.scaleTime()
    .range([0, plot_width])
    .domain([new Date('1/1/2019 1:00'), new Date('1/1/2020 0:00')])

  let yScale_brush = d3.scaleLinear()
    .range([brush_height, 0])

  let xAxis_brush = svg.append('g')
    .attr('id', 'xaxis_brush')
    .attr('class', 'xaxis_brush')
    .attr("transform", "translate(" + brush_margin.left + "," + (brush_margin.top + brush_height) + ")")
    .call(d3.axisBottom(xScale_brush))


  let yAxis_brush = svg.append('g')
    .attr('id', 'yaxis_brush')
    .attr('class', 'yaxis_brush')
    .attr("transform", "translate(" + brush_margin.left + "," + brush_margin.top + ")")
    .style('display', 'none')
    .call(d3.axisLeft(yScale_brush).ticks(0))

  let clip = svg.append('defs').append('svg:clipPath')
    .attr('id', 'line-clip')
    .append('svg:rect')
    .attr('width', plot_width)
    .attr('height', plot_height)
    .attr('x', 0)
    .attr('y', 0)


  niceTicks(yScale, yAxis)



  svg.append('text')
    .attr('class', 'title')
    .attr('font-size', '16px')
    .attr('fill', 'black')
    .attr("transform", translate(margin.left + (plot_width / 2), margin.top * .8))
    .style("text-anchor", "middle")
    .text("")

  svg.append('div')
    .attr('class', 'line-hover')
    .attr('opacity', 0)

  let main_plot = svg.append('g')
    .attr('class', 'main_plot')
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr("clip-path", "url(#line-clip")

  let brush_plot = svg.append('g')
    .attr('class', 'brush_plot')
    .attr("transform", "translate(" + brush_margin.left + "," + brush_margin.top + ")")

  brush_plot
    .append("g")
    .attr("class", "brush")
    .call(brush)
    .call(brush.move, xScale.range());

  main_plot
    .append("rect")
    .attr("class", "zoom")
    .attr("width", plot_width)
    .attr("height", plot_height)
    .call(zoom);



  let legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", translate(plot_width + margin.left + 25, margin.top))




  // add select and caller
  addMultiSelect(container, 'line-select', data, multiple = true, placeholder = 'Select letiables')
  let select = body.select('.line-select')
  select.node().addEventListener('change', (e) => {
    let selected = select.selectAll('li .selected').selectAll('.text').nodes()
    let array = []
    for (let idx in selected) {
      let sel = selected[idx]
      array.push(sel.innerHTML)
    }
    updateLine(array)
  })




  function updateLine(array) {

    body.select('.main_plot').selectAll('path').remove()
    body.select('.brush_plot').selectAll('path').remove()

    let colors = d3.schemeCategory10;
    let { min, max } = MaxMinMulti(data, array)

    yScale.domain([min, max]);

    niceTicks(yScale, yAxis)


    yScale_brush.domain([min, max]);

    yAxis_container
      .call(yAxis);
    yAxis_brush
      .call(d3.axisLeft(yScale_brush));
    legend.selectAll('rect').remove()
    legend.selectAll('text').remove()
    for (let idx in array) {
      let series = array[idx]
      let seriesarray = []
      for (let i = 0; i < data.length; i++) {
        let row = data[i]
        let x = row.Time
        let y = row[series]
        seriesarray.push({ x: x, y: y })
      }

      let paths = body.select(".main_plot")

      paths.append('path')
        .attr('class', 'line ' + 'line-' + idx)
        .attr('d', line(seriesarray))
        .style('stroke', colors[idx])
        .style('stroke-width', 1)
        .style('border', 'none')
        .style('fill', 'none')
        .style('pointer-events', 'none')


      let brush_paths = body.select(".brush_plot")

      brush_paths.append('path')
        .attr('class', 'brush_line')
        .attr('d', brush_line(seriesarray))
        .style('stroke', colors[idx])
        .style('stroke-width', 1)
        .style('opacity', 0.5)
        .style('border', 'none')
        .style('fill', 'none')
        .style('pointer-events', 'none')


      let legend_spacing = 25
      let rect_size = 20
      let legend_elements = body.select(".legend")

      legend_elements
        .append('text')
        .text('Legend')
        .attr('class', 'legend-title')
        .attr('y', -20)


      legend_elements
        .append('rect')
        .attr('width', rect_size)
        .attr('height', rect_size)
        .attr('y', idx * legend_spacing)
        .style('fill', colors[idx])

      legend_elements
        .append('text')
        .attr('class', 'legend-text')
        .attr('y', idx * legend_spacing + rect_size * 0.7)
        .attr('x', rect_size + 5)
        .text(array[idx])



    }
  }



  function brushed() {
    let select = body.select('.line-select')
    let selected = select.selectAll('li .selected').selectAll('.text').nodes()
    let array = []
    for (let idx in selected) {
      let sel = selected[idx]
      array.push(sel.innerHTML)
    }

    for (let idx in array) {
      let series = array[idx]
      let seriesarray = []
      for (let i = 0; i < data.length; i++) {
        let row = data[i]
        let x = row.Time
        let y = row[series]
        seriesarray.push({ x: x, y: y })
      }

      if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
      let s = d3.event.selection || xScale_brush.range();
      xScale.domain(s.map(xScale_brush.invert, xScale_brush));

      main_plot.select(".line-" + idx).attr("d", line(seriesarray));

      svg.select(".xaxis").call(xAxis)
      svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
        .scale(plot_width / (s[1] - s[0]))
        .translate(-s[0], 0));
    }
  }
  function zoomed() {

    let select = body.select('.line-select')
    let selected = select.selectAll('li .selected').selectAll('.text').nodes()

    array = []
    for (let idx in selected) {
      let sel = selected[idx]
      array.push(sel.innerHTML)
    }

    for (let idx in array) {
      let series = array[idx]
      let seriesarray = []

      for (let i = 0; i < data.length; i++) {
        let row = data[i]
        let x = row.Time
        let y = row[series]
        seriesarray.push({ x: x, y: y })
      }

      if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
      let t = d3.event.transform;
      xScale.domain(t.rescaleX(xScale_brush).domain());
      main_plot.select(".line-" + idx).attr("d", line(seriesarray));
      svg.select(".xaxis").call(xAxis)
      brush_plot.select(".brush").call(brush.move, xScale.range().map(t.invertX, t));
    }
  }

}





