// var ctx = document.getElementById("chLine1").getContext("2d");

// var gradientStroke = ctx.createLinearGradient(0,230,0,50);

// gradientStroke.addColorStop(1, 'rgba(247,189,1,0.2)');
// gradientStroke.addColorStop(0.2, 'rgba(247,189,1,0.0)');
// gradientStroke.addColorStop(0, 'rgba(247,189,1,0)'); //purple colors

var chartData = {
    labels: ["1 May","2 May","3 May","4 May","5 May","6 May","7 May","8 May","9 May","10 May","11 May","12 May","13 May","14 May","15 May","16 May","17 May","18 May","19 May","20 May","21 May","22 May","23 May","24 May","25 May","26 May","27 May","28 May","29 May","30 May","31 May"],
    datasets: [{
      data: [25,18,30,31,35,35,60,60,60,75,21,20,24,20,18,17,15,17,30,120,120,120,100,90,75,90,90,90,75,70,60],
      label: "Data",
          fill: true,
          backgroundColor: ["rgba(55, 125, 255, 0)", "rgba(255, 255, 255, 0)"],
          borderColor: '#F7BD01',
          borderWidth: 2,
          pointRadius: 0,
          pointBorderWidth: 20,
          pointHoverRadius: 0,
         
    }]
  };
  var chLine1 = document.getElementById("chLine1");
if (chLine1) {
  new Chart(chLine1, {
  type: 'line',
  data: chartData,
  options: {
    scales: {
      yAxes: [{
            display: false,
        gridLines: {
          display:false
      }
      }],
      xAxes: [{
            display: false, //this will remove only the label
       
        gridLines: {
          display:false
      }
    }]
    },
    legend: {
      display: false
    },

  }
  });
}



var chLine2 = document.getElementById("chLine2");
if (chLine2) {
  new Chart(chLine2, {
  type: 'line',
  data: chartData,
  options: {
    scales: {
      yAxes: [{
            display: false,
        gridLines: {
          display:false
      }
      }],
      xAxes: [{
            display: false, //this will remove only the label
       
        gridLines: {
          display:false
      }
    }]
    },
    legend: {
      display: false
    },
        
  }
  });
}

var chLine3 = document.getElementById("chLine3");
if (chLine3) {
  new Chart(chLine3, {
  type: 'line',
  data: chartData,
  options: {
    scales: {
      yAxes: [{
            display: false,
        gridLines: {
          display:false
      }
      }],
      xAxes: [{
            display: false, //this will remove only the label
       
        gridLines: {
          display:false
      }
    }]
    },
    legend: {
      display: false
    },
        
  }
  });
}