/*
  List all the responses by events triggered

  usage:
  node listResponses ##REQUESTID##
*/

if(!process.argv[2]){
  console.log("Please provide a request id.")
  process.exit(1)
}
let requestId = process.argv[2];

let concurrence = require("../concurrence.js")
concurrence.init({},(err)=>{
console.log("Listing responses to request:"+requestId)
  concurrence.listResponses(requestId).then((responses)=>{
    for(let r in responses){
      console.log(responses[r])
      console.log("RESPONSE:"+concurrence.web3.utils.toAscii(responses[r].returnValues['response']))
    }
  })
});
