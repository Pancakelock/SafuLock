var ctx = document.getElementById("chLine").getContext("2d");

var gradientStroke = ctx.createLinearGradient(0,230,0,50);

gradientStroke.addColorStop(1, 'rgba(247,189,1,0.2)');
gradientStroke.addColorStop(0.2, 'rgba(247,189,1,0.0)');
gradientStroke.addColorStop(0, 'rgba(247,189,1,0)'); //purple colors

var chartData = {
    labels: ["S", "M", "T", "W", "T", "F", "S", "S", "S", "S"],
    datasets: [{
      data: [400, 200, 445, 483, 503, 512, 570, 503, 530, 503],
      label: "Data",
          fill: true,
          backgroundColor: gradientStroke,
          borderColor: '#F7BD01',
          borderWidth: 2,
          borderDash: [],
          borderDashOffset: 0.0,
          pointBackgroundColor: '#F7BD01',
          pointBorderColor:'rgba(255,255,255,0)',
          pointHoverBackgroundColor: '#F7BD01',
          pointBorderWidth: 20,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 15,
          pointRadius: 4,
    }]
  };
  var chLine = document.getElementById("chLine");
if (chLine) {
  new Chart(chLine, {
  type: 'line',
  data: chartData,
  options: {
    scales: {
      yAxes: [{
        ticks: {
            display: false
        },
        gridLines: {
          display:false
      }
      }],
      xAxes: [{
        ticks: {
            display: false //this will remove only the label
        },
        gridLines: {
          display:false
      }
    }]
    },
    legend: {
      display: false
    },
    tooltips: {
        backgroundColor: '#f5f5f5',
        titleFontColor: '#333',
        bodyFontColor: '#666',
        bodySpacing: 4,
        xPadding: 12,
        mode: "nearest",
        intersect: 0,
        position: "nearest"
      },
  }
  });
}