
function createHistogram(container, data) {

  let duration = 250;
  let transition = 250;
  let ease = d3.easeLinear

  let body = container
  body.append('svg').attr('class', 'plot')


  let margin = { top: 50, right: 750, bottom: 100, left: 100 },
    canvas_width = 1500,
    canvas_height = 600,
    plot_width = canvas_width - margin.right - margin.left,
    plot_height = canvas_height - margin.top - margin.bottom


  let svg = body.select('svg')
    .attr('height', plot_height + margin.top + margin.bottom)
    .attr('width', plot_width + margin.left + margin.right)
    .attr("transform", translate(margin.left, margin.top))

  let xScale = d3.scaleLinear()
    .range([0, plot_width])


  let yScale = d3.scaleLinear()
    .range([plot_height, 0])


  let xAxis = d3.axisBottom(xScale)

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
    .text("Value");



  let yAxis = d3.axisLeft(yScale)

  niceTicks(xScale, xAxis)
  niceTicks(yScale, yAxis)


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
    .text("Count");




  svg.append('text')
    .attr('class', 'title')
    .attr('font-size', '16px')
    .attr('fill', 'black')
    .attr("transform", translate(margin.left + (plot_width / 2), margin.top * .8))
    .style("text-anchor", "middle")
    .text("")


  let legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", translate(plot_width + margin.left + 25, margin.top))


  svg.append('g')
    .attr('class', 'main_plot')
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")



  let binrange = body.append('div').attr('class', 'slidecontainer')
  binrange.append('div').text('Bin Size')



  let binslider = binrange.append('input')
    .attr('type', 'range')
    .attr('min', 1)
    .attr('max', 25)
    .attr('value', 10)
    .attr('class', 'slider')
    .attr('id', 'binrange')
    .on('input', () => {
      let selected = select.selectAll('li .selected').selectAll('.text').nodes()
      let array = []
      for (let idx in selected) {
        let sel = selected[idx]
        array.push(sel.innerHTML)
      }
      updateHist(array)
      updateHist
    })


  // add select and caller

  let select_container = container.append('div').attr('class', 'select-top-container')
  // select_container.append('div').text('Select Series')
  addMultiSelect(select_container, 'histogram-select', data, multiple = true, placeholder = 'Select Variables')
  let threshcontainer = body.append('div').attr('class', 'threshcontainer')

  threshcontainer.append('input').attr('class', 'lowbound').attr('placeholder', 'lower boundary (optional)')
    .on('input', () => {
      let selected = select.selectAll('li .selected').selectAll('.text').nodes()
      let array = []
      for (let idx in selected) {
        let sel = selected[idx]
        array.push(sel.innerHTML)
      }
      updateHist(array)
      updateHist
    })


  threshcontainer.append('input').attr('class', 'highbound').attr('placeholder', 'upper boundary (optional)')
    .on('input', () => {
      let selected = select.selectAll('li .selected').selectAll('.text').nodes()
      let array = []
      for (let idx in selected) {
        let sel = selected[idx]
        array.push(sel.innerHTML)
      }
      updateHist(array)
      updateHist
    })




  body.append('div')
    .attr('class', 'hist-hover hover-container')
    .attr('opacity', 0)
    .append('p')

  let select = body.select('.histogram-select')
  select.node().addEventListener('change', (e) => {
    let selected = select.selectAll('li .selected').selectAll('.text').nodes()
    let array = []
    for (let idx in selected) {
      let sel = selected[idx]
      array.push(sel.innerHTML)
    }
    updateHist(array)
  })




  function updateHist(array) {

    body.select('.main_plot').selectAll('rect').remove()
    let opacityscale = d3.scaleLinear().range([1, -1]).domain([1, 10])
    let colors = d3.schemeCategory10;
    let lowbound = body.select('.lowbound').node().value
    let highbound = body.select('.highbound').node().value
    let { min, max } = MaxMinMulti(data, array, lowbound, highbound)


    let binwidth = d3.select('#binrange').node().value

    legend.selectAll('rect').remove()
    legend.selectAll('text').remove()

    xScale
      .domain([min, max])
    niceTicks(xScale, xAxis)

    xAxis_container
      .call(xAxis.ticks(d3.max([binwidth, 10])));

    let binarray = []
    let binmax = 0
    for (let idx in array) {
      let series = array[idx]
      let row = data[idx]
      let histogram = d3.histogram()
        .value((d) => { return d[series] })
        .domain(xScale.domain())
        .thresholds(xScale.ticks(binwidth));
      let bins = histogram(data)
      let max = d3.max(bins, (b) => { return b.length })
      if (max > binmax) { binmax = max }
      binarray.push(bins)
    }

    yScale.domain([0, binmax]);

    yAxis_container
      .call(yScale);

    for (let idx in binarray) {
      let bins = binarray[idx]
      let series = array[idx].replace(/[^a-zA-Z ]/g, "_")


      let rects = body.select(".main_plot").selectAll(".rect_plot_" + series)
        .data(bins)

      rects
        .exit().remove()
      rects
        .enter()
        .append("rect")
        .attr('class', "rect_plot_" + series)
        .merge(rects)
        .attr("x", 1)
        .style('opacity', () => {
          return d3.max([opacityscale(binarray.length), .5])
        })
        .style('fill', colors[idx])
        .attr('data-fill-unselected', colors[idx])
        .attr('data-series', array[idx])
        .attr("transform", (d) => { return "translate(" + xScale(d.x0) + "," + yScale(d.length) + ")"; })
        .attr("width", (d) => { return Math.abs(xScale(d.x1) - xScale(d.x0)) * .95 })
        .attr("height", (d) => { return plot_height - yScale(d.length); })
        .on("mouseover", mouseOver)
        .on('mouseout', mouseOut)


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
        .style('opacity', () => {
          return d3.max([opacityscale(binarray.length), .5])
        })

      legend_elements
        .append('text')
        .attr('class', 'legend-text')
        .attr('y', idx * legend_spacing + rect_size * 0.7)
        .attr('x', rect_size + 5)
        .text(array[idx])
    }
  }


  function mouseOver(d, i) {

    let min = d.x0
    let max = d.x1
    let count = d.length
    let series = this.getAttribute('data-series')

    let color = this.getAttribute('data-fill-unselected')
    let darker = d3.color(color).darker(1.0)
    d3.select(this)
      .style('fill', darker)


    let hover = body.select('.hist-hover')

    hover
      .attr('position', 'absolute')
      .attr('left', margin.left)
      .attr('top', margin.top)
      .html(() => {
        return series + ": " + '<br />' +
          'Range: ' + min + "-" + max +
          '<br />' +
          'Count: ' + count

      })
      .transition(100).duration(100)
      .style('opacity', 1)


  }

  function mouseOut(d, i) {
    d3.select(this)
      .style('fill', this.getAttribute('data-fill-unselected'))
    let hover = body.select('.hist-hover')
    hover.style('opacity', 0)
  }

}



