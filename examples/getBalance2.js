require("../pyth.js")({},(err,pyth)=>{
  pyth.selectAccount(1)
  pyth.balanceOf().then((balance)=>{
    console.log("Balance: "+balance+" "+pyth.symbol)
  })
});
