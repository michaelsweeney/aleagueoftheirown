


const colorscales = {
  'BuGn': d3.interpolateBuGn,
  'BuPu': d3.interpolateBuPu,
  'Cool': d3.interpolateCool,
  'CubehelixDefault': d3.interpolateCubehelixDefault,
  'GnBu': d3.interpolateGnBu,
  'Inferno': d3.interpolateInferno,
  'Magma': d3.interpolateMagma,
  'OrRd': d3.interpolateOrRd,
  'Plasma': d3.interpolatePlasma,
  'PuBu': d3.interpolatePuBu,
  'PuBuGn': d3.interpolatePuBuGn,
  'RuRd': d3.interpolatePuRd,
  'RdPu': d3.interpolateRdPu,
  'Viridis': d3.interpolateViridis,
  'Warm': d3.interpolateWarm,
  'YlGn': d3.interpolateYlGn,
  'YlGnBu': d3.interpolateYlGnBu,
  'YlOrBr': d3.interpolateYlOrBr,
  'YlOrRd': d3.interpolateYlOrRd,
}




function addSelect(container, classname, data, multiple = true, placeholder = true) {
  let seldiv = container.append('div').attr('class', 'select-container ' + classname)

  seldiv.append('select')
  let select = seldiv.select('select')


  if (placeholder) { select.attr('title', placeholder) }

  select.attr('data-live-search', 'true')
  if (multiple) {
    select.attr('multiple', 'true')
  }
  select.attr('class', 'selectpicker')



  $(document).ready(() => {
    $('.selectpicker').selectpicker();
  });

  let cols = Object.keys(data[0])

  // handle bug where 'title' and 'multiple=false' causes bs-select to ignore first option
  if (!multiple) {
    cols.unshift('title')
  }

  let opts = select.selectAll('option')
    .data(cols)
    .enter()
    .append('option')
    .text((d) => {
      return d
    })
    .exit().remove()
}




function addColorSelect(container, colors) {

  let seldiv = container.append('div').attr('class', 'select-container color-select')
  seldiv.append('select')
  let select = seldiv.select('select')

  select
    .attr('class', 'selectpicker')
  select
    .attr('title', 'Viridis')


  $(document).ready(() => {
    $('.selectpicker').selectpicker({ dropupAuto: false });

  });


  let cols = Object.keys(colors)
  cols.unshift('title')
  select.selectAll('option')
    .data(cols)
    .enter()
    .append('option')
    .text((d) => { return d })
    .attr('selected', (d) => {
      if (d == 'Viridis') {
        return 'true'
      }
    })
    .exit().remove();

}





function translate(x, y) {
  return "translate(" + x + "," + y + ")"
}


// formats
// d3.format(".0%")(0.123);  // rounded percentage, "12%"
// d3.format("($.2f")(-3.5); // localized fixed-point currency, "(£3.50)"
// d3.format("+20")(42);     // space-filled and signed, "                 +42"
// d3.format(".^20")(42);    // dot-filled and centered, ".........42........."
// d3.format(".2s")(42e6);   // SI-prefix with two significant digits, "42M"
// d3.format("#x")(48879);   // prefixed lowercase hexadecimal, "0xbeef"
// d3.format(",.2r")(4223);  // grouped thousands with two significant digits, "4,200"

function numFormat(num) {
  if (Math.abs(num) >= 1e6) {
    return d3.format('.2s')(num)

  }
  if (Math.abs(num) < 1e6) {
    return d3.format(',.2r')(num)

  }
}

function timeFormat(time) {

  let format = d3.timeFormat("%b %e, %H:%M")

  return format(time)


}









function addMultiSelect(container, classname, data) {
  let seldiv = container.append('div').attr('class', 'multi-select-container select-container ' + classname)
  let selid = container.node().getAttribute('class') + '_multi_select'

  seldiv.append('select')
  let select = seldiv.select('select')
  select.attr('title', 'select variables')

  select.attr('data-live-search', 'true')
  select.attr('data-selected-text-format', "count")
  select.attr('multiple', 'true')
  select.attr('class', 'selectpicker')
  select.attr('id', selid)

  // $.fn.selectpicker.Constructor.DEFAULTS.multipleSeparator = ' \n ';

  $(document).ready(() => {
    $('.selectpicker').selectpicker();
  });

  let cols = Object.keys(data[0])

  // handle bug where 'title' and 'multiple=false' causes bs-select to ignore first option
  if (!multiple) {
    cols.unshift('title')
  }

  let opts = select.selectAll('option')
    .data(cols)
    .enter()
    .append('option')
    .text((d) => {
      return d
    })
    .exit().remove();
  seldiv.append('ul').attr('class', 'list-group')
}






function MaxMinMulti(data, array, low_thresh, high_thresh) {
  let min = 0;
  let max = 0;
  for (let row in data) {
    for (let idx in array) {
      let val = data[row][array[idx]]
      if (val < min) { min = val }
      if (val > max) { max = val }
    }
  }
  if (low_thresh && low_thresh.length > 0) {
    min = d3.max([min, low_thresh])
  }
  if (high_thresh && high_thresh.length > 0) {
    max = d3.min([max, high_thresh])
  }
  return { min: min, max: max }
}





function niceTicks(scale, axis) {
  if (scale.domain()[1] > 1000000) {
    axis.scale(scale)
      .tickFormat(d3.formatPrefix(".1", 1e6))
  }
  else {
    axis.scale(scale)
      .tickFormat(d3.format(",.2r"));
  }
}

function stripzero(int) {
  let str = int.toString()
  if (str[0] == '0') { return str[1] }
  else { return str }
}