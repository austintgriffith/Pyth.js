/*
  Get balance of local account by index

  usage:
  node getBalance ##ACCOUNTINDEX##
*/
if(!process.argv[2]){
  console.log("Please provide an account index.")
  process.exit(1)
}
let accountIndex = process.argv[2];

let concurrence = require("../concurrence.js")
concurrence.init({},(err)=>{
  console.log("Asking concurrence.js what my (etherbase) balance is...")
  concurrence.selectAccount(accountIndex)
  concurrence.balanceOf().then((balance)=>{
    console.log("Balance: "+balance+" "+concurrence.symbol)
  })
});
