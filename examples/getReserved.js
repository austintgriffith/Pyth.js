
if(!process.argv[2]){
  console.log("Please provide a request id.")
  process.exit(1)
}
let requestId = process.argv[2];

let concurrence = require("../concurrence.js")
concurrence.init({},(err)=>{
  concurrence.reserved(requestId).then((reserved)=>{
    console.log("Request "+requestId+" has "+reserved+" "+concurrence.symbol+" reserved")
  })
});
