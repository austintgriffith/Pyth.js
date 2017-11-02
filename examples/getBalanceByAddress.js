/*
  Get the token balance of a specific address

  usage:
  node getBalanceByAddress ##ADDRESS##

  example:
  node getBalanceByAddress 0xAEba920BF5185925DB51a4bff33d9A2191171e17
*/
let concurrence = require("../concurrence.js")
concurrence.init({},(err)=>{
  concurrence.balanceOf(process.argv[2]).then((balance)=>{
    console.log("Balance of "+process.argv[2]+": "+balance+" "+concurrence.symbol)
  })
});
