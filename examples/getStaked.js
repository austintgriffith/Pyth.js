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

require("../pyth.js")({DEBUG: true},(err,pyth)=>{

  pyth.selectAccount(1)

  pyth.staked(pyth.selectedAddress,requestId,responseId).then((staked)=>{
    console.log("Account "+pyth.selectedAddress+" has "+staked+" PTH staked on response "+responseId+" to request "+requestId)
  })

});
