// We try to avoid ES classes here
const OrderTypes = Object.freeze({
  BUY:   Symbol("buy"),
  SELL:  Symbol("SELL"),
});


function OrderBook(symbol) {
  const ret = Object.create(null);
  ret.orders = {buy: [], sell: []};
  ret.newOrder = newOrder;
  return ret;
}

function newOrder(typicalQty, price) {
  let qty;
  while(true) {
    let __qty = Math.floor(typicalQty * (1 + randNormal() / 2));
    if (__qty > 0) {
      qty = __qty;
      break;
    }
  }
  const orderType = Math.random() > .5 ? OrderTypes.BUY : OrderTypes.SELL;
  const orderArray = (orderType === OrderTypes.BUY) ? this.orders.buy : this.orders.sell;
  const order = {
    price: price,
    qty: qty,
    type: orderType,
    fulfilledQty: 0,
  };
  orderArray.push(order);
}

// https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
// Standard Normal variate using Box-Muller transform. Mean is 0, variance is 1
function randNormal() {
  var u = 0, v = 0;
  while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while(v === 0) v = Math.random();
  return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

// https://gist.github.com/timneutkens/f2933558b8739bbf09104fb27c5c9664
function clear() {
  const readline = require('readline')
  const blank = '\n'.repeat(process.stdout.rows)
  console.log(blank)
  readline.cursorTo(process.stdout, 0, 0)
  readline.clearScreenDown(process.stdout)
}

function printOrderBook(orderBook) {
  console.log("ORDERBOOK:");
  for (let arr of [orderBook.orders.buy, orderBook.orders.sell]) {
    arr.sort((a, b) => b.price - a.price);
    for (let order of arr) {
      console.log(`${order.price.toFixed(2)}\t${order.qty}`);
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function tradeCycle() {
  const orderBook = new OrderBook("PEAR");
  let value = 100;
  let price = 100;
  while (true) {
    clear();
    orderBook.newOrder(1000, price);
    price += Math.floor(randNormal() * 100) / 100;
    printOrderBook(orderBook);
    await sleep(1000 * (1 - randNormal() / 2));
  }
}
tradeCycle();
