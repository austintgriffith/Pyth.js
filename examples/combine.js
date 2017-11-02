/*
  Run a loop of the Combiner
  (this is where the concurrence is drawn, miners are rewarded, contracts are called back, etc)

  usage:
  node combine ##ACCOUNTINDEX## ##REQUESTID##

  example:
  node combine 5 0xd8293d3302f88fcc7f940ef5d00542416c46d89daaaf5c51aa14e0c89d45200b
*/


const fs = require("fs")

if(!process.argv[2]){
  console.log("Please provide an account index.")
  process.exit(1)
}
let accountIndex = process.argv[2];

if(!process.argv[3]){
  console.log("Please provide a request id.")
  process.exit(1)
}
let requestId = process.argv[3];

let combinerAddress = fs.readFileSync("../../Combiner/basic/Combiner.address").toString().trim()

let concurrence = require("../concurrence.js")
concurrence.init({},(err)=>{
  concurrence.selectAccount(accountIndex)
  concurrence.combine(requestId,combinerAddress).then((result)=>{
    console.log(result)
    concurrence.listDebug(result.events.Debug)
    concurrence.listDebug(result.events.DebugGas)
    concurrence.listDebug(result.events.DebugPointer)
  });
});
