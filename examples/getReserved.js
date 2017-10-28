
if(!process.argv[2]){
  console.log("Please provide a request id.")
  process.exit(1)
}
let requestId = process.argv[2];

require("../concurrence.js")({DEBUG: true},(err,concurrence)=>{
  concurrence.reserved(requestId).then((reserved)=>{
    console.log("Request "+requestId+" has "+reserved+" "+concurrence.symbol+" reserved")
  })
});
