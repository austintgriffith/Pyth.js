if(!process.argv[2]){
  console.log("Please provide an account index.")
  process.exit(1)
}
let accountIndex = process.argv[2];

require("../concurrence.js")({},(err,concurrence)=>{
  console.log("Asking concurrence.js what my (etherbase) balance is...")
  concurrence.selectAccount(accountIndex)
  concurrence.balanceOf().then((balance)=>{
    console.log("Balance: "+balance+" "+concurrence.symbol)
  })
});
