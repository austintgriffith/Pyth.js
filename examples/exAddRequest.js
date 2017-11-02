let request = { url: "https://api.coinmarketcap.com/v1/ticker/ethereum/" }
let protocol = "json.price_usd"
let combiner = "0x22530bf5e978bb88Bd36b914C19dE655605Bc1B8"
let callback = "0x0BAC8F1cF847F54bf8398e533Aa647a83869d14A"
let concurrence = require("../concurrence.js")
concurrence.init({},(err)=>{
  concurrence.addRequest(combiner,request,protocol,callback).then((addResult)=>{
    console.log("TX:"+addResult.transactionHash)
    console.log(addResult.events.AddRequest.returnValues)
  })
});
