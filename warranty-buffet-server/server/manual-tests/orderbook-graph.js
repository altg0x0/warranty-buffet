const chartPoints = [[{x: 0, y: 101}, {x : 100, y: 100}]];
const orderbookCanvas = document.getElementById("orderbook-graph");
console.log(document);
const priceChart = new Chart(orderbookCanvas, {
  animation: {
    duration: 0
  },
  type: 'scatter',
  data: {
    label : "Test",
    datasets: [{
      data: chartPoints,
      backgroundColor: 'rgba(0,0,0,0)',
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,1)',
      pointRadius: 0,
      showLine: true,
    }]
  },
  options: {
    elements:{
      line: {
        tension: 0,
      }
    },
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: false
        }
      }]
    }
  }
});

const OrderBook = require("../orderbook");
const testOrderBook = OrderBook("PEAR");
console.log(testOrderBook);

let i = 1;
testOrderBook.dealEmitter.on("dealComplete", function onDealComplete(deal) {
  chartPoints.push({
    x: i,
    y: deal.price,
  });
  i++;
  priceChart.update(0);
});
testOrderBook.startTradeCycle(false);