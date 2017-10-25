const fs = require("fs")

if(!process.argv[2]){
  console.log("Please provide a request id.")
  process.exit(1)
}
let requestId = process.argv[2];

if(!process.argv[3]){
  console.log("Please provide a number of tokens to reserve.")
  process.exit(1)
}
let tokens = process.argv[3];

require("../pyth.js")({DEBUG: true},(err,pyth)=>{
  pyth.selectAccount(1)
  pyth.reserve(requestId,tokens).then((reserveResult)=>{
    console.log(reserveResult)
  })
});