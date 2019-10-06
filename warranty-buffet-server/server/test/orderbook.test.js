const OrderBook = require("../orderbook");
const {expect} = require("chai");

describe("OrderBook", ()=>{
  it("should be a function", () =>{
    expect(OrderBook).to.be.a("function");
  });
  describe("#newOrder", () => {
    it("should add one new order to the orderbook", ()=>{
      const orderBook = OrderBook("PEAR");
      expect(orderBook.orders.buy.length).to.equal(0);
      expect(orderBook.orders.sell.length).to.equal(0);
      orderBook.newOrder(1000, 100);
      expect(orderBook.orders).to.satisfy(orders => orders.buy.length > 0 || orders.sell.length > 0);
    })
  })
});