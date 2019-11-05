



function createSummary(container, data) {
  let monthly = monthlySummary(data)
  let annual = annualSummary(data)

  let body = container.append('div').attr('class', 'table-container')

  body.append('h4').text('Annual Summary').attr('class', 'table-title')

  let summ_table = body.append('table')
  let annual_header = summ_table.append('tr').attr('class', 'header-row')
  annual_header.append('th').text('Simulation')
  annual_header.append('th').text('Annual Consumption (kWh)')
  annual_header.append('th').text('Peak Demand (kW)')
  annual_header.append('th').text('Time of Peak Demand')
  annual_header.append('th').text('Annual Consumption Cost ($)')
  annual_header.append('th').text('Annual Demand Cost ($)')
  annual_header.append('th').text('Annual Total Cost ($)')
  for (let run in annual) {
    let row = summ_table.append('tr')
    row.append('th').text(annual[run]['name'].replace("_", " "))
    row.append('td').text(d3.format("(,.0f")(annual[run]['consumption_kwh']))
    row.append('td').text(d3.format("(,.0f")(annual[run]['demand_peak']))
    row.append('td').text(d3.timeFormat("%b %d %H:%M %p")(annual[run]['demand_time']))
    row.append('td').text(d3.format("($,.0f")(annual[run]['consumption_charge']))
    row.append('td').text(d3.format("($,.0f")(annual[run]['demand_charge']))
    row.append('th').text(d3.format("($,.0f")(annual[run]['total_charge']))
  }



  body.append('h4').text('Monthly Summaries').attr('class', 'table-title')
  let month_table = body.append('table')
  for (let table in monthly) {

    let month_header = month_table.append('tr').attr('class', 'header-row')

    month_header.append('th').text(monthly[table]['1']['name'])
    month_header.append('th').text('Monthly Consumption (kWh)')
    month_header.append('th').text('Peak Demand (kW)')
    month_header.append('th').text('Time of Peak Demand')
    month_header.append('th').text('Monthly Consumption Cost ($)')
    month_header.append('th').text('Monthly Demand Cost ($)')
    month_header.append('th').text('Monthly Total Cost ($)')


    for (let month in monthly[table]) {
      let row = month_table.append('tr')
      row.append('td').text(d3.timeFormat("%b")(monthly[table][month]['demand_time']))
      row.append('td').text(d3.format("(,.0f")(monthly[table][month]['consumption_kwh']))
      row.append('td').text(d3.format("(,.0f")(monthly[table][month]['demand_peak']))
      row.append('td').text(d3.timeFormat("%b %d %H:%M")(monthly[table][month]['demand_time']))
      row.append('td').text(d3.format("($,.0f")(monthly[table][month]['consumption_charge']))
      row.append('td').text(d3.format("($,.0f")(monthly[table][month]['demand_charge']))
      row.append('th').text(d3.format("($,.0f")(monthly[table][month]['demand_charge'] + monthly[table][month]['consumption_charge']))

    }

    month_table.append('tr').attr('class', 'blank-row').append('td').attr('class', 'blank-cell').text('')

  }





}




