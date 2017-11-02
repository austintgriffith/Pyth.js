/*
  Is the combiner ready to combine responses?

  usage:
  node isCombinerReady ##REQUESTID##

  example:
  node isCombinerReady 0xd3991a0876d16b0c97697a7d2954b0e63dbb3902047cc2712683392f06981654
*/

const fs = require("fs");

if(!process.argv[2]){
  console.log("Please provide a request id.")
  process.exit(1)
}
let requestId = process.argv[2];
let combinerAddress = fs.readFileSync("../../Combiner/basic/Combiner.address").toString().trim()

let concurrence = require("../concurrence.js")
concurrence.init({},(err)=>{
  concurrence.isCombinerReady(requestId,combinerAddress).then((ready)=>{
    console.log("COMBINER READY: "+ready)
  })
});
