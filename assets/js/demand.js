
let demandrates = {
  summ_wkdy_eight_to_six: 40.13,
  summ_wkdy_seven_to_ten: 31.9,
  summ_all: 16.51,
  wint_wkdy_eight_to_ten: 16.65,
  wint_all: 5.3,
}

per_kwh = .172


function pivotRows(data) {

  for (let i = 0; i < data.length; i++) {
    let row = data[i]
    let time = row.Time
    let month = d3.timeFormat('%m')(time)
    let weekday = d3.timeFormat('%u')(time)
    let hour = d3.timeFormat('%H')(time)

    row.summ_wkdy_eight_to_six = 0
    row.summ_wkdy_seven_to_ten = 0
    row.summ_all = 0
    row.wint_wkdy_eight_to_ten = 0
    row.wint_all = 0

    if (month >= 06 && month <= 09) {
      row.summ_all = 1
      if (weekday < 6) {

        if (hour >= 8 && hour < 18) {
          row.summ_wkdy_eight_to_six = 1
        }
        if (hour >= 7 && hour < 22) {
          row.summ_wkdy_seven_to_ten = 1
        }
      }
    }

    else {
      row.wint_all = 1
      if (weekday < 6) {
        if (hour >= 8 && hour < 18) {
          row.wint_wkdy_eight_to_ten = 1
        }
      }
    }
  }





  let runs = {

    Opt_1x_750_2x_1250: { colname: 'Opt 1x750 2x1250 Total Plant kW' },
    Opt_3x1000: { colname: 'Opt 3x1000 Total Plant kW' },
    Opt_3x1000_Mag: { colname: 'Opt 3x1000 Mag Total Plant kW' },
    Opt_Ice_Storage: { colname: 'Opt Ice Total Plant kW' },

  }


  for (let i = 0; i < Object.keys(runs).length; i++) {
    let keys = Object.keys(runs)
    let key = runs[keys[i]]
    key.months = {}

    for (let i = 1; i <= 12; i++) {
      key.months[i] = {
        summ_wkdy_eight_to_six: [],
        summ_wkdy_seven_to_ten: [],
        summ_all: [],
        wint_wkdy_eight_to_ten: [],
        wint_all: [],
      }
    }
    for (let i = 0; i < data.length; i++) {
      let row = data[i]
      let time = row.Time
      let month = stripzero(d3.timeFormat('%m')(row.Time))
      let val = row[[key.colname]]

      if (row.summ_wkdy_eight_to_six == 1) {
        key.months[month].summ_wkdy_eight_to_six.push({ val: val, time: time })
      }
      if (row.summ_wkdy_seven_to_ten == 1) {
        key.months[month].summ_wkdy_seven_to_ten.push({ val: val, time: time })
      }
      if (row.summ_all == 1) {
        key.months[month].summ_all.push({ val: val, time: time })
      }
      if (row.wint_wkdy_eight_to_ten == 1) {
        key.months[month].wint_wkdy_eight_to_ten.push({ val: val, time: time })
      }
      if (row.wint_all == 1) {
        key.months[month].wint_all.push({ val: val, time: time })
      }
    }
  }
  return runs
}



