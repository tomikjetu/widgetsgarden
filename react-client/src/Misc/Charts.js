export var ChartOptions = {
  responsive: true,
  scaleFontColor: "red",
  type: "line",
  scales: {
    x: {
      ticks: {
        color: "#eee",
      },
    },
    y: {
      beginAtZero: true,
      grace: "10",
      ticks: {
        color: "#eee",
        stepSize: 1,
      },
    },
  },
};

var Months = [
  {
    abbreviation: "Jan",
    name: "January",
  },
  {
    abbreviation: "Feb",
    name: "February",
  },
  {
    abbreviation: "Mar",
    name: "March",
  },
  {
    abbreviation: "Apr",
    name: "April",
  },
  {
    abbreviation: "May",
    name: "May",
  },
  {
    abbreviation: "Jun",
    name: "June",
  },
  {
    abbreviation: "Jul",
    name: "July",
  },
  {
    abbreviation: "Aug",
    name: "August",
  },
  {
    abbreviation: "Sep",
    name: "September",
  },
  {
    abbreviation: "Oct",
    name: "October",
  },
  {
    abbreviation: "Nov",
    name: "November",
  },
  {
    abbreviation: "Dec",
    name: "December",
  },
];

var borderWidth = 3;
var colors = ["#5171a8", "#00a000", "#ff0000", "#a051a0", "#0000ff"];

export function getChartData(data, startDate, endDate, hideZero = true, setLabels, setColors) {
  var startDate = new Date(startDate);
  var endDate = new Date(endDate);

  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  var datasets = [];
  var index = 0;

  Object.keys(data).forEach((key) => {
    let currentDate = new Date(startDate);
    var dataset = data[key];
    var DATA = [];
    var sum = 0;

    for (let i = 0; i <= diffDays; i++) {
      var day = `${Months[currentDate.getMonth()].name} ${currentDate.getDate()}`;
      var dayCode = currentDate.getFullYear() + "/" + (currentDate.getMonth() + 1) + "/" + currentDate.getDate();

      DATA.push({
        x: day,
        y: dataset[dayCode] || 0,
      });
      sum += dataset[dayCode] || 0;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (!hideZero || sum > 0) {
      datasets.push({
        label: setLabels?.[index] || key,
        data: DATA,
        borderWidth,
        borderColor: setColors?.[index] || colors[index],
        backgroundColor: setColors?.[index] ||  colors[index],
        pointRadius: 1,
        pointHoverRadius: 4,
        tension: 0.05,
      });
      index++;
    }
  });
  
  return { datasets: datasets };
}
