
if(!process.argv[2]){
  console.log("Please provide a response id.")
  process.exit(1)
}
let responseId = process.argv[2];


let concurrence = require("../concurrence.js")
concurrence.init({},(err)=>{
  concurrence.staked(concurrence.selectedAddress,responseId).then((staked)=>{
    console.log("Account "+concurrence.selectedAddress+" has "+staked+" PTH staked on response "+responseId)
  })
});
