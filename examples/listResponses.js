
if(!process.argv[2]){
  console.log("Please provide a request id.")
  process.exit(1)
}
let requestId = process.argv[2];

require("../pyth.js")({DEBUG: true},(err,pyth)=>{
console.log("Listing responses with to request:"+requestId)
  pyth.listResponses(requestId).then((responses)=>{
    for(let r in responses){
      console.log(responses[r])
      console.log("RESPONSE:"+pyth.web3.utils.toAscii(responses[r].returnValues['response']))
    }
  })
});
