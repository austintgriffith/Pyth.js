/*
  Get status/mode/consensus of combiner for a request

  usage:
  node getcombinerStatus ##ACCOUNTINDEX##

  example:
  node getCombinerStatus.js 0x3bc605f10cfbc93f1310505869a3e66a025d84d6670d8dc279c305de6a596a21
*/
if(!process.argv[2]){
  console.log("Please provide a request id.")
  process.exit(1)
}
let requestId = process.argv[2];

const fs = require("fs")
let combinerAddress = fs.readFileSync("../../Combiner/basic/Combiner.address").toString().trim()

let concurrence = require("../concurrence.js")
concurrence.init({},(err)=>{
  concurrence.isCombinerOpen(requestId,combinerAddress).then((open)=>{
    console.log("COMBINER OPEN: "+open)
    concurrence.isCombinerReady(requestId,combinerAddress).then((ready)=>{
      console.log("COMBINER READY: "+ready)
      concurrence.getCombinerMode(requestId,combinerAddress).then((result)=>{
        console.log("MODE:",result)
        concurrence.getCombinerConcurrence(requestId,combinerAddress).then((result)=>{
          console.log("CONCURRENCE:",concurrence.web3.utils.toAscii(result))
          concurrence.getCombinerWeight(requestId,combinerAddress).then((result)=>{
            console.log("WEIGHT:",result)
            //concurrence.getCombinerTimestamp(requestId,combinerAddress).then((result)=>{
            //  console.log("TIMESTAMP:",result)
            //});
          });
        });
      });
    })
  })
});
