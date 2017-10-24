const fs = require("fs")
let request = {url: "http://localhost/"}
let parser = {type:"raw"}
let combiner = fs.readFileSync("../../Combiner/basic/Combiner.address").toString().trim()
let tokens = 5

console.log("combiner @ "+combiner)

require("../pyth.js")({DEBUG: true},(err,pyth)=>{
  pyth.selectAccount(1)
  pyth.addRequest(request,parser,combiner).then((addResult)=>{
    console.log(addResult.transactionHash,addResult.events.AddRequest.returnValues.id)
    pyth.reserve(addResult.events.AddRequest.returnValues.id,tokens).then((reserveResult)=>{
      console.log(reserveResult)
    })
  })
});
