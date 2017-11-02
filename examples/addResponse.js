/*
  Add a response

  usage:
  node getResponse ##ACCOUNTINDEX## ##REQUESTID## ##RESPONSE##

  example:
  node addResponse 4 0xd3991a0876d16b0c97697a7d2954b0e63dbb3902047cc2712683392f06981654 "1509577541201"
*/

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

let concurrence = require("../concurrence.js")
concurrence.init({},(err)=>{
  concurrence.selectAccount(accountIndex)
  concurrence.addResponse(requestId,response).then((result)=>{
    console.log("TX:"+result.transactionHash)
    console.log(result.events.AddResponse.returnValues)
  })
});