function tableFull(data) {
  let pivot = pivotRows(data)
  let demand_container = {}

  let runs = Object.keys(pivot)
  let months = Object.keys(pivot[runs[0]].months)
  let periods = Object.keys(demandrates)


  for (let r = 0; r < runs.length; r++) {
    let run = runs[r]
    demand_container[run] = {}

    for (let m = 0; m < months.length; m++) {
      let month = months[m]

      demand_container[run][month] = {}

      for (let p = 0; p < periods.length; p++) {

        let period = periods[p]

        let parray = pivot[run].months[month][period]
        demand_container[run][month][period] = { demand: {}, wint_consumption: 0, summ_consumption: 0 }

        let summ_consumption = 0;
        let wint_consumption = 0;

        if (period == 'summ_all') {
          let summ_consumption = 0
          for (let t = 0; t < parray.length; t++) {
            let val = parray[t].val
            summ_consumption = summ_consumption + val
          }
          demand_container[run][month][period].summ_consumption = summ_consumption
        }

        if (period == 'wint_all') {
          let wint_consumption = 0
          for (let t = 0; t < parray.length; t++) {
            let val = parray[t].val
            wint_consumption = wint_consumption + val
          }
          demand_container[run][month][period].wint_consumption = wint_consumption
        }

        let pmax = { val: 0, time: 0 }
        for (let t = 0; t < parray.length; t++) {
          let val = parray[t].val
          let time = parray[t].time

          if (pmax.val < val) {
            pmax = { val: val, time: time }
          }
        }
        let charge = demandrates[period] * pmax.val
        demand_container[run][month][period].demand = { val: pmax.val, time: pmax.time, charge: charge }
      }
    }
  }
  return demand_container

}



function monthlySummary(data) {
  let table_full = tableFull(data)
  let cost_per_kwh = 0.172
  let runs = Object.keys(table_full)
  let months = Object.keys(table_full[Object.keys(table_full)[0]])

  let table_summary = {}

  for (let i = 0; i < runs.length; i++) {
    let run = runs[i]

    table_summary[run] = {}

    for (let m = 0; m < months.length; m++) {
      let month = months[m]

      table_summary[run][month] = {}

      let demand_peak_kw = 0;
      let demand_peak_time = ''
      let demand_charge = 0;
      let consumption_kwh = 0;

      let summ_consumption = 0;
      let wint_consumption = 0;

      for (let p = 0; p < Object.keys(demandrates).length; p++) {
        let period = Object.keys(demandrates)[p]
        let vals = table_full[run][month][period]

        consumption_kwh = vals.summ_consumption + vals.wint_consumption

        if (vals.summ_consumption != 0) {
          summ_consumption = vals.summ_consumption
        }
        wint_consumption = vals.wint_consumption


        if (demand_peak_kw < vals.demand.val) {
          demand_peak_kw = vals.demand.val;
          demand_peak_time = vals.demand.time
        }
        demand_charge = demand_charge + vals.demand.charge
      }
      table_summary[run][month].name = run.replace(/_/g, ' '), 
      table_summary[run][month].demand_charge = demand_charge
      table_summary[run][month].demand_peak = demand_peak_kw
      table_summary[run][month].demand_time = demand_peak_time
      table_summary[run][month].summ_consumption = summ_consumption
      table_summary[run][month].wint_consumption = wint_consumption
      table_summary[run][month].consumption_kwh = table_summary[run][month].wint_consumption + table_summary[run][month].summ_consumption
      table_summary[run][month].consumption_charge = table_summary[run][month].consumption_kwh * cost_per_kwh

      delete table_summary[run][month].summ_consumption
      delete table_summary[run][month].wint_consumption

    }
  }

  return table_summary
}




function annualSummary(data) {

  let monthly = monthlySummary(data)

  let annual = {}
  for (let i in monthly) {
    let key = i
    let vals = monthly[i]

    let demand_charge = 0,
      consumption_charge = 0,
      demand_peak = 0,
      demand_time = '',
      consumption_kwh = 0

    for (let m in vals) {
      if (demand_peak < vals[m].demand_peak) {
        demand_peak = vals[m].demand_peak
        demand_time = vals[m].demand_time
      }
      consumption_charge = consumption_charge + vals[m].consumption_charge,
      demand_charge = demand_charge + vals[m].demand_charge
      consumption_kwh = consumption_kwh + vals[m].consumption_kwh

    }

    annual[key] = {
      name: key.replace(/_/g, ' '),
      demand_charge: demand_charge,
      consumption_charge: consumption_charge,
      demand_peak: demand_peak,
      demand_time: demand_time,
      total_charge: demand_charge + consumption_charge,
      consumption_kwh: consumption_kwh
    }
  }


return annual

}