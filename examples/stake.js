const Request = require('request');

if(!process.argv[2]){
  console.log("Please provide a request id.")
  process.exit(1)
}
let requestId = process.argv[2];

if(!process.argv[3]){
  console.log("Please provide a response id.")
  process.exit(1)
}
let responseId = process.argv[3];

if(!process.argv[4]){
  console.log("Please provide a number of tokens to stake.")
  process.exit(1)
}
let tokens = process.argv[4];

require("../pyth.js")({DEBUG: true},(err,pyth)=>{

  pyth.selectAccount(1)

  pyth.stake (requestId,responseId,tokens).then((result)=>{
    console.log(result)
  })

});
