
if(!process.argv[2]){
  console.log("Please provide a request id.")
  process.exit(1)
}
let requestId = process.argv[2];

const fs = require("fs")
let combinerAddress = fs.readFileSync("../../Combiner/basic/Combiner.address").toString().trim()

require("../pyth.js")({},(err,pyth)=>{
  pyth.isCombinerOpen(requestId,combinerAddress).then((open)=>{
    console.log("COMBINER OPEN: "+open)
    pyth.isCombinerReady(requestId,combinerAddress).then((ready)=>{
      console.log("COMBINER READY: "+ready)
      pyth.getCombinerMode(requestId,combinerAddress).then((result)=>{
        console.log("MODE:",result)
        pyth.getCombinerBestResult(requestId,combinerAddress).then((result)=>{
          console.log("BEST RESULT:",pyth.web3.utils.toAscii(result))
          pyth.getCombinerMostStaked(requestId,combinerAddress).then((result)=>{
            console.log("MOST STAKED:",result)

          });
        });
      });
    })
  })
});
