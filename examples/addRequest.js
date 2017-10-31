const fs = require("fs")

let request = {
  url: "http://relay.concurrence.io/address/Main"
}
let protocol = "raw"
let combiner = fs.readFileSync("../../Combiner/basic/Combiner.address").toString().trim()
let callback = "0x0"


let concurrence = require("../concurrence.js")
concurrence.init({},(err)=>{
  concurrence.selectAccount(1)
  concurrence.addRequest(combiner,request,protocol,callback).then((addResult)=>{
    console.log("TX:"+addResult.transactionHash)
    console.log(addResult.events.AddRequest.returnValues)
  })
});
