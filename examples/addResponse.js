
if(!process.argv[2]){
  console.log("Please provide an account index.")
  process.exit(1)
}
let accountIndex = process.argv[2];

if(!process.argv[3]){
  console.log("Please provide a request id.")
  process.exit(1)
}
let requestId = process.argv[3];

if(!process.argv[4]){
  console.log("Please provide a response.")
  process.exit(1)
}
let response = process.argv[4];

require("../pyth.js")({DEBUG: true},(err,pyth)=>{
  pyth.selectAccount(accountIndex)
  pyth.addResponse(requestId,response).then((result)=>{
    console.log("TX:"+result.transactionHash)
    console.log(result.events.AddResponse.returnValues)
  })
});
