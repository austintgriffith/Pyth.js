const fs = require("fs")

let request = {url: "http://localhost/"}
let parser = {type:"raw"}
let combiner = fs.readFileSync("../../Combiner/basic/Combiner.address").toString().trim()

require("../concurrence.js")({DEBUG: true},(err,concurrence)=>{
  concurrence.selectAccount(1)
  concurrence.addRequest(request,parser,combiner).then((addResult)=>{
    console.log("TX:"+addResult.transactionHash)
    console.log(addResult.events.AddRequest.returnValues)
  })
});
