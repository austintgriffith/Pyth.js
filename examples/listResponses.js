
if(!process.argv[2]){
  console.log("Please provide a request id.")
  process.exit(1)
}
let requestId = process.argv[2];

require("../concurrence.js")({DEBUG: true},(err,concurrence)=>{
console.log("Listing responses with to request:"+requestId)
  concurrence.listResponses(requestId).then((responses)=>{
    for(let r in responses){
      console.log(responses[r])
      console.log("RESPONSE:"+concurrence.web3.utils.toAscii(responses[r].returnValues['response']))
    }
  })
});
