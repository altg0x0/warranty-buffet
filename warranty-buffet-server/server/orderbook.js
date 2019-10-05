// We try to avoid ES classes here
'use strict';
const SortedSet = require("collections/sorted-set");
const EventEmitter = require('events');


const OrderTypes = Object.freeze({
  BUY:   Symbol("buy"),
  SELL:  Symbol("sell"),
});

const Colors = Object.freeze({
  RED: "\x1b[31m",
  GREEN:  "\x1b[32m",
  RESET:"\x1b[0m",
});


function OrderBook(symbol) {
  const ret = Object.create(null);
  ret.orders = {buy: SortedSet(), sell: SortedSet()};
  for (const i of Object.keys(ret.orders).map(x => ret.orders[x])) {
    i.contentCompare = (a, b) => b.price - a.price;
    i.contentEquals = (a, b) => Math.abs(a.price - b.price) < 1e-10;
  }
  ret.newOrder = newOrder;
  ret.symbol = symbol;
  ret.processOrder = processOrder;
  ret.dealEmitter = new class DealEmitter extends EventEmitter {};
  ret.startTradeCycle = tradeCycle;
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
  const orderSet = (orderType === OrderTypes.BUY) ? this.orders.buy : this.orders.sell;
  const order = {
    price: price,
    fullQty: qty,
    type: orderType,
    unfulfilledQty: qty,
    orderSet: orderSet,
  };
  processOrder.bind(this, order)();
}

function processOrder(order) {
  const orderType = order.type;
  const oppositeOrdersSet = (orderType === OrderTypes.SELL) ? this.orders.buy : this.orders.sell;
  while (true) {
    const buyOrder = (orderType === OrderTypes.BUY)? order : oppositeOrdersSet.min();
    const sellOrder = (orderType === OrderTypes.SELL)? order : oppositeOrdersSet.max();
    const oppositeOrder = (orderType === OrderTypes.BUY)? sellOrder : buyOrder;
    if (oppositeOrder == null || buyOrder.price < sellOrder.price)
      break;
    const dealQty = Math.min(buyOrder.unfulfilledQty, sellOrder.unfulfilledQty);
    this.dealEmitter.emit("dealComplete", {price: oppositeOrder.price, qty: dealQty});
    for (const i of [buyOrder, sellOrder]) {
      i.unfulfilledQty -= dealQty;
      if (i.unfulfilledQty === 0) {
        i.orderSet.delete(i);
      }
    }
    if (order.unfulfilledQty === 0)
      return;}
  order.orderSet.push(order);

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
  const readline = require('readline');
  const blank = '\n'.repeat(process.stdout.rows);
  console.log(blank);
  readline.cursorTo(process.stdout, 0, 0);
  readline.clearScreenDown(process.stdout);
}

function printOrderBook(orderBook) {
  console.log("ORDERBOOK: " + orderBook.symbol);
  console.log(Colors.RED);
  for (const arr of [orderBook.orders.sell.sorted(), orderBook.orders.buy.sorted()]) {
    for (const order of arr) {
      console.log(`${order.price.toFixed(2)}\t${order.unfulfilledQty}`);
    }
    console.log(Colors.GREEN);
  }
  console.log(Colors.RESET);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function tradeCycle(printOrders = false) {
  const orderBook = this;
  // let value = 100;
  let price = 100;
  while (true) {
    orderBook.newOrder(1000, price);
    price += Math.floor(Math.abs(randNormal()) * 3) / 3 * (Math.random() > .5 ? 1 : -1);
    if(printOrders) {
      clear();
      printOrderBook(orderBook);
    }
    await sleep(50 * (1 - randNormal() / 2));
  }
}
if (require.main === module){
  tradeCycle();
}

module.exports = OrderBook;