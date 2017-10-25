const fs = require("fs");

if(!process.argv[2]){
  console.log("Please provide a request id.")
  process.exit(1)
}
let requestId = process.argv[2];
let combinerAddress = fs.readFileSync("../../Combiner/basic/Combiner.address").toString().trim()

require("../pyth.js")({},(err,pyth)=>{
  pyth.isCombinerReady(requestId,combinerAddress).then((ready)=>{
    console.log("COMBINER READY: "+ready)
  })
});
