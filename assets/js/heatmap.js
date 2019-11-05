


 
function createHeatmap(container, data) {

  let duration = 0;
  let transition = 0;
  let ease = d3.easeLinear


  let body = container
  body.append('svg').attr('class', 'plot')



  let selectcontainer = body.append('div').attr('class', 'select-container')

  addSelect(selectcontainer, 'heatmap-select', data, multiple = false, placeholder = 'Select Variable')
  addColorSelect(selectcontainer, colorscales)

  let hover = body.append('div').attr('class', 'hover-container').append('p')
    .attr('class', 'hover-text')
    .style('opacity', 0)

  let select = container.select('.heatmap-select')
  let clr_select = container.select('.color-select')

  let margin = { top: 50, right: 250, bottom: 100, left: 100 },
    canvas_width = 1000,
    canvas_height = 600,
    plot_width = canvas_width - margin.right - margin.left,
    plot_height = canvas_height - margin.top - margin.bottom,
    rectwidth = plot_width / 365,
    rectheight = plot_height / 24;

  let svg = body.select('svg')
    .attr('height', plot_height + margin.top + margin.bottom)
    .attr('width', plot_width + margin.left + margin.right)
    .attr("transform", translate(margin.left, margin.top))

  let xScale = d3.scaleLinear().nice()
    .range([0, plot_width])
    .domain([0, 365])

  let yScale = d3.scaleLinear().nice()
    .range([plot_height, 0])
    .domain([0, 24])

  let xAxis = d3.axisBottom()
    .scale(xScale)

  let yAxis = d3.axisLeft()
    .scale(yScale)


    
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
    .attr("id", "gradient")
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
    .style("fill", "url(#gradient)")
    .attr("transform", translate(1, 0))
    .style('display', 'none')




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
    .text("Day of Year");

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
    .text("Hour of Day");


  let heatmap = svg.append('g')
    .attr('class', 'plot_data')
    .attr("transform", translate(margin.left, margin.top))
    .attr("clip-path", "url(#clip)");




  heatmap.append("g")
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
  select
    .on('change', () => {
      seriesChange(data)
      legendChange(data)
      updateTitle()

    })

  clr_select
    .on('change', () => {
      seriesChange(data)
      legendChange(data)
    })





  function updateTitle() {

    let select_val = select.select(".filter-option-inner-inner").node().textContent

    if (select_val != 'Select Variable') {
      text = select_val + " Annual Heatmap"
      let title = body.select('.title').text(text)
    }
  }




function seriesChange(data) {
  
  let select_val = select.select(".filter-option-inner-inner").node().textContent
  let clrScale = d3.scaleLinear().nice()
    .domain([
      d3.min([
        0, d3.min(data, (d) => {
          return d[select_val]
        })]),
      d3.max([0, d3.max(data, (d) => { return d[select_val] })])
    ])
  let selection = body.select(".plot_data").selectAll('.hour_rect').data(data)
  let selectedcolor = clr_select.select(".filter-option-inner-inner").node().textContent

  let lasthour = ''
  let dstcheck = true

  selection
      .data(data)
        .attr("x", (d) => { 
          return (+d3.timeFormat("%j")(d.Time)) * rectwidth })

        .attr("y", (d) => { 
          let timestr = d.Time.toString()
          hoursplit = timestr.replace("2020","2019").split(" GMT")[0].split("2019 ")[1].split(":")[0]
          if (lasthour == hoursplit ) { 
              hoursplit = hoursplit - 1
          dstcheck = false}
          else {lasthour = hoursplit}
          return hoursplit * rectheight })

        .attr("width", rectwidth)
        .attr("height", rectheight)
        .attr('data-time', (d) => {return d.Time})
        .style("fill", (d) => { 
          let colorfunc = colorscales[selectedcolor]
          return colorfunc(clrScale(d[select_val]))
        })

      .enter()
      .append('rect')
      .attr("x", (d) => { 
        return (+d3.timeFormat("%j")(d.Time)) * rectwidth })

      .attr("y", (d) => { 
        let timestr = d.Time.toString()
        hoursplit = timestr.replace("2020","2019").split(" GMT")[0].split("2019 ")[1].split(":")[0]
        if (lasthour == hoursplit ) { 
            hoursplit = hoursplit - 1
        dstcheck = false}
        else {lasthour = hoursplit}
        return hoursplit * rectheight })
        
        .attr("width", rectwidth)
        .attr("height", rectheight)
        .attr('class', 'hour_rect')
        .style("fill", (d) => { 
          let colorfunc = colorscales[selectedcolor]
          return colorfunc(clrScale(d[select_val]))
        })
        .on('mouseover', (d) => {
          mouseOver(d)
        })

      .exit()
      .remove()

  selection
    .exit().remove();
}





function legendChange(data) {
  
  let z_select_val = select.select(".filter-option-inner-inner").node().textContent

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



    
  niceTicks(clrScale, clrAxis)

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


  
    body.select('.clrAxis').select('rect').style('display', 'inline-block')
}



function mouseOver(d) {

  let select_val = select.select(".filter-option-inner-inner").node().textContent
  let val = d[select_val]
  let hover_container = body.select('.hover-container')
  hover_container
  .attr('position', 'absolute')
  .attr('left', margin.left )
  .attr('top', margin.top )

  let hover = body.select('.hover-text')

  hover
    .html(() => {
      return select_val +
        ': ' +
        numFormat(val) +
        '<br />' +
        'Time: ' +
        timeFormat(d['Time'])
    })
    .transition(100).duration(100)
    .style('opacity', 1)

}

function brushended() {
  let select_val = select.select(".filter-option-inner-inner").node().textContent

  let s = d3.event.selection;
  if (!s) {
    if (!idleTimeout) return idleTimeout = setTimeout(idled, idleDelay);
    xScale.domain(d3.extent(data, (d) => { return d[x_select_val]; })).nice();
    yScale.domain(d3.extent(data, (d) => { return d[y_select_val]; })).nice();
  } else {
    xScale.domain([s[0][0], s[1][0]].map(xScale.invert, xScale));
    yScale.domain([s[1][1], s[0][1]].map(yScale.invert, yScale));
    heatmap.select(".brush").call(brush.move, null);
  }
  zoom();
}

function idled() {
  idleTimeout = null;
}

function zoom() {
  let select_val = y_select.select(".filter-option-inner-inner").node().textContent

  let t = svg.transition().duration(750);
  svg.select(".xAxis").transition(t).call(xAxis);
  svg.select(".yAxis").transition(t).call(yAxis);
  svg.selectAll("circle").transition(t)
    .attr("color", (d) => {
      return clrScale(d[select_val]);
    })
}
}


