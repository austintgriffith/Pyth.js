require("../pyth.js")({},(err,pyth)=>{
  pyth.balanceOf(process.argv[2]).then((balance)=>{
    console.log("Balance of "+process.argv[2]+": "+balance+" "+pyth.symbol)
  })
});
