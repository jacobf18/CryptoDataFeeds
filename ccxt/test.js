const ccxt = require('ccxt');

let gemini = new ccxt.gemini();
let btcusd = 'BTC/USD';
let kraken = new ccxt.kraken();

/* Load Markets */

function loadMarkets(exchange) {
    (async () => {
        let markets = await exchange.load_markets ()
        console.log (exchange.id, markets)
    }) ();
}


function loadOrderBook(exchange, symbol) {
    let delay = 2000;
    (async () => {
        console.log(await exchange.fetchOrderBook(symbol));
        await new Promise (resolve => setTimeout(resolve, delay));
    }) ();
}

function getOHLCV(exchange, symbol) {
    let sleep = (ms) => new Promise (resolve => setTimeout (resolve, ms));
    (async () => {
        if (exchange.has.fetchOHLCV) {
            await sleep (exchange.rateLimit); // milliseconds
            console.log (await exchange.fetchOHLCV (symbol, '1m')); // one minute
        }
    }) ();
}

//loadOrderBook(gemini, btcusd)
//loadMarkets(gemini);
getOHLCV(gemini, btcusd);
