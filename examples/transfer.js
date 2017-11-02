/*
  Transfer token from a local account to any address

  usage:
  node transfer ##FROMACCOUNTINDEX## ##TOACCOUNTADDRESS## ##AMOUNT##

  example:
  node transfer 1 0x1973E3004ECfC1E05B9247355a8F66529764a0a8 100
*/

let concurrence = require("../concurrence.js")

if(!process.argv[2]){
  console.log("Please provide an acount index to transfer from")
  process.exit(1)
}
let fromIndex = process.argv[2];

if(!process.argv[3]){
  console.log("Please provide an account address to transfer to")
  process.exit(1)
}
let toAddress = process.argv[3];

if(!process.argv[4]){
  console.log("Please provide an amount of "+concurrence.symbol+" to transfer")
  process.exit(1)
}
let amount = process.argv[4];

concurrence.init({},(err)=>{
  concurrence.selectAccount(fromIndex)
  concurrence.transfer(toAddress,amount).then((result)=>{
    console.log(result.transactionHash)
  })
});
