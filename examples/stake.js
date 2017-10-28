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
  console.log("Please provide a response id.")
  process.exit(1)
}
let responseId = process.argv[4];

if(!process.argv[5]){
  console.log("Please provide a number of tokens to stake.")
  process.exit(1)
}
let tokens = process.argv[5];

require("../concurrence.js")({DEBUG: true},(err,concurrence)=>{

  concurrence.selectAccount(accountIndex)

  concurrence.stake (requestId,responseId,tokens).then((result)=>{
    console.log(result)
  })

});
