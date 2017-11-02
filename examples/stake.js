/*
  Stake token on a response

  usage:
  node stake ##ACCOUNTINDEX## ##REQUESTID## ##RESPONSEID## ##AMOUNT##

  example:
  node stake 4 0xd3991a0876d16b0c97697a7d2954b0e63dbb3902047cc2712683392f06981654 0xd8293d3302f88fcc7f940ef5d00542416c46d89daaaf5c51aa14e0c89d45200b 50
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
  console.log("Please provide a response id.")
  process.exit(1)
}
let responseId = process.argv[4];

if(!process.argv[5]){
  console.log("Please provide a number of tokens to stake.")
  process.exit(1)
}
let tokens = process.argv[5];

let concurrence = require("../concurrence.js")
concurrence.init({},(err)=>{
  concurrence.selectAccount(accountIndex)
  concurrence.stake(requestId,responseId,tokens).then((result)=>{
    console.log(result)
  })
});
