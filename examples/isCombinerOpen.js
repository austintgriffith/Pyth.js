/*
  Is the combiner open to responses?

  usage:
  node isCombinerOpen ##REQUESTID##

  example:
  node isCombinerOpen 0xd3991a0876d16b0c97697a7d2954b0e63dbb3902047cc2712683392f06981654
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
  concurrence.isCombinerOpen(requestId,combinerAddress).then((open)=>{
    console.log("COMBINER OPEN: "+open)
  })
});
