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

require("../pyth.js")({DEBUG: true},(err,pyth)=>{
  pyth.selectAccount(accountIndex)
  pyth.combine(requestId,combinerAddress).then((result)=>{
    console.log(result)
    console.log(result.events.Debug)
    console.log(result.events.DebugGas)
    console.log(result.events.DebugPointer)
  });
});
