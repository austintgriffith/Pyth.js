require("../pyth.js")({},(err,pyth)=>{
  console.log("Asking pyth.js what my (etherbase) balance is...")
  pyth.balanceOf().then((balance)=>{
    console.log("Balance: "+balance+" "+pyth.symbol)
  })
});
