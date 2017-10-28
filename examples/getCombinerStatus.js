
if(!process.argv[2]){
  console.log("Please provide a request id.")
  process.exit(1)
}
let requestId = process.argv[2];

const fs = require("fs")
let combinerAddress = fs.readFileSync("../../Combiner/basic/Combiner.address").toString().trim()

require("../concurrence.js")({},(err,concurrence)=>{
  concurrence.isCombinerOpen(requestId,combinerAddress).then((open)=>{
    console.log("COMBINER OPEN: "+open)
    concurrence.isCombinerReady(requestId,combinerAddress).then((ready)=>{
      console.log("COMBINER READY: "+ready)
      concurrence.getCombinerMode(requestId,combinerAddress).then((result)=>{
        console.log("MODE:",result)
        concurrence.getCombinerBestResult(requestId,combinerAddress).then((result)=>{
          console.log("BEST RESULT:",concurrence.web3.utils.toAscii(result))
          concurrence.getCombinerMostStaked(requestId,combinerAddress).then((result)=>{
            console.log("MOST STAKED:",result)

          });
        });
      });
    })
  })
});
