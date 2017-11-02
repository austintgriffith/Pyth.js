/*
  Get a request's combiner address
  This is usually on-chain by other contracts 

  usage:
  node getCombiner ##REQUESTID##

  example:
  node getCombiner 0x147b833db65b9d9a4321ba3fa0f476265ebb178531de166477822204268f6d88
*/
if(!process.argv[2]){
  console.log("Please provide a request id.")
  process.exit(1)
}
let requestId = process.argv[2];

let concurrence = require("../concurrence.js")
concurrence.init({},(err)=>{
  concurrence.getCombiner(requestId).then((combiner)=>{
    console.log(combiner)
  })
});
