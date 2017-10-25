if(!process.argv[2]){
  console.log("Please provide an account index.")
  process.exit(1)
}
let accountIndex = process.argv[2];

require("../pyth.js")({},(err,pyth)=>{
  console.log("Asking pyth.js what my (etherbase) balance is...")
  pyth.selectAccount(accountIndex)
  pyth.balanceOf().then((balance)=>{
    console.log("Balance: "+balance+" "+pyth.symbol)
  })
});
