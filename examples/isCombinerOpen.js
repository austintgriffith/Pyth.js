const fs = require("fs");

if(!process.argv[2]){
  console.log("Please provide a request id.")
  process.exit(1)
}
let requestId = process.argv[2];
let combinerAddress = fs.readFileSync("../../Combiner/basic/Combiner.address").toString().trim()

let concurrence = require("../concurrence.js")
concurrence.init({},(err)=>{
  concurrence.isCombinerOpen(requestId,combinerAddress).then((open)=>{
    console.log("COMBINER OPEN: "+open)
  })
});
