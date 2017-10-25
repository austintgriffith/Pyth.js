const fs = require("fs")

let request = {url: "http://localhost/"}
let parser = {type:"raw"}
let combiner = fs.readFileSync("../../Combiner/basic/Combiner.address").toString().trim()

require("../pyth.js")({DEBUG: true},(err,pyth)=>{
  pyth.selectAccount(1)
  pyth.addRequest(request,parser,combiner).then((addResult)=>{
    console.log("TX:"+addResult.transactionHash)
    console.log(addResult.events.AddRequest.returnValues)
  })
});
