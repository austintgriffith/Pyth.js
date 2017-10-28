require("../concurrence.js")({},(err,concurrence)=>{
  concurrence.selectAccount(1)
  concurrence.balanceOf().then((balance)=>{
    console.log("Balance: "+balance+" "+concurrence.symbol)
  })
});
